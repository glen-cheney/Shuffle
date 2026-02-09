import { describe, expect } from 'vitest';

import Shuffle from '../shuffle';
import { getAvailablePositions, getCenteredPositions, getColumnSpan } from '../layout';
import { test, childrenToArray } from './test-utils';

describe('shuffle layout', () => {
  test('should be 3 columns with gutters', ({ fixture, instance }) => {
    fixture.style.width = '1000px';

    const children = childrenToArray(fixture);
    for (const child of children) {
      child.style.width = '300px';
      child.style.height = '150px';
    }

    instance.value = new Shuffle(fixture, {
      columnWidth: 300,
      gutterWidth: 50,
    });

    expect(instance.value.colWidth).toBe(350);
    expect(instance.value.cols).toBe(3);
    expect(instance.value.positions).toEqual([600, 450, 450]);
  });

  test('can have a function for columns and gutters', ({ fixture, instance }) => {
    fixture.style.width = '1000px';

    const children = childrenToArray(fixture);
    for (const child of children) {
      child.style.width = '300px';
      child.style.height = '150px';
    }

    instance.value = new Shuffle(fixture, {
      columnWidth(containerWidth) {
        expect(containerWidth).toBe(1000);
        return 300;
      },

      gutterWidth() {
        return 50;
      },
    });

    expect(instance.value._getGutterSize(1000)).toBe(50);
    expect(instance.value._getColumnSize(1000, 50)).toBe(350);
    expect(instance.value.colWidth).toBe(350);
    expect(instance.value.cols).toBe(3);
    expect(instance.value.positions).toEqual([600, 450, 450]);
  });

  test('can have a function for columns/gutters and span multiple columns', ({ fixture, instance }) => {
    fixture.style.width = '1200px';

    const children = childrenToArray(fixture);
    for (const child of children) {
      child.style.width = '300px';
      child.style.height = '10px';
    }

    children[1].style.width = '600px';
    children[5].style.width = '600px';
    children[6].style.width = '900px';

    instance.value = new Shuffle(fixture, {
      columnWidth(containerWidth) {
        expect(containerWidth).toBe(1200);
        return 300;
      },

      gutterWidth() {
        return 0;
      },
    });

    expect(instance.value._getGutterSize(1200)).toBe(0);
    expect(instance.value._getColumnSize(1200, 0)).toBe(300);
    expect(instance.value.colWidth).toBe(300);
    expect(instance.value.cols).toBe(4);
    expect(instance.value.positions).toEqual([40, 40, 30, 30]);
  });

  test('can calculate column spans', () => {
    // itemWidth, columnWidth, columns, threshold
    expect(getColumnSpan(50, 100, 3, 0)).toBe(1);
    expect(getColumnSpan(200, 100, 3, 0)).toBe(2);
    expect(getColumnSpan(200, 200, 3, 0)).toBe(1);
    expect(getColumnSpan(300, 100, 3, 0)).toBe(3);

    // Column span should not be larger than the number of columns.
    expect(getColumnSpan(300, 50, 3, 0)).toBe(3);

    // Fix for percentage values.
    expect(getColumnSpan(100.02, 100, 4, 0)).toBe(2);
    expect(getColumnSpan(100.02, 100, 4, 0.01)).toBe(1);
    expect(getColumnSpan(99.98, 100, 4, 0.01)).toBe(1);
  });

  test('can calculate column sets', () => {
    // getAvailablePositions(positions, columnSpan, columns)
    const positions = [150, 0, 0, 0];
    expect(getAvailablePositions(positions, 1, 4)).toEqual([150, 0, 0, 0]);
    expect(getAvailablePositions(positions, 2, 4)).toEqual([150, 0, 0]);
  });

  test('can center already-positioned items', () => {
    // 4-2-1 even heights
    expect(
      getCenteredPositions(
        [
          new Shuffle.Rect(0, 0, 250, 100, 0),
          new Shuffle.Rect(250, 0, 250, 100, 1),
          new Shuffle.Rect(500, 0, 250, 100, 2),
          new Shuffle.Rect(750, 0, 250, 100, 3),
          new Shuffle.Rect(0, 100, 600, 100, 4),
          new Shuffle.Rect(600, 100, 300, 100, 5),
          new Shuffle.Rect(0, 200, 250, 100, 6),
        ],
        1000,
      ),
    ).toEqual([
      new Shuffle.Point(0, 0),
      new Shuffle.Point(250, 0),
      new Shuffle.Point(500, 0),
      new Shuffle.Point(750, 0),
      new Shuffle.Point(50, 100),
      new Shuffle.Point(650, 100),
      new Shuffle.Point(375, 200),
    ]);

    // 4 columns:
    // 2x2 1x1
    // 2x1
    // Centers the first row, but then finds that the 3rd item will overlap
    // the 2x2 and resets the first row.
    expect(
      getCenteredPositions(
        [
          new Shuffle.Rect(0, 0, 500, 200, 0),
          new Shuffle.Rect(500, 0, 250, 100, 1),
          new Shuffle.Rect(500, 100, 500, 100, 2),
        ],
        1000,
      ),
    ).toEqual([new Shuffle.Point(0, 0), new Shuffle.Point(500, 0), new Shuffle.Point(500, 100)]);
  });

  test('should reset columns', ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);

    // instance.cols will be > 0 in real browsers.
    instance.value._resetCols();

    const positions = Array.from({ length: instance.value.cols });
    for (let i = 0; i < instance.value.cols; i += 1) {
      positions[i] = 0;
    }

    expect(instance.value.positions).toEqual(positions);
  });

  test('can get the real width of an element which is scaled', () => {
    const div = document.createElement('div');
    div.style.cssText = 'width:100px;height:100px;';
    div.style.transform = 'translate(0px,0px) scale(0.5)';

    document.body.append(div);

    expect(Shuffle.getSize(div, false).width).toBe(100);
    expect(Shuffle.getSize(div, true).width).toBe(100);

    expect(Shuffle.getSize(div, false).height).toBe(100);
    expect(Shuffle.getSize(div, true).height).toBe(100);

    div.style.marginLeft = '10px';
    div.style.marginRight = '20px';
    div.style.marginTop = '30px';
    div.style.marginBottom = '40px';

    expect(Shuffle.getSize(div, false).width).toBe(100);
    expect(Shuffle.getSize(div, true).width).toBe(130);

    expect(Shuffle.getSize(div, false).height).toBe(100);
    expect(Shuffle.getSize(div, true).height).toBe(170);

    div.remove();
  });
});
