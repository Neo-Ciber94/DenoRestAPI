import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

export class PasswordHasherService {
  hash(passwordText: string): Promise<string> {
    return bcrypt.hash(passwordText);
  }

  verity(passwordText: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(passwordText, passwordHash);
  }
}
