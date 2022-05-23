import Schema, { array, string } from "computed_types";
import { RegexUtils } from "../../utils/regex-utils.ts";
import { Permission } from "./permissions.ts";

const userCreateSchema = Schema({
  username: string.test(noBlank),
  email: string.test(testEmail),
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

const childUserCreateSchema = Schema({
  username: string.test(noBlank),
  password: string.test(noBlank).min(3),
  email: string.test(testEmail),
  permissions: array.of(Schema.enum(Permission)).optional(),
});

export const childUserCreateValidator = childUserCreateSchema.destruct();

const childUserSetPasswordSchema = Schema({
  childId: string.test(noBlank),
  newPassword: string.test(noBlank).min(3),
});

export const childUserSetPasswordValidator =
  childUserSetPasswordSchema.destruct();

const childUserUpdateSchema = Schema({
  childId: string.optional(),
  username: string.optional(),
  permissions: array.of(Schema.enum(Permission)).optional(),
});

export const childUserUpdateValidator = childUserUpdateSchema.destruct();

function noBlank(s: string) {
  if (s.trim().length === 0) {
    throw new Error("Cannot be blank or empty");
  }
  
  return s;
}

function testEmail(s: string) {
  if (!RegexUtils.isValidEmail(s)) {
    throw new Error(`Invalid email: ${s}`);
  }

  return s;
}
