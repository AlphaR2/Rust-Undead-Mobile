// / Helper functions
export function calculateWaitTime(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("Retry-After");
  return retryAfter 
    ? parseInt(retryAfter) * 1000 
    : Math.pow(2, attempt) * 2000;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}