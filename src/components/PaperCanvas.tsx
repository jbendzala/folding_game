import { useEffect, useMemo, useState } from 'react';
import { Canvas, Circle, Group, Path, Rect, RoundedRect, rect } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { isValidFold } from '../core/fold';
import { getBounds, getStackAt } from '../core/grid';
import type { CellCoord, Fold, FoldState, ShapePattern } from '../core/types';
import { paperColor, theme, type WorldPalette } from '../theme';

// Travel before a drag commits to an axis/direction.
const SLOP = 8;
// Within this many px of the canvas edge, the paper slides instead of the
// finger having to keep going -- which keeps the touch away from the screen
// border where Android's back-swipe and edge panels would steal it.
const EDGE_ZONE = 72;
// How fast the paper slides while the finger is held at the very edge (px/s).
const EDGE_PAN_RATE = 1100;
/**
 * How far the CREASE travels per px of finger travel, measured from the
 * folding edge.
 *
 * 0.5 is the value that makes the PAPER move at exactly finger speed, which
 * is what the hand expects: the flap is mirrored across the crease, so the
 * folding edge travels twice as far as the crease does. At 1 the crease sits
 * under the finger but the paper outruns it 2:1, which reads as the fold
 * running away from you.
 */
const CREASE_TRACKING = 0.5;
// See-through folded flap, like paper against the light.
const FLAP_OPACITY = 0.86;

// armedKey encoding shared between the UI-thread worklet and JS:
// 0 = dragging right (left edge folds over)   1 = dragging left
// 2 = dragging down (top edge folds over)     3 = dragging up
type ArmKey = 0 | 1 | 2 | 3;

const BIG = 4000; // "infinite" clip extent

interface PaperCanvasProps {
  state: FoldState;
  /** The level's starting shape -- fixes the coordinate frame and cell size
   * for the whole level so the paper never rescales or recenters mid-play. */
  start: ShapePattern;
  /** Canvas edge length in px. */
  size: number;
  /** Board cells the final shape must cover -- rendered as a tinted zone. */
  goalCells?: CellCoord[];
  /** A suggested next fold to visualize (hint system). */
  hint?: Fold | null;
  /** This world's colours: paper ramp plus a complementary indicator. */
  palette: WorldPalette;
  /** True when the goal constrains which face shows, which is the only time
   * the back of the sheet should be painted the world's colour. */
  twoSided: boolean;
  onFold: (fold: Fold) => void;
}

/**
 * The interactive paper, folded like real paper: drag in any direction and
 * the sheet's edge on the opposite side folds over toward your finger. The
 * crease sits exactly at the midpoint between that edge and the finger and
 * moves CONTINUOUSLY -- no snapping mid-drag. The sheet is rendered in two
 * clipped passes: the part beyond the crease stays put, the part before it
 * is mirrored across the crease and drawn on top, slightly transparent, back
 * face showing. A thin accent line marks the grid boundary the crease will
 * snap to on release; letting go eases the crease onto that line and commits
 * the fold. Dragging back to the edge cancels (or re-arms a new direction).
 *
 * Per-frame work runs on the UI thread: the crease is a Reanimated shared
 * value feeding Skia transforms and clips directly. React state changes only
 * when a drag arms and when a fold commits.
 */
export function PaperCanvas({
  state,
  start,
  size,
  goalCells,
  hint,
  palette,
  twoSided,
  onFold,
}: PaperCanvasProps) {
  const [armKey, setArmKey] = useState<ArmKey | null>(null);

  // --- geometry (cell size frozen per level via `start`) ---
  // Folding past the halfway point makes the flap legitimately overhang the
  // far edge (fold 3 cells of a 5-cell sheet and 1 cell sticks out), so the
  // frame reserves a cell of margin for it. Boards of 2 can't overhang at
  // all (the only fold is the exact half), so they keep the full canvas.
  const maxDim = Math.max(start.width, start.height);
  const marginCells = maxDim >= 3 ? 2 : 0.25;
  const cell = Math.max(24, Math.floor(size / (maxDim + marginCells)));
  // Whole-pixel origin: with a fractional one, every shared cell edge lands
  // mid-pixel and Skia antialiases both neighbours into it, painting a seam
  // on some boundaries and not others. Creases are drawn explicitly below.
  const originX = Math.round((size - start.width * cell) / 2);
  const originY = Math.round((size - start.height * cell) / 2);
  const screenX = (col: number) => originX + col * cell;
  const screenY = (row: number) => originY + row * cell;

  const bounds = getBounds(state.cells);

  // Plain numbers for the worklet (it can't call JS closures).
  const leftEdgePx = screenX(bounds.minCol);
  const rightEdgePx = screenX(bounds.maxCol + 1);
  const topEdgePx = screenY(bounds.minRow);
  const bottomEdgePx = screenY(bounds.maxRow + 1);
  const nCols = bounds.maxCol - bounds.minCol;
  const nRows = bounds.maxRow - bounds.minRow;

  // Pins cap how far the crease may travel: the fold can include cells up to
  // but never past a pinned row/column (a pin must stay on the still side).
  const pins = state.pins ?? [];
  const creaseMaxK0 = pins.length
    ? Math.min(rightEdgePx - cell, ...pins.map((p) => screenX(p.col)))
    : rightEdgePx - cell;
  const creaseMinK1 = pins.length
    ? Math.max(leftEdgePx + cell, ...pins.map((p) => screenX(p.col + 1)))
    : leftEdgePx + cell;
  const creaseMaxK2 = pins.length
    ? Math.min(bottomEdgePx - cell, ...pins.map((p) => screenY(p.row)))
    : bottomEdgePx - cell;
  const creaseMinK3 = pins.length
    ? Math.max(topEdgePx + cell, ...pins.map((p) => screenY(p.row + 1)))
    : topEdgePx + cell;

  // --- view panning ---
  // Cell size stays fixed, but a fold can walk paper right out of the
  // starting frame (x -> 2*line+1-x compounds: two folds on a 6-wide sheet
  // can reach column 12), so the view follows the paper, re-centering on the
  // current shape. State only changes on commit, so this never moves under a
  // dragging finger.
  const shapeCenterX = originX + ((bounds.minCol + bounds.maxCol + 1) / 2) * cell;
  const shapeCenterY = originY + ((bounds.minRow + bounds.maxRow + 1) / 2) * cell;
  const targetPanX = size / 2 - shapeCenterX;
  const targetPanY = size / 2 - shapeCenterY;

  const panXSv = useSharedValue(targetPanX);
  const panYSv = useSharedValue(targetPanY);
  useEffect(() => {
    panXSv.value = withTiming(targetPanX, { duration: 220 });
    panYSv.value = withTiming(targetPanY, { duration: 220 });
  }, [targetPanX, targetPanY]);
  // Extra pan accumulated while the finger dwells in an edge zone, plus the
  // last touch position (the frame callback needs it between touch events).
  const dragPanXSv = useSharedValue(0);
  const dragPanYSv = useSharedValue(0);
  const fingerXSv = useSharedValue(0);
  const fingerYSv = useSharedValue(0);
  const contentTransform = useDerivedValue(() => [
    { translateX: panXSv.value + dragPanXSv.value },
    { translateY: panYSv.value + dragPanYSv.value },
  ]);

  // --- animation state ---
  const creaseSv = useSharedValue(0);
  const armedKeySv = useSharedValue(-1);
  // How many cells the current drag would fold (0 = none yet) and the drop
  // indicator's fade -- it re-fades softly each time it moves to a new line.
  const dropIdxSv = useSharedValue(0);
  const dropOpacitySv = useSharedValue(0);

  function jsArm(key: ArmKey) {
    setArmKey(key);
  }

  function jsClear() {
    setArmKey(null);
    armedKeySv.value = -1;
  }

  function jsCommit(key: ArmKey, idx: number) {
    const fold: Fold =
      key === 0
        ? { axis: 'vertical', line: bounds.minCol + idx - 1, moves: 'lower' }
        : key === 1
          ? { axis: 'vertical', line: bounds.maxCol - idx, moves: 'upper' }
          : key === 2
            ? { axis: 'horizontal', line: bounds.minRow + idx - 1, moves: 'lower' }
            : { axis: 'horizontal', line: bounds.maxRow - idx, moves: 'upper' };
    if (isValidFold(state, fold)) onFold(fold);
    setArmKey(null);
    armedKeySv.value = -1;
  }

  /**
   * Drives the crease every frame from the last known finger position, so
   * that holding the finger at an edge keeps the paper sliding. Doing this
   * only on touch-move (the obvious place) stalls the moment the finger
   * stops, which is exactly when the player is asking for more room.
   */
  useFrameCallback((frame) => {
    'worklet';
    const key = armedKeySv.value;
    if (key === -1) return;
    const dt = Math.min(frame.timeSincePreviousFrame ?? 16, 50) / 1000;
    const horizontal = key <= 1;

    // Slide the paper while the finger sits in an edge zone. Rate ramps with
    // how far in it is, so a light touch of the edge creeps and a firm one
    // moves properly.
    if (horizontal) {
      const fx = fingerXSv.value;
      if (fx < EDGE_ZONE) {
        dragPanXSv.value += ((EDGE_ZONE - fx) / EDGE_ZONE) * EDGE_PAN_RATE * dt;
      } else if (fx > size - EDGE_ZONE) {
        dragPanXSv.value -= ((fx - (size - EDGE_ZONE)) / EDGE_ZONE) * EDGE_PAN_RATE * dt;
      }
    } else {
      const fy = fingerYSv.value;
      if (fy < EDGE_ZONE) {
        dragPanYSv.value += ((EDGE_ZONE - fy) / EDGE_ZONE) * EDGE_PAN_RATE * dt;
      } else if (fy > size - EDGE_ZONE) {
        dragPanYSv.value -= ((fy - (size - EDGE_ZONE)) / EDGE_ZONE) * EDGE_PAN_RATE * dt;
      }
    }

    // Finger position in the paper's own coordinates.
    const px = fingerXSv.value - panXSv.value - dragPanXSv.value;
    const py = fingerYSv.value - panYSv.value - dragPanYSv.value;

    let target = creaseSv.value;
    if (key === 0) {
      const c = leftEdgePx + (px - leftEdgePx) * CREASE_TRACKING;
      target = Math.min(Math.max(c, leftEdgePx), creaseMaxK0);
    } else if (key === 1) {
      const c = rightEdgePx + (px - rightEdgePx) * CREASE_TRACKING;
      target = Math.max(Math.min(c, rightEdgePx), creaseMinK1);
    } else if (key === 2) {
      const c = topEdgePx + (py - topEdgePx) * CREASE_TRACKING;
      target = Math.min(Math.max(c, topEdgePx), creaseMaxK2);
    } else {
      const c = bottomEdgePx + (py - bottomEdgePx) * CREASE_TRACKING;
      target = Math.max(Math.min(c, bottomEdgePx), creaseMinK3);
    }
    // Ease toward the target instead of snapping: the crease starts at the
    // folding edge, so without this it would jump to wherever the finger
    // first landed. Also lends the paper a little weight.
    creaseSv.value = creaseSv.value + (target - creaseSv.value) * 0.4;

    // Which grid line the fold would drop on; the indicator fades in each
    // time it moves.
    const edge =
      key === 0 ? leftEdgePx : key === 1 ? rightEdgePx : key === 2 ? topEdgePx : bottomEdgePx;
    const span = horizontal ? nCols : nRows;
    const idx = Math.min(Math.max(Math.round(Math.abs(creaseSv.value - edge) / cell), 0), span);
    if (idx !== dropIdxSv.value) {
      dropIdxSv.value = idx;
      if (idx > 0) {
        dropOpacitySv.value = 0;
        dropOpacitySv.value = withTiming(1, { duration: 140 });
      } else {
        dropOpacitySv.value = withTiming(0, { duration: 80 });
      }
    }
  }, true);

  const pan = Gesture.Pan()
    .onBegin((e) => {
      armedKeySv.value = -1;
      fingerXSv.value = e.x;
      fingerYSv.value = e.y;
      dragPanXSv.value = 0;
      dragPanYSv.value = 0;
    })
    .onUpdate((e) => {
      const tx = e.translationX;
      const ty = e.translationY;
      const beyondSlop = Math.abs(tx) > SLOP || Math.abs(ty) > SLOP;

      // Arm from drag direction; re-arm while the flap is still tiny.
      if (beyondSlop && armedKeySv.value === -1) {
        const key = Math.abs(tx) >= Math.abs(ty) ? (tx > 0 ? 0 : 1) : (ty > 0 ? 2 : 3);
        armedKeySv.value = key;
        creaseSv.value =
          key === 0 ? leftEdgePx : key === 1 ? rightEdgePx : key === 2 ? topEdgePx : bottomEdgePx;
        dropIdxSv.value = 0;
        dropOpacitySv.value = 0;
        runOnJS(jsArm)(key as ArmKey);
      }
      if (armedKeySv.value === -1) return;

      const key = armedKeySv.value;

      // Allow changing direction while the fold is barely started.
      const edge =
        key === 0 ? leftEdgePx : key === 1 ? rightEdgePx : key === 2 ? topEdgePx : bottomEdgePx;
      if (beyondSlop && Math.abs(creaseSv.value - edge) < cell * 0.4) {
        const want = Math.abs(tx) >= Math.abs(ty) ? (tx > 0 ? 0 : 1) : (ty > 0 ? 2 : 3);
        if (want !== key) {
          armedKeySv.value = want;
          creaseSv.value =
            want === 0
              ? leftEdgePx
              : want === 1
                ? rightEdgePx
                : want === 2
                  ? topEdgePx
                  : bottomEdgePx;
          dropIdxSv.value = 0;
          dropOpacitySv.value = 0;
          runOnJS(jsArm)(want as ArmKey);
          return;
        }
      }

      // Just record where the finger is. The crease itself is advanced by
      // the frame callback below, so that holding still at an edge keeps the
      // paper sliding instead of stalling until the finger moves again.
      fingerXSv.value = e.x;
      fingerYSv.value = e.y;
    })
    .onFinalize((_e, success) => {
      const key = armedKeySv.value;
      // Stop the frame driver before animating anything: it writes the crease
      // every frame while armed, so it would fight the settle animations below.
      armedKeySv.value = -1;
      dragPanXSv.value = withTiming(0, { duration: 160 });
      dragPanYSv.value = withTiming(0, { duration: 160 });

      // `success` is false when the system took the touch away -- Android's
      // back-swipe and edge panels do this near the screen border. Committing
      // then would fold the paper without the player ever letting go, so an
      // interrupted gesture snaps back instead.
      if (key === -1 || !success) {
        creaseSv.value = withTiming(
          key === 0
            ? leftEdgePx
            : key === 1
              ? rightEdgePx
              : key === 2
                ? topEdgePx
                : bottomEdgePx,
          { duration: 140 }
        );
        runOnJS(jsClear)();
        return;
      }
      const edge =
        key === 0 ? leftEdgePx : key === 1 ? rightEdgePx : key === 2 ? topEdgePx : bottomEdgePx;
      const span = key <= 1 ? nCols : nRows;
      const idx = Math.min(Math.max(Math.round(Math.abs(creaseSv.value - edge) / cell), 0), span);
      if (idx === 0) {
        runOnJS(jsClear)();
        return;
      }
      const target = key === 0 || key === 2 ? edge + idx * cell : edge - idx * cell;
      creaseSv.value = withTiming(target, { duration: 110 }, () => {
        runOnJS(jsCommit)(key as ArmKey, idx);
      });
    });

  // --- derived Skia props (all UI-thread, driven by the continuous crease) ---
  const armVertical = armKey === 0 || armKey === 1;
  const flapOnLow = armKey === 0 || armKey === 2; // flap is the low-coordinate side

  const flapTransform = useDerivedValue(() => {
    const c = creaseSv.value;
    if (armVertical) return [{ translateX: c }, { scaleX: -1 }, { translateX: -c }];
    return [{ translateY: c }, { scaleY: -1 }, { translateY: -c }];
  }, [armVertical]);

  // Base pass shows only the side beyond the crease; flap pass (source
  // coords, pre-mirror) shows only the side before it.
  const baseClip = useDerivedValue(() => {
    const c = creaseSv.value;
    if (armVertical) {
      return flapOnLow ? rect(c, -BIG, BIG * 2, BIG * 2) : rect(-BIG, -BIG, c + BIG, BIG * 2);
    }
    return flapOnLow ? rect(-BIG, c, BIG * 2, BIG * 2) : rect(-BIG, -BIG, BIG * 2, c + BIG);
  }, [armVertical, flapOnLow]);
  const flapClip = useDerivedValue(() => {
    const c = creaseSv.value;
    if (armVertical) {
      return flapOnLow ? rect(-BIG, -BIG, c + BIG, BIG * 2) : rect(c, -BIG, BIG * 2, BIG * 2);
    }
    return flapOnLow ? rect(-BIG, -BIG, BIG * 2, c + BIG) : rect(-BIG, c, BIG * 2, BIG * 2);
  }, [armVertical, flapOnLow]);

  // Where the paper's folding EDGE will land when released (the edge mirrors
  // across the snapped crease, so it travels two cells per folded cell).
  const dropLinePos = useDerivedValue(() => {
    if (armKey === null) return -100;
    const edge =
      armKey === 0 ? leftEdgePx : armKey === 1 ? rightEdgePx : armKey === 2 ? topEdgePx : bottomEdgePx;
    const idx = dropIdxSv.value;
    if (idx === 0) return -100;
    const px = armKey === 0 || armKey === 2 ? edge + 2 * idx * cell : edge - 2 * idx * cell;
    return px - 1.5;
  }, [armKey, leftEdgePx, rightEdgePx, topEdgePx, bottomEdgePx, cell]);
  const dropLineX = useDerivedValue(
    () => (armVertical ? dropLinePos.value : leftEdgePx),
    [armVertical, leftEdgePx]
  );
  const dropLineY = useDerivedValue(
    () => (armVertical ? topEdgePx : dropLinePos.value),
    [armVertical, topEdgePx]
  );

  // --- render data ---
  const occupied = useMemo(() => {
    const seen = new Set<string>();
    const out: { pos: CellCoord; depth: number; faceUp: boolean }[] = [];
    for (const cs of state.cells) {
      const k = `${cs.position.row}:${cs.position.col}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const stack = getStackAt(state, cs.position);
      out.push({ pos: cs.position, depth: stack.length, faceUp: stack[0].faceUp });
    }
    return out;
  }, [state]);

  // Continuous paper: cells butt together; depth reads as overlaid regions.
  const renderCell = (c: { pos: CellCoord; depth: number; faceUp: boolean }, flipped = false) => (
    <Rect
      key={`${c.pos.row}:${c.pos.col}`}
      x={screenX(c.pos.col)}
      y={screenY(c.pos.row)}
      width={cell}
      height={cell}
      color={paperColor(palette, c.depth, flipped ? !c.faceUp : c.faceUp, twoSided)}
    />
  );

  // Crease lines on every internal boundary -- i.e. only between two cells
  // that are both paper, so holes and outer edges stay clean.
  const creaseSegments = useMemo(() => {
    const filled = new Set(occupied.map((c) => `${c.pos.row}:${c.pos.col}`));
    const segs: { key: string; x: number; y: number; w: number; h: number }[] = [];
    for (const { pos } of occupied) {
      if (filled.has(`${pos.row}:${pos.col + 1}`)) {
        segs.push({
          key: `cv${pos.row}:${pos.col}`,
          x: screenX(pos.col + 1),
          y: screenY(pos.row),
          w: 1,
          h: cell,
        });
      }
      if (filled.has(`${pos.row + 1}:${pos.col}`)) {
        segs.push({
          key: `ch${pos.row}:${pos.col}`,
          x: screenX(pos.col),
          y: screenY(pos.row + 1),
          w: cell,
          h: 1,
        });
      }
    }
    return segs;
  }, [occupied, cell, originX, originY]);

  const renderCreases = () =>
    creaseSegments.map((s) => (
      <Rect key={s.key} x={s.x} y={s.y} width={s.w} height={s.h} color={palette.crease} />
    ));

  const renderSheetShadow = (c: { pos: CellCoord }) => (
    <Rect
      key={`sh${c.pos.row}:${c.pos.col}`}
      x={screenX(c.pos.col) + 5}
      y={screenY(c.pos.row) + 6}
      width={cell}
      height={cell}
      color={theme.colors.paperShadow}
    />
  );

  // Hint visuals: gold crease + an arrow on the moving side pointing across.
  const hintShapes = useMemo(() => {
    if (!hint) return null;
    const isV = hint.axis === 'vertical';
    const cPx = isV ? screenX(hint.line + 1) : screenY(hint.line + 1);
    const lo = isV ? screenY(bounds.minRow) : screenX(bounds.minCol);
    const hi = isV ? screenY(bounds.maxRow + 1) : screenX(bounds.maxCol + 1);
    const mid = (lo + hi) / 2;
    const away = hint.moves === 'lower' ? -cell * 0.55 : cell * 0.55;
    const dir = hint.moves === 'lower' ? 1 : -1;
    const ax = isV ? cPx + away : mid;
    const ay = isV ? mid : cPx + away;
    const s = Math.min(cell * 0.22, 16);
    const arrow = isV
      ? `M ${ax - dir * s} ${ay - s} L ${ax + dir * s} ${ay} L ${ax - dir * s} ${ay + s} Z`
      : `M ${ax - s} ${ay - dir * s} L ${ax} ${ay + dir * s} L ${ax + s} ${ay - dir * s} Z`;
    return { isV, cPx, lo, hi, arrow };
  }, [hint, state, cell]);

  const folding = armKey !== null;

  return (
    <GestureDetector gesture={pan}>
      <View style={{ width: size, height: size }}>
        <Canvas style={{ width: size, height: size }}>
         <Group transform={contentTransform}>
          {/* stationary paper (clipped to beyond the crease while folding) */}
          {folding ? (
            <Group clip={baseClip}>
              {occupied.map(renderSheetShadow)}
              {occupied.map((c) => renderCell(c))}
              {renderCreases()}
            </Group>
          ) : (
            <Group>
              {occupied.map(renderSheetShadow)}
              {occupied.map((c) => renderCell(c))}
              {renderCreases()}
            </Group>
          )}

          {/* the flap: mirrored across the continuous crease, back face up,
              slightly transparent so the layers underneath ghost through */}
          {folding && (
            <Group transform={flapTransform} opacity={FLAP_OPACITY}>
              <Group clip={flapClip}>
                {occupied.map((c) => (
                  <Rect
                    key={`fsh${c.pos.row}:${c.pos.col}`}
                    // Negated on the mirrored axis so the shadow still falls
                    // down-right on screen after the flap flips over.
                    x={screenX(c.pos.col) + (armVertical ? -4 : 4)}
                    y={screenY(c.pos.row) + (armVertical ? 5 : -5)}
                    width={cell}
                    height={cell}
                    color={theme.colors.paperShadow}
                  />
                ))}
                {occupied.map((c) => renderCell(c, true))}
                {renderCreases()}
              </Group>
            </Group>
          )}

          {/* goal zone: always visible, above everything but the hint */}
          {goalCells?.map((g) => (
            <Rect
              key={`goal${g.row}:${g.col}`}
              x={screenX(g.col)}
              y={screenY(g.row)}
              width={cell}
              height={cell}
              color={palette.tintDeep}
              opacity={0.55}
            />
          ))}

          {/* pins: fastened to the table, these cells never move */}
          {pins.map((p) => (
            <Group key={`pin${p.row}:${p.col}`}>
              <Circle
                cx={screenX(p.col) + cell / 2}
                cy={screenY(p.row) + cell / 2}
                r={Math.max(cell * 0.16, 7)}
                color="#1c2333"
              />
              <Circle
                cx={screenX(p.col) + cell / 2}
                cy={screenY(p.row) + cell / 2}
                r={Math.max(cell * 0.06, 2.5)}
                color="#f2ede3"
              />
            </Group>
          ))}

          {/* where the paper's edge will land when released */}
          {folding && (
            <Rect
              x={dropLineX}
              y={dropLineY}
              width={armVertical ? 3 : (nCols + 1) * cell}
              height={armVertical ? (nRows + 1) * cell : 3}
              color={palette.accent}
              opacity={dropOpacitySv}
            />
          )}

          {/* hint: suggested crease + direction arrow */}
          {hintShapes && (
            <Group>
              <RoundedRect
                x={hintShapes.isV ? hintShapes.cPx - 2 : hintShapes.lo}
                y={hintShapes.isV ? hintShapes.lo : hintShapes.cPx - 2}
                width={hintShapes.isV ? 4 : hintShapes.hi - hintShapes.lo}
                height={hintShapes.isV ? hintShapes.hi - hintShapes.lo : 4}
                r={2}
                color={palette.accent}
              />
              <Path path={hintShapes.arrow} color={palette.accent} />
            </Group>
          )}
         </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
}
