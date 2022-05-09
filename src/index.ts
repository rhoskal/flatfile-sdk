/*
 * Types
 */

type Nil = null | undefined;

type Nullable<A> = A | null;

type Primitive = string | boolean | number | Date | null;

type RecordData<T extends Primitive | undefined = Primitive> = {
  [key: string]: T;
};

type LoggerLevel = "error" | "warn" | "info";

interface Logger {
  level: LoggerLevel;
  error(thing: any): void;
  info(thing: any): void;
  warn(thing: any): void;
}

interface FlatfileRecord {
  value: RecordData;
  set(field: string, value: Primitive): this;
  get(field: string): Nullable<Primitive>;
  addComment(fields: string | Array<string>, message: string): this;
  addError(fields: string | Array<string>, message: string): this;
  addWarning(fields: string | Array<string>, message: string): this;
}

interface RecordBatch {
  records: Array<FlatfileRecord>;
}

/*
 * Guards
 */

export const isNull = (x: unknown): x is null => x === null;

export const isUndefined = (x: unknown): x is undefined => x === undefined;

export const isNil = (x: unknown): x is Nil => isNull(x) || isUndefined(x);

export const isNotNil = <T>(x: T | Nil): x is T => !isNil(x);

/*
 * Main
 */

export default async ({
  recordBatch,
  _session,
  logger,
}: {
  recordBatch: RecordBatch;
  _session: unknown;
  logger: Logger;
}) => {
  return recordBatch.records.map((record) => {
    logger.info(record);
    const email = record.value["email"];
    logger.info(email);
    const phone = record.value["phone"];

    if (isNil(email) && isNil(phone)) {
      record
        .addWarning("email", "Must have either phone or email")
        .addWarning("phone", "Must have either phone or email");
    }
  });
};
