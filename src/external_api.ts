const axios = require("axios");

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

const fetchCountries = async () => {
  try {
    const {
      data: { data: countries },
    } = await axios.get(
      "https://v1.nocodeapi.com/alnoor/google_sheets/WXIpzDYrcFlVdkTL?tabId=Sheet1",
    );

    return countries;
  } catch (_e) {
    return [];
  }
};

const lookup = (countries) => {
  return (match) => {
    const found = countries.find(
      (c) => c.country_name.toLowerCase() === match.toLowerCase(),
    );

    return isNil(found) ? undefined : found.country_code;
  };
};

module.exports = async ({ recordBatch, _session, _logger }) => {
  const countries = await fetchCountries();

  if (countries.length === 0) return;

  return recordBatch.records.forEach((record) => {
    const { country: countryName } = record.value;

    if (isNotNil(countryName)) {
      const countryCode = lookup(countries)(countryName);

      if (isNotNil(countryCode)) {
        record
          .set("country", countryCode)
          .addComment("country", "Country was automatically formatted");
      }
    }
  });
};
