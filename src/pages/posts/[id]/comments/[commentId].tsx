import { h } from "nano_jsx";
import { useRouteData } from "../../../../ssr/hooks.tsx";

export default function ViewCommentId() {
  const routeData = useRouteData();

  return (
    <div>
      {JSON.stringify(routeData, null, 2)}
    </div>
  );
}
