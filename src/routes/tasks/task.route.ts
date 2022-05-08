import { Router } from "https://deno.land/x/oak@v10.5.1/router.ts";
import { TaskApiService } from "./task.service.ts";
import { taskCreateValidator, taskUpdateValidator } from "./task.validator.ts";

const taskApiService = new TaskApiService();

const taskRouter = new Router({
  prefix: "/tasks",
})
  .get("/", async (ctx) => {
    const result = await taskApiService.getAll();
    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .get("/:id", async (ctx) => {
    const result = await taskApiService.get(ctx.params.id);
    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .post("/", async (ctx) => {
    const obj = await ctx.request.body({ type: "json" }).value;
    const [err, task] = taskCreateValidator(obj);

    if (err) {
      ctx.response.status = 400;
      ctx.response.body = err.message;
      return;
    }

    const result = await taskApiService.create(task!);

    ctx.response.body = result;
    ctx.response.status = 201;
    ctx.response.headers.append("Location", `/tasks/${result.id}`);
  })
  .post("/toggle/:id", async (ctx) => {
    const result = await taskApiService.toggle(ctx.params.id);
    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .put("/", async (ctx) => {
    const obj = await ctx.request.body({ type: "json" }).value;
    const [err, task] = taskUpdateValidator(obj);

    if (err) {
      ctx.response.status = 400;
      ctx.response.body = err.message;
      return;
    }

    const result = await taskApiService.update(task!);

    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  })
  .delete("/:id", async (ctx) => {
    const result = await taskApiService.delete(ctx.params.id);

    if (result == null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = result;
    ctx.response.status = 200;
  });

export default taskRouter;
