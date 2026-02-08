export class Rect {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;

  /**
   * Class for representing rectangular regions.
   * https://github.com/google/closure-library/blob/master/closure/goog/math/rect.js
   * @param x Left.
   * @param y Top.
   * @param width Width.
   * @param height Height.
   * @param id Identifier.
   */
  constructor(x: number, y: number, width: number, height: number, id: number) {
    this.id = id;
    this.left = x;
    this.top = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Returns whether two rectangles intersect.
   * @param rectA A rectangle.
   * @param rectB A rectangle.
   * @return Whether a and b intersect.
   */
  static intersects(rectA: Rect, rectB: Rect): boolean {
    return (
      rectA.left < rectB.left + rectB.width &&
      rectB.left < rectA.left + rectA.width &&
      rectA.top < rectB.top + rectB.height &&
      rectB.top < rectA.top + rectA.height
    );
  }
}
