export type JsonValue =
  | string
  | number
  | boolean
  | { [key: string]: JsonValue }
  | Array<JsonValue>;
