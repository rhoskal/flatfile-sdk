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
  firstName: "firstName",
  lastName: "lastName",
};

export default async ({ recordBatch, _session, _logger }) => {
  return recordBatch.records.map((record) => {
    const { firstName, lastName } = record.value;

    if (isNotNil(firstName) && isNotNil(lastName)) {
      if (firstName.includes(" ")) {
        const parts = firstName.split(" ");

        record
          .set(FIELDS.firstName, parts[0])
          .addComment(FIELDS.firstName, "Full name was split");
        record
          .set(FIELDS.lastName, parts.slice(1, parts.length).join(" ").trim())
          .addComment(FIELDS.lastName, "Full name was split");
      }
    }
  });
};
