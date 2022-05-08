import Schema, {
  string,
  array,
  boolean,
} from "https://denoporter.sirjosh.workers.dev/v1/deno.land/x/computed_types/src/index.ts";

const taskCreateSchema = Schema({
  title: string.test(noBlank),
  tags: array.of(string.test(noBlank)),
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
  return s.trim().length > 0 ? "no blank" : undefined;
}
