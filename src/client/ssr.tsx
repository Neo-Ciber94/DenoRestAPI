import { Application, Router } from "oak";
import * as path from "std/path";
import * as fs from "std/fs";
import * as Nano from "nano_jsx";
import { h } from "nano_jsx";
const { Helmet } = Nano;

interface ViewRoute {
  route: string;
  parent?: string;
  filePath: string;
}

type RoutePath = {
  parent?: string;
  route: string;
};

export interface ServerSideRoutesOptions {
  viewsPath?: string;
  prefix?: string;
}

export async function useServerSideRoutes(
  app: Application,
  options: ServerSideRoutesOptions = {},
) {
  const { viewsPath = "pages", prefix = "/" } = options;

  if (!prefix.startsWith("/")) {
    throw new Error("Prefix must start with '/'");
  }

  const basePath = path.join(Deno.cwd(), "src", viewsPath);

  const walkEntries = fs.walk(basePath, {
    exts: [".jsx", ".tsx"],
  });

  const views: ViewRoute[] = [];
  for await (const entry of walkEntries) {
    const { parent, route } = entryToRoutePath(basePath, prefix, entry);

    views.push({
      filePath: entry.path,
      parent,
      route,
    });
  }

  console.log(views);

  const routerMap = new Map<string | undefined, Router>();
  for (const view of views) {
    const router = routerMap.get(view.parent) || new Router({
      prefix: view.parent,
    });

    router.get(view.route, async (ctx) => {
      const html = await renderRouteToHtml(view);
      ctx.response.body = html;
    });

    routerMap.set(view.parent, router);
  }

  for (const router of routerMap.values()) {
    app.use(router.routes());
    app.use(router.allowedMethods());
  }
}

function entryToRoutePath(
  baseRoute: string,
  prefix: string,
  entry: fs.WalkEntry,
): RoutePath {
  let route = path
    .relative(baseRoute, entry.path)
    .replace(/\\/g, "/")
    .replace(/\.(tsx|jsx)$/, "");

  if (route.endsWith("index")) {
    route = route.replace(/index$/, "");
  }

  const lastPath = route.lastIndexOf("/");
  let parent: string | undefined = undefined;

  if (lastPath >= 0) {
    parent = prefix + route.substring(0, lastPath);
    route = route.substring(lastPath + 1);
  }

  const regexParam = /\[(?<param>.*)\]/g;
  route = route.replace(regexParam, (match) => {
    const param = match.replace(/\[|\]/g, "");
    return `:${param}`;
  });

  return {
    parent,
    route: "/" + route,
  };
}

async function renderRouteToHtml(viewRoute: ViewRoute) {
  const path = `file://${viewRoute.filePath}`;
  const JsxComponent = await import(path).then((m) => m.default);

  if (JsxComponent == null) {
    const route = viewRoute.route.replace(/^\//, "");
    throw new Error(`Expected default exported JSX component on ${route}:

      export default function Hello() {
        return <h1>Hello World!</h1>;
      }
    `);
  }

  const app = Nano.renderSSR(<JsxComponent />);
  const { body, head, footer, attributes } = Helmet.SSR(app);

  return `
  <!DOCTYPE html>
  <html ${attributes.html.toString()}>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${head.join("\n")}
    </head>
    <body ${attributes.body.toString()}>
      ${body}
      ${footer.join("\n")}
    </body>
  </html`;
}
