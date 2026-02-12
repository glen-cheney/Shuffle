type TransitionEventCallback = (event: TransitionEvent) => void;

interface Transition {
  element: HTMLElement;
  listener: TransitionEventCallback;
}

export class TransitionManager {
  #transitions = new Map<string, Transition>();
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
    this.#transitions.set(id, { element, listener });

    return id;
  }

  cancelTransition(id: string): boolean {
    const entry = this.#transitions.get(id);
    if (entry) {
      entry.element.removeEventListener('transitionend', entry.listener as EventListener);
      this.#transitions.delete(id);
      return true;
    }

    return false;
  }

  cancelAll(): void {
    for (const id of this.#transitions.keys()) {
      this.cancelTransition(id);
    }
  }
}

export function createTransitionManager(): TransitionManager {
  return new TransitionManager();
}
