const dfns = require("date-fns");

const DATE_FIELDS = ["date"];

module.exports = async ({ recordBatch, _session, logger }) => {
  await Promise.all(
    await recordBatch.records.map(async (record) => {
      DATE_FIELDS.forEach((dateField) => {
        let dateValue = record.get(dateField);

        if (dateValue) {
          if (Date.parse(dateValue)) {
            let thisDate = dfns.format(new Date(dateValue), "yyyy-MM-dd");
            let realDate = dfns.parseISO(thisDate);
            if (dfns.isDate(realDate)) {
              record.set(dateField, thisDate).addComment(dateField, "Automatically formatted");
              if (dfns.isFuture(realDate)) {
                record.addError(dateField, "date cannot be in the future");
              }
            }
          } else {
            record.addError(dateField, "Invalid date");
            logger.error("Invalid date");
          }
        }
      });
    }),
  );
};
