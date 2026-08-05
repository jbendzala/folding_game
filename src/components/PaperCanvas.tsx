import { useMemo, useRef, useState } from 'react';
import { Canvas, Group, Path, Rect, RoundedRect } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { isValidFold } from '../core/fold';
import { getBounds, getStackAt } from '../core/grid';
import type { CellCoord, Fold, FoldState } from '../core/types';
import type { ShapePattern } from '../core/types';
import { paperColor, theme } from '../theme';

// Travel before a drag commits to an axis/direction.
const SLOP = 8;

// armedKey encoding shared between the UI-thread worklet and JS:
// 0 = dragging right (left edge folds over)   1 = dragging left
// 2 = dragging down (top edge folds over)     3 = dragging up
type ArmKey = 0 | 1 | 2 | 3;

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
  onFold: (fold: Fold) => void;
}

/**
 * The interactive paper, folded like real paper: drag in any direction and
 * the sheet's edge on the opposite side folds over toward your finger. The
 * crease sits at the midpoint between that edge and your finger (paper
 * physics), snapped live to cell boundaries -- so one long drag folds a 6x6
 * clean in half, and dragging further folds more. Release commits the fold
 * where the crease sits; drag back to shrink the flap to nothing and release
 * to cancel.
 *
 * Per-frame work runs on the UI thread: the crease position is a Reanimated
 * shared value feeding Skia directly. React state changes only when the
 * crease crosses a cell boundary (flap membership) and on commit.
 */
export function PaperCanvas({ state, start, size, goalCells, hint, onFold }: PaperCanvasProps) {
  const [armKey, setArmKey] = useState<ArmKey | null>(null);
  const [creaseIdx, setCreaseIdx] = useState(0);
  const armRef = useRef<{ key: ArmKey; idx: number }>({ key: 0, idx: 0 });

  // --- geometry (frozen per level via `start`) ---
  const maxDim = Math.max(start.width, start.height);
  const cell = Math.max(24, Math.floor((size - 24) / maxDim));
  const originX = (size - start.width * cell) / 2;
  const originY = (size - start.height * cell) / 2;
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

  // --- animation state ---
  const creaseSv = useSharedValue(0);
  const armedKeySv = useSharedValue(-1);
  const idxSv = useSharedValue(0);

  function jsArm(key: ArmKey) {
    armRef.current = { key, idx: 0 };
    setArmKey(key);
    setCreaseIdx(0);
  }

  function jsSetIdx(idx: number) {
    armRef.current.idx = idx;
    setCreaseIdx(idx);
  }

  function jsRelease() {
    const { key, idx } = armRef.current;
    if (armKeyValid(key) && idx > 0) {
      const fold: Fold =
        key === 0
          ? { axis: 'vertical', line: bounds.minCol + idx - 1, moves: 'lower' }
          : key === 1
            ? { axis: 'vertical', line: bounds.maxCol - idx, moves: 'upper' }
            : key === 2
              ? { axis: 'horizontal', line: bounds.minRow + idx - 1, moves: 'lower' }
              : { axis: 'horizontal', line: bounds.maxRow - idx, moves: 'upper' };
      if (isValidFold(state, fold)) onFold(fold);
    }
    armRef.current = { key: 0, idx: 0 };
    setArmKey(null);
    setCreaseIdx(0);
    idxSv.value = 0;
    armedKeySv.value = -1;
  }

  function armKeyValid(key: number): key is ArmKey {
    return key >= 0 && key <= 3;
  }

  const pan = Gesture.Pan()
    .onBegin(() => {
      idxSv.value = 0;
      armedKeySv.value = -1;
    })
    .onUpdate((e) => {
      const tx = e.translationX;
      const ty = e.translationY;

      // Arm (or re-arm while the flap is empty) from the drag direction.
      const beyondSlop = Math.abs(tx) > SLOP || Math.abs(ty) > SLOP;
      if (beyondSlop && (armedKeySv.value === -1 || idxSv.value === 0)) {
        const key = Math.abs(tx) >= Math.abs(ty) ? (tx > 0 ? 0 : 1) : (ty > 0 ? 2 : 3);
        if (key !== armedKeySv.value) {
          armedKeySv.value = key;
          // Start the crease at the folding edge so the slide begins there.
          creaseSv.value =
            key === 0 ? leftEdgePx : key === 1 ? rightEdgePx : key === 2 ? topEdgePx : bottomEdgePx;
          runOnJS(jsArm)(key as ArmKey);
        }
      }
      if (armedKeySv.value === -1) return;

      // Crease = midpoint between the folding edge and the finger, snapped
      // to the nearest cell boundary inside the sheet.
      const key = armedKeySv.value;
      let idx = 0;
      if (key === 0) {
        idx = Math.round(((leftEdgePx + e.x) / 2 - leftEdgePx) / cell);
        idx = Math.min(Math.max(idx, 0), nCols);
      } else if (key === 1) {
        idx = Math.round((rightEdgePx - (rightEdgePx + e.x) / 2) / cell);
        idx = Math.min(Math.max(idx, 0), nCols);
      } else if (key === 2) {
        idx = Math.round(((topEdgePx + e.y) / 2 - topEdgePx) / cell);
        idx = Math.min(Math.max(idx, 0), nRows);
      } else {
        idx = Math.round((bottomEdgePx - (bottomEdgePx + e.y) / 2) / cell);
        idx = Math.min(Math.max(idx, 0), nRows);
      }

      if (idx !== idxSv.value) {
        idxSv.value = idx;
        const px =
          key === 0
            ? leftEdgePx + idx * cell
            : key === 1
              ? rightEdgePx - idx * cell
              : key === 2
                ? topEdgePx + idx * cell
                : bottomEdgePx - idx * cell;
        creaseSv.value = withTiming(px, { duration: 90 });
        runOnJS(jsSetIdx)(idx);
      }
    })
    .onFinalize(() => {
      runOnJS(jsRelease)();
    });

  // --- derived Skia props ---
  const armVertical = armKey === 0 || armKey === 1; // vertical crease line
  const flapTransform = useDerivedValue(() => {
    const c = creaseSv.value;
    if (armVertical) {
      return [{ translateX: c }, { scaleX: -1 }, { translateX: -c }];
    }
    return [{ translateY: c }, { scaleY: -1 }, { translateY: -c }];
  }, [armVertical]);
  const creaseLineX = useDerivedValue(
    () => (armVertical ? creaseSv.value - 1.5 : leftEdgePx),
    [armVertical, leftEdgePx]
  );
  const creaseLineY = useDerivedValue(
    () => (armVertical ? topEdgePx : creaseSv.value - 1.5),
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

  // Which board positions ride the current flap.
  const flapSet = useMemo(() => {
    const s = new Set<string>();
    if (armKey === null || creaseIdx === 0) return s;
    for (const { pos } of occupied) {
      const inFlap =
        armKey === 0
          ? pos.col <= bounds.minCol + creaseIdx - 1
          : armKey === 1
            ? pos.col >= bounds.maxCol - creaseIdx + 1
            : armKey === 2
              ? pos.row <= bounds.minRow + creaseIdx - 1
              : pos.row >= bounds.maxRow - creaseIdx + 1;
      if (inFlap) s.add(`${pos.row}:${pos.col}`);
    }
    return s;
  }, [armKey, creaseIdx, occupied, bounds]);

  const staticCells = occupied.filter((c) => !flapSet.has(`${c.pos.row}:${c.pos.col}`));
  const flapCells = occupied.filter((c) => flapSet.has(`${c.pos.row}:${c.pos.col}`));

  // Continuous paper: cells butt together (no gap, no per-cell rounding).
  // Depth differences read as overlaid paper regions, exactly like the real
  // thing; the whole sheet gets one soft drop shadow.
  const renderCell = (c: { pos: CellCoord; depth: number; faceUp: boolean }, flipped = false) => (
    <Rect
      key={`${c.pos.row}:${c.pos.col}`}
      x={screenX(c.pos.col)}
      y={screenY(c.pos.row)}
      width={cell}
      height={cell}
      color={paperColor(c.depth, flipped ? !c.faceUp : c.faceUp)}
    />
  );

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

  const flapActive = armKey !== null && creaseIdx > 0;

  return (
    <GestureDetector gesture={pan}>
      <View style={{ width: size, height: size }}>
        <Canvas style={{ width: size, height: size }}>
          {/* sheet drop shadow + resting paper */}
          {staticCells.map(renderSheetShadow)}
          {staticCells.map((c) => renderCell(c))}

          {/* the flap, mirrored across the (animated) crease */}
          {flapActive && (
            <Group transform={flapTransform}>
              {flapCells.map((c) => (
                <Rect
                  key={`lift${c.pos.row}:${c.pos.col}`}
                  x={screenX(c.pos.col) + 4}
                  y={screenY(c.pos.row) + 5}
                  width={cell}
                  height={cell}
                  color={theme.colors.paperShadow}
                />
              ))}
              {flapCells.map((c) => renderCell(c, true))}
            </Group>
          )}

          {/* goal zone: the cells the final shape must cover, tinted whole */}
          {goalCells?.map((g) => (
            <Rect
              key={`goal${g.row}:${g.col}`}
              x={screenX(g.col)}
              y={screenY(g.row)}
              width={cell}
              height={cell}
              color={theme.colors.accent}
              opacity={0.4}
            />
          ))}

          {/* active crease line (follows the animated crease) */}
          {flapActive && (
            <Rect
              x={creaseLineX}
              y={creaseLineY}
              width={armVertical ? 3 : (nCols + 1) * cell}
              height={armVertical ? (nRows + 1) * cell : 3}
              color={theme.colors.accent}
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
                color={theme.colors.gold}
              />
              <Path path={hintShapes.arrow} color={theme.colors.gold} />
            </Group>
          )}
        </Canvas>
      </View>
    </GestureDetector>
  );
}
