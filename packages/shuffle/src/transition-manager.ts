type TransitionEventCallback = (event: TransitionEvent) => void;

interface Transition {
  element: HTMLElement;
  listener: TransitionEventCallback;
}

export class TransitionManager {
  #transitions: Record<string, Transition | null> = {};
  #count = 0;

  #uniqueId(): string {
    this.#count += 1;
    return `transitionend${this.#count}`;
  }

  waitForTransition(element: HTMLElement, callback: TransitionEventCallback): string {
    const id = this.#uniqueId();
    const listener = (event: TransitionEvent) => {
      if (event.currentTarget === event.target) {
        this.cancelTransition(id);
        callback(event);
      }
    };

    element.addEventListener('transitionend', listener as EventListener);
    this.#transitions[id] = { element, listener };

    return id;
  }

  cancelTransition(id: string): boolean {
    const entry = this.#transitions[id];
    if (entry) {
      entry.element.removeEventListener('transitionend', entry.listener as EventListener);
      this.#transitions[id] = null;
      return true;
    }

    return false;
  }

  cancelAll(): void {
    for (const id of Object.keys(this.#transitions)) {
      if (this.#transitions[id]) {
        this.cancelTransition(id);
      }
    }
  }
}

export function createTransitionManager(): TransitionManager {
  return new TransitionManager();
}
