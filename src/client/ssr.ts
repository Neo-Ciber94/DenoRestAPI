import { Application } from "oak";
import * as path from "std/path";
import * as fs from "std/fs";
import * as Nano from "nano_jsx";
const { Helmet } = Nano;

export interface ViewRoute {
  route: string;
  filePath: string;
}

export interface PageRouterOptions {
  viewsPath?: string;
}

export async function setupPageViews(
  app: Application,
  options: PageRouterOptions = {}
) {
  const { viewsPath = "pages" } = options;
  const basePath = path.join(Deno.cwd(), "src", viewsPath);

  const walkEntries = fs.walk(basePath, {
    exts: [".jsx", ".tsx"],
  });

  const views: ViewRoute[] = [];
  for await (const entry of walkEntries) {
    views.push({
      filePath: entry.path,
      route: entryToRoutePath(basePath, entry),
    });
  }

  console.log(views);
}

function entryToRoutePath(baseRoute: string, entry: fs.WalkEntry): string {
  let route = path
    .relative(baseRoute, entry.path)
    .replace(/\\/g, "/")
    .replace(/\.(tsx|jsx)$/, "");

  if (route.endsWith("index")) {
    route = route.replace(/index$/, "");
  }

  const regexParam = /\[(?<param>.*)\]/g;
  route = route.replace(regexParam, (match) => {
    const param = match.replace(/\[|\]/g, "");
    return `:${param}`;
  });

  return "/" + route;
}

async function renderRouteToHtml(viewRoute: ViewRoute) {
  const JsxComponent = await import(viewRoute.filePath).then((m) => m.default);

  if (JsxComponent == null) {
    throw new Error(`Expected react component`);
  }

  // const app = Nano.renderSSR(<JsxComponent />);
  // const { body, head, footer, attributes } = Helmet.SSR(app);
  return "";
}
