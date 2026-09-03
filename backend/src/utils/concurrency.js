/**
 * Runs `worker` over `items` with at most `concurrency` in flight at
 * once, calling `onSettled(result, index)` as soon as EACH item
 * finishes (not in input order - whichever finishes first reports
 * first). This is what lets a batch analysis stream results back to
 * the client progressively instead of waiting for the whole batch.
 *
 * A failure in one item never aborts the others - each item's
 * success/failure is reported independently via onSettled.
 *
 * @param {Array} items
 * @param {(item, index) => Promise<any>} worker
 * @param {(result: {index: number, status: 'fulfilled'|'rejected', value?: any, error?: any}) => void} onSettled
 * @param {number} concurrency
 */
export async function runWithConcurrency(items, worker, onSettled, concurrency = 3) {
  let nextIndex = 0

  async function runOne() {
    while (nextIndex < items.length) {
      const index = nextIndex++
      try {
        const value = await worker(items[index], index)
        onSettled({ index, status: 'fulfilled', value })
      } catch (error) {
        onSettled({ index, status: 'rejected', error })
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, runOne)
  await Promise.all(workers)
}