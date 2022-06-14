import { h, hydrate } from "nano_jsx";
import { useRouteParams } from "../../../../ssr/hooks.tsx";
import { isBrowser } from "../../../../ssr/utils.ts";

export default function ViewCommentId() {
  const routeData = useRouteParams();

  console.log(routeData);
  return (
    <div>
      <h1>Posts Comment with Id</h1>
      {JSON.stringify(routeData, null, 2)}
    </div>
  );
}

// if (isBrowser()) {
//   hydrate(<ViewCommentId />, document?.getElementById("root"));
// }
