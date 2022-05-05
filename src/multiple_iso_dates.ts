const dfns = require("date-fns");

/**
 * Helper function to determine if a value is null or undefined.
 * Useful in if/else statments or ternaries.
 *
 * @param {*} val - Any object/value
 */
const isNil = (val) => val === null || val === undefined || val === "";

/**
 * Helper function to determine if a value is NOT null or undefined.
 * Useful in if/else statments or ternaries.
 *
 * @param {*} val - Any object/value
 */
const isNotNil = (val) => !isNil(val);

const FIELDS = {
  date: "date",
  // modified_at: "modifiedAt",
  // created_at: "createdAt",
};

module.exports = async ({ recordBatch, _session, logger }) => {
  return recordBatch.records.map((record) => {
    Object.keys(FIELDS).forEach((field) => {
      const dateValue = record.get(FIELDS[field]);

      if (isNotNil(dateValue)) {
        if (Date.parse(dateValue)) {
          const thisDate = dfns.format(new Date(dateValue), "yyyy-MM-dd");
          const realDate = dfns.parseISO(thisDate);

          if (dfns.isDate(realDate)) {
            record
              .set(FIELDS[field], thisDate)
              .addComment(FIELDS[field], "Automatically formatted");

            if (dfns.isFuture(realDate)) {
              record.addError(FIELDS[field], "Date cannot be in the future");
            }
          }
        } else {
          record.addError(FIELDS[field], "Invalid date");
          logger.error("Invalid date");
        }
      }
    });
  });
};

module.exports = async ({ recordBatch, _session, logger }) => {
  return recordBatch.records.map((record) => {
    const { date, modifiedAt, createdAt } = record.value;

    if (isNotNil(date)) {
      convertToISO(date);
    }

    if (isNotNil(modifiedAt)) {
      convertToISO(modifiedAt);
    }

    if (isNotNil(createdAt)) {
      convertToISO(createdAt);
    }
  });
};
