import { Router } from "oak";
import { AuthService } from "./auth.service.ts";
import authorize from "../../middlewares/authorize.middleware.ts";
import { Config } from "../../config/mod.ts";

const authRouter = new Router({
  prefix: "/auth",
})
  .post("/create_account", async (ctx) => {
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
  })
  .post("/resend-confirmation", async (ctx) => {
    const authService = new AuthService(ctx.request);
    const obj = await ctx.request.body({ type: "json" }).value;
    await authService.resendConfirmationEmail(obj);

    ctx.response.status = 200;
  })
  .get(`/${Config.CONFIRM_EMAIL_PATHNAME}`, async (ctx) => {
    const authService = new AuthService(ctx.request);
    await authService.confirmUserEmail();
    ctx.response.status = 200;
    ctx.response.type = "text/html";
    ctx.response.body = `
      <h4>Your email had been confirmed!</h4>
    `;
  })

  // Child user
  .get("/child_account", async (ctx) => {
    const authService = new AuthService(ctx.request);
    const result = await authService.getChildUsersAccounts();

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .get("/child_account/:id", async (ctx) => {
    const authService = new AuthService(ctx.request);
    const result = await authService.getChildUserAccountById(ctx.params.id);

    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .post("/child_account", authorize(), async (ctx) => {
    const authService = new AuthService(ctx.request);
    const obj = await ctx.request.body({ type: "json" }).value;
    const result = await authService.createChildUserAccount(obj);

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .put("/child_account", authorize(), async (ctx) => {
    const authService = new AuthService(ctx.request);
    const obj = await ctx.request.body({ type: "json" }).value;
    await authService.updateChildUser(obj);

    ctx.response.status = 200;
  })
  .put("/set_child_account_password", authorize(), async (ctx) => {
    const authService = new AuthService(ctx.request);
    const obj = await ctx.request.body({ type: "json" }).value;
    await authService.setChildUserPassword(obj);

    ctx.response.status = 200;
  })
  .delete("/child_account/:id", authorize(), async (ctx) => {
    const authService = new AuthService(ctx.request);
    const result = await authService.deleteChildUser(ctx.params.id);

    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  });

if (Config.isDevelopment()) {
  authRouter.post("/refresh_users_permissions", async (ctx) => {
    const authService = new AuthService(ctx.request);
    await authService.refreshUsersPermissions();

    ctx.response.status = 200;
  });
}

export default authRouter;
