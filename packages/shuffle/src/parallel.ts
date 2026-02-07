// Copied and converted from https://github.com/component/array-parallel/blob/f9240097cb1edf8432111d2bf6cb6eb600da34c2/index.js

/**
 * Execute an array of functions in parallel.
 * Calls the callback with an error if any function fails,
 * otherwise calls it with null and an array of results.
 */
export function parallel<T>(
  fns: Array<(done: (err: Error | null, result?: T) => void) => void>,
  context?: unknown,
  callback?: (err: Error | null, results?: T[]) => void,
): void {
  if (!callback) {
    if (typeof context === 'function') {
      callback = context as (err: Error | null, results?: T[]) => void;
      context = null;
    } else {
      callback = noop;
    }
  }

  let pending = fns && fns.length;

  if (!pending) {
    return callback!(null, []);
  }

  let finished = false;
  const results = new Array(pending);

  for (let i = 0, l = fns.length; i < l; i++) {
    const fn = fns[i];
    fn.call(context, maybeDone(i));
  }

  function maybeDone(i: number) {
    return function (err: Error | null, result?: T) {
      if (finished) return;

      if (err) {
        callback!(err, results);
        finished = true;
        return;
      }

      results[i] = result;

      if (!--pending) {
        callback!(null, results);
      }
    };
  }
}

function noop() {
  // no-op
}
