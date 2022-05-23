import { Router } from "https://deno.land/x/oak@v10.5.1/router.ts";
import authRouter from "./auth/auth.route.ts";
import taskRouter from "./tasks/task.route.ts";

const apiRouter = new Router({
  prefix: "/api",
});

// auth
apiRouter.use(authRouter.routes());
apiRouter.use(authRouter.allowedMethods());

// tasks
apiRouter.use(taskRouter.routes());
apiRouter.use(taskRouter.allowedMethods());

export default apiRouter;
