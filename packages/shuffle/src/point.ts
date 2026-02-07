import { getNumber } from './get-number';

export class Point {
  x: number;
  y: number;

  /**
   * Represents a coordinate pair.
   * @param x X coordinate.
   * @param y Y coordinate.
   */
  constructor(x?: number | string, y?: number | string) {
    this.x = getNumber(x);
    this.y = getNumber(y);
  }

  /**
   * Whether two points are equal.
   * @param a Point A.
   * @param b Point B.
   * @return Whether the points are equal.
   */
  static equals(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }
}
