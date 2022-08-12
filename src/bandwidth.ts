import * as FF from "@flatfile/configure";
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as NEA from "fp-ts/NonEmptyArray";
import { identity, constVoid, pipe } from "fp-ts/function";

/*
 * Validations
 */

const sequenceValidationT = Ap.sequenceT(
  E.getApplicativeValidation(NEA.getSemigroup<FF.Message>()),
);

const validateMaxLength =
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

const validateUKPostCode = (
  value: string,
): E.Either<NEA.NonEmptyArray<FF.Message>, string> => {
  const re = /^([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}|GIR\s?0A{2})$/g;

  return re.test(value)
    ? E.right(value)
    : E.left([new FF.Message("Invalid post code.", "error", "validate")]);
};

/*
 * Main
 */

const X = new FF.Sheet(
  "asdf",
  {
    transaction_type: FF.OptionField({
      label: "Transaction Type",
      required: true,
      options: {
        cancel: "CANCEL",
        change: "CHANGE",
        intern: "INTERN",
        new: "NEW",
        portin: "PORTIN",
      },
    }),
    e164: FF.TextField({
      label: "E164",
    }),
    service: FF.OptionField({
      label: "Service",
      required: true, // how to customize error message?
      options: {
        es: "ES",
      },
    }),
    losing_carrier: FF.OptionField({
      label: "Losing Carrier",
      options: {
        annex1: "Annex1",
      },
    }),
    device_type: FF.OptionField({
      label: "Device Type",
      options: {
        fax: "FAX",
        tel: "TEL",
      },
    }),
    service_type: FF.TextField({
      label: "Service Type",
    }),
    customer_type: FF.OptionField({
      label: "Customer Type",
      options: {
        res: "RES",
        bus: "BUS",
      },
    }),
    first_name: FF.TextField({
      label: "First Name",
      validate: (value) => {
        const maxLength = validateMaxLength(20)(value);

        return pipe(
          sequenceValidationT(maxLength),
          E.match(identity, constVoid),
        );
      },
    }),
    last_name: FF.TextField({
      label: "Last Name",
      validate: (value) => {
        const maxLength = validateMaxLength(50)(value);

        return pipe(
          sequenceValidationT(maxLength),
          E.match(identity, constVoid),
        );
      },
    }),
    title: FF.TextField({
      label: "Title",
      validate: (value) => {
        const maxLength = validateMaxLength(10)(value);

        return pipe(
          sequenceValidationT(maxLength),
          E.match(identity, constVoid),
        );
      },
    }),
    company_name: FF.TextField({
      label: "Company Name",
      validate: (value) => {
        const maxLength = validateMaxLength(60)(value);

        return pipe(
          sequenceValidationT(maxLength),
          E.match(identity, constVoid),
        );
      },
    }),
    house_name_or_number: FF.TextField({
      label: "House Name or Number",
      validate: (value) => {
        const maxLength = validateMaxLength(60)(value);

        return pipe(
          sequenceValidationT(maxLength),
          E.match(identity, constVoid),
        );
      },
    }),
    street_name: FF.TextField({
      label: "Street Name",
      validate: (value) => {
        const maxLength = validateMaxLength(55)(value);

        return pipe(
          sequenceValidationT(maxLength),
          E.match(identity, constVoid),
        );
      },
    }),
    locality: FF.TextField({
      label: "Locality",
      validate: (value) => {
        const maxLength = validateMaxLength(30)(value);

        return pipe(
          sequenceValidationT(maxLength),
          E.match(identity, constVoid),
        );
      },
    }),
    post_code: FF.TextField({
      label: "Post Code",
      validate: (value) => {
        const postCode = validateUKPostCode(value);

        return pipe(
          sequenceValidationT(postCode),
          E.match(identity, constVoid),
        );
      },
    }),
  },
  {
    allowCustomFields: false,
    readOnly: true,
    recordCompute: (_record, _logger) => {},
    batchRecordsCompute: async (_payload) => {},
  },
);
