import type { ElementOption } from './types';

export function resolveElementOption(option?: ElementOption | null, root?: HTMLElement | null): HTMLElement | null {
  if (typeof option === 'string') {
    return (root ?? document).querySelector(option);
  }

  if (option && 'nodeType' in option && option.nodeType && option.nodeType === 1) {
    return option as HTMLElement;
  }

  if (option && 'jquery' in option) {
    return option[0] ?? null;
  }

  return null;
}
