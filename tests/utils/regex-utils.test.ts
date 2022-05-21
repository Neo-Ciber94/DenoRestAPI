import { assert, assertFalse } from "std/assert";
import { RegexUtils } from "../../src/utils/regex-utils.ts";

Deno.test("RegexUtils :: isValidEmail", () => {
  assert(RegexUtils.isValidEmail("example@example.com"));
  assert(RegexUtils.isValidEmail("example@gmail.com"));
  assert(RegexUtils.isValidEmail("example@hotmail.com"));
  assert(RegexUtils.isValidEmail("example@yahoo.com"));
  assert(RegexUtils.isValidEmail("example@dufeed.com"));

  assertFalse(RegexUtils.isValidEmail("example"));
  assertFalse(RegexUtils.isValidEmail("example@example"));
});
