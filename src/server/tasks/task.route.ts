import { Router } from "oak";
import { TaskApiService } from "./task.service.ts";
import authorize from "../../middlewares/authorize.middleware.ts";
import { Permission } from "../auth/permissions.ts";

const taskRouter = new Router({
  prefix: "/tasks",
})
  .get(
    "/",
    authorize({
      permissions: [Permission.View],
    }),
    async (ctx) => {
      const taskApiService = new TaskApiService(ctx.request);
      const result = await taskApiService.getAll();
      ctx.response.body = result;
      ctx.response.status = 200;
    },
  )
  .get(
    "/:id",
    authorize({
      permissions: [Permission.View],
    }),
    async (ctx) => {
      const taskApiService = new TaskApiService(ctx.request);
      const result = await taskApiService.get(ctx.params.id);
      if (result == null) {
        ctx.response.status = 404;
        return;
      }

      ctx.response.body = result;
      ctx.response.status = 200;
    },
  )
  .post(
    "/",
    authorize({
      permissions: [Permission.Create],
    }),
    async (ctx) => {
      const taskApiService = new TaskApiService(ctx.request);
      const obj = await ctx.request.body({ type: "json" }).value;
      const result = await taskApiService.create(obj);

      ctx.response.body = result;
      ctx.response.status = 201;
      ctx.response.headers.append("Location", `/tasks/${result.id}`);
    },
  )
  .put(
    "/toggle/:id",
    authorize({
      permissions: [Permission.Edit],
    }),
    async (ctx) => {
      const taskApiService = new TaskApiService(ctx.request);
      const result = await taskApiService.toggle(ctx.params.id);
      if (result == null) {
        ctx.response.status = 404;
        return;
      }

      ctx.response.body = result;
      ctx.response.status = 200;
    },
  )
  .put(
    "/",
    authorize({
      permissions: [Permission.Edit],
    }),
    async (ctx) => {
      const taskApiService = new TaskApiService(ctx.request);
      const obj = await ctx.request.body({ type: "json" }).value;
      const result = await taskApiService.update(obj);

      if (result == null) {
        ctx.response.status = 404;
        return;
      }

      ctx.response.body = result;
      ctx.response.status = 200;
    },
  )
  .delete(
    "/:id",
    authorize({
      permissions: [Permission.Delete],
    }),
    async (ctx) => {
      const taskApiService = new TaskApiService(ctx.request);
      const result = await taskApiService.delete(ctx.params.id);

      if (result == null) {
        ctx.response.status = 404;
        return;
      }

      ctx.response.body = result;
      ctx.response.status = 200;
    },
  );

export default taskRouter;
