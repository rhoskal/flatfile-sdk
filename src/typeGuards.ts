/*
 * Types
 */

type Nil = null | undefined;

type Falsy = null | undefined | false | "" | 0;

/*
 * Guards
 */

/**
 * Helper function to determine if a value is null.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isNull(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isNull = (x: unknown): x is null => x === null;

/**
 * Helper function to determine if a value is undefined.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isUndefined(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isUndefined = (x: unknown): x is undefined => x === undefined;

/**
 * Helper function to determine if a value is null, undefined or an empty string.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isNil(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isNil = (x: unknown): x is Nil =>
  isNull(x) || isUndefined(x) || (isString(x) && x === "");

/**
 * Helper function to determine if a value is NOT null or undefined.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isNotNil(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isNotNil = <T>(x: T | Nil): x is T => !isNil(x);

/**
 * Helper function to determine if a value is falsy.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isFalsy(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isFalsy = (x: unknown): x is Falsy =>
  x === 0 || Number.isNaN(x) || x === false || isNil(x);

/**
 * Helper function to determine if a value is truthy.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isTruthy(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isTruthy = (x: unknown): x is true => !isFalsy(x);

/**
 * Helper function to determine if a value is a string.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isString(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isString = (x: unknown): x is string => typeof x === "string";

/**
 * Helper function to determine if a value is a number.
 * Useful in if/else statements or ternaries.
 *
 * @param {*} x - Any object/value
 *
 * @example
 * if (isNumber(x)) {
 *   ...
 * } else {
 *   ...
 * }
 */
export const isNumber = (x: unknown): x is number => typeof x === "number";
