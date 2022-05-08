import Schema, {
  string,
  array,
  boolean,
} from "https://denoporter.sirjosh.workers.dev/v1/deno.land/x/computed_types/src/index.ts";

const userCreateSchema = Schema({
  username: string.test(noBlank),
  password: string.test(noBlank).min(3),
});

export const userCreateValidator = userCreateSchema.destruct();

const userLoginSchema = Schema({
  username: string.test(noBlank),
  password: string.test(noBlank),
});

export const userLoginValidator = userLoginSchema.destruct();

const userChangePasswordSchema = Schema({
  oldPassword: string.test(noBlank),
  newPassword: string.test(noBlank),
});

export const userChangePasswordValidator = userChangePasswordSchema.destruct();

function noBlank(s: string) {
  return s.trim().length > 0 ? "no blank" : undefined;
}
