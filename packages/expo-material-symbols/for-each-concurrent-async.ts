/**
 * Runs `task` for every item with at most `concurrency` tasks in flight at once.
 *
 * Items are pulled from a shared iterator, so each item is processed exactly once
 * regardless of completion order. The first rejection aborts the pool — already
 * in-flight tasks still settle, but no new items are dispatched.
 *
 * @param items - Items to process. Any iterable, including arrays and generators.
 * @param concurrency - Maximum number of tasks running in parallel. Must be >= 1.
 * @param task - Work to perform for each item. Called once per item.
 * @throws If `concurrency < 1`, or with the first rejection from `task`.
 *
 * @example
 * ```ts
 * await forEachConcurrentAsync(urls, 6, async (url) => {
 *   const res = await fetch(url);
 *   await Bun.write(`./out/${basename(url)}`, res);
 * });
 * ```
 */
export async function forEachConcurrentAsync<T>(
  items: Iterable<T>,
  concurrency: number,
  task: (item: T) => Promise<void>
): Promise<void> {
  if (concurrency < 1) {
    throw new Error(`concurrency must be >= 1, got ${concurrency}`);
  }
  const queue = items[Symbol.iterator]();
  const worker = async () => {
    for (let r = queue.next(); !r.done; r = queue.next()) {
      await task(r.value);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}
