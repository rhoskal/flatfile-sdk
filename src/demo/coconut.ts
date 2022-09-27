import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as M from "fp-ts/Map";
import * as NEA from "fp-ts/NonEmptyArray";
import * as O from "fp-ts/Option";
import * as Str from "fp-ts/string";
import { Lazy, pipe } from "fp-ts/function";
import * as t from "io-ts";

import * as G from "../typeGuards";
import { fold, runValidations } from "../utils";

const countries = new Map<string, string>([
  ["Afghanistan".toLowerCase(), "AF"],
  ["Åland Islands".toLowerCase(), "AX"],
  ["Albania".toLowerCase(), "AL"],
  ["Algeria".toLowerCase(), "DZ"],
  ["American Samoa".toLowerCase(), "AS"],
  ["AndorrA".toLowerCase(), "AD"],
  ["Angola".toLowerCase(), "AO"],
  ["Anguilla".toLowerCase(), "AI"],
  ["Antarctica".toLowerCase(), "AQ"],
  ["Antigua and Barbuda".toLowerCase(), "AG"],
  ["Argentina".toLowerCase(), "AR"],
  ["Armenia".toLowerCase(), "AM"],
  ["Aruba".toLowerCase(), "AW"],
  ["Australia".toLowerCase(), "AU"],
  ["Austria".toLowerCase(), "AT"],
  ["Azerbaijan".toLowerCase(), "AZ"],
  ["Bahamas".toLowerCase(), "BS"],
  ["Bahrain".toLowerCase(), "BH"],
  ["Bangladesh".toLowerCase(), "BD"],
  ["Barbados".toLowerCase(), "BB"],
  ["Belarus".toLowerCase(), "BY"],
  ["Belgium".toLowerCase(), "BE"],
  ["Belize".toLowerCase(), "BZ"],
  ["Benin".toLowerCase(), "BJ"],
  ["Bermuda".toLowerCase(), "BM"],
  ["Bhutan".toLowerCase(), "BT"],
  ["Bolivia".toLowerCase(), "BO"],
  ["Bosnia and Herzegovina".toLowerCase(), "BA"],
  ["Botswana".toLowerCase(), "BW"],
  ["Bouvet Island".toLowerCase(), "BV"],
  ["Brazil".toLowerCase(), "BR"],
  ["British Indian Ocean Territory".toLowerCase(), "IO"],
  ["Brunei Darussalam".toLowerCase(), "BN"],
  ["Bulgaria".toLowerCase(), "BG"],
  ["Burkina Faso".toLowerCase(), "BF"],
  ["Burundi".toLowerCase(), "BI"],
  ["Cambodia".toLowerCase(), "KH"],
  ["Cameroon".toLowerCase(), "CM"],
  ["Canada".toLowerCase(), "CA"],
  ["Cape Verde".toLowerCase(), "CV"],
  ["Cayman Islands".toLowerCase(), "KY"],
  ["Central African Republic".toLowerCase(), "CF"],
  ["Chad".toLowerCase(), "TD"],
  ["Chile".toLowerCase(), "CL"],
  ["China".toLowerCase(), "CN"],
  ["Christmas Island".toLowerCase(), "CX"],
  ["Cocos (Keeling) Islands".toLowerCase(), "CC"],
  ["Colombia".toLowerCase(), "CO"],
  ["Comoros".toLowerCase(), "KM"],
  ["Congo".toLowerCase(), "CG"],
  ["Congo, The Democratic Republic of the".toLowerCase(), "CD"],
  ["Cook Islands".toLowerCase(), "CK"],
  ["Costa Rica".toLowerCase(), "CR"],
  ["Cote D'Ivoire".toLowerCase(), "CI"],
  ["Croatia".toLowerCase(), "HR"],
  ["Cuba".toLowerCase(), "CU"],
  ["Cyprus".toLowerCase(), "CY"],
  ["Czech Republic".toLowerCase(), "CZ"],
  ["Denmark".toLowerCase(), "DK"],
  ["Djibouti".toLowerCase(), "DJ"],
  ["Dominica".toLowerCase(), "DM"],
  ["Dominican Republic".toLowerCase(), "DO"],
  ["Ecuador".toLowerCase(), "EC"],
  ["Egypt".toLowerCase(), "EG"],
  ["El Salvador".toLowerCase(), "SV"],
  ["Equatorial Guinea".toLowerCase(), "GQ"],
  ["Eritrea".toLowerCase(), "ER"],
  ["Estonia".toLowerCase(), "EE"],
  ["Ethiopia".toLowerCase(), "ET"],
  ["Falkland Islands (Malvinas)".toLowerCase(), "FK"],
  ["Faroe Islands".toLowerCase(), "FO"],
  ["Fiji".toLowerCase(), "FJ"],
  ["Finland".toLowerCase(), "FI"],
  ["France".toLowerCase(), "FR"],
  ["French Guiana".toLowerCase(), "GF"],
  ["French Polynesia".toLowerCase(), "PF"],
  ["French Southern Territories".toLowerCase(), "TF"],
  ["Gabon".toLowerCase(), "GA"],
  ["Gambia".toLowerCase(), "GM"],
  ["Georgia".toLowerCase(), "GE"],
  ["Germany".toLowerCase(), "DE"],
  ["Ghana".toLowerCase(), "GH"],
  ["Gibraltar".toLowerCase(), "GI"],
  ["Greece".toLowerCase(), "GR"],
  ["Greenland".toLowerCase(), "GL"],
  ["Grenada".toLowerCase(), "GD"],
  ["Guadeloupe".toLowerCase(), "GP"],
  ["Guam".toLowerCase(), "GU"],
  ["Guatemala".toLowerCase(), "GT"],
  ["Guernsey".toLowerCase(), "GG"],
  ["Guinea".toLowerCase(), "GN"],
  ["Guinea-Bissau".toLowerCase(), "GW"],
  ["Guyana".toLowerCase(), "GY"],
  ["Haiti".toLowerCase(), "HT"],
  ["Heard Island and Mcdonald Islands".toLowerCase(), "HM"],
  ["Holy See (Vatican City State)".toLowerCase(), "VA"],
  ["Honduras".toLowerCase(), "HN"],
  ["Hong Kong".toLowerCase(), "HK"],
  ["Hungary".toLowerCase(), "HU"],
  ["Iceland".toLowerCase(), "IS"],
  ["India".toLowerCase(), "IN"],
  ["Indonesia".toLowerCase(), "ID"],
  ["Iran, Islamic Republic Of".toLowerCase(), "IR"],
  ["Iraq".toLowerCase(), "IQ"],
  ["Ireland".toLowerCase(), "IE"],
  ["Isle of Man".toLowerCase(), "IM"],
  ["Israel".toLowerCase(), "IL"],
  ["Italy".toLowerCase(), "IT"],
  ["Jamaica".toLowerCase(), "JM"],
  ["Japan".toLowerCase(), "JP"],
  ["Jersey".toLowerCase(), "JE"],
  ["Jordan".toLowerCase(), "JO"],
  ["Kazakhstan".toLowerCase(), "KZ"],
  ["Kenya".toLowerCase(), "KE"],
  ["Kiribati".toLowerCase(), "KI"],
  ["Korea, Democratic People'S Republic of".toLowerCase(), "KP"],
  ["Korea, Republic of".toLowerCase(), "KR"],
  ["Kuwait".toLowerCase(), "KW"],
  ["Kyrgyzstan".toLowerCase(), "KG"],
  ["Lao People'S Democratic Republic".toLowerCase(), "LA"],
  ["Latvia".toLowerCase(), "LV"],
  ["Lebanon".toLowerCase(), "LB"],
  ["Lesotho".toLowerCase(), "LS"],
  ["Liberia".toLowerCase(), "LR"],
  ["Libyan Arab Jamahiriya".toLowerCase(), "LY"],
  ["Liechtenstein".toLowerCase(), "LI"],
  ["Lithuania".toLowerCase(), "LT"],
  ["Luxembourg".toLowerCase(), "LU"],
  ["Macao".toLowerCase(), "MO"],
  ["Macedonia.toLowerCase(), The Former Yugoslav Republic of", "MK"],
  ["Madagascar".toLowerCase(), "MG"],
  ["Malawi".toLowerCase(), "MW"],
  ["Malaysia".toLowerCase(), "MY"],
  ["Maldives".toLowerCase(), "MV"],
  ["Mali".toLowerCase(), "ML"],
  ["Malta".toLowerCase(), "MT"],
  ["Marshall Islands".toLowerCase(), "MH"],
  ["Martinique".toLowerCase(), "MQ"],
  ["Mauritania".toLowerCase(), "MR"],
  ["Mauritius".toLowerCase(), "MU"],
  ["Mayotte".toLowerCase(), "YT"],
  ["Mexico".toLowerCase(), "MX"],
  ["Micronesia, Federated States of".toLowerCase(), "FM"],
  ["Moldova, Republic of".toLowerCase(), "MD"],
  ["Monaco".toLowerCase(), "MC"],
  ["Mongolia".toLowerCase(), "MN"],
  ["Montserrat".toLowerCase(), "MS"],
  ["Morocco".toLowerCase(), "MA"],
  ["Mozambique".toLowerCase(), "MZ"],
  ["Myanmar".toLowerCase(), "MM"],
  ["Namibia".toLowerCase(), "NA"],
  ["Nauru".toLowerCase(), "NR"],
  ["Nepal".toLowerCase(), "NP"],
  ["Netherlands".toLowerCase(), "NL"],
  ["Netherlands Antilles".toLowerCase(), "AN"],
  ["New Caledonia".toLowerCase(), "NC"],
  ["New Zealand".toLowerCase(), "NZ"],
  ["Nicaragua".toLowerCase(), "NI"],
  ["Niger".toLowerCase(), "NE"],
  ["Nigeria".toLowerCase(), "NG"],
  ["Niue".toLowerCase(), "NU"],
  ["Norfolk Island".toLowerCase(), "NF"],
  ["Northern Mariana Islands".toLowerCase(), "MP"],
  ["Norway".toLowerCase(), "NO"],
  ["Oman".toLowerCase(), "OM"],
  ["Pakistan".toLowerCase(), "PK"],
  ["Palau".toLowerCase(), "PW"],
  ["Palestinian Territory, Occupied".toLowerCase(), "PS"],
  ["Panama".toLowerCase(), "PA"],
  ["Papua New Guinea".toLowerCase(), "PG"],
  ["Paraguay".toLowerCase(), "PY"],
  ["Peru".toLowerCase(), "PE"],
  ["Philippines".toLowerCase(), "PH"],
  ["Pitcairn".toLowerCase(), "PN"],
  ["Poland".toLowerCase(), "PL"],
  ["Portugal".toLowerCase(), "PT"],
  ["Puerto Rico".toLowerCase(), "PR"],
  ["Qatar".toLowerCase(), "QA"],
  ["Reunion".toLowerCase(), "RE"],
  ["Romania".toLowerCase(), "RO"],
  ["Russian Federation".toLowerCase(), "RU"],
  ["RWANDA".toLowerCase(), "RW"],
  ["Saint Helena".toLowerCase(), "SH"],
  ["Saint Kitts and Nevis".toLowerCase(), "KN"],
  ["Saint Lucia".toLowerCase(), "LC"],
  ["Saint Pierre and Miquelon".toLowerCase(), "PM"],
  ["Saint Vincent and the Grenadines".toLowerCase(), "VC"],
  ["Samoa".toLowerCase(), "WS"],
  ["San Marino".toLowerCase(), "SM"],
  ["Sao Tome and Principe".toLowerCase(), "ST"],
  ["Saudi Arabia".toLowerCase(), "SA"],
  ["Senegal".toLowerCase(), "SN"],
  ["Serbia and Montenegro".toLowerCase(), "CS"],
  ["Seychelles".toLowerCase(), "SC"],
  ["Sierra Leone".toLowerCase(), "SL"],
  ["Singapore".toLowerCase(), "SG"],
  ["Slovakia".toLowerCase(), "SK"],
  ["Slovenia".toLowerCase(), "SI"],
  ["Solomon Islands".toLowerCase(), "SB"],
  ["Somalia".toLowerCase(), "SO"],
  ["South Africa".toLowerCase(), "ZA"],
  ["South Georgia and the South Sandwich Islands".toLowerCase(), "GS"],
  ["Spain".toLowerCase(), "ES"],
  ["Sri Lanka".toLowerCase(), "LK"],
  ["Sudan".toLowerCase(), "SD"],
  ["Suriname".toLowerCase(), "SR"],
  ["Svalbard and Jan Mayen".toLowerCase(), "SJ"],
  ["Swaziland".toLowerCase(), "SZ"],
  ["Sweden".toLowerCase(), "SE"],
  ["Switzerland".toLowerCase(), "CH"],
  ["Syrian Arab Republic".toLowerCase(), "SY"],
  ["Taiwan, Province of China".toLowerCase(), "TW"],
  ["Tajikistan".toLowerCase(), "TJ"],
  ["Tanzania, United Republic of".toLowerCase(), "TZ"],
  ["Thailand".toLowerCase(), "TH"],
  ["Timor-Leste".toLowerCase(), "TL"],
  ["Togo".toLowerCase(), "TG"],
  ["Tokelau".toLowerCase(), "TK"],
  ["Tonga".toLowerCase(), "TO"],
  ["Trinidad and Tobago".toLowerCase(), "TT"],
  ["Tunisia".toLowerCase(), "TN"],
  ["Turkey".toLowerCase(), "TR"],
  ["Turkmenistan".toLowerCase(), "TM"],
  ["Turks and Caicos Islands".toLowerCase(), "TC"],
  ["Tuvalu".toLowerCase(), "TV"],
  ["Uganda".toLowerCase(), "UG"],
  ["Ukraine".toLowerCase(), "UA"],
  ["United Arab Emirates".toLowerCase(), "AE"],
  ["United Kingdom".toLowerCase(), "GB"],
  ["United States".toLowerCase(), "US"],
  ["USA".toLowerCase(), "US"],
  ["United States Minor Outlying Islands".toLowerCase(), "UM"],
  ["Uruguay".toLowerCase(), "UY"],
  ["Uzbekistan".toLowerCase(), "UZ"],
  ["Vanuatu".toLowerCase(), "VU"],
  ["Venezuela".toLowerCase(), "VE"],
  ["Viet Nam".toLowerCase(), "VN"],
  ["Virgin Islands, British".toLowerCase(), "VG"],
  ["Virgin Islands, U.S.".toLowerCase(), "VI"],
  ["Wallis and Futuna".toLowerCase(), "WF"],
  ["Western Sahara".toLowerCase(), "EH"],
  ["Yemen".toLowerCase(), "YE"],
  ["Zambia".toLowerCase(), "ZM"],
  ["Zimbabwe".toLowerCase(), "ZW"],
]);

/*
 * Field Validations
 */

const validateEmail =
  (value: string): Lazy<E.Either<NEA.NonEmptyArray<FF.Message>, string>> =>
  () => {
    return value.includes("@")
      ? E.right(value)
      : E.left([new FF.Message("Invalid email address.", "warn", "validate")]);
  };

/*
 * Record Hooks
 */

const emailOrPhoneRequired = (record: FlatfileRecord) => {
  return pipe(
    Ap.sequenceT(O.Apply)(
      O.fromNullable(() => record.get("email")),
      O.fromNullable(() => record.get("phone")),
    ),
    O.match(
      () => record,
      ([email, phone]) => {
        if (G.isNil(email) && G.isNil(phone)) {
          record.addWarning(
            ["email", "phone"],
            "Must have either phone or email.",
          );
        }

        return record;
      },
    ),
  );
};

const zipCodeZeroPadding = (record: FlatfileRecord) => {
  return pipe(
    Ap.sequenceT(E.Apply)(
      t.string.decode(record.get("postal_code")),
      t.string.decode(record.get("country")),
    ),
    E.match(
      () => record,
      ([zip, country]) => {
        if (country === "US" && zip.length < 5) {
          const padded = zip.padStart(5, "0");

          record
            .set("postal_code", padded)
            .addInfo("postal_code", "Padded with zeros.");
        }

        return record;
      },
    ),
  );
};

/*
 * Main
 */

const Leads = new FF.Sheet(
  "Leads (CRM Demo)",
  {
    first_name: FF.TextField({
      label: "First Name",
      description: "Lead's first name.",
    }),
    last_name: FF.TextField({
      label: "Last Name",
      description: "Lead's last name.",
      required: true,
    }),
    email: FF.TextField({
      label: "Email Address",
      description: "Lead's email.",
      unique: true,
      compute: (value) => value.toLowerCase(),
      validate: (value) => {
        const ensureValidEmail = validateEmail(value);

        return runValidations(ensureValidEmail());
      },
    }),
    phone: FF.TextField({
      label: "Phone Number",
      description: "Lead's phone.",
    }),
    date: FF.DateField({
      label: "Date",
      description: "Date goes here.",
    }),
    country: FF.TextField({
      label: "Country",
      description: "Country goes here",
      compute: (value) => {
        return pipe(
          M.lookup(Str.Eq)(value.toLowerCase())(countries),
          O.getOrElse(() => value),
        );
      },
    }),
    postal_code: FF.TextField({
      label: "Postal Code",
      description: "Postal code goes here",
    }),
    opt_in: FF.BooleanField({
      label: "Opt In",
      description: "Opt in goes here",
    }),
    deal_status: FF.OptionField({
      label: "Deal Status",
      description: "Deal status goes here",
      options: {
        prospecting: "Prospecting",
        discovery: "Discovery",
        proposal: "Proposal",
        negotiation: "Negotiation",
        closed_won: "Closed Won",
        closed_lost: "Closed Lost",
      },
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record, _session, _logger) => {
      return fold(emailOrPhoneRequired, zipCodeZeroPadding)(record);
    },
    batchRecordsCompute: async (_payload, _session, _logger) => {},
  },
);

const workbook = new FF.Workbook({
  name: "Workbook - CRM Demo",
  namespace: "CRM",
  sheets: {
    Leads,
  },
});

export default workbook;
