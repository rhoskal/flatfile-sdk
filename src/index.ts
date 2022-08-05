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

const Leads = new FF.Sheet(
  "Leads",
  {
    first_name: FF.TextField({
      label: "First Name",
      description: "Lead's first name.",
    }),
    last_name: FF.TextField({
      lable: "Last Name",
      description: "Lead's last name.",
      required: true,
    }),
    email: FF.TextField({
      label: "Email Address",
      description: "Lead's email.",
      unique: true,
    }),
    phone: FF.TextField({
      label: "Phone Number",
      description: "Lead's phone.",
    }),
    date: FF.DateField({
      label: "Date",
      description: "Date goes here",
    }),
    country: FF.TextField({
      label: "Country",
      description: "Country goes here",
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
    onChange: (record, _session, logger) => {
      logger.info(record);

      return pipe(
        Ap.sequenceT(O.Apply)(
          RR.lookup("email")(record.value),
          RR.lookup("phone")(record.value),
        ),
        O.match(
          () => record,
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
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (_record) => { },
    // batchRecordsCompute: async (payload: FlatfileRecords<any>) => { }
  },
);

const workbook = new FF.Workbook({
  name: `Workbook-${random_id}`,
  namespace: `Workbook-namespace-${random_id}`,
  sheets: {
    Leads,
  },
});

export default workbook;
