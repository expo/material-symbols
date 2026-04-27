import { describe, expect, test } from "bun:test";
import { forEachConcurrentAsync } from "./for-each-concurrent-async";

describe("forEachConcurrentAsync", () => {
  test("processes every item exactly once", async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const seen: number[] = [];
    await forEachConcurrentAsync(items, 3, async (item) => {
      seen.push(item);
    });
    expect(seen.sort((a, b) => a - b)).toEqual(items);
  });

  test("caps in-flight tasks to the concurrency limit", async () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    let inFlight = 0;
    let peak = 0;
    await forEachConcurrentAsync(items, 4, async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight--;
    });
    expect(peak).toBe(4);
  });

  test("runs tasks in parallel up to the limit", async () => {
    const items = [0, 1, 2, 3, 4, 5];
    const start = Date.now();
    await forEachConcurrentAsync(items, 3, async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    const elapsed = Date.now() - start;
    // 6 items / 3 workers * 50ms = 100ms ideal; allow generous slack
    expect(elapsed).toBeLessThan(180);
    expect(elapsed).toBeGreaterThanOrEqual(100);
  });

  test("runs sequentially when concurrency is 1", async () => {
    const items = [1, 2, 3];
    const order: number[] = [];
    await forEachConcurrentAsync(items, 1, async (item) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      order.push(item);
    });
    expect(order).toEqual([1, 2, 3]);
  });

  test("returns immediately for an empty iterable", async () => {
    let called = false;
    await forEachConcurrentAsync([], 4, async () => {
      called = true;
    });
    expect(called).toBe(false);
  });

  test("handles fewer items than workers", async () => {
    const seen: number[] = [];
    await forEachConcurrentAsync([1, 2], 8, async (item) => {
      seen.push(item);
    });
    expect(seen.sort((a, b) => a - b)).toEqual([1, 2]);
  });

  test("propagates rejection from a task", async () => {
    await expect(
      forEachConcurrentAsync([1, 2, 3], 2, async (item) => {
        if (item === 2) throw new Error("boom");
      })
    ).rejects.toThrow("boom");
  });

  test("throws when concurrency is less than 1", async () => {
    await expect(forEachConcurrentAsync([1], 0, async () => {})).rejects.toThrow(
      "concurrency must be >= 1"
    );
  });

  test("works with a generator as input", async () => {
    function* gen() {
      yield "a";
      yield "b";
      yield "c";
    }
    const seen: string[] = [];
    await forEachConcurrentAsync(gen(), 2, async (item) => {
      seen.push(item);
    });
    expect(seen.sort()).toEqual(["a", "b", "c"]);
  });
});
