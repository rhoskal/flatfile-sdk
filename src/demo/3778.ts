import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";
import { Lazy, pipe } from "fp-ts/function";
import * as Str from "fp-ts/string";
import * as t from "io-ts";

import { fold, runValidations, ValidationResult } from "../utils";

/*
 * Field Validations
 */

const validateMaxLength =
  (len: number) =>
  (value: string): Lazy<ValidationResult<string>> =>
  () => {
    return value.length <= len
      ? E.right(value)
      : E.left([
          new FF.Message(
            `Cannot be more than ${len} characters.`,
            "error",
            "validate",
          ),
        ]);
  };

/*
 * Record Hooks
 */

const x = (record: FlatfileRecord): FlatfileRecord => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      foo: t.string.decode(record.get("foo")),
      bar: t.string.decode(record.get("bar")),
    }),
    E.match(
      () => record,
      ({ foo, bar }) => {
        // logic

        return record;
      },
    ),
  );
};

const removeSpecialCharacters = (value: string): string => {
  return Str.replace(/[*;/{}\[\]"_#'^><|]/g, "")(value);
};

const removeExtraSpaces = (value: string): string => {
  return Str.replace(/\s{2,}/g, " ")(value);
};

const toUppercase = (value: string): string => {
  return Str.toUpperCase(value);
};

const trim = (value: string): string => {
  return Str.trim(value);
};

const replaceLanguageChars = (value: string): string => {
  return pipe(
    Str.split("")(value),
    RA.map((char) => {
      if (Str.Eq.equals(char, "ç")) {
        return "c";
      } else {
        return char;
      }
    }),
    (chars) => chars.join(""),
  );
};

/*
 * Main
 */

const XSheet = new FF.Sheet(
  "X (3778)",
  {
    foo: FF.TextField({
      label: "",
      required: true,
      compute: (value) => {
        return pipe(value, trim, removeSpecialCharacters, removeExtraSpaces);
      },
    }),
    bar: FF.TextField({
      label: "",
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(999)(value);

        return runValidations(ensureMaxLength());
      },
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record, _session, _logger) => {
      return fold(x)(record);
    },
    batchRecordsCompute: async (_payload, _session, _logger) => {},
  },
);

const XPortal = new FF.Portal({
  name: "X (3778)",
  helpContent: "",
  sheet: "",
});

const workbook = new FF.Workbook({
  name: "Workbook - 3778 Demo",
  namespace: "Y",
  portals: [XPortal],
  sheets: {
    X,
  },
});

export default workbook;
