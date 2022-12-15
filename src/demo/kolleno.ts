import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import { Lazy, pipe } from "fp-ts/function";
import * as Str from "fp-ts/string";
import * as t from "io-ts";

import { runRecordHooks, runValidations, ValidationResult } from "../utils";

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
            "warn",
            "validate",
          ),
        ]);
  };

const validatePositive =
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value >= 0.01
      ? E.right(value)
      : E.left([
          new FF.Message("Value must be at least 1 cent.", "error", "validate"),
        ]);
  };

const validateJson =
  (value: string): Lazy<ValidationResult<string>> =>
  () => {
    try {
      JSON.parse(value);

      return E.right(value);
    } catch (err) {
      if (err instanceof SyntaxError) {
        // JSON.parse() does not allow trailing commas
        // JSON.parse() does not allow single quotes
        return E.left([
          new FF.Message("Not valid JSON format.", "error", "validate"),
        ]);
      } else {
        return E.left([new FF.Message("Unknown error.", "error", "validate")]);
      }
    }
  };

/*
 * Record Hooks
 */

const x = (record: FlatfileRecord): FlatfileRecord => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      foo: t.number.decode(record.get("foo")),
      bar: t.number.decode(record.get("bar")),
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

/*
 * Main
 */

const InvoicesSheet = new FF.Sheet(
  "Invoices (Kolleno)",
  {
    customer_external_id: FF.TextField({
      label: "Customer External Id",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(255)(value)();

        return runValidations(ensureMaxLength);
      },
    }),
    customer_name: FF.TextField({
      label: "Customer Name",
      compute: (value) => pipe(value, Str.trim),
    }),
    invoice_external_id: FF.TextField({
      label: "Invoice External Id",
      compute: (value) => pipe(value, Str.trim),
    }),
    invoice_ref: FF.TextField({
      label: "Invoice Ref",
      required: true,
      compute: (value) => pipe(value, Str.trim),
    }),
    currency: FF.OptionField({
      label: "Currency",
      description: "3 letter ISO code of the currency",
      required: true,
      options: {
        cad: "CAD",
        usd: "USD",
      },
    }),
    amount: FF.NumberField({
      label: "Amount",
      required: true,
      validate: (value) => {
        const ensureIsPositive = validatePositive(value)();

        return runValidations(ensureIsPositive);
      },
    }),
    balance: FF.NumberField({
      label: "Balance",
      required: true,
      validate: (value) => {
        const ensureIsPositive = validatePositive(value)();

        return runValidations(ensureIsPositive);
      },
    }),
    payment_status: FF.TextField({
      label: "Payment Status",
      compute: (value) => pipe(value, Str.trim),
    }),
    date_invoice: FF.TextField({
      label: "Date Invoice",
      compute: (value) => pipe(value, Str.trim),
    }),
    date_due: FF.TextField({
      label: "Due Date",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {}, // ensure due date is NOT before date_invoice
    }),
    first_name: FF.TextField({
      label: "First Name",
      compute: (value) => pipe(value, Str.trim),
    }),
    last_name: FF.TextField({
      label: "Last Name",
      compute: (value) => pipe(value, Str.trim),
    }),
    email_address1: FF.TextField({
      label: "Email Address (1)",
      required: true,
      compute: (value) => pipe(value, Str.trim),
    }),
    email_address2: FF.TextField({
      label: "Email Address (2)",
      compute: (value) => pipe(value, Str.trim),
    }),
    phone_number_country_code: FF.NumberField({
      label: "Phone Number Country Code",
    }),
    phone_number: FF.TextField({
      label: "Phone Number",
      compute: (value) => pipe(value, Str.trim),
    }),
    extra_data: FF.TextField({
      label: "Extra Data",
      description: "JSON format",
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureValidJson = validateJson(value)();

        return runValidations(ensureValidJson);
      },
    }),
    comment: FF.TextField({
      label: "Comment",
      compute: (value) => pipe(value, Str.trim),
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record, _session, _logger) => {
      return runRecordHooks(x)(record);
    },
    batchRecordsCompute: async (_payload, _session, _logger) => {},
  },
);

const InvoicesPortal = new FF.Portal({
  name: "Invoice (Kolleno)",
  helpContent: "",
  sheet: "InvoicesSheet",
});

const workbook = new FF.Workbook({
  name: "Workbook - Kolleno Demo",
  namespace: "Kolleno",
  portals: [InvoicesPortal],
  sheets: {
    InvoicesSheet,
  },
});

export default workbook;
