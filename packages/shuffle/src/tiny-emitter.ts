// oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-function-type, typescript/ban-types, typescript/no-explicit-any
/**
 * @fileoverview copy of `tiny-emitter` on npm, but converted to ESM
 */

export class TinyEmitter {
  handlers?: Record<string, { fn: Function & { onceCb?: Function }; ctx?: any }[]>;

  on(event: string, callback: Function, ctx?: any): this {
    const handlers = this.handlers ?? (this.handlers = {});

    (handlers[event] || (handlers[event] = [])).push({
      fn: callback,
      ctx,
    });

    return this;
  }

  once(event: string, callback: Function, ctx?: any): this {
    // oxlint-disable-next-line typescript/no-this-alias, unicorn/no-this-assignment
    const self = this;
    function listener() {
      self.off(event, listener);
      // oxlint-disable-next-line prefer-rest-params
      callback.apply(ctx, arguments);
    }

    listener.onceCb = callback;
    return this.on(event, listener, ctx);
  }

  emit(event: string, ...args: any[]): this {
    const data = args;
    const evtArr = [...((this.handlers ?? (this.handlers = {}))[event] || [])];
    let i = 0;
    const len = evtArr.length;

    for (i; i < len; i += 1) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  }

  off(event: string, callback?: Function): this {
    const handlers = this.handlers ?? (this.handlers = {});
    const evts = handlers[event];
    const liveEvents = [];

    if (evts && callback) {
      for (let i = 0, len = evts.length; i < len; i += 1) {
        if (evts[i].fn !== callback && evts[i].fn.onceCb !== callback) {
          liveEvents.push(evts[i]);
        }
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    if (liveEvents.length > 0) {
      handlers[event] = liveEvents;
    } else {
      // oxlint-disable-next-line typescript/no-dynamic-delete
      delete handlers[event];
    }

    return this;
  }
}
