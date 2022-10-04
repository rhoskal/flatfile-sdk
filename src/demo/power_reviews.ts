import * as FF from "@flatfile/configure";

import * as E from "fp-ts/Either";
import { Lazy, pipe } from "fp-ts/function";
import * as Str from "fp-ts/string";

import { runValidations, ValidationResult } from "../utils";

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

const validateWholeNumber =
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value % 1 === 0
      ? E.right(value)
      : E.left([new FF.Message("Whole numbers only.", "error", "validate")]);
  };

const validateRangeInclusive =
  (min: number, max: number) =>
  (value: number): Lazy<ValidationResult<number>> =>
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

const validatePositive =
  (value: number): Lazy<ValidationResult<number>> =>
  () => {
    return value >= 0
      ? E.right(value)
      : E.left([new FF.Message("Value must be positive", "error", "validate")]);
  };

/*
 * Main
 */

const ReviewsSheet = new FF.Sheet(
  "Reviews (PowerReviews)",
  {
    review_id: FF.TextField({
      label: "Review Id",
      description: "The unique ID for the review.",
      required: true,
      unique: true,
    }),
    page_id: FF.TextField({
      label: "Page Id",
      description: "The unique ID for the product.",
      required: true,
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(50)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    handle: FF.TextField({
      label: "Display Name",
      description: "The user's nickname on the review.",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(40)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    title: FF.TextField({
      label: "Title",
      description: "The user-entered review title.",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(60)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    date: FF.DateField({
      label: "Date",
      description: "The date the user wrote the review.",
      required: true,
    }),
    location: FF.TextField({
      label: "Location",
      description: "The physical location of the reviewer.",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(40)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    body: FF.TextField({
      label: "Body",
      description: "The main body or comments on the review.",
      required: true,
      compute: (value) => pipe(value, Str.trim),
    }),
    rating: FF.NumberField({
      label: "Rating",
      description: "The star rating value.",
      required: true,
      validate: (value) => {
        const ensureWholeNumber = validateWholeNumber(value);
        const ensureBetween1and5 = validateRangeInclusive(1, 5)(value);

        return runValidations(ensureWholeNumber(), ensureBetween1and5());
      },
    }),
    is_buyer_verified: FF.BooleanField({
      label: "Verified Buyer?",
      description: "States whether or not the user is a verified buyer.",
      required: true,
    }),
    status: FF.OptionField({
      label: "Status",
      description: "Valid status of the review.",
      required: true,
      options: {
        approved: "Approved",
        pending: "Pending",
        rejected: "Rejected",
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

const ProductsSheet = new FF.Sheet(
  "Products (PowerReviews)",
  {
    page_id: FF.TextField({
      label: "Page Id",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(50)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    product_url: FF.TextField({
      label: "Product URL",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(650)(value);
        const ensureNoSpaces = validateRegex(/[^ ]+/g)(value);

        return runValidations(ensureMaxLength(), ensureNoSpaces());
      },
    }),
    name: FF.TextField({
      label: "Name",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(500)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    image_url: FF.TextField({
      label: "Image URL",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(650)(value);
        const ensureNoSpaces = validateRegex(/[^ ]+/g)(value);

        return runValidations(ensureMaxLength(), ensureNoSpaces());
      },
    }),
    description: FF.TextField({
      label: "Description",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(10000)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    category: FF.TextField({
      label: "Category",
      description:
        "The product's inventory classification. To indicate a hierarchy, use the greater than (>) symbol as a delimiter between categories.",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(300)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    brand: FF.TextField({
      label: "Brand",
      required: true,
      compute: (value) => pipe(value, Str.trim),
      validate: (value) => {
        const ensureMaxLength = validateMaxLength(300)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    upc_or_ean: FF.TextField({
      label: "UPC or EAN",
      description: "The 12-digit UPC or 13-digit EAN.",
      required: true,
      validate: (value) => {
        const ensureUpcOrEan = validateRegex(/\d{12,13}+/g)(value);

        return runValidations(ensureUpcOrEan());
      },
    }),
    manufacturer_id: FF.TextField({
      label: "Manufacturer Id",
      required: true,
    }),
    in_stock: FF.BooleanField({
      label: "In Stock?",
    }),
    price: FF.NumberField({
      label: "Price",
      compute: (value) => value,
      validate: (value) => {
        const ensureIsPositive = validatePositive(value);

        return runValidations(ensureIsPositive());
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

const ProductsPortal = new FF.Portal({
  name: "Products (PowerReviews)",
  helpContent: "",
  sheet: "ProductsSheet",
});

const ReviewsPortal = new FF.Portal({
  name: "Reviews (PowerReviews)",
  helpContent: "",
  sheet: "ReviewsSheet",
});

const workbook = new FF.Workbook({
  name: "Workbook - PowerReviews Demo",
  namespace: "PowerReviews",
  portals: [ReviewsPortal, ProductsPortal],
  sheets: {
    ReviewsSheet,
    ProductsSheet,
  },
});

export default workbook;
