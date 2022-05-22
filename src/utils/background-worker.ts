enum State {
  Loading = 1,
  Ready = 2,
  Closed = 3,
}

/**
 * Represents a serializable type.
 */
export type JsonValue =
  | number
  | string
  | boolean
  | { [key: string]: JsonValue }
  | Array<JsonValue>;

export type ModuleImport =
  | object
  | Function
  | Promise<object>
  | Promise<Function>;

/**
 * Options used to configure a `BackgroundWorker`.
 */
export interface BackgroundWorkerOptions<T> {
  /**
   * A callback that is called when a message is received from the worker.
   */
  onMessage: (message: MessageEvent<T>) => Promise<void> | void;

  /**
   * A callback to call when the worker is ready.
   */
  onReady?: (worker: Worker) => Promise<void> | void;

  /**
   * The imports to be made available to the worker.
   * @example
   * ```
   * imports: [
   *  import("path/to/module").then((m) => m.default),
   *  import("path/to/other-module"),
   *  myFunction
   * ]
   * ```
   */
  imports?: ModuleImport[];

  /**
   * The name of the worker.
   */
  name?: string;

  /**
   * Enables `deno` namespace on this worker. This requires `--allow-unstable`.
   */
  useDenoNamespace?: boolean;
}

/**
 * A mechanism for run operations on other thread.
 */
export class BackgroundWorker<T extends JsonValue> {
  private worker: Promise<Worker>;
  private blobUrl: Promise<string>;
  private state = State.Loading;

  constructor(options: BackgroundWorkerOptions<T>) {
    this.blobUrl = this.createBlobUrl(options);
    this.worker = this.createWorker(options);
  }

  /**
   * Whether if this worker is ready to receive messages.
   */
  get isReady() {
    return this.state === State.Ready;
  }

  /**
   * Whether if this worker is closed.
   */
  get isClosed() {
    return this.state === State.Closed;
  }

  /**
   * Send a message to the worker.
   * @param message The message to send.
   * @returns A promise that resolves when the message is sent.
   */
  async postMessage(message: T): Promise<void> {
    if (this.isClosed) {
      return;
    }

    const worker = await this.worker;
    worker.postMessage(message);
  }

  /**
   * Close this worker to prevent further messages.
   * @returns A promise that resolves when the worker is closed.
   */
  async close(): Promise<void> {
    if (this.state === State.Closed) {
      return;
    }

    const worker = await this.worker;
    const blobUrl = await this.blobUrl;
    worker.terminate();
    URL.revokeObjectURL(blobUrl);
    this.state = State.Closed;
  }

  private async createWorker(
    options: BackgroundWorkerOptions<T>
  ): Promise<Worker> {
    const blobUrl = await this.blobUrl;
    const worker = new Worker(blobUrl, {
      type: "module",
      name: options.name,
      deno: {
        namespace:
          options.useDenoNamespace == null ? false : options.useDenoNamespace,
      },
    } as any);

    this.state = State.Ready;

    if (options.onReady) {
      await options.onReady(worker);
    }

    return worker;
  }

  private async createBlobUrl(
    options: BackgroundWorkerOptions<T>
  ): Promise<string> {
    const operation = options.onMessage.toString();
    const imported = options.imports
      ? await this.loadImports(options.imports)
      : [];

    const code = `
        const worker = self;
        worker.onmessage = ${operation};
    `;

    const blob = new Blob([imported.join("\n"), code]);
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  }

  private async loadImports(imports: ModuleImport[]): Promise<string[]> {
    const result: string[] = [];

    for (const promise of imports) {
      const imported = await promise;
      const obj = imported as any;

      if (typeof obj === "object") {
        const str = Object.keys(obj).map((k) => obj[k].toString());
        result.push(...str);
      } else {
        result.push(obj.toString());
      }
    }

    return result;
  }
}
