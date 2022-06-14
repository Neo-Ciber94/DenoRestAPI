import { bundle } from "./src/ssr/bundle.ts";

const src = `
import { hydrate } from "nano_jsx";
import Home from "../src/pages/index.tsx"

hydrate(Home, document.body);`;

const result = await bundle(src);
console.log(result);