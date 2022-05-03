const fields = {
  firstName: "firstName",
  lastName: "lastName",
};

const isNil = (val) => val === null || val === undefined;

const isNotNil = (val) => !isNil(val);

module.exports = async ({ recordBatch, _session, _logger }) => {
  await Promise.all(
    await recordBatch.records.map(async (record) => {
      const { firstName, lastName } = record.value;

      if (isNotNil(firstName) && isNotNil(lastName)) {
        if (firstName.includes(" ")) {
          const substrings = firstName.split(" ");

          record
            .set(fields.firstName, substrings[0])
            .addComment(fields.firstName, "Full name was split");
          record
            .set(fields.lastName, substrings.join(" "))
            .addComment(fields.lastName, "Full name was split");
        }
      }
    }),
  );
};
