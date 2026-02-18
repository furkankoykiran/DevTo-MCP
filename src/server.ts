import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForemApiClient } from "./services/api-client.js";
import { registerArticleTools } from "./tools/articles.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerUserTools } from "./tools/users.js";
import { registerTagTools } from "./tools/tags.js";
import { registerOrganizationTools } from "./tools/organizations.js";
// import { registerReactionTools } from "./tools/reactions.js";
import { registerReadingListTools } from "./tools/reading-list.js";
import { registerFollowerTools } from "./tools/followers.js";

const SERVER_NAME = "devto-mcp";
const SERVER_VERSION = "1.0.0";

export function createServer(apiKey: string): McpServer {
    const server = new McpServer({
        name: SERVER_NAME,
        version: SERVER_VERSION,
    });

    const client = new ForemApiClient(apiKey);

    registerArticleTools(server, client);
    registerCommentTools(server, client);
    registerUserTools(server, client);
    registerTagTools(server, client);
    registerOrganizationTools(server, client);
    // registerReactionTools(server, client); // Disabled due to API 401 issues
    registerReadingListTools(server, client);
    registerFollowerTools(server, client);

    return server;
}
