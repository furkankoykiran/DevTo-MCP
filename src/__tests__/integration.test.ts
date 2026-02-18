import { describe, it, expect } from "vitest";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createServer } from "../server.js";

const DEVTO_API_KEY = process.env.DEVTO_API_KEY;

/**
 * Integration tests that call the live DEV Community API.
 * These are skipped when DEVTO_API_KEY is not set.
 */
describe.skipIf(!DEVTO_API_KEY)("Integration: Live API", () => {
    let mcpClient: Client;

    async function setup() {
        const server = createServer(DEVTO_API_KEY!);
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

        mcpClient = new Client({ name: "integration-test", version: "1.0.0" });
        await Promise.all([
            mcpClient.connect(clientTransport),
            server.connect(serverTransport),
        ]);
    }

    async function callTool(name: string, args: Record<string, unknown> = {}): Promise<{
        text: string;
        isError: boolean;
    }> {
        const result = await mcpClient.callTool({ name, arguments: args });
        const content = result.content as Array<{ type: string; text: string }>;
        return {
            text: content[0].text,
            isError: (result.isError as boolean) || false,
        };
    }

    it("lists all 17 tools", async () => {
        await setup();
        const tools = await mcpClient.listTools();
        expect(tools.tools.length).toBe(17);
    }, 60_000);

    it("get_authenticated_user returns user profile", async () => {
        await setup();
        const result = await callTool("get_authenticated_user");
        expect(result.isError).toBe(false);
        const user = JSON.parse(result.text);
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("id");
    }, 60_000);

    it("get_articles returns articles array", async () => {
        await setup();
        const result = await callTool("get_articles", { per_page: 2 });
        expect(result.isError).toBe(false);
        const articles = JSON.parse(result.text);
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeLessThanOrEqual(2);
    }, 60_000);

    it("get_tags returns tags array", async () => {
        await setup();
        const result = await callTool("get_tags", { per_page: 3 });
        expect(result.isError).toBe(false);
        const tags = JSON.parse(result.text);
        expect(Array.isArray(tags)).toBe(true);
        expect(tags.length).toBeGreaterThan(0);
    }, 60_000);

    it("get_my_articles returns user's articles", async () => {
        await setup();
        const result = await callTool("get_my_articles", { status: "all", per_page: 2 });
        expect(result.isError).toBe(false);
        const articles = JSON.parse(result.text);
        expect(Array.isArray(articles)).toBe(true);
    }, 60_000);

    it("get_followed_tags returns followed tags", async () => {
        await setup();
        const result = await callTool("get_followed_tags");
        expect(result.isError).toBe(false);
        const tags = JSON.parse(result.text);
        expect(Array.isArray(tags)).toBe(true);
    }, 60_000);

    it("get_user_by_username returns user profile", async () => {
        await setup();
        const result = await callTool("get_user_by_username", { username: "ben" });
        expect(result.isError).toBe(false);
        const user = JSON.parse(result.text);
        expect(user).toHaveProperty("username");
    }, 60_000);

    it("get_reading_list returns reading list", async () => {
        await setup();
        const result = await callTool("get_reading_list", { per_page: 2 });
        expect(result.isError).toBe(false);
        const items = JSON.parse(result.text);
        expect(Array.isArray(items)).toBe(true);
    }, 60_000);
});
