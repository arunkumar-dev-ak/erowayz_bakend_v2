export function isSerializationError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  ) {
    const err = error as { code?: string; message?: string };
    return (
      err.code === 'P2034' ||
      (err.message?.includes('could not serialize access') ?? false) ||
      (err.message?.includes('SerializationFailure') ?? false) ||
      (err.message?.includes('could not serialize transaction') ?? false)
    );
  }

  return false;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomJitter(base: number): number {
  return base + Math.floor(Math.random() * base);
}
