export class PaymentError extends Error {
  retryable: boolean;
  reason: string;
  metaData?: Record<string, unknown>;

  constructor(
    message: string,
    retryable = true,
    reason?: string,
    metaData?: Record<string, unknown>,
  ) {
    super(message);
    this.retryable = retryable;
    this.reason = reason ?? message;
    this.metaData = metaData;
  }
}
