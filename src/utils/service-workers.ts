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

/**
 * Waits until the worker receives a ready signal.
 * @param worker The worker to wait for.
 * @returns A promise that resolves when the worker is ready.
 */
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

/**
 * Sends a ready signal to the worker.
 * @param worker The worker to send a message to.
 */
export function notifyReady(worker: Worker) {
  worker.postMessage({
    type: "ready",
  });
}
