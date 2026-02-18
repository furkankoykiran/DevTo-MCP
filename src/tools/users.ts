import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForemApiClient } from "../services/api-client.js";
import type { User } from "../types/index.js";

export function registerUserTools(server: McpServer, client: ForemApiClient): void {
    server.tool(
        "get_authenticated_user",
        "Get the profile of the currently authenticated DEV Community user (the owner of the API key).",
        {},
        async () => {
            try {
                const user = await client.get<User>("/users/me");
                return {
                    content: [{ type: "text", text: JSON.stringify(user, null, 2) }],
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
        "get_user_by_username",
        "Get a user's public profile by their username or numeric ID.",
        {
            username: z.string().describe("Username or numeric user ID"),
        },
        async (params) => {
            try {
                const user = await client.get<User>(`/users/by_username`, {
                    url: params.username,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(user, null, 2) }],
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
