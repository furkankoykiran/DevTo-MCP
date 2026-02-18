import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForemApiClient } from "../services/api-client.js";
import type { ReadingListItem } from "../types/index.js";

export function registerReadingListTools(server: McpServer, client: ForemApiClient): void {
    server.tool(
        "get_reading_list",
        "Get the authenticated user's reading list (bookmarked articles). Supports pagination.",
        {
            page: z.number().int().positive().optional().describe("Pagination page number"),
            per_page: z.number().int().min(1).max(1000).optional().describe("Number of items per page (default 30)"),
        },
        async (params) => {
            try {
                const items = await client.get<ReadingListItem[]>("/readinglist", {
                    page: params.page,
                    per_page: params.per_page,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
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
