import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';
import { getBounds, getStackAt } from '../core/grid';
import type { CellCoord, FoldState } from '../core/types';

const CELL_SIZE = 40;
const CELL_GAP = 2;
const CANVAS_SIZE = 340;

// One fill per stack depth -- deeper stacks read as visibly "thicker" paper.
// Falls back to the last color for anything deeper than we bothered to name.
const LAYER_COLORS = ['#eef3fb', '#a9c6ec', '#6f9bd6', '#3f6cb0', '#274a85', '#152c52'];
const layerColor = (depth: number) => LAYER_COLORS[Math.min(depth, LAYER_COLORS.length) - 1];

export interface FoldLine {
  axis: 'vertical' | 'horizontal';
  line: number;
}

interface PaperCanvasProps {
  state: FoldState;
  /** Optional cell to render with a target ring (used before the first fold). */
  targetCell?: CellCoord;
  /** Currently armed fold line, highlighted while the player picks a direction. */
  selectedLine?: FoldLine | null;
  onSelectLine?: (line: FoldLine) => void;
}

/**
 * Renders the current shape (via Skia) plus transparent tap zones over every
 * internal grid line (via plain RN Views) so the player can pick a fold line
 * before picking its direction. Two separate layers on purpose: Skia draws,
 * RN handles hit-testing -- simplest thing that reliably works for an MVP.
 */
export function PaperCanvas({ state, targetCell, selectedLine, onSelectLine }: PaperCanvasProps) {
  const bounds = getBounds(state.cells);
  const width = bounds.maxCol - bounds.minCol + 1;
  const height = bounds.maxRow - bounds.minRow + 1;
  const originX = CANVAS_SIZE / 2 - (width * CELL_SIZE) / 2;
  const originY = CANVAS_SIZE / 2 - (height * CELL_SIZE) / 2;

  const screenX = (col: number) => originX + (col - bounds.minCol) * CELL_SIZE;
  const screenY = (row: number) => originY + (row - bounds.minRow) * CELL_SIZE;

  const occupied: CellCoord[] = [];
  const seen = new Set<string>();
  for (const cs of state.cells) {
    const key = `${cs.position.row}:${cs.position.col}`;
    if (seen.has(key)) continue;
    seen.add(key);
    occupied.push(cs.position);
  }

  const verticalLines = Array.from(
    { length: bounds.maxCol - bounds.minCol },
    (_, i) => bounds.minCol + i
  );
  const horizontalLines = Array.from(
    { length: bounds.maxRow - bounds.minRow },
    (_, i) => bounds.minRow + i
  );

  return (
    <View style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
      <Canvas style={StyleSheet.absoluteFill}>
        {occupied.map((pos) => {
          const depth = getStackAt(state, pos).length;
          const isTarget =
            targetCell && pos.row === targetCell.row && pos.col === targetCell.col;
          return (
            <RoundedRect
              key={`${pos.row}:${pos.col}`}
              x={screenX(pos.col) + CELL_GAP / 2}
              y={screenY(pos.row) + CELL_GAP / 2}
              width={CELL_SIZE - CELL_GAP}
              height={CELL_SIZE - CELL_GAP}
              r={6}
              color={isTarget ? '#e0a640' : layerColor(depth)}
            />
          );
        })}
      </Canvas>

      {/* Vertical fold-line tap zones. */}
      {verticalLines.map((line) => {
        const isSelected =
          selectedLine?.axis === 'vertical' && selectedLine.line === line;
        const x = screenX(line + 1);
        return (
          <View
            key={`v${line}`}
            onTouchEnd={() => onSelectLine?.({ axis: 'vertical', line })}
            style={[
              styles.lineZone,
              {
                left: x - 12,
                top: originY,
                width: 24,
                height: height * CELL_SIZE,
                backgroundColor: isSelected ? 'rgba(224,166,64,0.35)' : 'transparent',
              },
            ]}
          >
            <View style={[styles.lineMark, { height: height * CELL_SIZE }]} />
          </View>
        );
      })}

      {/* Horizontal fold-line tap zones. */}
      {horizontalLines.map((line) => {
        const isSelected =
          selectedLine?.axis === 'horizontal' && selectedLine.line === line;
        const y = screenY(line + 1);
        return (
          <View
            key={`h${line}`}
            onTouchEnd={() => onSelectLine?.({ axis: 'horizontal', line })}
            style={[
              styles.lineZone,
              {
                left: originX,
                top: y - 12,
                width: width * CELL_SIZE,
                height: 24,
                backgroundColor: isSelected ? 'rgba(224,166,64,0.35)' : 'transparent',
              },
            ]}
          >
            <View style={[styles.lineMarkHorizontal, { width: width * CELL_SIZE }]} />
          </View>
        );
      })}
    </View>
  );
}

export { CANVAS_SIZE };

const styles = StyleSheet.create({
  lineZone: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineMark: {
    width: 2,
    backgroundColor: 'rgba(60,90,140,0.25)',
  },
  lineMarkHorizontal: {
    height: 2,
    backgroundColor: 'rgba(60,90,140,0.25)',
  },
});
