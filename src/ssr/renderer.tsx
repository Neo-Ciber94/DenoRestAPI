import { Application, Router, RouterContext } from "oak";
import { getQuery } from "oak/helpers";
import * as Nano from "nano_jsx";
import { h } from "nano_jsx";
import { getViewRoutes, ViewRoute } from "./views.ts";
import { RequestWithParams } from "./types.ts";
import { GET_SERVER_DATA_FUNCTION, ROUTE_PARAMS } from "./constants.ts";
import { ensureDir } from "std/fs";
import { bundle } from "./bundle.ts";
import * as sha1 from "sha1";
import * as base64 from "base64";
import * as path from "std/path";
const { Helmet } = Nano;

const SERVER_ADDRESS = "http://localhost:8000";
const BUNDLE_ADDRESS = `${SERVER_ADDRESS}/static/bundle`;

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

  const viewsRoutes = await getViewRoutes(viewsPath, prefix);
  const routerMap = new Map<string | undefined, Router>();

  console.log(viewsRoutes);

  for (const view of viewsRoutes) {
    const router = routerMap.get(view.parent) || new Router({
      prefix: view.parent,
    });

    router.get(view.pathname, async (ctx) => {
      const html = await renderRouteToHtml(view, ctx);
      ctx.response.body = html;
    });

    routerMap.set(view.parent, router);
  }

  // Generate the hydrate bundle files asynchronously
  await Promise.all(viewsRoutes.map(generateHydrateScript));

  for (const router of routerMap.values()) {
    app.use(router.routes());
    app.use(router.allowedMethods());
  }
}

async function renderRouteToHtml(
  viewRoute: ViewRoute,
  context: RouterContext<string>,
) {
  const componentPath = `file://${viewRoute.component}`;
  const imports = await import(componentPath);
  const JsxComponent = imports.default;
  const getServerDataFn = imports[GET_SERVER_DATA_FUNCTION];

  if (JsxComponent == null) {
    const route = viewRoute.pathname.replace(/^\//, "");
    throw new Error(`Expected default exported JSX component on ${route}:

      export default function Hello() {
        return <h1>Hello World!</h1>;
      }
    `);
  }

  if (getServerDataFn != null && typeof getServerDataFn !== "function") {
    throw new Error(`Expected '${GET_SERVER_DATA_FUNCTION}' to be a function`);
  }

  let routeData: unknown = undefined;
  const request = context.request as RequestWithParams;
  const pathname = request.url.pathname;
  const params = context.params;
  const query = getQuery(context);

  if (getServerDataFn) {
    request.params = params;
    request.query = query;
    const { data } = await getServerDataFn(request);
    routeData = data;
  }

  console.log({ params, query });

  // prettier-ignore
  const app = Nano.renderSSR(<JsxComponent data={routeData} />, { pathname });
  const hydrateScriptPath = getHydrateFileName(viewRoute);
  const { body, head, footer, attributes } = Helmet.SSR(app);

  const q = JSON.stringify({ params, query });

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
      <script src="${BUNDLE_ADDRESS}/${hydrateScriptPath}.bundle.js"/>
      <script id="${ROUTE_PARAMS}" type="application/json">
        ${q}
      </script>
    </body>
  </html`;
}

async function generateHydrateScript(view: ViewRoute): Promise<string> {
  const pagesPath = path.join(Deno.cwd(), "src");
  const filename = getHydrateFileName(view);
  const outdir = path.join(Deno.cwd(), "/src/public/bundle/");
  const componentPath = path
    .relative(pagesPath, view.component)
    .replaceAll("\\", "/");

  await ensureDir(outdir);

  const src = `
    import { hydrate } from "nano_jsx";
    import Component from "../../${componentPath}";

    hydrate(Component, document.body);`;

  const bundledScript = await bundle(src, {
    filename,
    outdir,
  });

  const outfileName = `${filename}.bundle.js`;
  const outfilePath = path.join(outdir, outfileName);
  await Deno.writeTextFile(outfilePath, bundledScript);
  return outfileName;
}

function getHydrateFileName(view: ViewRoute): string {
  const filename = `${view.parent ?? ""}${view.pathname}`;
  const sha1Hash = sha1.sha1(filename, "utf8", "hex").toString();
  const base64Hash = base64.Base64.fromString(sha1Hash).toString();
  return base64Hash.replaceAll("=", "");
}
