const dfns = require("date-fns");

const fields = {
  date: "date",
};

const isNil = (val) => val === null || val === undefined;

const isNotNil = (val) => !isNil(val);

module.exports = async ({ recordBatch, _session, logger }) => {
  return Promise.all(
    await recordBatch.records.map((record) => {
      Object.keys(fields).forEach((field) => {
        const { date: dateValue } = record.get(field);

        if (isNotNil(dateValue)) {
          if (Date.parse(dateValue)) {
            const thisDate = dfns.format(new Date(dateValue), "yyyy-MM-dd");
            const realDate = dfns.parseISO(thisDate);

            if (dfns.isDate(realDate)) {
              record.set(fields.date, thisDate).addComment(fields.date, "Automatically formatted");

              if (dfns.isFuture(realDate)) {
                record.addError(fields.date, "Date cannot be in the future");
              }
            }
          } else {
            record.addError(fields.date, "Invalid date");
            logger.error("Invalid date");
          }
        }
      });
    }),
  );
};
