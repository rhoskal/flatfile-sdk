import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as E from "fp-ts/Either";
import * as NEA from "fp-ts/NonEmptyArray";
import { constVoid, identity, pipe } from "fp-ts/function";

import * as G from "../typeGuards";
import { sequenceValidationT } from "../utils";

/*
 * Field Validations
 */


// recommended field should be handled at the SDK level in some way
const ensureRecommended = (
  value: unknown,
): E.Either<NEA.NonEmptyArray<FF.Message>, unknown> => {
  return G.isNotNil(value)
    ? E.right(value)
    : E.left([new FF.Message("Recommended field.", "warn", "validate")]);
};

//this is better handled with expression language once merged
const ensureMonthlyPeriod = (
  value: number,
): E.Either<NEA.NonEmptyArray<FF.Message>, number> => {
  return value >= 1 && value <= 12
    ? E.right(value)
    : E.left([
        new FF.Message("Value must be between 1-12", "error", "validate"),
      ]);
};

//this should be handled at the SDK level
const ensureRegex =
  (regex: RegExp) =>
  (value: string): E.Either<NEA.NonEmptyArray<FF.Message>, string> => {
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

//this is better handled with expression language once merged
const ensureMaxLength =
  (len: number) =>
  (value: string): E.Either<NEA.NonEmptyArray<FF.Message>, string> => {
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
        const maxLen = ensureMaxLength(100)(value);
	// can you explain why you pipe with this match function in your validation functions.  The code isn't obvious at first
        return pipe(sequenceValidationT(maxLen), E.match(identity, constVoid));
      },
    }),
    je_line_description: FF.TextField({
      label: "Comment",
      validate: (value) => {
        const maxLen = ensureMaxLength(256)(value);
        const recommended = ensureRecommended(value);

        return pipe(
          sequenceValidationT(maxLen, recommended),
          E.match(identity, constVoid),
        );
      },
    }),
    source: FF.TextField({
      label: "Source",
      validate: (value) => {
        const maxLen = ensureMaxLength(25)(value);
        return pipe(sequenceValidationT(maxLen), E.match(identity, constVoid));
      },
    }),
    effective_date: FF.DateField({
      label: "Document Date",
      validate: (value) => {
        const isRecommended = ensureRecommended(value);

        return pipe(
          sequenceValidationT(isRecommended),
          E.match(identity, constVoid),
        );
      },
    }),
    period: FF.NumberField({
      label: "Period",
      validate: (value) => {
        const isMonthlyPeriod = ensureMonthlyPeriod(value);

        return pipe(
          sequenceValidationT(isMonthlyPeriod),
          E.match(identity, constVoid),
        );
      },
    }),
    gl_account_number: FF.TextField({
      label: "Account Number",
      validate: (value) => {
        const maxLen = ensureMaxLength(100)(value);

        return pipe(sequenceValidationT(maxLen), E.match(identity, constVoid));
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
      // hiddenFrom: {
      //   mapping: true,
      //   review: false,
      //   export: false,
      // },
    }),
    credit_debit_indicator: FF.OptionField({
      label: "Credit or Debit",
      options: {
        c: "Credit",
        d: "Debit",
      },
      // hiddenFrom: {
      //   mapping: true,
      //   review: false,
      //   export: false,
      // },
    }),
    amount_currency: FF.OptionField({
      label: "Amount Currency",
      options: {
        cad: "CAD",
        gbp: "GBP",
        usd: "USD",
      },
      // hiddenFrom: {
      //   mapping: true,
      //   review: false,
      //   export: false,
      // },
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
        const isMilitaryTime = ensureRegex(/^\d{4}$/g)(value);

        return pipe(
          sequenceValidationT(isMilitaryTime),
          E.match(identity, constVoid),
        );
      },
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record: FlatfileRecord, _logger) => {
      const { debit_amount, credit_amount } = record.value;
      // this should be a firstclass platform-sdk concept of two field conditional validation.  ned to figure out the syntax
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
    batchRecordsCompute: async (_payload) => {},
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
