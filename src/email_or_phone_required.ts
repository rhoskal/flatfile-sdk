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

module.exports = async ({ recordBatch, _session, _logger }) => {
  return recordBatch.records.map((record) => {
    const { email, phone } = record.value;

    if (isNil(email) && isNil(phone)) {
      record
        .addWarning("email", "Must have either phone or email")
        .addWarning("phone", "Must have either phone or email");
    }
  });
};
