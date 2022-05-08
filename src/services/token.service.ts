import {
  create,
  Payload,
  Header,
  verify,
  getNumericDate,
} from "https://deno.land/x/djwt@v2.2/mod.ts";

export interface GenerateTokenConfig<T> {
  secret: string;
  expiresMs: number;
  payload: T;
}

const ALGORITHM = "HS256";

export class TokenService<T> {
  generate(config: GenerateTokenConfig<T>): Promise<string> {
    const header: Header = { alg: ALGORITHM };
    const payload: Payload = { 
      exp: getNumericDate(config.expiresMs), 
      ...config.payload 
    };
    return create(header, payload, config.secret);
  }

  async verify(token: string, secret: string): Promise<T | undefined> {
    try {
      const result = await verify(token, secret, ALGORITHM);
      return result as unknown as T;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}
