/**
 * Loads a service worker.
 * @param filename The filename of the worker to load.
 * @param base The base path of the worker.
 * @returns The promise that resolves with the worker when it receive a ready signal.
 */
export async function createWorkerService(
  filename: string,
  base?: string
): Promise<Worker> {
  const worker = new Worker(new URL(filename, base).href, {
    type: "module",
    deno: { namespace: true },
  } as any);

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
