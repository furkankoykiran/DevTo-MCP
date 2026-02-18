import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForemApiClient } from "../services/api-client.js";
import type { Reaction } from "../types/index.js";

export function registerReactionTools(server: McpServer, client: ForemApiClient): void {
    server.tool(
        "toggle_reaction",
        "Toggle a reaction on an article or comment. Calling it once adds the reaction, calling it again removes it. Categories: like, unicorn, readinglist, thumbsup, thumbsdown, vomit, raised_hand, fire.",
        {
            reactable_id: z.number().int().positive().describe("ID of the article or comment to react to"),
            reactable_type: z.enum(["Article", "Comment", "User"]).describe("Type of the reactable entity"),
            category: z.enum(["like", "unicorn", "readinglist", "thumbsup", "thumbsdown", "vomit", "raised_hand", "fire"]).describe("Reaction category"),
        },
        async (params) => {
            try {
                const reaction = await client.post<Reaction>("/reactions/toggle", undefined, {
                    reactable_id: params.reactable_id,
                    reactable_type: params.reactable_type,
                    category: params.category,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(reaction, null, 2) }],
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
