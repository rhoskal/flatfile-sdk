import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";

import * as G from "../typeGuards";

/*
 * Field Validations
 */

const validateEmail = (value: string) => (): void | FF.Message => {
  if (!value.includes("@")) {
    return new FF.Message("Invalid email address.", "warn", "validate");
  }

  return;
};

/*
 * Record Hooks
 */

const emailOrPhoneRequired = (record: FlatfileRecord): FlatfileRecord => {
  const email = record.get("email");
  const phone = record.get("phone");

  if (G.isNil(email) && G.isNil(phone)) {
    record.addWarning(["email", "phone"], "Must have either phone or email.");
  }

  return record;
};

const zipCodeZeroPadding = (record: FlatfileRecord): FlatfileRecord => {
  const postal_code = record.get("postal_code");
  const country = record.get("country");

  if (G.isNotNil(country) && G.isNotNil(postal_code)) {
    if (G.isString(country) && G.isString(postal_code)) {
      if (country === "US" && postal_code.length < 5) {
        const padded = postal_code.padStart(5, "0");

        record
          .set("postal_code", padded)
          .addInfo("postal_code", "Padded with zeros.");
      }
    }
  }

  return record;
};

/*
 * Helpers
 */

/**
 * Easily pass the result of one function as the input of another.
 *
 * @example
 * pipe(fn1, fn2, ...);
 */
const pipe = (...fns: Array<any>) => fns.reduce((acc, fn) => fn(acc));

/**
 * Converts `String.prototype.toLowerCase()` to a normal fn so it can be used with `pipe`.
 *
 * @param {string} value - value to apply operation.
 *
 * @example
 * pipe(value, toLowerCase);
 */
const toLowerCase = (value: string): string => value.toLowerCase();

/**
 * Converts `String.prototype.trim()` to a normal fn so it can be used with `pipe`.
 *
 * @param {string} value - value to apply operation.
 *
 * @example
 * pipe(value, trim);
 */
const trim = (value: string): string => value.trim();

/**
 * Allows us to combine multiple validations in a quick and easy way.
 *
 * @example
 * runValidations(fn1, fn2, fn3, ...);
 */
const runValidations = (...fns: Array<any>): Array<FF.Message> => {
  return fns.reduce((acc, fn) => [...acc, fn()], []).filter(G.isNotNil);
};

/**
 * Allows us to sequence multiple RecordHooks _synchronously_ on a `FlatfileRecord`.
 *
 * @example
 * runRecordHooks(fn1, fn2, fn3, ...)(record)
 */
export const runRecordHooks =
  (...fns: Array<(x: FlatfileRecord) => void>) =>
  (x: FlatfileRecord) =>
    fns.map((f) => f(x));

/*
 * Main
 */

const LeadsSheet = new FF.Sheet(
  "Leads",
  {
    first_name: FF.TextField({
      label: "First Name",
      description: "Lead's first name.",
    }),
    last_name: FF.TextField({
      label: "Last Name",
      description: "Lead's last name.",
      required: true,
    }),
    email: FF.TextField({
      label: "Email Address",
      description: "Lead's email.",
      unique: true,
      compute: (value) => {
        return pipe(value, trim, toLowerCase);
      },
      validate: (value) => {
        const ensureValidEmail = validateEmail(value);

        return runValidations(ensureValidEmail);
      },
    }),
    phone: FF.TextField({
      label: "Phone Number",
      description: "Lead's phone.",
    }),
    date: FF.DateField({
      label: "Date",
      description: "Date goes here.",
    }),
    country: FF.TextField({
      label: "Country",
      description: "Country goes here",
      cast: FF.CountryCast("iso-2"),
    }),
    postal_code: FF.TextField({
      label: "Postal Code",
      description: "Postal code goes here",
    }),
    opt_in: FF.BooleanField({
      label: "Opt In",
      description: "Opt in goes here",
    }),
    deal_status: FF.OptionField({
      label: "Deal Status",
      description: "Deal status goes here",
      options: {
        prospecting: "Prospecting",
        discovery: "Discovery",
        proposal: "Proposal",
        negotiation: "Negotiation",
        closed_won: "Closed Won",
        closed_lost: "Closed Lost",
      },
    }),
  },
  {
    allowCustomFields: false,
    readOnly: true,
    recordCompute: (record, _session, _logger) => {
      return runRecordHooks(emailOrPhoneRequired, zipCodeZeroPadding)(record);
    },
  },
);

const LeadsPortal = new FF.Portal({
  name: "Leads SDK example",
  sheet: "LeadsSheet",
});

const workbook = new FF.Workbook({
  name: "Workbook - Leads SDK example",
  namespace: "Examples",
  portals: [LeadsPortal],
  sheets: {
    LeadsSheet,
  },
});

export default workbook;
