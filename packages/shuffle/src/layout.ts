import { Point } from './point';
import { Rect } from './rect';

/**
 * Determine the number of columns an items spans.
 * @param itemWidth Width of the item.
 * @param columnWidth Width of the column (includes gutter).
 * @param columns Total number of columns.
 * @param threshold A buffer value for the size of the column to fit.
 * @return The column span.
 */
export function getColumnSpan(itemWidth: number, columnWidth: number, columns: number, threshold: number): number {
  let columnSpan = itemWidth / columnWidth;

  // If the difference between the rounded column span number and the
  // calculated column span number is really small, round the number to
  // make it fit.
  if (Math.abs(Math.round(columnSpan) - columnSpan) < threshold) {
    // e.g. columnSpan = 4.0089945390298745
    columnSpan = Math.round(columnSpan);
  }

  // Ensure the column span is not more than the amount of columns in the whole layout.
  return Math.min(Math.ceil(columnSpan), columns);
}

/**
 * Retrieves the column set to use for placement.
 * @param positions The position array.
 * @param columnSpan The number of columns this current item spans.
 * @param columns The total columns in the grid.
 * @return An array of numbers representing the column set.
 */
export function getAvailablePositions(positions: number[], columnSpan: number, columns: number): number[] {
  // The item spans only one column.
  if (columnSpan === 1) {
    return positions;
  }

  // The item spans more than one column, figure out how many different
  // places it could fit horizontally.
  // The group count is the number of places within the positions this block
  // could fit, ignoring the current positions of items.
  // Imagine a 2 column brick as the second item in a 4 column grid with
  // 10px height each. Find the places it would fit:
  // [20, 10, 10, 0]
  //  |   |   |
  //  *   *   *
  //
  // Then take the places which fit and get the bigger of the two:
  // max([20, 10]), max([10, 10]), max([10, 0]) = [20, 10, 10]
  //
  // Next, find the first smallest number (the short column).
  // [20, 10, 10]
  //      |
  //      *
  //
  // And that's where it should be placed!
  //
  // Another example where the second column's item extends past the first:
  // [10, 20, 10, 0] => [20, 20, 10] => 10
  const available = [];

  // For how many possible positions for this item there are.
  for (let i = 0; i <= columns - columnSpan; i += 1) {
    // Find the bigger value for each place it could fit.
    available.push(Math.max(...positions.slice(i, i + columnSpan)));
  }

  return available;
}

/**
 * Find index of short column, the first from the left where this item will go.
 *
 * @param positions The array to search for the smallest number.
 * @param buffer Optional buffer which is very useful when the height is a percentage of the width.
 * @return Index of the short column.
 */
export function getShortColumn(positions: number[], buffer: number): number {
  const minPosition = Math.min(...positions);
  for (let i = 0, len = positions.length; i < len; i += 1) {
    if (positions[i] >= minPosition - buffer && positions[i] <= minPosition + buffer) {
      return i;
    }
  }

  return 0;
}

interface ItemPositionParams {
  /** Object with width and height. */
  itemSize: { width: number; height: number };
  /** Positions of the other current items. */
  positions: number[];
  /** The column width or row height. */
  gridSize: number;
  /** The total number of columns or rows. */
  total: number;
  /** Buffer value for the column to fit. */
  threshold: number;
  /** Vertical buffer for the height of items. */
  buffer: number;
}

/**
 * Determine the location of the next item, based on its size.
 * @param params Object with itemSize, positions, gridSize, total, threshold, and buffer.
 * @return The point position for the item.
 */
export function getItemPosition({
  itemSize,
  positions,
  gridSize,
  total,
  threshold,
  buffer,
}: ItemPositionParams): Point {
  const span = getColumnSpan(itemSize.width, gridSize, total, threshold);
  const setY = getAvailablePositions(positions, span, total);
  const shortColumnIndex = getShortColumn(setY, buffer);

  // Position the item
  const point = new Point(gridSize * shortColumnIndex, setY[shortColumnIndex]);

  // Update the columns array with the new values for each column.
  // e.g. before the update the columns could be [250, 0, 0, 0] for an item
  // which spans 2 columns. After it would be [250, itemHeight, itemHeight, 0].
  const setHeight = setY[shortColumnIndex] + itemSize.height;
  for (let i = 0; i < span; i += 1) {
    positions[shortColumnIndex + i] = setHeight;
  }

  return point;
}

/**
 * This method attempts to center items. This method could potentially be slow
 * with a large number of items because it must place items, then check every
 * previous item to ensure there is no overlap.
 * @param itemRects Item data objects.
 * @param containerWidth Width of the containing element.
 * @return An array of centered points.
 */
export function getCenteredPositions(itemRects: Rect[], containerWidth: number): Point[] {
  const rowMap: Record<number, Rect[]> = {};

  // Populate rows by their offset because items could jump between rows like:
  // a   c
  //  bbb
  for (const itemRect of itemRects) {
    if (rowMap[itemRect.top] === undefined) {
      // Start of a new row.
      rowMap[itemRect.top] = [itemRect];
    } else {
      // Push the point to the last row array.
      rowMap[itemRect.top].push(itemRect);
    }
  }

  // For each row, find the end of the last item, then calculate
  // the remaining space by dividing it by 2. Then add that
  // offset to the x position of each point.
  const rects: Rect[] = [];
  const rows: Rect[][] = [];
  const centeredRows: Rect[][] = [];
  for (const itemRects of Object.values(rowMap)) {
    rows.push(itemRects);
    const lastItem = itemRects.at(-1)!;
    const end = lastItem.left + lastItem.width;
    const offset = Math.round((containerWidth - end) / 2);

    let finalRects = itemRects;
    let canMove = false;
    if (offset > 0) {
      const newRects: Rect[] = [];
      // oxlint-disable-next-line no-loop-func
      canMove = itemRects.every((comparisonRect) => {
        const newRect = new Rect(
          comparisonRect.left + offset,
          comparisonRect.top,
          comparisonRect.width,
          comparisonRect.height,
          comparisonRect.id,
        );

        // Check all current rects to make sure none overlap.
        const noOverlap = !rects.some((rectangle) => Rect.intersects(newRect, rectangle));

        newRects.push(newRect);
        return noOverlap;
      });

      // If none of the rectangles overlapped, the whole group can be centered.
      if (canMove) {
        finalRects = newRects;
      }
    }

    // If the items are not going to be offset, ensure that the original
    // placement for this row will not overlap previous rows (row-spanning
    // elements could be in the way).
    if (!canMove) {
      let intersectingRect: Rect;
      // oxlint-disable-next-line no-loop-func
      const hasOverlap = itemRects.some((itemRect) =>
        rects.some((comparisonRect) => {
          const intersects = Rect.intersects(itemRect, comparisonRect);
          if (intersects) {
            intersectingRect = comparisonRect;
          }
          return intersects;
        }),
      );

      // If there is any overlap, replace the overlapping row with the original.
      if (hasOverlap) {
        const rowIndex = centeredRows.findIndex((items) => items.includes(intersectingRect));
        centeredRows.splice(rowIndex, 1, rows[rowIndex]);
      }
    }

    rects.push(...finalRects);
    centeredRows.push(finalRects);
  }

  // Reduce array of arrays to a single array of points.
  // https://stackoverflow.com/a/10865042/373422
  // Then reset sort back to how the items were passed to this method.
  // Remove the wrapper object with index, map to a Point.
  return centeredRows
    .flat()
    .toSorted((rowA, rowB) => rowA.id - rowB.id)
    .map((itemRect) => new Point(itemRect.left, itemRect.top));
}
