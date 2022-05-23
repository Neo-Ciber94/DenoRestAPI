import Schema, { array, boolean, string } from "computed_types";

const taskCreateSchema = Schema({
  title: string.test(noBlank),
  tags: array.of(string.test(noBlank)).optional(),
});

export const taskCreateValidator = taskCreateSchema.destruct();

const taskUpdateSchema = Schema({
  id: string,
  title: string.test(noBlank).optional(),
  tags: array.of(string.test(noBlank)).optional(),
  completed: boolean.optional(),
});

export const taskUpdateValidator = taskUpdateSchema.destruct();

function noBlank(s: string) {
  if (s.trim().length === 0) {
    throw new Error("Cannot be blank or empty");
  }

  return s;
}
