import { h } from "nano_jsx";
import { useRouteParams } from "../ssr/hooks.tsx";

export default function Home() {
  console.log(useRouteParams());
  console.log('Hello')
  return <h1 class="red">Hello World!</h1>;
}
