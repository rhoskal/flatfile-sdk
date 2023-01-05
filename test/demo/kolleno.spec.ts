import * as E from "fp-ts/Either";

import * as Z from "../../src/demo/kolleno";

describe("Kolleno Demo", () => {
  test("validateMaxLength()", () => {
    expect(E.isLeft(Z.validateMaxLength(5)("asdfasdf")())).toBeTruthy();
    expect(E.isRight(Z.validateMaxLength(5)("asdf")())).toBeTruthy();
  });

  test("validatePositive()", () => {
    expect(E.isLeft(Z.validatePositive(0)())).toBeTruthy();
    expect(E.isRight(Z.validatePositive(0.01)())).toBeTruthy();
  });

  test("validateJson()", () => {
    expect(E.isLeft(Z.validateJson("{foobar}")())).toBeTruthy();
    expect(E.isLeft(Z.validateJson("-")())).toBeTruthy();
    expect(E.isRight(Z.validateJson("null")())).toBeTruthy();
    expect(E.isRight(Z.validateJson("{}")())).toBeTruthy();
    expect(E.isRight(Z.validateJson('{"foobar": 42}')())).toBeTruthy();
  });

  test("validateEmail()", () => {
    expect(E.isLeft(Z.validateEmail("foobar.com")())).toBeTruthy();
    expect(E.isRight(Z.validateEmail("foo@bar.com")())).toBeTruthy();
  });

  test("validatePhone()", () => {
    expect(E.isLeft(Z.validatePhone("asdf")())).toBeTruthy();
    expect(E.isLeft(Z.validatePhone("123-456-7890")())).toBeTruthy();
    expect(E.isRight(Z.validatePhone("1234567890")())).toBeTruthy();
  });
});
