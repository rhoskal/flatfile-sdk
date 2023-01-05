import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import { Lazy, pipe } from "fp-ts/function";
import * as Str from "fp-ts/string";
import * as t from "io-ts";
import * as datefns from "date-fns";

import * as G from "../typeGuards";
import { runRecordHooks, runValidations, ValidationResult } from "../utils";

/*
 * Field Validations
 */

export const validateMaxLength =
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

export const validatePositive =
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value >= 0.01
      ? E.right(value)
      : E.left([
          new FF.Message("Value must be at least 1 cent.", "error", "validate"),
        ]);
  };

export const validateJson =
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
          new FF.Message(
            "Cannot be parsed into valid JSON.",
            "error",
            "validate",
          ),
        ]);
      } else {
        return E.left([new FF.Message("Unknown error.", "error", "validate")]);
      }
    }
  };

export const validateEmail =
  (value: string): Lazy<ValidationResult<string>> =>
  () => {
    return value.includes("@")
      ? E.right(value)
      : E.left([new FF.Message("Invalid email address.", "error", "validate")]);
  };

export const validatePhone =
  (value: string): Lazy<ValidationResult<string>> =>
  () => {
    return /[^\d]/g.test(value)
      ? E.left([
          new FF.Message("Not a valid phone number.", "warn", "validate"),
        ])
      : E.right(value);
  };

/*
 * Record Hooks
 */

const dueDateNotBeforeInvoiceDate = (
  record: FlatfileRecord,
): FlatfileRecord => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      date_invoice: t.string.decode(record.get("date_invoice")),
      date_due: t.string.decode(record.get("date_due")),
    }),
    E.match(
      () => record,
      ({ date_invoice, date_due }) => {
        if (datefns.isBefore(new Date(date_due), new Date(date_invoice))) {
          record.addWarning("date_due", "Cannot be before invoice date.");
        }

        return record;
      },
    ),
  );
};

const balanceLTEtoAmount = (record: FlatfileRecord): FlatfileRecord => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      amount: t.number.decode(record.get("amount")),
      balance: t.number.decode(record.get("balance")),
    }),
    E.match(
      () => record,
      ({ amount, balance }) => {
        if (G.isFalsy(balance <= amount)) {
          record.addError(
            "balance",
            "Remaining amount must be less than or equal to total invoice amount.",
          );
        }

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
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(255)(value)();

        return runValidations(ensureMaxLength);
      },
    }),
    invoice_external_id: FF.TextField({
      label: "Invoice External Id",
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(255)(value)();

        return runValidations(ensureMaxLength);
      },
    }),
    invoice_ref: FF.TextField({
      label: "Invoice Ref",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        // should be 255 but changing for the same of the demo
        const ensureMaxLength = validateMaxLength(25)(value)();

        return runValidations(ensureMaxLength);
      },
    }),
    currency: FF.OptionField({
      label: "Currency",
      description: "3 letter ISO code of the currency",
      required: true,
      options: {
        aud: "AUD",
        cad: "CAD",
        eur: "EUR",
        gbp: "GBP",
        usd: "USD",
        zar: "ZAR",
      },
    }),
    amount: FF.NumberField({
      label: "Amount",
      description: "Total amount on the invoice.",
      required: true,
      validate: (value) => {
        const ensureIsPositive = validatePositive(value)();

        return runValidations(ensureIsPositive);
      },
    }),
    balance: FF.NumberField({
      label: "Balance",
      description: "Remaining amount to be paid on the invoice.",
      required: true,
    }),
    payment_status: FF.OptionField({
      label: "Payment Status",
      options: {
        closed: "Closed",
        dispute: "Dispute",
        hold_back: "Hold Back",
        installments: "Installments",
        open: "Open",
        paid: "Paid",
        partially_paid: "Partially Paid",
      },
    }),
    date_invoice: FF.TextField({
      label: "Date Invoice",
      compute: (value) => {
        try {
          const parsed = datefns.parse(value, "dd/MM/yyyy", new Date());
          return datefns.format(parsed, "yyyy-MM-dd");
        } catch (err) {
          return value;
        }
      },
    }),
    date_due: FF.TextField({
      label: "Due Date",
      required: true,
      compute: (value) => {
        try {
          const parsed = datefns.parse(value, "dd/MM/yyyy", new Date());
          return datefns.format(parsed, "yyyy-MM-dd");
        } catch (err) {
          return value;
        }
      },
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
      validate: (value) => {
        const ensureValidEmail = validateEmail(value)();

        return runValidations(ensureValidEmail);
      },
    }),
    email_address2: FF.TextField({
      label: "Email Address (2)",
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureValidEmail = validateEmail(value)();

        return runValidations(ensureValidEmail);
      },
    }),
    phone_number_country_code: FF.NumberField({
      label: "Phone Number Country Code",
    }),
    phone_number: FF.TextField({
      label: "Phone Number",
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureValidPhone = validatePhone(value)();

        return runValidations(ensureValidPhone);
      },
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
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(65535)(value)();

        return runValidations(ensureMaxLength);
      },
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record, _session, _logger) => {
      return runRecordHooks(
        dueDateNotBeforeInvoiceDate,
        balanceLTEtoAmount,
      )(record);
    },
    batchRecordsCompute: async (_payload, _session, _logger) => {},
  },
);

const InvoicesPortal = new FF.Portal({
  name: "Invoices (Kolleno)",
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
