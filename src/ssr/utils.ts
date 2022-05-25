/**
 * Checks whether the environment is running in the server.
 * @returns `true` if the current environment is a server-side rendering environment.
 */
export const isServer = () => typeof self.Deno !== "undefined";

/**
 * Checks whether the environment is running in the browser.
 * @returns `true` if the current environment is a browser.
 */
export const isBrowser = () => typeof self.Deno === "undefined";
