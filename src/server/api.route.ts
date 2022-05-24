import { Router } from "https://deno.land/x/oak@v10.5.1/router.ts";
import { Config } from "../config/mod.ts";
import authRouter from "./auth/auth.route.ts";
import taskRouter from "./tasks/task.route.ts";

const apiRouter = new Router({
  prefix: Config.API_URL,
});

// auth
apiRouter.use(authRouter.routes());
apiRouter.use(authRouter.allowedMethods());

// tasks
apiRouter.use(taskRouter.routes());
apiRouter.use(taskRouter.allowedMethods());

export default apiRouter;
