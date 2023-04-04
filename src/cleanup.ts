import { EventEmitter } from "node:events";

export type CleanupFn = () => void | Promise<void>;

const cleanupFns: CleanupFn[] = [];

const emitter = new EventEmitter().on("cleanup", async (...args: unknown[]) => {
  console.info("exit: ", ...args);
  for (const fn of cleanupFns) {
    await fn();
  }
  process.exit(0);
});

export function registerCleanupFn(fn: CleanupFn) {
  bindCleanupHandlers();
  cleanupFns.push(fn);
}

let cleanupHandlersBound = false;

export function bindCleanupHandlers() {
  if (cleanupHandlersBound) return;
  cleanupHandlersBound = true;

  const emit = (...args: unknown[]) => emitter.emit("cleanup", ...args);

  const signals = ["SIGINT", "SIGTERM", "exit", "uncaughtException"];

  for (const signal of signals) {
    process.on(signal, emit);
  }
}
