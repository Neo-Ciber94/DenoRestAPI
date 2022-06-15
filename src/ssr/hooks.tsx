import { ROUTE_PARAMS } from "./constants.ts";
import { StringMap } from "./types.ts";

export type RouteParams = {
  params: StringMap;
  query: StringMap;
};

export function useRouteParams(): RouteParams {
  if (typeof window === "undefined") {
    return { params: {}, query: {} };
  }

  const element = window.document.getElementById(ROUTE_PARAMS);
  if (element == null) {
    throw new Error(`Expected element with id '${ROUTE_PARAMS}'`);
  }

  const json = element.textContent;
  if (json == null) {
    return { params: {}, query: {} };
  }

  const { params, query } = JSON.parse(json);
  return { params, query };
}
