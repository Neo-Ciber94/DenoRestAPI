import { dirname } from "std/path";

export namespace FileUtils {
  export function createDirIfDontExist(path: string): boolean {
    try {
      Deno.statSync(path);
      return false;
    } catch {
      const dir = dirname(path);
      Deno.mkdirSync(dir, {
        recursive: true,
      });
      return true;
    }
  }
}
