import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForemApiClient } from "../services/api-client.js";
import type { Follower } from "../types/index.js";

export function registerFollowerTools(server: McpServer, client: ForemApiClient): void {
    server.tool(
        "get_followers",
        "Get the authenticated user's followers on DEV Community. Supports pagination with sort by creation date.",
        {
            page: z.number().int().positive().optional().describe("Pagination page number"),
            per_page: z.number().int().min(1).max(1000).optional().describe("Number of followers per page (default 80)"),
            sort: z.enum(["created_at"]).optional().describe("Sort followers by field"),
        },
        async (params) => {
            try {
                const followers = await client.get<Follower[]>("/followers/users", {
                    page: params.page,
                    per_page: params.per_page,
                    sort: params.sort,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(followers, null, 2) }],
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
