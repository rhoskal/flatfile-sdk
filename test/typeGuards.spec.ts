import * as G from "../src/typeGuards";

describe("Type Guards", () => {
  test("isNull()", () => {
    expect(G.isNull(null)).toBeTruthy();
    expect(G.isNull(undefined)).toBeFalsy();
    expect(G.isNull(42)).toBeFalsy();
  });

  test("isUndefined()", () => {
    expect(G.isUndefined(null)).toBeFalsy();
    expect(G.isUndefined(undefined)).toBeTruthy();
    expect(G.isUndefined(42)).toBeFalsy();
  });

  test("isNil()", () => {
    expect(G.isNil(null)).toBeTruthy();
    expect(G.isNil(undefined)).toBeTruthy();
    expect(G.isNil(42)).toBeFalsy();
    expect(G.isNil("")).toBeTruthy();
  });

  test("isNotNil()", () => {
    expect(G.isNotNil(null)).toBeFalsy();
    expect(G.isNotNil(undefined)).toBeFalsy();
    expect(G.isNotNil(42)).toBeTruthy();
    expect(G.isNotNil("")).toBeFalsy();
  });

  test("isFalsy()", () => {
    expect(G.isFalsy(null)).toBeTruthy();
    expect(G.isFalsy(NaN)).toBeTruthy();
    expect(G.isFalsy(0)).toBeTruthy();
    expect(G.isFalsy(false)).toBeTruthy();
  });

  test("isTruthy()", () => {
    expect(G.isTruthy(null)).toBeFalsy();
    expect(G.isTruthy(NaN)).toBeFalsy();
    expect(G.isTruthy(0)).toBeFalsy();
    expect(G.isTruthy(true)).toBeTruthy();
  });

  test("isString()", () => {
    expect(G.isString(42)).toBeFalsy();
    expect(G.isString("asdf")).toBeTruthy();
  });

  test("isNumber()", () => {
    expect(G.isNumber(42)).toBeTruthy();
    expect(G.isNumber("asdf")).toBeFalsy();
  });
});
