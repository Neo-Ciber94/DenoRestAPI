import { assert, assertFalse } from "std/assert";
import { PasswordHasher } from "../../src/services/password-hasher.service.ts";

Deno.test("Password Hasher :: hash and verify", async () => {
  const hasher = new PasswordHasher();
  const password = "123456";
  const hash = await hasher.hash(password);

  assert(await hasher.verify(password, hash));
  assertFalse(await hasher.verify("1234567", hash));
});
