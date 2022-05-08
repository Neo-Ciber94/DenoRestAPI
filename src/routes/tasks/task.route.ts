import { Router } from "https://deno.land/x/oak@v10.5.1/router.ts";
import { TaskApiService } from "./task.service.ts";
import authorize from "../../middlewares/authorize.middleware.ts";

const taskRouter = new Router({
  prefix: "/tasks",
})
  .use(authorize())
  .get("/", async (ctx) => {
    const taskApiService = new TaskApiService(ctx.request);
    const result = await taskApiService.getAll();
    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .get("/:id", async (ctx) => {
    const taskApiService = new TaskApiService(ctx.request);
    const result = await taskApiService.get(ctx.params.id);
    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .post("/", async (ctx) => {
    const taskApiService = new TaskApiService(ctx.request);
    const obj = await ctx.request.body({ type: "json" }).value;
    const result = await taskApiService.create(obj);

    ctx.response.body = result;
    ctx.response.status = 201;
    ctx.response.headers.append("Location", `/tasks/${result.id}`);
  })
  .post("/toggle/:id", async (ctx) => {
    const taskApiService = new TaskApiService(ctx.request);
    const result = await taskApiService.toggle(ctx.params.id);
    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .put("/", async (ctx) => {
    const taskApiService = new TaskApiService(ctx.request);
    const obj = await ctx.request.body({ type: "json" }).value;
    const result = await taskApiService.update(obj);

    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .delete("/:id", async (ctx) => {
    const taskApiService = new TaskApiService(ctx.request);
    const result = await taskApiService.delete(ctx.params.id);

    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  });

export default taskRouter;
