// oxlint-disable unicorn/explicit-length-check, no-param-reassign, no-plusplus
// Copied and converted from https://github.com/component/array-parallel/blob/f9240097cb1edf8432111d2bf6cb6eb600da34c2/index.js

function noop(): void {
  // no-op
}

/**
 * Execute an array of functions in parallel.
 * Calls the callback with an error if any function fails,
 * otherwise calls it with null and an array of results.
 */
export function parallel<ResultType>(
  fns: ((done: (err: Error | null, result?: ResultType) => void) => void)[],
  context?: unknown,
  callback?: (err: Error | null, results?: ResultType[]) => void,
): void {
  if (!callback) {
    if (typeof context === 'function') {
      callback = context as (err: Error | null, results?: ResultType[]) => void;
      context = null;
    } else {
      callback = noop;
    }
  }

  let pending = fns && fns.length;

  if (!pending) {
    callback(null, []);
    return;
  }

  let finished = false;
  // oxlint-disable-next-line unicorn/no-new-array
  const results = new Array(pending);

  function maybeDone(i: number) {
    return function onDoneCheck(err: Error | null, result?: ResultType) {
      if (finished) {
        return;
      }

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

  for (let i = 0, len = fns.length; i < len; i++) {
    const fn = fns[i];
    fn.call(context, maybeDone(i));
  }
}
