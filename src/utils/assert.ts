export namespace Assert {
  export function nonNull<T>(value: T, message?: string): asserts value {
    if (value == null) {
      throw new Error(message || `the value is null`);
    }
  }
}
