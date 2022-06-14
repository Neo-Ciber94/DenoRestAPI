import { ensureDir } from "std/fs";
import * as path from "std/path";

export interface BundleOptions {
  outdir?: string;
  filename?: string;
}

export async function bundle(
  src: string,
  options?: BundleOptions
): Promise<string> {
  const outdir = options?.outdir ?? path.join(Deno.cwd(), "tmp");
  await ensureDir(outdir);

  let filepath: string;

  if (options?.filename) {
    filepath = path.join(outdir, options.filename);
    await Deno.create(filepath);
  } else {
    filepath = await Deno.makeTempFile({
      dir: outdir,
      suffix: ".ts",
    });
  }

  await Deno.writeTextFile(filepath, src);
  console.log(filepath);

  // const filename = path
  //   .basename(filepath)
  //   .slice(0, path.extname(filepath).length);

  try {
    const process = Deno.run({
      cmd: [`deno`, `bundle`, `${filepath}`],
      stdout: "piped",
    });

    const output = await process.output();
    const decoder = new TextDecoder("utf-8");
    const result = decoder.decode(output);
    return result;
  } finally {
    await Deno.remove(filepath);
  }
}
