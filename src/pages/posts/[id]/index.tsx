import { useRouteParams } from "../../../ssr/hooks.tsx";
import { h } from "nano_jsx";

export default function ViewPost() {
  const routeData = useRouteParams();
  console.log(routeData);

  return (
    <div>
      <h1>View Posts with Id</h1>
      <pre>Params: {JSON.stringify(routeData, null, 2)}</pre>
    </div>
  );
}
