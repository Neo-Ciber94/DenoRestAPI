export function createWorkerService(filename: string, base?: string): Worker {
  const worker = new Worker(new URL(filename, base).href, {
    type: "module",
    deno: { namespace: true },
  } as any);
  return worker;
}

export async function createWorkerServiceAndWait(
  filename: string,
  base?: string
): Promise<Worker> {
  const worker = createWorkerService(filename, base);
  await waitReady(worker);
  return worker;
}

export function waitReady(worker: Worker): Promise<void> {
  return new Promise((resolve) => {
    worker.onmessage = (message) => {
      const { type } = message.data;
      if (type === "ready") {
        resolve();
      }
    };
  });
}

export function notifyReady(worker: Worker) {
  worker.postMessage({
    type: "ready",
  });
}
