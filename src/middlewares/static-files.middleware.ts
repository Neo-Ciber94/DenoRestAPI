import { Middleware, Router } from "oak";

export interface StaticFilesOptions {
  root: string;
  prefix?: string;
}

export default function staticFiles(options: StaticFilesOptions): Middleware {
  return async (ctx, next) => {
    const pathname = ctx.request.url.pathname;

    if (options.prefix && !pathname.startsWith(options.prefix)) {
      await next();
      return;
    }

    const filePath = pathname.substring(options.prefix?.length ?? 0);

    await ctx.send({
      root: options.root,
      path: filePath,
    });
  };
}
