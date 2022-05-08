import * as bcrypt from "bcrypt";

export class PasswordHasher {
  hash(passwordText: string): Promise<string> {
    return bcrypt.hash(passwordText);
  }

  verity(passwordText: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(passwordText, passwordHash);
  }
}
