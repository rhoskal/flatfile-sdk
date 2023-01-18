import * as FF from "@flatfile/configure";
import * as E from "fp-ts/Either";
import { Lazy, pipe } from "fp-ts/function";
import * as Str from "fp-ts/string";

import { runValidations, ValidationResult } from "../utils";

/*
 * Field Validations
 */

const validateRegex =
  (regex: RegExp) =>
  (value: string): Lazy<ValidationResult<string>> =>
  () => {
    return regex.test(value)
      ? E.right(value)
      : E.left([
          new FF.Message(
            "Value does not meet required format.",
            "error",
            "validate",
          ),
        ]);
  };

const validateEmail =
  (value: string): Lazy<ValidationResult<string>> =>
  () => {
    return value.includes("@")
      ? E.right(value)
      : E.left([new FF.Message("Invalid email address.", "error", "validate")]);
  };

/*
 * Custom, re-usable field
 */

const EmailField = FF.makeField(
  FF.TextField({
    compute: (value) => pipe(value, trim, removeSpaces),
    validate: (value) => {
      const ensureValidEmail = validateEmail(value);

      return runValidations(ensureValidEmail());
    },
  }),
);

/*
 * Main
 */

const toUppercase = (value: string): string => {
  return Str.toUpperCase(value);
};

const trim = (value: string): string => {
  return Str.trim(value);
};

const removeSpaces = (value: string): string => {
  return Str.replace(/\s+/g, "")(value);
};

const removeIllegalCharacters = (value: string): string => {
  return Str.replace(/[_]/g, "")(value);
};

const GuardiansSheet = new FF.Sheet(
  "Guardians (Classtag)",
  {
    student_id: FF.NumberField({
      label: "Student Id",
      required: true,
    }),
    guardian_id: FF.NumberField({
      label: "Guardian Id",
      required: true,
    }),
    guardian_first_name: FF.TextField({
      label: "Guardian First Name",
      required: true,
      compute: (value) => {
        return pipe(value, trim, removeIllegalCharacters, toUppercase);
      },
    }),
    guardian_last_name: FF.TextField({
      label: "Guardian Last Name",
      required: true,
      compute: (value) => {
        return pipe(value, trim, removeIllegalCharacters, toUppercase);
      },
    }),
    guardian_email: EmailField({
      label: "Guardian Email",
      required: true,
    }),
    guardian_phone: FF.TextField({
      label: "Guardian Phone",
      required: true,
      compute: (value) => pipe(value, trim),
      validate: (value) => {
        const ensureValidPhone = validateRegex(/^\d{3}-\d{3}-\d{4}$/g)(value);

        return runValidations(ensureValidPhone());
      },
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (_record, _session, _logger) => {},
    batchRecordsCompute: async (_payload, _session, _logger) => {},
  },
);

const GuardiansPortal = new FF.Portal({
  name: "Guardians (Classtag)",
  helpContent: "",
  sheet: "GuardiansSheet",
});

const workbook = new FF.Workbook({
  name: "Workbook - Classtag Demo",
  namespace: "Classtag",
  portals: [GuardiansPortal],
  sheets: {
    GuardiansSheet,
  },
});

export default workbook;
