type TransitionEventCallback = (event: TransitionEvent) => void;

interface Transition {
  element: HTMLElement;
  listener: TransitionEventCallback;
}

const transitions: Record<string, Transition | null> = {};
const eventName = 'transitionend';
let count = 0;

function uniqueId() {
  count += 1;
  return eventName + count;
}

export function cancelTransitionEnd(id: string): boolean {
  if (transitions[id]) {
    transitions[id].element.removeEventListener(eventName, transitions[id].listener);
    transitions[id] = null;
    return true;
  }

  return false;
}

export function onTransitionEnd(element: HTMLElement, callback: TransitionEventCallback): string {
  const id = uniqueId();
  const listener = (event: TransitionEvent) => {
    if (event.currentTarget === event.target) {
      cancelTransitionEnd(id);
      callback(event);
    }
  };

  element.addEventListener(eventName, listener);

  transitions[id] = { element, listener };

  return id;
}
