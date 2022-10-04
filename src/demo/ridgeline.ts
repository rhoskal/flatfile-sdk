import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as Ap from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";
import * as RR from "fp-ts/ReadonlyRecord";
import * as Str from "fp-ts/string";
import { pipe } from "fp-ts/function";
import { last } from "fp-ts/Semigroup";
import * as t from "io-ts";
import * as datefns from "date-fns";

import { fold } from "../utils";

interface ApiResponse {
  data: {
    currencies: {
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
      };
      edges: Array<{
        cursor: string;
        node: { id: string; name: string; code: string };
      }>;
    };
  };
}

const apiResponse: ApiResponse = {
  data: {
    currencies: {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "YXJyYXljb25uZWN0aW9uOjA=",
        endCursor: "YXJyYXljb25uZWN0aW9uOjE2OA==",
      },
      edges: [
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjA=",
          node: { id: "AED", name: "UAE Dirham", code: "AED" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE=",
          node: { id: "AFN", name: "Afghani", code: "AFN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjI=",
          node: { id: "AMD", name: "Armenian Dram", code: "AMD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjM=",
          node: {
            id: "ANG",
            name: "Netherlands Antillean Guilder",
            code: "ANG",
          },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQ=",
          node: { id: "AOA", name: "Kwanza", code: "AOA" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjU=",
          node: { id: "ARS", name: "Argentine Peso", code: "ARS" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjY=",
          node: { id: "AUD", name: "Australian Dollar", code: "AUD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjc=",
          node: { id: "AWG", name: "Aruban Florin", code: "AWG" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjg=",
          node: { id: "AZN", name: "Azerbaijan Manat", code: "AZN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjk=",
          node: { id: "BAM", name: "Convertible Mark", code: "BAM" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEw",
          node: { id: "BBD", name: "Barbados Dollar", code: "BBD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEx",
          node: { id: "BDT", name: "Taka", code: "BDT" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEy",
          node: { id: "BGN", name: "Bulgarian Lev", code: "BGN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEz",
          node: { id: "BHD", name: "Bahraini Dinar", code: "BHD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0",
          node: { id: "BIF", name: "Burundi Franc", code: "BIF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1",
          node: { id: "BMD", name: "Bermudian Dollar", code: "BMD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2",
          node: { id: "BND", name: "Brunei Dollar", code: "BND" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE3",
          node: { id: "BOB", name: "Boliviano", code: "BOB" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE4",
          node: { id: "BOV", name: "Mvdol", code: "BOV" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE5",
          node: { id: "BRL", name: "Brazilian Real", code: "BRL" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjIw",
          node: { id: "BSD", name: "Bahamian Dollar", code: "BSD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjIx",
          node: { id: "BWP", name: "Pula", code: "BWP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjIy",
          node: { id: "BYN", name: "Belarusian Ruble", code: "BYN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjIz",
          node: { id: "BZD", name: "Belize Dollar", code: "BZD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjI0",
          node: { id: "CAD", name: "Canadian Dollar", code: "CAD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjI1",
          node: { id: "CDF", name: "Congolese Franc", code: "CDF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjI2",
          node: { id: "CHE", name: "WIR Euro", code: "CHE" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjI3",
          node: { id: "CHF", name: "Swiss Franc", code: "CHF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjI4",
          node: { id: "CHW", name: "WIR Franc", code: "CHW" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjI5",
          node: { id: "CLF", name: "Unidad de Fomento", code: "CLF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjMw",
          node: { id: "CLP", name: "Chilean Peso", code: "CLP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjMx",
          node: { id: "CNY", name: "Yuan Renminbi", code: "CNY" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjMy",
          node: { id: "COP", name: "Colombian Peso", code: "COP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjMz",
          node: { id: "COU", name: "Unidad de Valor Real", code: "COU" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjM0",
          node: { id: "CRC", name: "Costa Rican Colon", code: "CRC" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjM1",
          node: { id: "CUC", name: "Peso Convertible", code: "CUC" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjM2",
          node: { id: "CVE", name: "Cabo Verde Escudo", code: "CVE" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjM3",
          node: { id: "CZK", name: "Czech Koruna", code: "CZK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjM4",
          node: { id: "DJF", name: "Djibouti Franc", code: "DJF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjM5",
          node: { id: "DKK", name: "Danish Krone", code: "DKK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQw",
          node: { id: "DOP", name: "Dominican Peso", code: "DOP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQx",
          node: { id: "DZD", name: "Algerian Dinar", code: "DZD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQy",
          node: { id: "EGP", name: "Egyptian Pound", code: "EGP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQz",
          node: { id: "ERN", name: "Nakfa", code: "ERN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQ0",
          node: { id: "ETB", name: "Ethiopian Birr", code: "ETB" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQ1",
          node: { id: "EUR", name: "Euro", code: "EUR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQ2",
          node: { id: "FJD", name: "Fiji Dollar", code: "FJD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQ3",
          node: { id: "FKP", name: "Falkland Islands Pound", code: "FKP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQ4",
          node: { id: "GBP", name: "Pound Sterling", code: "GBP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjQ5",
          node: { id: "GEL", name: "Lari", code: "GEL" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjUw",
          node: { id: "GHS", name: "Ghana Cedi", code: "GHS" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjUx",
          node: { id: "GIP", name: "Gibraltar Pound", code: "GIP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjUy",
          node: { id: "GMD", name: "Dalasi", code: "GMD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjUz",
          node: { id: "GNF", name: "Guinean Franc", code: "GNF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjU0",
          node: { id: "GTQ", name: "Quetzal", code: "GTQ" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjU1",
          node: { id: "GYD", name: "Guyana Dollar", code: "GYD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjU2",
          node: { id: "HKD", name: "Hong Kong Dollar", code: "HKD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjU3",
          node: { id: "HNL", name: "Lempira", code: "HNL" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjU4",
          node: { id: "HRK", name: "Kuna", code: "HRK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjU5",
          node: { id: "HTG", name: "Gourde", code: "HTG" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjYw",
          node: { id: "HUF", name: "Forint", code: "HUF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjYx",
          node: { id: "IDR", name: "Rupiah", code: "IDR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjYy",
          node: { id: "ILS", name: "New Israeli Sheqel", code: "ILS" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjYz",
          node: { id: "INR", name: "Indian Rupee", code: "INR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjY0",
          node: { id: "IQD", name: "Iraqi Dinar", code: "IQD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjY1",
          node: { id: "ISK", name: "Iceland Krona", code: "ISK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjY2",
          node: { id: "JMD", name: "Jamaican Dollar", code: "JMD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjY3",
          node: { id: "JOD", name: "Jordanian Dinar", code: "JOD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjY4",
          node: { id: "JPY", name: "Yen", code: "JPY" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjY5",
          node: { id: "KES", name: "Kenyan Shilling", code: "KES" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjcw",
          node: { id: "KGS", name: "Som", code: "KGS" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjcx",
          node: { id: "KHR", name: "Riel", code: "KHR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjcy",
          node: { id: "KMF", name: "Comorian Franc", code: "KMF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjcz",
          node: { id: "KRW", name: "Won", code: "KRW" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjc0",
          node: { id: "KWD", name: "Kuwaiti Dinar", code: "KWD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjc1",
          node: { id: "KYD", name: "Cayman Islands Dollar", code: "KYD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjc2",
          node: { id: "KZT", name: "Tenge", code: "KZT" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjc3",
          node: { id: "LAK", name: "Lao Kip", code: "LAK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjc4",
          node: { id: "LBP", name: "Lebanese Pound", code: "LBP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjc5",
          node: { id: "LKR", name: "Sri Lanka Rupee", code: "LKR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjgw",
          node: { id: "LRD", name: "Liberian Dollar", code: "LRD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjgx",
          node: { id: "LSL", name: "Loti", code: "LSL" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjgy",
          node: { id: "MAD", name: "Moroccan Dirham", code: "MAD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjgz",
          node: { id: "MDL", name: "Moldovan Leu", code: "MDL" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjg0",
          node: { id: "MGA", name: "Malagasy Ariary", code: "MGA" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjg1",
          node: { id: "MKD", name: "Denar", code: "MKD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjg2",
          node: { id: "MMK", name: "Kyat", code: "MMK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjg3",
          node: { id: "MNT", name: "Tugrik", code: "MNT" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjg4",
          node: { id: "MOP", name: "Pataca", code: "MOP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjg5",
          node: { id: "MUR", name: "Mauritius Rupee", code: "MUR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjkw",
          node: { id: "MVR", name: "Rufiyaa", code: "MVR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjkx",
          node: { id: "MWK", name: "Malawi Kwacha", code: "MWK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjky",
          node: { id: "MXN", name: "Mexican Peso", code: "MXN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjkz",
          node: {
            id: "MXV",
            name: "Mexican Unidad de Inversion (UDI)",
            code: "MXV",
          },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjk0",
          node: { id: "MYR", name: "Malaysian Ringgit", code: "MYR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjk1",
          node: { id: "MZN", name: "Mozambique Metical", code: "MZN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjk2",
          node: { id: "NAD", name: "Namibia Dollar", code: "NAD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjk3",
          node: { id: "NGN", name: "Naira", code: "NGN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjk4",
          node: { id: "NIO", name: "Cordoba Oro", code: "NIO" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjk5",
          node: { id: "NOK", name: "Norwegian Krone", code: "NOK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwMA==",
          node: { id: "NPR", name: "Nepalese Rupee", code: "NPR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwMQ==",
          node: { id: "NZD", name: "New Zealand Dollar", code: "NZD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwMg==",
          node: { id: "OMR", name: "Rial Omani", code: "OMR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwMw==",
          node: { id: "PAB", name: "Balboa", code: "PAB" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwNA==",
          node: { id: "PEN", name: "Sol", code: "PEN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwNQ==",
          node: { id: "PGK", name: "Kina", code: "PGK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwNg==",
          node: { id: "PHP", name: "Philippine Peso", code: "PHP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwNw==",
          node: { id: "PKR", name: "Pakistan Rupee", code: "PKR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwOA==",
          node: { id: "PLN", name: "Zloty", code: "PLN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEwOQ==",
          node: { id: "PYG", name: "Guarani", code: "PYG" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExMA==",
          node: { id: "QAR", name: "Qatari Rial", code: "QAR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExMQ==",
          node: { id: "RON", name: "Romanian Leu", code: "RON" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExMg==",
          node: { id: "RSD", name: "Serbian Dinar", code: "RSD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExMw==",
          node: { id: "RUB", name: "Russian Ruble", code: "RUB" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExNA==",
          node: { id: "RWF", name: "Rwanda Franc", code: "RWF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExNQ==",
          node: { id: "SAR", name: "Saudi Riyal", code: "SAR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExNg==",
          node: { id: "SBD", name: "Solomon Islands Dollar", code: "SBD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExNw==",
          node: { id: "SCR", name: "Seychelles Rupee", code: "SCR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExOA==",
          node: { id: "SEK", name: "Swedish Krona", code: "SEK" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjExOQ==",
          node: { id: "SGD", name: "Singapore Dollar", code: "SGD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyMA==",
          node: { id: "SHP", name: "Saint Helena Pound", code: "SHP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyMQ==",
          node: { id: "SLL", name: "Leone", code: "SLL" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyMg==",
          node: { id: "SOS", name: "Somali Shilling", code: "SOS" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyMw==",
          node: { id: "SRD", name: "Surinam Dollar", code: "SRD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyNA==",
          node: { id: "SSP", name: "South Sudanese Pound", code: "SSP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyNQ==",
          node: { id: "SYP", name: "Syrian Pound", code: "SYP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyNg==",
          node: { id: "SZL", name: "Lilangeni", code: "SZL" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyNw==",
          node: { id: "THB", name: "Baht", code: "THB" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyOA==",
          node: { id: "TJS", name: "Somoni", code: "TJS" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEyOQ==",
          node: { id: "TND", name: "Tunisian Dinar", code: "TND" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzMA==",
          node: { id: "TOP", name: "Pa\u2019anga", code: "TOP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzMQ==",
          node: { id: "TRY", name: "Turkish Lira", code: "TRY" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzMg==",
          node: { id: "TTD", name: "Trinidad and Tobago Dollar", code: "TTD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzMw==",
          node: { id: "TWD", name: "New Taiwan Dollar", code: "TWD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzNA==",
          node: { id: "TZS", name: "Tanzanian Shilling", code: "TZS" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzNQ==",
          node: { id: "UAH", name: "Hryvnia", code: "UAH" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzNg==",
          node: { id: "UGX", name: "Uganda Shilling", code: "UGX" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzNw==",
          node: { id: "USD", name: "US Dollar", code: "USD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzOA==",
          node: { id: "USN", name: "US Dollar (Next Day)", code: "USN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjEzOQ==",
          node: {
            id: "UYI",
            name: "Uruguay Peso en Unidades Indexadas (UI)",
            code: "UYI",
          },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0MA==",
          node: { id: "UYU", name: "Peso Uruguayo", code: "UYU" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0MQ==",
          node: { id: "UYW", name: "Unidad Previsional", code: "UYW" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0Mg==",
          node: { id: "UZS", name: "Uzbekistan Sum", code: "UZS" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0Mw==",
          node: { id: "VES", name: "Bol\u00edvar Soberano", code: "VES" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0NA==",
          node: { id: "VND", name: "Dong", code: "VND" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0NQ==",
          node: { id: "VUV", name: "Vatu", code: "VUV" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0Ng==",
          node: { id: "WST", name: "Tala", code: "WST" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0Nw==",
          node: { id: "XAF", name: "CFA Franc BEAC", code: "XAF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0OA==",
          node: { id: "XCD", name: "East Caribbean Dollar", code: "XCD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE0OQ==",
          node: { id: "XDR", name: "SDR (Special Drawing Right)", code: "XDR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1MA==",
          node: {
            id: "XOF",
            name: "CFA Franc BCEAO (West African CFA Franc)",
            code: "XOF",
          },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1MQ==",
          node: { id: "XPF", name: "CFP Franc", code: "XPF" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1Mg==",
          node: { id: "XSU", name: "Sucre", code: "XSU" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1Mw==",
          node: { id: "XUA", name: "ADB Unit of Account", code: "XUA" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1NA==",
          node: { id: "YER", name: "Yemeni Rial", code: "YER" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1NQ==",
          node: { id: "ZAR", name: "Rand", code: "ZAR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1Ng==",
          node: { id: "ZMW", name: "Zambian Kwacha", code: "ZMW" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1Nw==",
          node: { id: "ALL", name: "Lek", code: "ALL" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1OA==",
          node: { id: "BTN", name: "Ngultrum", code: "BTN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE1OQ==",
          node: { id: "CUP", name: "Cuban Peso", code: "CUP" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2MA==",
          node: { id: "SVC", name: "El Salvador Colon", code: "SVC" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2MQ==",
          node: { id: "IRR", name: "Iranian Rial", code: "IRR" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2Mg==",
          node: { id: "KPW", name: "North Korean Won", code: "KPW" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2Mw==",
          node: { id: "LYD", name: "Libyan Dinar", code: "LYD" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2NA==",
          node: { id: "MRU", name: "Ouguiya", code: "MRU" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2NQ==",
          node: { id: "STN", name: "Dobra", code: "STN" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2Ng==",
          node: { id: "SDG", name: "Sudanese Pound", code: "SDG" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2Nw==",
          node: { id: "TMT", name: "Turkmenistan New Manat", code: "TMT" },
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE2OA==",
          node: { id: "ZWL", name: "Zimbabwe Dollar", code: "ZWL" },
        },
      ],
    },
  },
};

/*
 * Record Hooks
 */

const compositeUniquenessCheck = (record: FlatfileRecord): FlatfileRecord => {
  return pipe(
    Ap.sequenceS(E.Apply)({
      cusip: t.string.decode(record.get("cusip")),
      name: t.string.decode(record.get("name")),
    }),
    E.match(
      () => record,
      ({ cusip, name }) => {
        record.set("combo_cusip_name", Str.Monoid.concat(cusip, name));

        return record;
      },
    ),
  );
};

/*
 * Main
 */

const AssetClasses = new FF.Sheet(
  "Asset Classes (Ridgeline)",
  {
    ridgeline_id: FF.TextField({
      label: "Ridgeline Identifier",
      description: "Some description",
      compute: (value) => pipe(value, Str.trim),
    }),
    reference_id: FF.TextField({
      label: "Reference Identifier",
      description: "Some description",
      unique: true,
      primary: true,
      compute: (value) => pipe(value, Str.trim),
    }),
    record_number: FF.NumberField({
      label: "Record Number",
      description: "Some description",
      required: true,
    }),
    id: FF.TextField({
      label: "Id",
      description: "Some description",
      required: true,
      compute: (value) => pipe(value, Str.trim),
    }),
    name: FF.TextField({
      label: "Name",
      description: "Some description",
      required: true,
    }),
  },
  {
    allowCustomFields: false,
    readOnly: true,
    previewFieldKey: "name",
    recordCompute: (_record, _logger) => {},
    batchRecordsCompute: async (_payload) => {},
  },
);

const Securities = new FF.Sheet(
  "Securities (Ridgeline)",
  {
    asset_class_id: FF.LinkedField({
      label: "Asset Class",
      sheet: AssetClasses,
    }),
    asset_type: FF.OptionField({
      label: "Asset Type",
      description: "Some description",
      options: {
        caus: "CAUS",
        clus: "CLUS",
        csus: "CSUS",
        mbus: "MBUS",
      },
    }),
    ticker: FF.TextField({
      label: "Ticker",
      description: "Some description",
      compute: (value) => pipe(value, Str.trim, Str.toUpperCase),
    }),
    cusip: FF.TextField({
      label: "CUSIP",
      description: "Some description",
    }),
    name: FF.TextField({
      label: "Name",
      description: "Some description",
    }),
    combo_cusip_name: FF.TextField({
      label: "CUSIP + Name",
      description: "Some description",
      unique: true,
      stageVisibility: {
        mapping: true,
        review: false,
        export: false,
      },
    }),
    issuer: FF.TextField({
      label: "Issuer",
      description: "Some description",
    }),
    industry1: FF.TextField({
      label: "Industry 1",
      description: "Some description",
    }),
    sector1: FF.TextField({
      label: "Sector 1",
      description: "Some description",
    }),
    industry2: FF.TextField({
      label: "Industry2",
      description: "Some description",
    }),
    sector2: FF.TextField({
      label: "Sector 2",
      description: "Some description",
    }),
    // this needs to be dynamic BUT we can't support that
    local_currency: FF.OptionField({
      label: "Local Currency",
      description: "Some description",
      options: pipe(
        apiResponse.data.currencies.edges,
        RA.map(({ node }) => ({
          id: Str.toLowerCase(node.id),
          code: node.code,
        })),
        (cs) =>
          RR.fromFoldableMap(last<string>(), RA.Foldable)(cs, (c) => [
            c.id,
            c.code,
          ]),
      ),
    }),
    sedol: FF.TextField({
      label: "Sedol",
      description: "Some description",
    }),
    isin: FF.TextField({
      label: "ISIN",
      description: "Some description",
    }),
    effective_date: FF.TextField({
      label: "Effective Date",
      description: "Some description",
      compute: (value) => {
        try {
          return datefns.format(new Date(value), "yyyy-MM-dd");
        } catch (err) {
          return value;
        }
      },
    }),
  },
  {
    allowCustomFields: false,
    readOnly: true,
    recordCompute: (record, _logger) => {
      return fold(compositeUniquenessCheck)(record);
    },
    batchRecordsCompute: async (_payload) => {},
  },
);

const workbook = new FF.Workbook({
  name: "Workbook - Ridgeline Demo",
  namespace: "Ridgeline",
  sheets: {
    Securities,
    AssetClasses,
  },
});

export default workbook;
