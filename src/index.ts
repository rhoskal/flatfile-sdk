import * as FF from "@flatfile/configure";
import * as Ap from "fp-ts/Apply";
import * as O from "fp-ts/Option";
import * as RR from "fp-ts/ReadonlyRecord";
import { pipe } from "fp-ts/function";

import * as G from "./typeGuards";

/*
 * Main
 */

const random_id: string = `${Math.floor(Date.now() / 1000)}`;

const sheet_leads = new FF.Sheet(
  "Leads",
  {
    first_name: FF.TextField("First Name", {
      description: "First name goes here",
      empty: () => "how to add warning????",
    }),
    last_name: FF.TextField("Last Name", {
      description: "Last name goes here",
      required: true,
      empty: () => "",
    }),
    email: FF.EmailField("Email Address", {
      description: "Email address goes here",
      unique: true,
      // () => {} // how to custom error when field is not unique?
    }),
    // how to create hidden field from mapping?
    // phone: FF.PhoneField("Phone Number", {
    //   description: "Phone number goes here",
    // }),
    date: FF.TextField("Date", {
      description: "Date goes here",
    }),
    country: FF.TextField("Country", {
      description: "Country goes here",
    }),
    postal_code: FF.TextField("Postal Code", {
      description: "Postal code goes here",
    }),
    opt_in: FF.BooleanField("Opt In", {
      description: "Opt in goes here",
    }),
    deal_status: FF.CategoryField("Deal Status", {
      description: "Deal status goes here",
      categories: {
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
    onChange: (record, _session, logger) => {
      logger.info(record);

      return pipe(
        Ap.sequenceT(O.Apply)(
          RR.lookup("email")(record.value),
          RR.lookup("phone")(record.value),
        ),
        O.match(
          () => {
            return record;
          },
          ([email, phone]) => {
            if (G.isNil(email) && G.isNil(phone)) {
              record.addWarning(
                ["email", "phone"],
                "Must have either phone or email",
              );
            }

            return record;
          },
        ),
      );
    },
    readOnly: true,
  },
);

const workbook = new FF.Workbook({
  name: `Workbook-${random_id}`,
  namespace: `Workbook-namespace-${random_id}`,
  sheets: {
    sheet_leads,
  },
});

export default workbook;
