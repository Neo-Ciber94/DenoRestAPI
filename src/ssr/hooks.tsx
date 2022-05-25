import { ROUTE_PARAMS } from "./constants.ts";
import { StringMap } from "./types.ts";
import { isBrowser } from "./utils.ts";

export type RouteParams = {
  params: StringMap;
  query: StringMap;
};

export function useRouteParams(): RouteParams {
  const routeData = (window as any)[ROUTE_PARAMS] as string;
  if (routeData == null) {
    return { params: {}, query: {} };
  }

  return JSON.parse(routeData);
}
