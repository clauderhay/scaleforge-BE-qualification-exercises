export class ExecutionCache<TInputs extends Array<unknown>, TOutput> {

  // Created a map to store completed executions' resuls
  private cache: Map<string, Promise<TOutput>> = new Map();
  // Created a map to keep track of ongoing executions
  private queue: Map<string, Promise<TOutput>> = new Map();

  constructor(private readonly handler: (...args: TInputs) => Promise<TOutput>) {}
  
  async fire(key: string, ...args: TInputs): Promise<TOutput> {
    // Checking if key is already in cache, then return it.
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Check if there is no execution, then start a new one
    if (!this.queue.has(key)) {
      // This starts the execution and store the promise in the queue
      const execPromise = this.handler(...args);
      this.queue.set(key, execPromise);

      // This try catch waits for the execution to complete and get result, then we cache it
      try {
        const result = await execPromise;
        this.cache.set(key, execPromise);
        return result;
      } finally {
        // We make sure that the completed execution from the queue is removed
        this.queue.delete(key);
      }
    } else {
      // Return the promise if there's an exisiting exectution
      return await this.queue.get(key)!;
    }
  }
}
