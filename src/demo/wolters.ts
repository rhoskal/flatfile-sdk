import * as FF from "@flatfile/configure";
import * as E from "fp-ts/Either";
import { Lazy } from "fp-ts/function";

import * as G from "../typeGuards";
import { runValidations, ValidationResult } from "../utils";

/*
 * Field Validations
 */

const validateRecommended =
  <T>(value: T): Lazy<ValidationResult<T>> =>
  () => {
    return G.isNotNil(value)
      ? E.right(value)
      : E.left([new FF.Message("Recommended field.", "warn", "validate")]);
  };

const validateMonthlyPeriod =
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value >= 1 && value <= 12
      ? E.right(value)
      : E.left([
          new FF.Message("Value must be between 1-12", "error", "validate"),
        ]);
  };

const validateRegex =
  (regex: RegExp) =>
  (value: string): Lazy<ValidationResult<string>> =>
  () => {
    return regex.test(value)
      ? E.right(value)
      : E.left([
          new FF.Message(
            "Value does not meet required format",
            "warn",
            "validate",
          ),
        ]);
  };

const validateMaxLength =
  (len: number) =>
  (value: string): Lazy<ValidationResult<string>> =>
  () => {
    return value.length <= len
      ? E.right(value)
      : E.left([
          new FF.Message(
            `Cannot be more than ${len} characters.`,
            "warn",
            "validate",
          ),
        ]);
  };

/*
 * Main
 */

const Journals = new FF.Sheet(
  "Journals (Wolters Demo)",
  {
    journal_id: FF.TextField({
      label: "Journal Id",
      required: true,
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(100)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    je_line_description: FF.TextField({
      label: "Comment",
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(100)(value);
        const ensureRecommended = validateRecommended(value);

        return runValidations(ensureMaxLength(), ensureRecommended());
      },
    }),
    source: FF.TextField({
      label: "Source",
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(25)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    effective_date: FF.DateField({
      label: "Document Date",
      validate: (value) => {
        const ensureRecommended = validateRecommended(value);

        return runValidations(ensureRecommended());
      },
    }),
    period: FF.NumberField({
      label: "Period",
      validate: (value) => {
        const ensureMonthlyPeriod = validateMonthlyPeriod(value);

        return runValidations(ensureMonthlyPeriod());
      },
    }),
    gl_account_number: FF.TextField({
      label: "Account Number",
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(25)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    debit_amount: FF.NumberField({
      label: "Debit Amount",
    }),
    credit_amount: FF.NumberField({
      label: "Credit Amount",
    }),
    amount: FF.NumberField({
      label: "Amount",
      stageVisibility: {
        mapping: false,
        review: true,
        export: true,
      },
    }),
    credit_debit_indicator: FF.OptionField({
      label: "Credit or Debit",
      options: {
        c: "Credit",
        d: "Debit",
      },
      stageVisibility: {
        mapping: false,
        review: true,
        export: true,
      },
    }),
    amount_currency: FF.OptionField({
      label: "Amount Currency",
      options: {
        cad: "CAD",
        gbp: "GBP",
        usd: "USD",
      },
      stageVisibility: {
        mapping: false,
        review: true,
        export: true,
      },
    }),
    entered_by: FF.TextField({
      label: "Posted By",
    }),
    entered_date: FF.DateField({
      label: "Posted Date",
    }),
    entered_time: FF.TextField({
      label: "Posted Time",
      compute: (value) => {
        const parts = value.split(":");

        if (parts.length >= 2) {
          return parts[0] + parts[1];
        } else {
          return value;
        }
      },
      validate: (value) => {
        const ensureMilitaryTime = validateRegex(/^\d{4}$/g)(value);

        return runValidations(ensureMilitaryTime());
      },
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record, _session, _logger) => {
      const { debit_amount, credit_amount } = record.value;

      if (G.isNotNil(debit_amount)) {
        record.set("amount", debit_amount).set("credit_debit_indicator", "d");
      } else if (G.isNotNil(credit_amount)) {
        record
          .set("amount", Number(credit_amount) * -1)
          .set("credit_debit_indicator", "c");
      } else {
        record.addError("amount", "Help! Cannot decide.");
      }

      return record;
    },
    batchRecordsCompute: async (_payload, _session, _logger) => {},
  },
);

const workbook = new FF.Workbook({
  name: "Workbook - Wolters Demo",
  namespace: "Wolters",
  sheets: {
    Journals,
  },
});

export default workbook;
