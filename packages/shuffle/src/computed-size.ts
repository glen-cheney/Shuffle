import { getNumber } from './get-number';

const WIDTH = 10;
let value: boolean | null = null;

export function testComputedSize(): boolean {
  if (value !== null) {
    return value;
  }

  const element = document.body || document.documentElement;
  const div = document.createElement('div');
  div.style.cssText = 'width:10px;padding:2px;box-sizing:border-box;';
  element.append(div);

  const { width } = globalThis.getComputedStyle(div, null);
  // Fix for issue #314
  value = Math.round(getNumber(width)) === WIDTH;

  div.remove();

  return value;
}
