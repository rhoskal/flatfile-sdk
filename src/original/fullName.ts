module.exports = async ({ recordBatch, session, logger }) => {
  await Promise.all(
    await recordBatch.records.map(async (record) => {
      if (record.value.firstName && !record.value.lastName) {
        if (record.value.firstName.includes(" ")) {
          const components = record.value.firstName.split(" ");
          record
            .set("firstName", components.shift())
            .addComment("firstName", "Full name was split");
          record
            .set("lastName", components.join(" "))
            .addComment("lastName", "Full name was split");
        }
      }
    }),
  );
};
