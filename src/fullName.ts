const isNil = (val) => val === null || val === undefined;

const isNotNil = (val) => !isNil(val);

const FIELDS = {
  firstName: "firstName",
  lastName: "lastName",
};

module.exports = async ({ recordBatch, _session, _logger }) => {
  return Promise.all(
    await recordBatch.records.map((record) => {
      const { firstName, lastName } = record.value;

      if (isNotNil(firstName) && isNotNil(lastName)) {
        if (firstName.includes(" ")) {
          const substrings = firstName.split(" ");

          record
            .set(FIELDS.firstName, substrings[0])
            .addComment(FIELDS.firstName, "Full name was split");
          record
            .set(FIELDS.lastName, substrings.join(" "))
            .addComment(FIELDS.lastName, "Full name was split");
        }
      }
    }),
  );
};
