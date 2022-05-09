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
    const { postalCode, country: countryCode } = record.value;

    if (countryCode !== "US") return;

    if (isNotNil(postalCode) && postalCode.length < 5) {
      const padded = postalCode.padStart(5, "0");

      record
        .set("postalCode", padded)
        .addInfo("postalCode", "Zipcode was padded with zeroes");
    }
  });
};
