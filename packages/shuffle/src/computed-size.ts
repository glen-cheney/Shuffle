import { getNumber } from './get-number';

let value: boolean | null = null;
export function testComputedSize() {
  if (value !== null) {
    return value;
  }

  const element = document.body || document.documentElement;
  const e = document.createElement('div');
  e.style.cssText = 'width:10px;padding:2px;box-sizing:border-box;';
  element.appendChild(e);

  const { width } = window.getComputedStyle(e, null);
  // Fix for issue #314
  value = Math.round(getNumber(width)) === 10;

  element.removeChild(e);

  return value;
}
