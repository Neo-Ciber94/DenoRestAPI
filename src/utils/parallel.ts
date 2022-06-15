export type Callback = () => Promise<unknown> | unknown;

/**
 * Provides a set of utilities for parallelizing asynchronous tasks.
 */
export namespace Parallel {
  /**
   * Perform a `forEach` operation in parallel.
   * @param array The array to process.
   * @param callback The callback to call for each element.
   */
  export async function forEach<T>(
    array: T[],
    callback: (item: T) => Promise<unknown> | unknown
  ): Promise<void> {
    await Promise.all(array.map(callback));
  }

  /**
   * Call a set of callbacks in parallel.
   * @param callbacks The callbacks to call.
   */
  export async function invokeAll(...callbacks: Callback[]) {
    await Promise.all(callbacks.map((c) => c()));
  }
}
