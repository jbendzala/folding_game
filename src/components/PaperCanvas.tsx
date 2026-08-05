import { useMemo, useRef, useState } from 'react';
import { Canvas, Circle, Group, Path, RoundedRect } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { isValidFold } from '../core/fold';
import { getBounds, getStackAt } from '../core/grid';
import type { CellCoord, Fold, FoldState, ShapePattern } from '../core/types';
import { paperColor, theme } from '../theme';

// Gesture tuning. SLOP: travel before we commit to an axis/direction.
// COMMIT: fold progress (0..1) beyond which release completes the fold.
const SLOP = 8;
const COMMIT = 0.22;

// armedKey encoding shared between the UI-thread worklet and JS:
// 0 = horizontal drag, positive (fold left side rightward)
// 1 = horizontal drag, negative   2 = vertical drag, positive   3 = negative
type ArmKey = 0 | 1 | 2 | 3;

interface FlapDesc {
  fold: Fold;
  /** Distinct board positions that ride the fold. */
  positions: CellCoord[];
  /** Screen-x (vertical fold) or screen-y (horizontal) of the crease. */
  creasePx: number;
  /** Flap extent from crease to far edge, in px -- normalizes drag progress. */
  spanPx: number;
}

interface PaperCanvasProps {
  state: FoldState;
  /** The level's starting shape -- fixes the coordinate frame and cell size
   * for the whole level so the paper never rescales or recenters mid-play. */
  start: ShapePattern;
  /** Canvas edge length in px. */
  size: number;
  /** Board coordinate the final cell must land on (Worlds 1-2 goals). */
  anchor?: CellCoord;
  /** A suggested next fold to visualize (hint system). */
  hint?: Fold | null;
  onFold: (fold: Fold) => void;
}

/**
 * The interactive paper. Drag anywhere on the sheet: the side of the grabbed
 * cell in your drag direction becomes a flap that folds live under your
 * finger -- rendered by scaling the flap group from 1 to -1 across the crease
 * (a top-down view of paper flipping over). Release past the commit point
 * and it snaps closed (then commits to the engine); release early and it
 * springs back open.
 *
 * Everything per-frame runs on the UI thread via Reanimated shared values
 * feeding Skia props directly; React state only changes when a drag arms
 * (once) and when a fold commits.
 */
export function PaperCanvas({ state, start, size, anchor, hint, onFold }: PaperCanvasProps) {
  const [flap, setFlap] = useState<FlapDesc | null>(null);
  const flapRef = useRef<FlapDesc | null>(null);

  // --- geometry (frozen per level via `start`) ---
  const maxDim = Math.max(start.width, start.height);
  const cell = Math.max(24, Math.min(56, Math.floor((size - 32) / maxDim)));
  const gap = Math.max(2, Math.round(cell * 0.055));
  const originX = (size - start.width * cell) / 2;
  const originY = (size - start.height * cell) / 2;
  const screenX = (col: number) => originX + col * cell;
  const screenY = (row: number) => originY + row * cell;

  // --- animation state ---
  const progress = useSharedValue(0);
  const armedKey = useSharedValue(-1);
  const readyKey = useSharedValue(-1);
  const denom = useSharedValue(1e9);
  const startXSv = useSharedValue(0);
  const startYSv = useSharedValue(0);

  const bounds = getBounds(state.cells);

  function armFlap(x: number, y: number, key: number) {
    const grabbed: CellCoord = {
      col: Math.max(bounds.minCol, Math.min(bounds.maxCol, Math.floor((x - originX) / cell))),
      row: Math.max(bounds.minRow, Math.min(bounds.maxRow, Math.floor((y - originY) / cell))),
    };
    const fold: Fold =
      key === 0
        ? { axis: 'vertical', line: grabbed.col, moves: 'lower' }
        : key === 1
          ? { axis: 'vertical', line: grabbed.col - 1, moves: 'upper' }
          : key === 2
            ? { axis: 'horizontal', line: grabbed.row, moves: 'lower' }
            : { axis: 'horizontal', line: grabbed.row - 1, moves: 'upper' };

    if (!isValidFold(state, fold)) {
      flapRef.current = null;
      setFlap(null);
      denom.value = 1e9; // progress stays pinned at 0 -> release cancels
      readyKey.value = key;
      return;
    }

    const axisKey = fold.axis === 'vertical' ? 'col' : 'row';
    const seen = new Set<string>();
    const positions: CellCoord[] = [];
    for (const cs of state.cells) {
      const v = cs.position[axisKey];
      const moving = fold.moves === 'lower' ? v <= fold.line : v > fold.line;
      if (!moving) continue;
      const k = `${cs.position.row}:${cs.position.col}`;
      if (seen.has(k)) continue;
      seen.add(k);
      positions.push(cs.position);
    }

    const values = positions.map((p) => p[axisKey]);
    const far = fold.moves === 'lower' ? Math.min(...values) : Math.max(...values);
    const creasePx =
      fold.axis === 'vertical' ? screenX(fold.line + 1) : screenY(fold.line + 1);
    // Crease-to-far-edge extent: 'lower' flap spans (far .. line], 'upper'
    // spans (line .. far]. Both are a whole number of cells.
    const spanCells = fold.moves === 'lower' ? fold.line + 1 - far : far - fold.line;

    const desc: FlapDesc = {
      fold,
      positions,
      creasePx,
      spanPx: Math.max(spanCells * cell, cell),
    };
    flapRef.current = desc;
    setFlap(desc);
    denom.value = 2 * desc.spanPx;
    readyKey.value = key;
  }

  function commitFold() {
    const desc = flapRef.current;
    flapRef.current = null;
    setFlap(null);
    if (desc) onFold(desc.fold);
    progress.value = 0;
    armedKey.value = -1;
    readyKey.value = -1;
  }

  function cancelFlap() {
    flapRef.current = null;
    setFlap(null);
    progress.value = 0;
    armedKey.value = -1;
    readyKey.value = -1;
  }

  const pan = Gesture.Pan()
    .onBegin((e) => {
      startXSv.value = e.x;
      startYSv.value = e.y;
      progress.value = 0;
      armedKey.value = -1;
      readyKey.value = -1;
    })
    .onUpdate((e) => {
      const tx = e.translationX;
      const ty = e.translationY;

      if (armedKey.value === -1) {
        if (Math.abs(tx) < SLOP && Math.abs(ty) < SLOP) return;
        const key: ArmKey =
          Math.abs(tx) >= Math.abs(ty) ? (tx > 0 ? 0 : 1) : (ty > 0 ? 2 : 3);
        armedKey.value = key;
        runOnJS(armFlap)(startXSv.value, startYSv.value, key);
        return;
      }

      const horizontalArm = armedKey.value <= 1;
      const t = horizontalArm ? tx : ty;
      const sign = armedKey.value === 0 || armedKey.value === 2 ? 1 : -1;
      const raw = (sign * t) / Math.max(denom.value, 1);

      // Barely folded and the finger reversed / changed axis? Re-arm so the
      // player can change their mind without lifting.
      if (raw <= 0.02 && (Math.abs(tx) > SLOP || Math.abs(ty) > SLOP)) {
        const key: ArmKey =
          Math.abs(tx) >= Math.abs(ty) ? (tx > 0 ? 0 : 1) : (ty > 0 ? 2 : 3);
        if (key !== armedKey.value) {
          armedKey.value = key;
          progress.value = 0;
          runOnJS(armFlap)(startXSv.value, startYSv.value, key);
          return;
        }
      }

      if (readyKey.value === armedKey.value) {
        progress.value = Math.min(Math.max(raw, 0), 1);
      }
    })
    .onFinalize(() => {
      if (readyKey.value === -1) {
        runOnJS(cancelFlap)();
        return;
      }
      if (progress.value >= COMMIT) {
        progress.value = withTiming(
          1,
          { duration: 170, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(commitFold)();
            else runOnJS(cancelFlap)();
          }
        );
      } else {
        progress.value = withTiming(
          0,
          { duration: 150, easing: Easing.out(Easing.quad) },
          () => runOnJS(cancelFlap)()
        );
      }
    });

  // --- derived Skia props (all UI-thread) ---
  const creaseVertical = flap?.fold.axis === 'vertical';
  const creasePx = flap?.creasePx ?? 0;
  const flapTransform = useDerivedValue(() => {
    const s = 1 - 2 * progress.value;
    if (!creaseVertical) {
      return [{ translateY: creasePx }, { scaleY: s }, { translateY: -creasePx }];
    }
    return [{ translateX: creasePx }, { scaleX: s }, { translateX: -creasePx }];
  }, [creaseVertical, creasePx]);
  const shadeOpacity = useDerivedValue(() => progress.value * 0.25);
  const liftOpacity = useDerivedValue(() => Math.sin(progress.value * Math.PI) * 0.3);
  const creaseOpacity = useDerivedValue(() => Math.min(progress.value * 6, 1) * 0.85);

  // --- static geometry for this render ---
  const flapSet = useMemo(() => {
    const s = new Set<string>();
    for (const p of flap?.positions ?? []) s.add(`${p.row}:${p.col}`);
    return s;
  }, [flap]);

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

  const staticCells = occupied.filter((c) => !flapSet.has(`${c.pos.row}:${c.pos.col}`));
  const flapCells = occupied.filter((c) => flapSet.has(`${c.pos.row}:${c.pos.col}`));

  const renderCell = (c: { pos: CellCoord; depth: number; faceUp: boolean }) => (
    <RoundedRect
      key={`${c.pos.row}:${c.pos.col}`}
      x={screenX(c.pos.col) + gap / 2}
      y={screenY(c.pos.row) + gap / 2}
      width={cell - gap}
      height={cell - gap}
      r={theme.radius.cell}
      color={paperColor(c.depth, c.faceUp)}
    />
  );

  const renderStackShadow = (c: { pos: CellCoord; depth: number }) =>
    c.depth > 1 ? (
      <RoundedRect
        key={`sh${c.pos.row}:${c.pos.col}`}
        x={screenX(c.pos.col) + gap / 2 + Math.min(c.depth, 4)}
        y={screenY(c.pos.row) + gap / 2 + Math.min(c.depth, 4)}
        width={cell - gap}
        height={cell - gap}
        r={theme.radius.cell}
        color={theme.colors.paperShadow}
      />
    ) : null;

  // Hint visuals: amber crease + an arrow on the moving side pointing across.
  const hintShapes = useMemo(() => {
    if (!hint) return null;
    const b = getBounds(state.cells);
    const isV = hint.axis === 'vertical';
    const cPx = isV ? screenX(hint.line + 1) : screenY(hint.line + 1);
    const lo = isV ? screenY(b.minRow) : screenX(b.minCol);
    const hi = isV ? screenY(b.maxRow + 1) : screenX(b.maxCol + 1);
    const mid = (lo + hi) / 2;
    const away = hint.moves === 'lower' ? -cell * 0.55 : cell * 0.55;
    const dir = hint.moves === 'lower' ? 1 : -1; // points toward the stationary side
    const ax = isV ? cPx + away : mid;
    const ay = isV ? mid : cPx + away;
    const s = cell * 0.22;
    const arrow = isV
      ? `M ${ax - dir * s} ${ay - s} L ${ax + dir * s} ${ay} L ${ax - dir * s} ${ay + s} Z`
      : `M ${ax - s} ${ay - dir * s} L ${ax} ${ay + dir * s} L ${ax + s} ${ay - dir * s} Z`;
    return { isV, cPx, lo, hi, arrow };
  }, [hint, state, cell]);

  return (
    <GestureDetector gesture={pan}>
      <View style={{ width: size, height: size }}>
        <Canvas style={{ width: size, height: size }}>
          {/* stack-depth shadows, then resting paper */}
          {staticCells.map(renderStackShadow)}
          {staticCells.map(renderCell)}

          {/* target: where the final cell must land */}
          {anchor && (
            <Circle
              cx={screenX(anchor.col) + cell / 2}
              cy={screenY(anchor.row) + cell / 2}
              r={cell * 0.14}
              color={theme.colors.accent}
              style="stroke"
              strokeWidth={3}
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

          {/* active crease line */}
          {flap && (
            <RoundedRect
              x={creaseVertical ? creasePx - 1.5 : screenX(bounds.minCol)}
              y={creaseVertical ? screenY(bounds.minRow) : creasePx - 1.5}
              width={creaseVertical ? 3 : (bounds.maxCol - bounds.minCol + 1) * cell}
              height={creaseVertical ? (bounds.maxRow - bounds.minRow + 1) * cell : 3}
              r={1.5}
              color={theme.colors.accent}
              opacity={creaseOpacity}
            />
          )}

          {/* the flap: scales 1 -> -1 across the crease = paper flipping over */}
          {flap && (
            <Group transform={flapTransform}>
              {flapCells.map((c) => (
                <RoundedRect
                  key={`lift${c.pos.row}:${c.pos.col}`}
                  x={screenX(c.pos.col) + gap / 2 + 3}
                  y={screenY(c.pos.row) + gap / 2 + 3}
                  width={cell - gap}
                  height={cell - gap}
                  r={theme.radius.cell}
                  color="black"
                  opacity={liftOpacity}
                />
              ))}
              {flapCells.map(renderCell)}
              {flapCells.map((c) => (
                <RoundedRect
                  key={`shade${c.pos.row}:${c.pos.col}`}
                  x={screenX(c.pos.col) + gap / 2}
                  y={screenY(c.pos.row) + gap / 2}
                  width={cell - gap}
                  height={cell - gap}
                  r={theme.radius.cell}
                  color="black"
                  opacity={shadeOpacity}
                />
              ))}
            </Group>
          )}
        </Canvas>
      </View>
    </GestureDetector>
  );
}
