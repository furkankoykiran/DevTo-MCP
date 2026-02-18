#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
    const apiKey = process.env.DEVTO_API_KEY;

    if (!apiKey) {
        console.error("Error: DEVTO_API_KEY environment variable is required.");
        console.error("Get your API key from: https://dev.to/settings/extensions");
        process.exit(1);
    }

    const server = createServer(apiKey);
    const transport = new StdioServerTransport();

    await server.connect(transport);
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
