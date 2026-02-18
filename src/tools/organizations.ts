import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForemApiClient } from "../services/api-client.js";
import type { Organization, Article, User } from "../types/index.js";

export function registerOrganizationTools(server: McpServer, client: ForemApiClient): void {
    server.tool(
        "get_organization",
        "Get details about a DEV Community organization by its username/slug.",
        {
            username: z.string().describe("Organization username or slug"),
        },
        async (params) => {
            try {
                const org = await client.get<Organization>(`/organizations/${params.username}`);
                return {
                    content: [{ type: "text", text: JSON.stringify(org, null, 2) }],
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
        "get_organization_articles",
        "Get articles published by an organization on DEV Community.",
        {
            username: z.string().describe("Organization username or slug"),
            page: z.number().int().positive().optional().describe("Pagination page number"),
            per_page: z.number().int().min(1).max(1000).optional().describe("Number of articles per page"),
        },
        async (params) => {
            try {
                const articles = await client.get<Article[]>(`/organizations/${params.username}/articles`, {
                    page: params.page,
                    per_page: params.per_page,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(articles, null, 2) }],
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
        "get_organization_users",
        "Get users who belong to a DEV Community organization.",
        {
            username: z.string().describe("Organization username or slug"),
            page: z.number().int().positive().optional().describe("Pagination page number"),
            per_page: z.number().int().min(1).max(1000).optional().describe("Number of users per page"),
        },
        async (params) => {
            try {
                const users = await client.get<User[]>(`/organizations/${params.username}/users`, {
                    page: params.page,
                    per_page: params.per_page,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(users, null, 2) }],
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
