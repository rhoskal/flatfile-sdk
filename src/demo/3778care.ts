import * as FF from "@flatfile/configure";
import { FlatfileRecord } from "@flatfile/hooks";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";
import { Lazy, pipe } from "fp-ts/function";
import * as Str from "fp-ts/string";
import * as datefns from "date-fns";

import * as G from "../typeGuards";
import { fold, runValidations, ValidationResult } from "../utils";

/*
 * Field Validations
 */

const validateMaxLength =
  (len: number) =>
  (value: string): Lazy<ValidationResult<string>> =>
  () => {
    return value.length <= len
      ? E.right(value)
      : E.left([
          new FF.Message(
            `Cannot be more than ${len} characters.`,
            "error",
            "validate",
          ),
        ]);
  };

/*
 * Record Hooks
 */

const checkForOneOrTheOther =
  (
    field1: { key: string; label: string },
    field2: { key: string; label: string },
  ) =>
  (record: FlatfileRecord): FlatfileRecord => {
    const value1 = record.get(field1.key);
    const value2 = record.get(field2.key);

    if (G.isNil(value1) && G.isNil(value2)) {
      record.addError(
        [field1.key, field2.key],
        `Must provide one of: ${field1.label} or ${field2.label}.`,
      );
    }

    return record;
  };

/*
 * Helpers
 */

const removeSymbols = (value: string): string => {
  return Str.replace(/[*;/{}\[\]"_#'^><|]/g, "")(value);
};

const removeExtraSpaces = (value: string): string => {
  return Str.replace(/\s{2,}/g, " ")(value);
};

const toUpperCase = (value: string): string => {
  return Str.toUpperCase(value);
};

const trim = (value: string): string => {
  return Str.trim(value);
};

const replaceLanguageChars = (value: string): string => {
  return pipe(
    Str.split("")(value),
    RA.map((char) => {
      return Str.Eq.equals(Str.toLowerCase(char), "ç") ? "c" : char;
    }),
    (chars) => chars.join(""),
  );
};

const formatDate =
  (format: string) =>
  (value: string): string => {
    try {
      return datefns.format(new Date(value), format);
    } catch (err) {
      return value;
    }
  };

/*
 * Main
 */

const PeopleSheet = new FF.Sheet(
  "People (3778.care)",
  {
    unit_code: FF.TextField({
      label: "Código da unidade",
      description: "Unit Code",
      compute: (value) => {
        return pipe(
          value,
          trim,
          removeSymbols,
          removeExtraSpaces,
          replaceLanguageChars,
          toUpperCase,
        );
      },
    }),
    unit_name: FF.TextField({
      label: "Nome da unidade",
      description: "Unit Name",
      compute: (value) => {
        return pipe(
          value,
          trim,
          removeSymbols,
          removeExtraSpaces,
          replaceLanguageChars,
          toUpperCase,
        );
      },
    }),
    function_code: FF.TextField({
      label: "Código de função",
      description: "Function Code",
      compute: (value) => {
        return pipe(
          value,
          trim,
          removeSymbols,
          removeExtraSpaces,
          replaceLanguageChars,
          toUpperCase,
        );
      },
    }),
    job_name: FF.TextField({
      label: "Nome do trabalho",
      description: "Job Name",
      compute: (value) => {
        return pipe(
          value,
          trim,
          removeSymbols,
          removeExtraSpaces,
          replaceLanguageChars,
          toUpperCase,
        );
      },
    }),
    department_code: FF.TextField({
      label: "Código do departamento",
      description: "Department Code",
      compute: (value) => {
        return pipe(
          value,
          trim,
          removeSymbols,
          removeExtraSpaces,
          replaceLanguageChars,
          toUpperCase,
        );
      },
    }),
    department_name: FF.TextField({
      label: "Nome do departamento",
      description: "Department Name",
      compute: (value) => {
        return pipe(
          value,
          trim,
          removeSymbols,
          removeExtraSpaces,
          replaceLanguageChars,
          toUpperCase,
        );
      },
    }),
    employee_code: FF.TextField({
      label: "Código de empregado",
      description: "Employee Code",
      required: true,
      compute: (value) => {
        return pipe(
          value,
          trim,
          removeSymbols,
          removeExtraSpaces,
          replaceLanguageChars,
          toUpperCase,
        );
      },
    }),
    employee_name: FF.TextField({
      label: "Nome do empregado",
      description: "Employee Name",
      required: true,
      compute: (value) => {
        return pipe(
          value,
          trim,
          removeSymbols,
          removeExtraSpaces,
          replaceLanguageChars,
          toUpperCase,
        );
      },
      validate: (value) => {
        // actual is 999, but that's hard to demo
        const ensureMaxLength = validateMaxLength(10)(value);

        return runValidations(ensureMaxLength());
      },
    }),
    gender: FF.OptionField({
      label: "Gênero",
      description: "Gender",
      required: true,
      options: {
        F: "Female",
        M: "Male",
      },
    }),
    dob: FF.TextField({
      label: "Data de nascimento",
      description: "Date of Birth",
      required: true,
      compute: formatDate("dd/MM/yyyy"),
    }),
    admission_date: FF.TextField({
      label: "Data de admissão",
      description: "Admission Date",
      required: true,
      compute: formatDate("dd/MM/yyyy"),
    }),
    status: FF.OptionField({
      label: "Situação",
      description: "Status",
      required: true,
      options: {
        // A for Away
        // F for vacation
        // N for Inactive
        // P for Pending
        // Y for Asset
        A: "Afastado",
        F: "Férias",
        N: "Inativo",
        P: "Pendente",
        Y: "Ativo",
      },
    }),
    blood_type: FF.OptionField({
      label: "Tipo Sanguíneo",
      description: "Blood Type",
      options: {
        NONE: "NONE",
        "A+": "A+",
        "B+": "B+",
        "B-": "B-",
        "AB+": "AB+",
        "AB-": "AB-",
        "O+": "O+",
        "THE-": "THE-",
      },
    }),
    disregard_esocial: FF.BooleanField({
      label: "Desconsiderar para o eSocial",
      description: "Disregard for eSocial",
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record, _session, _logger) => {
      return fold(
        checkForOneOrTheOther(
          { key: "unit_code", label: "Código da unidade" },
          { key: "unit_name", label: "Nome da unidade" },
        ),
        checkForOneOrTheOther(
          { key: "function_code", label: "Código de função" },
          { key: "job_name", label: "Nome do trabalho" },
        ),
        checkForOneOrTheOther(
          { key: "department_code", label: "Código do departamento" },
          { key: "department_name", label: "Nome do departamento" },
        ),
        checkForOneOrTheOther(
          { key: "employee_code", label: "Código de empregado" },
          { key: "employee_name", label: "Nome do empregado" },
        ),
      )(record);
    },
    batchRecordsCompute: async (_payload, _session, _logger) => {},
  },
);

const XPortal = new FF.Portal({
  name: "People (3778.care)",
  helpContent: "",
  sheet: "PeopleSheet",
});

const workbook = new FF.Workbook({
  name: "Workbook - 3778.care Demo",
  namespace: "3778.care",
  portals: [XPortal],
  sheets: {
    PeopleSheet,
  },
});

export default workbook;
