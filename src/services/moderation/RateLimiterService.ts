/**
 * Sliding Window Rate Limiter & Abuse Prevention Service
 */

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiterService {
  private static submissionLimits: Map<string, RateLimitRecord> = new Map();
  private static reportLimits: Map<string, RateLimitRecord> = new Map();

  private static readonly SUBMISSION_WINDOW_MS = 60_000; // 1 minute
  private static readonly MAX_SUBMISSIONS_PER_WINDOW = 10;

  private static readonly REPORT_WINDOW_MS = 60_000; // 1 minute
  private static readonly MAX_REPORTS_PER_WINDOW = 5;

  public static readonly MAX_PAYLOAD_SIZE_BYTES = 50_000; // 50 KB

  /**
   * Checks whether a submission is allowed within rate limits.
   */
  public static checkSubmissionRate(userToken: string): { allowed: boolean; retryAfterSeconds?: number } {
    return this.checkLimit(this.submissionLimits, userToken, this.MAX_SUBMISSIONS_PER_WINDOW, this.SUBMISSION_WINDOW_MS);
  }

  /**
   * Checks whether a report submission is allowed within rate limits.
   */
  public static checkReportRate(userToken: string): { allowed: boolean; retryAfterSeconds?: number } {
    return this.checkLimit(this.reportLimits, userToken, this.MAX_REPORTS_PER_WINDOW, this.REPORT_WINDOW_MS);
  }

  /**
   * Validates payload size to reject oversized submissions.
   */
  public static validatePayloadSize(payload: unknown): { valid: boolean; sizeBytes: number; message?: string } {
    const stringified = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const sizeBytes = new TextEncoder().encode(stringified).length;
    if (sizeBytes > this.MAX_PAYLOAD_SIZE_BYTES) {
      return {
        valid: false,
        sizeBytes,
        message: `Payload size (${sizeBytes} bytes) exceeds maximum allowable limit of ${this.MAX_PAYLOAD_SIZE_BYTES} bytes.`
      };
    }
    return { valid: true, sizeBytes };
  }

  /**
   * Resets rate limits (useful for testing).
   */
  public static reset(): void {
    this.submissionLimits.clear();
    this.reportLimits.clear();
  }

  private static checkLimit(
    storage: Map<string, RateLimitRecord>,
    key: string,
    maxCount: number,
    windowMs: number
  ): { allowed: boolean; retryAfterSeconds?: number } {
    const now = Date.now();
    const record = storage.get(key) || { timestamps: [] };

    // Evict timestamps outside the sliding window
    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

    if (record.timestamps.length >= maxCount) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
      return { allowed: false, retryAfterSeconds };
    }

    record.timestamps.push(now);
    storage.set(key, record);
    return { allowed: true };
  }
}
