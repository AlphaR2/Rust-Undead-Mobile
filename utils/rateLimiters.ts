export class RateLimiter {
  private lastCall = 0;
  private delay: number;
  private retryDelay = 1000;

  constructor(delayMs: number) {
    this.delay = delayMs;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;

    if (timeSinceLastCall < this.delay) {
      const waitTime = this.delay - timeSinceLastCall;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastCall = Date.now();

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        return await fn();
      } catch (error: any) {
        attempts++;

        if (error.message?.includes("429") || error.status === 429) {
          if (attempts >= maxAttempts) {
            throw new Error("Rate limit exceeded after maximum retries");
          }

          const backoffDelay = this.retryDelay * Math.pow(2, attempts - 1);
          // console.log(
          //   `Rate limited, waiting ${backoffDelay}ms before retry ${attempts}/${maxAttempts}`
          // );
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        } else {
          throw error;
        }
      }
    }

    throw new Error("Maximum retry attempts reached");
  }
}

// Request cache with TTL
export class RequestCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private activeRequests = new Map<string, Promise<any>>();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 10000
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Check if request is already in progress
    if (this.activeRequests.has(key)) {
      return this.activeRequests.get(key)!;
    }

    // Execute new request
    const promise = fetcher();
    this.activeRequests.set(key, promise);

    try {
      const data = await promise;
      this.cache.set(key, { data, timestamp: now, ttl });
      return data;
    } finally {
      this.activeRequests.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.activeRequests.clear();
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.activeRequests.delete(key);
  }
}
