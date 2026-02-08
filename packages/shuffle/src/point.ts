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
   * @param pointA Point A.
   * @param pointB Point B.
   * @return Whether the points are equal.
   */
  static equals(pointA: Point, pointB: Point): boolean {
    return pointA.x === pointB.x && pointA.y === pointB.y;
  }
}
