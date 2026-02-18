import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ForemApiClient, ForemApiError } from "../services/api-client.js";

// We need to mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        statusText: status === 200 ? "OK" : "Error",
        headers: {
            "content-type": "application/json",
            ...headers,
        },
    });
}

describe("ForemApiClient", () => {
    let client: ForemApiClient;

    beforeEach(() => {
        client = new ForemApiClient("test-api-key", 5_000);
        mockFetch.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("URL building", () => {
        it("builds URL with base path", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse([]));
            await client.get("/articles");
            expect(mockFetch).toHaveBeenCalledWith(
                "https://dev.to/api/articles",
                expect.objectContaining({ method: "GET" }),
            );
        });

        it("builds URL with query params, skipping undefined/empty values", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse([]));
            await client.get("/articles", { page: 1, tag: "javascript", empty: "", undef: undefined });
            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).toContain("page=1");
            expect(calledUrl).toContain("tag=javascript");
            expect(calledUrl).not.toContain("empty");
            expect(calledUrl).not.toContain("undef");
        });
    });

    describe("Headers", () => {
        it("includes api-key for authenticated requests", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({}));
            await client.get("/users/me");
            const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
            expect(headers["api-key"]).toBe("test-api-key");
            expect(headers["accept"]).toContain("forem.api-v1");
            expect(headers["user-agent"]).toBe("devto-mcp/1.0.0");
        });

        it("omits api-key for unauthenticated requests", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({}));
            await client.get("/articles/1", undefined, false);
            const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
            expect(headers["api-key"]).toBeUndefined();
        });
    });

    describe("Response handling", () => {
        it("returns parsed JSON on success", async () => {
            const data = { id: 1, title: "Test" };
            mockFetch.mockResolvedValueOnce(jsonResponse(data));
            const result = await client.get<{ id: number; title: string }>("/articles/1");
            expect(result).toEqual(data);
        });

        it("returns empty object for 204 status", async () => {
            mockFetch.mockResolvedValueOnce(
                new Response(null, { status: 204, statusText: "No Content" }),
            );
            const result = await client.post("/some-action");
            expect(result).toEqual({});
        });
    });

    describe("Error handling", () => {
        it("throws ForemApiError with status and endpoint on 404", async () => {
            mockFetch.mockResolvedValue(
                jsonResponse({ error: "not found", status: 404 }, 404),
            );
            try {
                await client.get("/articles/999");
                expect.fail("Should have thrown");
            } catch (err) {
                expect(err).toBeInstanceOf(ForemApiError);
                const apiErr = err as ForemApiError;
                expect(apiErr.status).toBe(404);
                expect(apiErr.endpoint).toBe("/articles/999");
                expect(apiErr.method).toBe("GET");
                expect(apiErr.message).toContain("not found");
            }
        });

        it("throws ForemApiError with fallback message when body is not JSON", async () => {
            mockFetch.mockResolvedValueOnce(
                new Response("Bad Gateway", { status: 502, statusText: "Bad Gateway" }),
            );

            // 502 is retryable, need to mock multiple calls
            mockFetch.mockResolvedValue(
                new Response("Bad Gateway", { status: 502, statusText: "Bad Gateway" }),
            );

            await expect(client.get("/articles")).rejects.toThrow(ForemApiError);
        });

        it("includes rate-limit info in error", async () => {
            mockFetch.mockResolvedValue(
                jsonResponse({ error: "Rate limited" }, 429, {
                    "x-ratelimit-limit": "100",
                    "x-ratelimit-remaining": "0",
                    "x-ratelimit-reset": "1700000000",
                    "retry-after": "0",
                }),
            );

            try {
                await client.get("/articles");
            } catch (e) {
                const err = e as ForemApiError;
                expect(err.status).toBe(429);
                expect(err.rateLimit?.remaining).toBe(0);
                expect(err.rateLimit?.limit).toBe(100);
                expect(err.message).toContain("rate-limit remaining: 0");
            }
        });

        it("includes request-id in error when present", async () => {
            mockFetch.mockResolvedValueOnce(
                jsonResponse({ error: "Server Error" }, 500, {
                    "x-request-id": "req-abc-123",
                }),
            );
            // Need to exhaust retries
            mockFetch.mockResolvedValue(
                jsonResponse({ error: "Server Error" }, 500, {
                    "x-request-id": "req-abc-123",
                }),
            );

            try {
                await client.get("/articles");
            } catch (e) {
                const err = e as ForemApiError;
                expect(err.requestId).toBe("req-abc-123");
                expect(err.message).toContain("req-abc-123");
            }
        });
    });

    describe("Retry logic", () => {
        it("retries on 500 and succeeds on second attempt", async () => {
            mockFetch
                .mockResolvedValueOnce(jsonResponse({ error: "Internal" }, 500))
                .mockResolvedValueOnce(jsonResponse({ id: 1 }));

            const result = await client.get<{ id: number }>("/articles/1");
            expect(result).toEqual({ id: 1 });
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        it("retries on 429 and succeeds", async () => {
            mockFetch
                .mockResolvedValueOnce(
                    jsonResponse({ error: "Rate Limited" }, 429, { "retry-after": "0" }),
                )
                .mockResolvedValueOnce(jsonResponse([{ id: 1 }]));

            const result = await client.get<Array<{ id: number }>>("/articles");
            expect(result).toEqual([{ id: 1 }]);
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        it("does NOT retry on 400 (not retryable)", async () => {
            mockFetch.mockResolvedValueOnce(
                jsonResponse({ error: "Bad Request" }, 400),
            );

            await expect(client.get("/articles")).rejects.toThrow(ForemApiError);
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it("exhausts retries and throws on persistent 500", async () => {
            mockFetch.mockResolvedValue(
                jsonResponse({ error: "Internal Server Error" }, 500),
            );

            await expect(client.get("/articles")).rejects.toThrow(ForemApiError);
            // 1 initial + 3 retries = 4 calls
            expect(mockFetch).toHaveBeenCalledTimes(4);
        });

        it("retries on network error and succeeds", async () => {
            mockFetch
                .mockRejectedValueOnce(new Error("fetch failed"))
                .mockResolvedValueOnce(jsonResponse({ ok: true }));

            const result = await client.get<{ ok: boolean }>("/test");
            expect(result).toEqual({ ok: true });
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });
    });

    describe("POST and PUT", () => {
        it("sends JSON body on POST", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ id: 42 }));
            await client.post("/articles", { article: { title: "Test" } });
            const init = mockFetch.mock.calls[0][1];
            expect(init.method).toBe("POST");
            expect(JSON.parse(init.body as string)).toEqual({ article: { title: "Test" } });
        });

        it("sends JSON body on PUT", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ id: 42 }));
            await client.put("/articles/42", { article: { title: "Updated" } });
            const init = mockFetch.mock.calls[0][1];
            expect(init.method).toBe("PUT");
            expect(JSON.parse(init.body as string)).toEqual({ article: { title: "Updated" } });
        });

        it("sends POST with query params and no body", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ result: "ok" }));
            await client.post("/reactions/toggle", undefined, {
                reactable_id: 1,
                reactable_type: "Article",
                category: "like",
            });
            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).toContain("reactable_id=1");
            expect(calledUrl).toContain("reactable_type=Article");
            expect(calledUrl).toContain("category=like");
        });
    });
});
