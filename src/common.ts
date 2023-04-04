export type AsPromise<T> = T extends Promise<infer U> ? Promise<U> : Promise<T>;

export type OptionallyPromise<T> = AsPromise<T> | Awaited<T>;

export type Optional<T> =
  | OptionallyPromise<T>
  | OptionallyPromise<void | undefined>;
