import { Router } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import { AuthService } from "./auth.service.ts";
import authorize from "../../middlewares/authorize.middleware.ts";

const authRouter = new Router({
  prefix: "/auth",
})
  .post("/create", async (ctx) => {
    const authService = new AuthService(ctx.request);
    const obj = await ctx.request.body({ type: "json" }).value;
    const result = await authService.createUser(obj);

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .post("/login", async (ctx) => {
    const authService = new AuthService(ctx.request);
    const obj = await ctx.request.body({ type: "json" }).value;
    const result = await authService.login(obj);

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .post("/logout", authorize(), async (ctx) => {
    const authService = new AuthService(ctx.request);
    await authService.logout();
    ctx.response.status = 200;
  })
  .post("/change_password", authorize(), async (ctx) => {
    const authService = new AuthService(ctx.request);
    const obj = await ctx.request.body({ type: "json" }).value;
    await authService.changePassword(obj);
    ctx.response.status = 200;
  })
  .get("/me", authorize(), async (ctx) => {
    const authService = new AuthService(ctx.request);
    const result = await authService.me();

    ctx.response.body = result;
    ctx.response.status = 200;
  });

export default authRouter;
