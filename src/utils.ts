import { FlatfileRecord } from "@flatfile/hooks";

/**
 * Helper function to apply reduction to FF record class.
 *
 * @example
 * fold(fn1, fn2, fn3, ...)(record)
 */

export const fold =
  (...fns: Array<(x: FlatfileRecord) => void>) =>
  (x: FlatfileRecord) =>
    fns.map((f) => f(x));
