import { create, getNumericDate, Header, Payload, verify } from "djwt";

export interface GenerateTokenConfig<T> {
  secret: string;
  expiresMs: number;
  payload: T;
}

const ALGORITHM = "HS256";

export class TokenService<T> {
  async generate(config: GenerateTokenConfig<T>): Promise<string> {
    const header: Header = { alg: ALGORITHM };
    const payload: Payload = {
      exp: getNumericDate(config.expiresMs),
      ...config.payload,
    };

    const key = await this.getCryptoKey(config.secret);
    return create(header, payload, key);
  }

  async verify(token: string, secret: string): Promise<T | undefined> {
    try {
      const key = await this.getCryptoKey(secret);
      const result = await verify(token, key);
      return result as unknown as T;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  private getCryptoKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyBuf = encoder.encode(secret);
    return crypto.subtle.importKey(
      "raw",
      keyBuf,
      { name: "HMAC", hash: "SHA-256" },
      true,
      ["sign", "verify"]
    );
  }
}
