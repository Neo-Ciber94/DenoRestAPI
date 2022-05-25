import * as path from "std/path";
import * as fs from "std/fs";

export interface ViewRoute {
  component: string;
  parent?: string;
  pathname: string;
  name: string;
}

export async function getViewRoutes(
  viewsPath: string,
  prefix: string
): Promise<ViewRoute[]> {
  const basePath = path.join(Deno.cwd(), "src", viewsPath);
  const walkEntries = fs.walk(basePath, {
    exts: [".jsx", ".tsx"],
  });

  const views: ViewRoute[] = [];

  for await (const entry of walkEntries) {
    const routePath = entryToRoutePath(basePath, entry);
    const name = entry.name.replace(/\.(tsx|jsx)$/, "");
    const firstPath = routePath.indexOf("/");
    let parent: string | undefined;
    let pathname: string;

    if (firstPath >= 0) {
      parent = prefix + routePath.slice(0, firstPath);
      pathname = "/" + routePath.slice(firstPath + 1);
    } else {
      pathname = prefix + routePath;
    }

    views.push({
      component: entry.path,
      parent,
      pathname,
      name,
    });
  }

  return views;
}

function entryToRoutePath(baseRoute: string, entry: fs.WalkEntry): string {
  let route = path
    .relative(baseRoute, entry.path)
    .replace(/\\/g, "/")
    .replace(/\.(tsx|jsx)$/, "");

  if (route.endsWith("index")) {
    route = route.replace(/index$/, "");
  }

  const regexParam = /\[(?<param>\w+)\]/g;

  route = route.replace(regexParam, (match) => {
    const param = match.replace(/\[|\]/g, "");
    return `:${param}`;
  });

  if (route.endsWith("/")) {
    route = route.substring(0, route.length - 1);
  }

  return route;
}
