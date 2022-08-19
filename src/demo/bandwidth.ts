import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as E from "fp-ts/Either";
import * as NEA from "fp-ts/NonEmptyArray";
import { identity, constVoid, pipe } from "fp-ts/function";
import { match } from "ts-pattern";

import * as G from "../typeGuards";
import { fold, sequenceValidationT } from "../utils";

/*
 * Types
 */

type CustomerType = "BUS" | "RES";
type TransactionType = "CANCEL" | "CHANGE" | "INTERN" | "NEW" | "PORTIN";

/*
 * Validations
 */

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

const requiredFields = (record: FlatfileRecord) => {
  const company_name = record.get("company_name");
  const customer_type = record.get("customer_type");
  const device_type = record.get("device_type");
  const first_name = record.get("first_name");
  const house_name_or_number = record.get("house_name_or_number");
  const last_name = record.get("last_name");
  const locality = record.get("locality");
  const losing_carrier = record.get("losing_carrier");
  const post_code = record.get("post_code");
  const service_type = record.get("service_type");
  const street_name = record.get("street_name");
  const transaction_type = record.get("transaction_type");

  // ignore possible `null` value when matching

  if (G.isNil(losing_carrier)) {
    match(transaction_type as TransactionType)
      .with("CANCEL", () => {
        record.addError("losing_carrier", "Field is required.");
      })
      .otherwise(() => {});
  }

  if (G.isNil(device_type)) {
    match(transaction_type as TransactionType)
      .with("CHANGE", () => {
        record.addError("device_type", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("device_type", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("device_type", "Field is required.");
      })
      .otherwise(() => {});
  }

  if (G.isNil(service_type)) {
    match(transaction_type as TransactionType)
      .with("CHANGE", () => {
        record.addError("service_type", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("service_type", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("service_type", "Field is required.");
      })
      .otherwise(() => {});
  }

  if (G.isNil(customer_type)) {
    match(transaction_type as TransactionType)
      .with("CHANGE", () => {
        record.addError("customer_type", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("customer_type", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("customer_type", "Field is required.");
      })
      .otherwise(() => {});
  } else {
    match(customer_type as CustomerType)
      .with("BUS", () => {
        if (G.isNil(company_name)) {
          record.addWarning("company_name", "Please add a company name.");
        }
      })
      .with("RES", () => {
        if (G.isNotNil(company_name)) {
          record.addWarning("company_name", "Please remove company name.");
        }
      })
      .otherwise(() => {});
  }

  if (G.isNil(first_name)) {
    match(customer_type as CustomerType).with("RES", () => {
      record.addError("first_name", "Field is required.");
    });

    match(transaction_type as TransactionType)
      .with("CHANGE", () => {
        record.addError("first_name", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("first_name", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("first_name", "Field is required.");
      });
  }

  if (G.isNil(last_name)) {
    match(customer_type as CustomerType).with("RES", () => {
      record.addError("last_name", "Field is required.");
    });

    match(transaction_type as TransactionType)
      .with("CHANGE", () => {
        record.addError("last_name", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("last_name", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("last_name", "Field is required.");
      });
  }

  if (G.isNil(company_name)) {
    match(transaction_type as TransactionType)
      .with("CHANGE", () => {
        record.addError("company_name", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("company_name", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("company_name", "Field is required.");
      })
      .otherwise(() => {});
  }

  if (G.isNil(house_name_or_number)) {
    match(transaction_type)
      .with("CHANGE", () => {
        record.addError("house_name_or_number", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("house_name_or_number", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("house_name_or_number", "Field is required.");
      })
      .otherwise(() => {});
  }

  if (G.isNil(street_name)) {
    match(transaction_type as TransactionType)
      .with("CHANGE", () => {
        record.addError("street_name", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("street_name", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("street_name", "Field is required.");
      })
      .otherwise(() => {});
  }

  if (G.isNil(locality)) {
    match(transaction_type as TransactionType)
      .with("CHANGE", () => {
        record.addError("locality", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("locality", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("locality", "Field is required.");
      })
      .otherwise(() => {});
  }

  if (G.isNil(post_code)) {
    match(transaction_type as TransactionType)
      .with("CHANGE", () => {
        record.addError("post_code", "Field is required.");
      })
      .with("NEW", () => {
        record.addError("post_code", "Field is required.");
      })
      .with("PORTIN", () => {
        record.addError("post_code", "Field is required.");
      })
      .otherwise(() => {});
  }

  return record;
};

/*
 * Main
 */

const EmergencyService = new FF.Sheet(
  "Emergency Service (Bandwidth)",
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
      required: true,
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
    recordCompute: (record, _logger) => {
      return fold(requiredFields)(record);
    },
    batchRecordsCompute: async (_payload) => {},
  },
);

const workbook = new FF.Workbook({
  name: "Workbook - Bandwidth Demo",
  namespace: "Bandwidth",
  sheets: {
    EmergencyService,
  },
});

export default workbook;
