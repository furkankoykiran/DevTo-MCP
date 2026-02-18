import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForemApiClient } from "../services/api-client.js";
import type { Comment } from "../types/index.js";

export function registerCommentTools(server: McpServer, client: ForemApiClient): void {
    server.tool(
        "get_comments",
        "Get comments for an article or podcast episode as threaded conversations. Returns top-level comments with nested replies.",
        {
            a_id: z.number().int().optional().describe("Article ID to get comments for"),
            p_id: z.number().int().optional().describe("Podcast episode ID to get comments for"),
        },
        async (params) => {
            try {
                if (!params.a_id && !params.p_id) {
                    return {
                        content: [{ type: "text", text: "Error: Either a_id (article ID) or p_id (podcast episode ID) must be provided." }],
                        isError: true,
                    };
                }

                const comments = await client.get<Comment[]>("/comments", {
                    a_id: params.a_id,
                    p_id: params.p_id,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
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
        "get_comment_by_id",
        "Get a single comment by its ID code. Returns the comment with its nested replies.",
        {
            id: z.string().describe("The ID code of the comment (alphanumeric string)"),
        },
        async (params) => {
            try {
                const comment = await client.get<Comment>(`/comments/${params.id}`);
                return {
                    content: [{ type: "text", text: JSON.stringify(comment, null, 2) }],
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
