import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as NEA from "fp-ts/NonEmptyArray";
import * as O from "fp-ts/Option";
import * as RR from "fp-ts/ReadonlyRecord";
import { Lazy, pipe } from "fp-ts/function";
import * as Str from "fp-ts/string";
import * as t from "io-ts";

import { fold, runValidations } from "../utils";

/*
 * Field Validations
 */

const validateRangeInclusive =
  (min: number, max: number) =>
  (value: number): Lazy<E.Either<NEA.NonEmptyArray<FF.Message>, number>> =>
  () => {
    return value >= min && value <= max
      ? E.right(value)
      : E.left([
          new FF.Message(
            `Value must be between ${min} and ${max}`,
            "error",
            "validate",
          ),
        ]);
  };

const validatePositive =
  (value: number): Lazy<E.Either<NEA.NonEmptyArray<FF.Message>, number>> =>
  () => {
    return value >= 0
      ? E.right(value)
      : E.left([new FF.Message("Value must be positive", "error", "validate")]);
  };

/*
 * Record Hooks
 */

const balancedOwnerPercentages = (record: FlatfileRecord) => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      owner1_percent: t.number.decode(record.get("owner1_percent")),
      owner2_percent: t.number.decode(record.get("owner2_percent")),
    }),
    E.match(
      () => record,
      ({ owner1_percent, owner2_percent }) => {
        if (owner1_percent + owner2_percent !== 100) {
          record.addWarning(
            ["owner1_percent", "owner2_percent"],
            "Owner percentages must total 100%.",
          );
        }

        return record;
      },
    ),
  );
};

const checkCorrespondingRTN = (record: FlatfileRecord) => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      bank_name: t.string.decode(record.get("bank_name")),
      rtn: t.string.decode(record.get("routing_transit_number")),
    }),
    E.match(
      () => record,
      ({ bank_name, rtn }) => {
        return pipe(
          RR.lookup(bank_name)(RTN),
          O.map((rtns) => {
            return rtns.includes(rtn)
              ? record
              : record.addError(
                  "routing_transit_number",
                  `Was expecting one of: ${rtns.join(", ")}`,
                );
          }),
          O.getOrElse(() => record),
        );
      },
    ),
  );
};

/*
 * Main
 */

type USBank =
  | "alliant"
  | "chase"
  | "citibank"
  | "first_bank"
  | "wells_fargo"
  | "usaa";
type Banks = Record<Readonly<USBank>, Readonly<Uppercase<string>>>;
type RTN = Record<Readonly<USBank>, NEA.NonEmptyArray<string>>;

const Banks: Banks = {
  alliant: "ALIANT",
  chase: "CHASE BANK",
  citibank: "CITIBANK",
  first_bank: "FIRST BANK",
  wells_fargo: "WELLS FARGO",
  usaa: "USAA",
};

// https://wise.com/us/routing-number
const RTN: RTN = {
  alliant: ["271081528"],
  chase: ["021000021"],
  citibank: ["321171184", "31100209"],
  first_bank: ["107005047"],
  wells_fargo: ["121000248"],
  usaa: ["314074269"],
};

const BanksSheet = new FF.Sheet(
  "Banks (Appfolio) - NewNew",
  {
    bank_name: FF.OptionField({
      label: "Bank Name",
      required: true,
      options: Banks,
    }),
    account_name: FF.TextField({
      label: "Account Name",
      description:
        "The account name indicates the nature or purpose of the account such as Operating or Rents.",
      required: true,
      compute: (value) => pipe(value, Str.trim),
    }),
    account_number: FF.TextField({
      label: "Account Number",
      required: true,
      compute: (value) => pipe(value, Str.trim),
    }),
    routing_transit_number: FF.TextField({
      label: "Routing Number",
      required: true,
      compute: (value) => pipe(value, Str.trim),
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record, _session, _logger) => {
      return fold(checkCorrespondingRTN)(record);
    },
    batchRecordsCompute: async (_payload, _session, _logger) => {},
  },
);

const PropertiesSheet = new FF.Sheet(
  "Properties (Appfolio) - NewNew",
  {
    name: FF.TextField({
      label: "Property Name",
      description:
        "If the property is a multi- family property such as a duplex, enter it only once.\n" +
        "Example of a property name for a duplex: 25 - 27 4th Avenue.",
      unique: true,
    }),
    address1: FF.TextField({
      label: "Address 1",
      required: true,
    }),
    address2: FF.TextField({
      label: "Address 2",
    }),
    city: FF.TextField({
      label: "City",
      required: true,
    }),
    state: FF.TextField({
      label: "State",
      required: true,
    }),
    postal_code: FF.TextField({
      label: "Postal Code",
      required: true,
    }),
    property_type: FF.OptionField({
      label: "Property Type",
      description:
        "Multi-family should only be selected when you manage ALL units in the same building.\n" +
        "Condos are treated like a house and considered Single-Family UNLESS all condos in the building have the same owner and you are managing all condos for that owner.",
      options: {
        single_family: "Single-Family",
        multi_family: "Multi-Family",
        commercial: "Commercial",
        mixed_use: "Mixed-Use",
        student_housing: "Student-Housing",
      },
    }),
    mgmt_fee_minimum: FF.NumberField({
      label: "Mgmt Fee Minimum",
      validate: (value) => {
        const ensureBetween1and100 = validateRangeInclusive(1, 100)(value);

        return runValidations(ensureBetween1and100());
      },
    }),
    mgmt_fee_type: FF.OptionField({
      label: "Mgmt Fee Type",
      options: {
        percent: "Percent",
        flat: "Flat",
      },
    }),
    mgmt_fee_percentage: FF.NumberField({
      label: "Mgmt Fee %",
      validate: (value) => {
        const ensureBetween0and100 = validateRangeInclusive(0, 100)(value);

        return runValidations(ensureBetween0and100());
      },
    }),
    mgmt_fee_flat: FF.NumberField({
      label: "Mgmt Fee Flat",
      validate: (value) => {
        const ensureIsPositive = validatePositive(value);

        return runValidations(ensureIsPositive());
      },
    }),
    operating_bank_account_name: FF.TextField({
      label: "Operating Bank Account Name",
    }),
    escrow_bank_account_name: FF.TextField({
      label: "Escrow Bank Account Name",
    }),
    grace_period: FF.NumberField({
      label: "Grace Period",
      description:
        "The period of time allowed before late fees will be assessed. Late fees become eligible to charge on the day the grace period ends. For example, when Rent Due Day is " +
        "1st of the month and Grace Period is 4 Days, payments made on the 5th will be considered late.",
    }),
    late_fee_type: FF.OptionField({
      label: "Late Fee Type",
      description:
        "Flat Fee: A flat fixed amount charge. Calculates on current month charges only.\n" +
        "Percent of Monthly Owed: A percentage of total monthly owed, includes rent and other incomes, minus available credit. Calculates on current month charges only.\n" +
        "Percent of Monthly Rent Charge: A percentage of monthly rent only, does not include other income, minus available credit. Calculates on current month charges only.\n" +
        "Percent of Total Owed: A percentage of total outstanding owed, includes rent and other income, minus available credit. Calculates on current and previous month charges.",
      options: {
        flat_fee: "Flat Fee",
        percent_total_owed: "% Total Owed",
        percent_monthly_rent_charge: "% Monthly Rent Charge",
        percent_monthly_owed: "% Monthly Owed",
      },
    }),
    late_fee_amount: FF.NumberField({
      label: "Late Fee Amount",
      validate: (value) => {
        const ensureIsPositive = validatePositive(value);

        return runValidations(ensureIsPositive());
      },
    }),
    late_fee_per_day: FF.NumberField({
      label: "Late Fee/Day",
      description:
        "Daily late fees begin assessment one day after the base late fee is assessed and continue to accumulate within the current month until all outstanding late fee eligible charges are paid.",
    }),
    owner1_fname: FF.TextField({
      label: "First Name (Owner #1)",
    }),
    owner1_lname: FF.TextField({
      label: "Last Name (Owner #1)",
    }),
    owner1_company: FF.TextField({
      label: "Company Name (Owner #1)",
    }),
    owner1_percent: FF.NumberField({
      label: "Percentage (Owner #1)",
      description:
        "Owner percentages must total 100%.\n" +
        "You can have one owner at 100% and a second owner at 0%. Since a Tax ID (SSN) can only belong to one individual enter in 100% for the owner whose Tax ID you have on file and enter " +
        "in 0% for the spouse or business partner.",
      default: 0,
      validate: (value) => {
        const ensureBetween0and100 = validateRangeInclusive(0, 100)(value);

        return runValidations(ensureBetween0and100());
      },
    }),
    owner2_fname: FF.TextField({
      label: "First Name (Owner #2)",
    }),
    owner2_lname: FF.TextField({
      label: "Last Name (Owner #2)",
    }),
    owner2_company: FF.TextField({
      label: "Company Name (Owner #2)",
    }),
    owner2_percent: FF.NumberField({
      label: "Percentage (Owner #2)",
      description:
        "Owner percentages must total 100%.\n" +
        "You can have one owner at 100% and a second owner at 0%. Since a Tax ID (SSN) can only belong to one individual enter in 100% for the owner whose Tax ID you have on file and enter " +
        "in 0% for the spouse or business partner.",
      default: 0,
      validate: (value) => {
        const ensureBetween0and100 = validateRangeInclusive(0, 100)(value);

        return runValidations(ensureBetween0and100());
      },
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record, _session, _logger) => {
      return fold(balancedOwnerPercentages)(record);
    },
    batchRecordsCompute: async (_payload, _session, _logger) => {},
  },
);

const BanksPortal = new FF.Portal({
  name: "Banks (Appfolio) - NewNew",
  helpContent: `# Banks

     ![embed image test](https://cdn.brandfolder.io/1TPX6JVS/at/n8x4ppp94tc6vq3j2pjgggpk/APM-Primary-Logo.svg)

     Some example markdown

     - List item 1
     - List item 2`,
  sheet: "BanksSheet",
});

const PropertiesPortal = new FF.Portal({
  name: "Properties (Appfolio) - NewNew",
  helpContent:
    "# Properties\n\n" +
    "![embed image test](https://cdn.brandfolder.io/1TPX6JVS/at/n8x4ppp94tc6vq3j2pjgggpk/APM-Primary-Logo.svg)\n\n" +
    "Some example markdown\n\n" +
    "- List item 1\n- List item 2",
  sheet: "PropertiesSheet",
});

const workbook = new FF.Workbook({
  name: "Workbook - Appfolio Demo",
  namespace: "Appfolio",
  sheets: {
    BanksSheet,
    PropertiesSheet,
  },
  portals: [BanksPortal, PropertiesPortal],
});

export default workbook;
