export interface WorkerMessage<TKey extends string, TData = unknown> {
  type: TKey;
  data: TData;
}

export class WorkerDispatcher<TKey extends string = string, TData = unknown> {
  private readonly worker: Worker;

  constructor(path: URL) {
    this.worker = new Worker(path.href, {
      type: "module",
      // https://deno.land/manual/runtime/workers#using-deno-in-worker
      deno: {
        namespace: true,
      },
    } as any);
  }

  dispatch(message: WorkerMessage<TKey, TData>) {
    this.worker.postMessage(message);
  }
}

export function createWorker<TKey extends string = string, TData = unknown>(
  handler: (message: WorkerMessage<TKey, TData>) => void | Promise<void>
) {
  const worker = self as unknown as Worker;
  worker.onmessage = (event) => {
    const { type = "unknown", data } = event.data;
    handler({ type, data });
  };
}
