import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForemApiClient } from "../services/api-client.js";
import type { Article } from "../types/index.js";

export function registerArticleTools(server: McpServer, client: ForemApiClient): void {
    server.tool(
        "get_articles",
        "List published articles from DEV Community with optional filters. Returns articles ordered by descending popularity by default.",
        {
            page: z.number().int().positive().optional().describe("Pagination page number"),
            per_page: z.number().int().min(1).max(1000).optional().describe("Number of articles per page (default 30, max 1000)"),
            tag: z.string().optional().describe("Filter by tag name"),
            tags: z.string().optional().describe("Comma-separated list of tags to filter by (any match)"),
            tags_exclude: z.string().optional().describe("Comma-separated list of tags to exclude"),
            username: z.string().optional().describe("Filter by author username"),
            state: z.enum(["fresh", "rising", "all"]).optional().describe("Article state filter"),
            top: z.number().int().positive().optional().describe("Return most popular articles in the last N days"),
            collection_id: z.number().int().optional().describe("Filter by collection ID"),
        },
        async (params) => {
            try {
                const articles = await client.get<Article[]>("/articles", {
                    page: params.page,
                    per_page: params.per_page,
                    tag: params.tag,
                    tags: params.tags,
                    tags_exclude: params.tags_exclude,
                    username: params.username,
                    state: params.state,
                    top: params.top,
                    collection_id: params.collection_id,
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
        "get_article_by_id",
        "Get a published article by its numeric ID. Returns full article details including body content.",
        {
            id: z.number().int().positive().describe("The numeric ID of the article"),
        },
        async (params) => {
            try {
                const article = await client.get<Article>(`/articles/${params.id}`);
                return {
                    content: [{ type: "text", text: JSON.stringify(article, null, 2) }],
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
        "create_article",
        "Create a new article on DEV Community. Set published to false to save as draft.",
        {
            title: z.string().describe("Title of the article"),
            body_markdown: z.string().optional().describe("Article content in markdown format"),
            published: z.boolean().optional().describe("Whether to publish immediately (false = draft)"),
            tags: z.array(z.string()).max(4).optional().describe("List of tags (max 4)"),
            series: z.string().optional().describe("Article series name"),
            canonical_url: z.string().url().optional().describe("Original URL if cross-posting"),
            description: z.string().optional().describe("Short description for the article"),
            main_image: z.string().url().optional().describe("Main cover image URL"),
            organization_id: z.number().int().optional().describe("Organization ID to publish under"),
        },
        async (params) => {
            try {
                const article = await client.post<Article>("/articles", {
                    article: {
                        title: params.title,
                        body_markdown: params.body_markdown,
                        published: params.published,
                        tags: params.tags,
                        series: params.series,
                        canonical_url: params.canonical_url,
                        description: params.description,
                        main_image: params.main_image,
                        organization_id: params.organization_id,
                    },
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(article, null, 2) }],
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
        "update_article",
        "Update an existing article by its ID. Only include fields you want to change.",
        {
            id: z.number().int().positive().describe("The numeric ID of the article to update"),
            title: z.string().optional().describe("New title"),
            body_markdown: z.string().optional().describe("New content in markdown"),
            published: z.boolean().optional().describe("Publish or unpublish the article"),
            tags: z.array(z.string()).max(4).optional().describe("New tags (max 4)"),
            series: z.string().nullable().optional().describe("Series name (null to remove from series)"),
            canonical_url: z.string().url().optional().describe("New canonical URL"),
            description: z.string().optional().describe("New description"),
            main_image: z.string().url().optional().describe("New cover image URL"),
            organization_id: z.number().int().optional().describe("Organization ID"),
        },
        async (params) => {
            try {
                const { id, ...updateFields } = params;
                const article = await client.put<Article>(`/articles/${id}`, {
                    article: updateFields,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(article, null, 2) }],
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
        "get_my_articles",
        "Get the authenticated user's own articles. Can filter by published, unpublished, or all.",
        {
            page: z.number().int().positive().optional().describe("Pagination page number"),
            per_page: z.number().int().min(1).max(1000).optional().describe("Number of articles per page"),
            status: z.enum(["published", "unpublished", "all"]).optional().describe("Filter by article status (default: all)"),
        },
        async (params) => {
            try {
                const status = params.status || "all";
                let path: string;

                switch (status) {
                    case "published":
                        path = "/articles/me/published";
                        break;
                    case "unpublished":
                        path = "/articles/me/unpublished";
                        break;
                    default:
                        path = "/articles/me/all";
                }

                const articles = await client.get<Article[]>(path, {
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
}
