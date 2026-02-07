/**
 * @fileoverview copy of `tiny-emitter` on npm, but converted to ESM
 */

export class TinyEmitter {
  e?: Record<string, Array<{ fn: Function & { _?: Function }; ctx?: any }>>;

  on(event: string, callback: Function, ctx?: any): this {
    var e = this.e || (this.e = {});

    (e[event] || (e[event] = [])).push({
      fn: callback,
      ctx: ctx,
    });

    return this;
  }

  once(event: string, callback: Function, ctx?: any): this {
    var self = this;
    function listener() {
      self.off(event, listener);
      callback.apply(ctx, arguments);
    }

    listener._ = callback;
    return this.on(event, listener, ctx);
  }

  emit(event: string, ...args: any[]): this {
    var data = args;
    var evtArr = ((this.e || (this.e = {}))[event] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  }

  off(event: string, callback?: Function): this {
    var e = this.e || (this.e = {});
    var evts = e[event];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback) liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    liveEvents.length ? (e[event] = liveEvents) : delete e[event];

    return this;
  }
}
