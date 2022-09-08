import { Message } from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as NEA from "fp-ts/NonEmptyArray";
import { constVoid, identity, pipe } from "fp-ts/function";

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

/**
 * Validation helper to accumulate error messages since
 * E.Either ap uses a flatMap and thus stops at the first error.
 *
 * @example
 * pipe(
 *   sequenceValidationT(validateEmail, maxLength),
 *   E.match(identity, constVoid),
 * );
 */
export const sequenceValidationT = Ap.sequenceT(
  E.getApplicativeValidation(NEA.getSemigroup<Message>()),
);

/**
 * A wrapper around `sequenceValidationT` that conforms to the FF SDK
 * `validate()` return type. Runs all validation functions and accumulates
 * the errors.
 *
 * @example
 * runValidations(fn1, fn2, fn3, ...);
 */
export const runValidations = (
  ...fns: [E.Either<NEA.NonEmptyArray<Message>, any>]
): void | Array<Message> => {
  return pipe(sequenceValidationT(...fns), E.match(identity, constVoid));
};
