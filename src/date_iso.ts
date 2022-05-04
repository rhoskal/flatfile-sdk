const dfns = require("date-fns");

/**
 * Helper function to determine if a value is null or undefined.
 * Useful in if/else statments or ternaries.
 *
 * @param {*} val - Any object/value
 */
const isNil = (val) => val === null || val === undefined;

/**
 * Helper function to determine if a value is NOT null or undefined.
 * Useful in if/else statments or ternaries.
 *
 * @param {*} val - Any object/value
 */
const isNotNil = (val) => !isNil(val);

const FIELDS = {
  date: "date",
};

module.exports = async ({ recordBatch, _session, logger }) => {
  return recordBatch.records.map((record) => {
    Object.keys(FIELDS).forEach((field) => {
      const { date: dateValue } = record.get(field);

      if (isNotNil(dateValue)) {
        if (Date.parse(dateValue)) {
          const thisDate = dfns.format(new Date(dateValue), "yyyy-MM-dd");
          const realDate = dfns.parseISO(thisDate);

          if (dfns.isDate(realDate)) {
            record
              .set(FIELDS.date, thisDate)
              .addComment(FIELDS.date, "Automatically formatted");

            if (dfns.isFuture(realDate)) {
              record.addError(FIELDS.date, "Date cannot be in the future");
            }
          }
        } else {
          record.addError(FIELDS.date, "Invalid date");
          logger.error("Invalid date");
        }
      }
    });
  });
};
