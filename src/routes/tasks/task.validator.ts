import Schema, {
  string,
  array,
  boolean,
} from "https://denoporter.sirjosh.workers.dev/v1/deno.land/x/computed_types/src/index.ts";

const taskCreateSchema = Schema({
  title: string,
  tags: array.of(string),
});

export const taskCreateValidator = taskCreateSchema.destruct();

const taskUpdateSchema = Schema({
  id: string,
  title: string.optional(),
  tags: array.of(string).optional(),
  completed: boolean.optional(),
});

export const taskUpdateValidator = taskUpdateSchema.destruct();
