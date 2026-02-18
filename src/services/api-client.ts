import type { ApiError } from "../types/index.js";

const BASE_URL = "https://dev.to/api";
const ACCEPT_HEADER = "application/vnd.forem.api-v1+json";
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1_000;

/** HTTP methods supported by the client. */
type HttpMethod = "GET" | "POST" | "PUT";

/** Rate-limit information extracted from response headers. */
export interface RateLimitInfo {
    limit: number | null;
    remaining: number | null;
    reset: number | null;
}

/** Structured error thrown by the API client with diagnostic context. */
export class ForemApiError extends Error {
    readonly status: number;
    readonly endpoint: string;
    readonly method: HttpMethod;
    readonly rateLimit: RateLimitInfo | null;
    readonly requestId: string | null;

    constructor(opts: {
        status: number;
        message: string;
        endpoint: string;
        method: HttpMethod;
        rateLimit?: RateLimitInfo | null;
        requestId?: string | null;
    }) {
        super(
            `Forem API Error (${opts.status} ${opts.method} ${opts.endpoint}): ${opts.message}` +
            (opts.requestId ? ` [request-id: ${opts.requestId}]` : "") +
            (opts.rateLimit?.remaining !== null && opts.rateLimit?.remaining !== undefined
                ? ` [rate-limit remaining: ${opts.rateLimit.remaining}]`
                : "")
        );
        this.name = "ForemApiError";
        this.status = opts.status;
        this.endpoint = opts.endpoint;
        this.method = opts.method;
        this.rateLimit = opts.rateLimit ?? null;
        this.requestId = opts.requestId ?? null;
    }
}

export class ForemApiClient {
    private readonly apiKey: string;
    private readonly timeoutMs: number;

    constructor(apiKey: string, timeoutMs: number = DEFAULT_TIMEOUT_MS) {
        this.apiKey = apiKey;
        this.timeoutMs = timeoutMs;
    }

    // ── Public HTTP methods ──────────────────────────────────────────

    async get<T>(
        path: string,
        params?: Record<string, string | number | boolean | undefined>,
        authenticated: boolean = true,
    ): Promise<T> {
        return this.request<T>("GET", path, { params, authenticated });
    }

    async post<T>(
        path: string,
        body?: Record<string, unknown>,
        params?: Record<string, string | number | boolean | undefined>,
    ): Promise<T> {
        return this.request<T>("POST", path, { body, params, authenticated: true });
    }

    async put<T>(
        path: string,
        body?: Record<string, unknown>,
    ): Promise<T> {
        return this.request<T>("PUT", path, { body, authenticated: true });
    }

    // ── Internals ────────────────────────────────────────────────────

    private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
        const url = new URL(`${BASE_URL}${path}`);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null && value !== "") {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        return url.toString();
    }

    private getHeaders(authenticated: boolean): Record<string, string> {
        const headers: Record<string, string> = {
            "accept": ACCEPT_HEADER,
            "content-type": "application/json",
            "user-agent": "devto-mcp/1.0.0",
        };
        if (authenticated) {
            headers["api-key"] = this.apiKey;
        }
        return headers;
    }

    private extractRateLimit(response: Response): RateLimitInfo {
        const parse = (h: string): number | null => {
            const v = response.headers.get(h);
            return v !== null ? Number(v) : null;
        };
        return {
            limit: parse("x-ratelimit-limit"),
            remaining: parse("x-ratelimit-remaining"),
            reset: parse("x-ratelimit-reset"),
        };
    }

    /** Determine how long to wait before retrying (ms). */
    private getRetryDelay(attempt: number, response?: Response): number {
        // Respect Retry-After header if present (seconds)
        const retryAfter = response?.headers.get("retry-after");
        if (retryAfter) {
            const seconds = Number(retryAfter);
            if (!isNaN(seconds) && seconds > 0) {
                return seconds * 1_000;
            }
        }
        // Exponential backoff: 1s, 2s, 4s
        return INITIAL_BACKOFF_MS * Math.pow(2, attempt);
    }

    /** Whether the status code is retryable. */
    private isRetryable(status: number): boolean {
        return status === 429 || (status >= 500 && status < 600);
    }

    private async request<T>(
        method: HttpMethod,
        path: string,
        opts: {
            params?: Record<string, string | number | boolean | undefined>;
            body?: Record<string, unknown>;
            authenticated?: boolean;
        },
    ): Promise<T> {
        const url = this.buildUrl(path, opts.params);
        const headers = this.getHeaders(opts.authenticated ?? true);
        const bodyStr = opts.body ? JSON.stringify(opts.body) : undefined;

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(url, {
                    method,
                    headers,
                    body: bodyStr,
                    signal: AbortSignal.timeout(this.timeoutMs),
                });

                // Successful response
                if (response.ok) {
                    if (response.status === 204) {
                        return {} as T;
                    }
                    return (await response.json()) as T;
                }

                // Build error info
                const rateLimit = this.extractRateLimit(response);
                const requestId = response.headers.get("x-request-id");

                // Retryable? Try again (unless last attempt)
                if (this.isRetryable(response.status) && attempt < MAX_RETRIES) {
                    const delay = this.getRetryDelay(attempt, response);
                    await this.sleep(delay);
                    continue;
                }

                // Non-retryable or final attempt — throw structured error
                let errorMessage: string;
                try {
                    const errorBody = (await response.json()) as ApiError;
                    errorMessage = errorBody.error || `API request failed with status ${response.status}`;
                } catch {
                    errorMessage = `API request failed with status ${response.status}: ${response.statusText}`;
                }

                throw new ForemApiError({
                    status: response.status,
                    message: errorMessage,
                    endpoint: path,
                    method,
                    rateLimit,
                    requestId,
                });
            } catch (error) {
                if (error instanceof ForemApiError) {
                    throw error;
                }

                lastError = error instanceof Error ? error : new Error(String(error));

                // Network/timeout errors are retryable
                if (attempt < MAX_RETRIES) {
                    const delay = this.getRetryDelay(attempt);
                    await this.sleep(delay);
                    continue;
                }
            }
        }

        // All retries exhausted
        throw new ForemApiError({
            status: 0,
            message: `Request failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message ?? "Unknown error"}`,
            endpoint: path,
            method,
        });
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
