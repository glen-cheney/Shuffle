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
   * @param w Width.
   * @param h Height.
   * @param id Identifier.
   */
  constructor(x: number, y: number, w: number, h: number, id: number) {
    this.id = id;
    this.left = x;
    this.top = y;
    this.width = w;
    this.height = h;
  }

  /**
   * Returns whether two rectangles intersect.
   * @param a A rectangle.
   * @param b A rectangle.
   * @return Whether a and b intersect.
   */
  static intersects(a: Rect, b: Rect): boolean {
    return (
      a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height
    );
  }
}
