import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as NEA from "fp-ts/NonEmptyArray";
import { Lazy, pipe } from "fp-ts/function";
import { match } from "ts-pattern";
import * as datefns from "date-fns";
import * as t from "io-ts";

import * as G from "../typeGuards";
import { fold, runValidations } from "../utils";

/*
 * Field Validations
 */

const validateSsn =
  (value: string): Lazy<E.Either<NEA.NonEmptyArray<FF.Message>, string>> =>
  () => {
    const re = /^(?!(000|666|9))\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/g;
    // const re = /^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/g;

    return re.test(value)
      ? E.right(value)
      : E.left([new FF.Message("Invalid SSN format.", "warn", "validate")]);
  };

const validateVin =
  (value: string): Lazy<E.Either<NEA.NonEmptyArray<FF.Message>, string>> =>
  () => {
    const alphaNumeric = /^[A-Z0-9]{1,17}$/g;
    const exclude = /^[^IOQUZ]+$/g;

    return alphaNumeric.test(value) && exclude.test(value)
      ? E.right(value)
      : E.left([new FF.Message("Invalid VIN format.", "warn", "validate")]);
  };

const validateNoFutureDate =
  (value: Date): Lazy<E.Either<NEA.NonEmptyArray<FF.Message>, Date>> =>
  () => {
    return G.isFalsy(datefns.isFuture(value))
      ? E.right(value)
      : E.left([
          new FF.Message("Date cannot be in the future.", "warn", "validate"),
        ]);
  };

const validatePositive =
  (value: number): Lazy<E.Either<NEA.NonEmptyArray<FF.Message>, number>> =>
  () => {
    return value >= 0
      ? E.right(value)
      : E.left([
          new FF.Message("Must be a positive value.", "warn", "validate"),
        ]);
  };

const validateManufactureYear =
  (value: number): Lazy<E.Either<NEA.NonEmptyArray<FF.Message>, number>> =>
  () => {
    const currentYear: number = new Date().getFullYear();

    return value >= 1940 && value <= currentYear + 1
      ? E.right(value)
      : E.left([
          new FF.Message("Invalid manufacture year.", "warn", "validate"),
        ]);
  };

/*
 * Record Hooks
 */

const grossVehicleWeightCheck = (record: FlatfileRecord): FlatfileRecord => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      asset_type: t.string.decode(record.get("asset_type")),
      empty_weight: t.number.decode(Number(record.get("empty_weight"))),
      actual_cgvw: t.number.decode(Number(record.get("actual_cgvw"))),
    }),
    E.match(
      () => record,
      ({ asset_type, empty_weight, actual_cgvw }) => {
        match(asset_type)
          .with("tractor", () => {
            if (actual_cgvw > empty_weight) {
              if (actual_cgvw > 160000) {
                record.addError("actual_cgvw", "Too heavy.");
              }

              if (actual_cgvw > 80000 && actual_cgvw <= 160000) {
                record.addWarning("actual_cgvw", "Woah! Are you sure?");
              }
            }
          })
          .with("trailer", () => {
            if (empty_weight > 0) {
              record.addWarning("empty_weight", "Weight is not required.");
            }

            if (actual_cgvw > 0) {
              record.addWarning("actual_cgvw", "Weight is not required.");
            }
          });

        return record;
      },
    ),
  );
};

/*
 * Main
 */

const Assets = new FF.Sheet(
  "Assets (Fleetworthy)",
  {
    asset_id: FF.TextField({
      label: "Asset Id",
    }),
    vin: FF.TextField({
      label: "VIN",
      required: true,
      compute: (value) => {
        return value.trim().toUpperCase();
      },
      validate: (value) => {
        const ensureValidVin = validateVin(value);

        return runValidations(ensureValidVin());
      },
    }),
    client_unit_number: FF.TextField({
      label: "Client Unit Number",
      required: true,
      unique: true,
    }),
    asset_type: FF.OptionField({
      label: "Asset Type",
      required: true,
      options: {
        tractor: "Tractor",
        trailer: "Trailer",
      },
    }),
    sub_type: FF.TextField({
      label: "Sub Type",
    }),
    entity: FF.TextField({
      label: "Entity",
      required: true,
    }),
    provider_unit_number: FF.TextField({
      label: "Provider Unit Number",
    }),
    alias: FF.TextField({
      label: "Alias",
    }),
    fuel_type: FF.OptionField({
      label: "Fuel Type",
      required: true,
      options: {
        diesel: "Diesel",
        gas: "Gas",
      },
    }),
    estimated_mpg: FF.TextField({
      label: "Estimated MPG",
    }),
    year_of_manufacture: FF.NumberField({
      label: "Year of Manufacture",
      required: true,
      validate: (value) => {
        const ensureValidManufactureYear = validateManufactureYear(value);

        return runValidations(ensureValidManufactureYear());
      },
    }),
    manufacturer: FF.OptionField({
      label: "Manufacturer",
      required: true,
      options: {
        ford: "Ford",
        dodge: "Dodge",
      },
    }),
    licensed_weight: FF.NumberField({
      label: "Licensed Weight",
      required: true,
      validate: (value) => {
        const ensurePositive = validatePositive(value);

        return runValidations(ensurePositive());
      },
    }),
    actual_cgvw: FF.NumberField({
      label: "Actual CGVW",
      required: true,
      validate: (value) => {
        const ensurePositive = validatePositive(value);

        return runValidations(ensurePositive());
      },
    }),
    empty_weight: FF.NumberField({
      label: "Empty Weight",
      required: true,
      validate: (value) => {
        const ensurePositive = validatePositive(value);

        return runValidations(ensurePositive());
      },
    }),
    number_of_axles: FF.NumberField({
      label: "# Axles",
      required: true,
    }),
    asset_status: FF.OptionField({
      label: "Asset Status",
      required: true,
      options: {
        active: "Active",
        in_service: "In-Service",
        inactive: "Inactive",
      },
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record, _logger) => {
      return fold(grossVehicleWeightCheck)(record);
    },
    batchRecordsCompute: async (_payload) => {},
  },
);

const People = new FF.Sheet(
  "People (Fleetworthy)",
  {
    person_id: FF.TextField({
      label: "Person Id",
    }),
    ssn: FF.TextField({
      label: "Social Security Number",
      required: true,
      unique: true,
      compute: (value) => value.trim(),
      validate: (value) => {
        const ensureValidSsn = validateSsn(value);

        return runValidations(ensureValidSsn());
      },
    }),
    person_number: FF.NumberField({
      label: "Person Number",
      required: true,
    }),
    entity: FF.TextField({
      label: "Entity",
      required: true,
    }),
    first_name: FF.TextField({
      label: "First Name",
      required: true,
    }),
    last_name: FF.TextField({
      label: "Last Name",
      required: true,
    }),
    date_of_birth: FF.DateField({
      label: "Date of Birth",
      required: true,
      validate: (value) => {
        const ensureNoFutureDate = validateNoFutureDate(value);

        return runValidations(ensureNoFutureDate());
      },
    }),
    person_status: FF.OptionField({
      label: "Person Status",
      required: true,
      options: {
        active: "Active",
        applicant: "Applicant",
        inactive: "Inactive",
        leave: "Leave",
        terminated: "Terminated",
      },
    }),
    job_class: FF.TextField({
      label: "Job Class",
    }),
    join_date: FF.DateField({
      label: "Join Date",
      required: true,
      validate: (value) => {
        const ensureNoFutureDate = validateNoFutureDate(value);

        return runValidations(ensureNoFutureDate());
      },
    }),
    email: FF.TextField({
      label: "Email Address",
    }),
    phone_number: FF.TextField({
      label: "Phone Number",
    }),
    license_number: FF.TextField({
      label: "License Number",
      required: true,
    }),
    license_class: FF.TextField({
      label: "License Class",
      required: true,
    }),
    license_state: FF.OptionField({
      label: "License State",
      options: {
        alabama: "AL",
        alaska: "AK",
        arizona: "AZ",
        arkansas: "AR",
        california: "CA",
        colorado: "CO",
        connecticut: "CT",
        delaware: "DE",
        florida: "FL",
        georgia: "GA",
        hawaii: "HI",
        idaho: "ID",
        illinois: "IL",
        indiana: "IN",
        iowa: "IA",
        kansas: "KS",
        kentucky: "KY",
        louisiana: "LA",
        maine: "ME",
        maryland: "MD",
        massachusetts: "MA",
        michigan: "MI",
        minnesota: "MN",
        mississippi: "MS",
        missouri: "MO",
        montana: "MT",
        nebraska: "NE",
        nevada: "NV",
        new_hampshire: "NH",
        new_jersey: "NJ",
        new_mexico: "NM",
        new_york: "NY",
        north_carolina: "NC",
        north_dakota: "ND",
        ohio: "OH",
        oklahoma: "OK",
        oregon: "OR",
        pennsylvania: "PA",
        rhode_island: "RI",
        south_carolina: "SC",
        south_dakota: "SD",
        tennessee: "TN",
        texas: "TX",
        utah: "UT",
        vermont: "VT",
        virginia: "VA",
        washington: "WA",
        west_virginia: "WV",
        wisconsin: "WI",
        wyoming: "WY",
      },
    }),
    license_expiration_date: FF.DateField({
      label: "License Expiration Date",
      required: true,
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (_record, _logger) => {},
    batchRecordsCompute: async (_payload) => {},
  },
);

const workbook = new FF.Workbook({
  name: "Workbook - Fleetworthy Demo",
  namespace: "Fleetworthy",
  sheets: {
    Assets,
    People,
  },
});

export default workbook;
