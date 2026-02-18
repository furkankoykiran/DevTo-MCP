import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForemApiClient } from "../services/api-client.js";
import type { Tag, FollowedTag } from "../types/index.js";

export function registerTagTools(server: McpServer, client: ForemApiClient): void {
    server.tool(
        "get_tags",
        "List available tags from DEV Community with pagination.",
        {
            page: z.number().int().positive().optional().describe("Pagination page number"),
            per_page: z.number().int().min(1).max(1000).optional().describe("Number of tags per page (default 10)"),
        },
        async (params) => {
            try {
                const tags = await client.get<Tag[]>("/tags", {
                    page: params.page,
                    per_page: params.per_page,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(tags, null, 2) }],
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        "get_followed_tags",
        "Get the tags followed by the authenticated user.",
        {},
        async () => {
            try {
                const tags = await client.get<FollowedTag[]>("/follows/tags");
                return {
                    content: [{ type: "text", text: JSON.stringify(tags, null, 2) }],
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
                    isError: true,
                };
            }
        }
    );
}
