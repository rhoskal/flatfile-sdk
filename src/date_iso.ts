const dfns = require("date-fns");

const isNil = (val) => val === null || val === undefined;

const isNotNil = (val) => !isNil(val);

const FIELDS = {
  date: "date",
};

export default async ({ recordBatch, _session, logger }) => {
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
