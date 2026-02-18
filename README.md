# DevTo-MCP

A production-ready [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for the [DEV Community](https://dev.to) (Forem) API. Manage articles, comments, users, tags, organizations, and more through any MCP-compatible client.

[![CI](https://github.com/furkankoykiran/DevTo-MCP/actions/workflows/ci.yml/badge.svg)](https://github.com/furkankoykiran/DevTo-MCP/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/devto-mcp.svg)](https://www.npmjs.com/package/devto-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org)

## Quick Start

### Install in VS Code

Install the DevTo MCP server in VS Code with one click:

[<img alt="Install in VS Code" src="https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=for-the-badge&logo=visualstudiocode&logoColor=white" />](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22devto%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22devto-mcp%22%5D%2C%22env%22%3A%7B%22DEVTO_API_KEY%22%3A%22YOUR_API_KEY%22%7D%7D)

> **Note:** After installing, replace `YOUR_API_KEY` with your actual DEV Community API key from [dev.to/settings/extensions](https://dev.to/settings/extensions).

### Install in Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "devto": {
      "command": "npx",
      "args": ["-y", "devto-mcp"],
      "env": {
        "DEVTO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Install in Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "devto": {
      "command": "npx",
      "args": ["-y", "devto-mcp"],
      "env": {
        "DEVTO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Features

- **17 tools** across 8 domains for comprehensive DEV Community interaction
- Full [Forem API V1](https://developers.forem.com/api/v1) support with proper authentication headers
- **Robust API client** with request timeouts, automatic retries with exponential backoff, and rate-limit awareness
- Written in TypeScript with strict type safety
- Zod input validation on all tool parameters
- Structured error messages with status codes, endpoints, and request IDs
- Zero external HTTP dependencies (uses native `fetch`)

## Prerequisites

- **Node.js** 18 or higher
- **DEV Community API Key** — Get yours at [dev.to/settings/extensions](https://dev.to/settings/extensions)

## Installation

### Using npx (recommended)

```bash
DEVTO_API_KEY=your_key npx devto-mcp
```

### Global install

```bash
npm install -g devto-mcp
```

### From source

```bash
git clone https://github.com/furkankoykiran/DevTo-MCP.git
cd DevTo-MCP
npm install
npm run build
```

## Configuration

Set your DEV Community API key as an environment variable:

```bash
export DEVTO_API_KEY=your_api_key_here
```

## Available Tools

### Articles

| Tool | Description |
|------|-------------|
| `get_articles` | List published articles with filters (tag, username, state, top, pagination) |
| `get_article_by_id` | Get full article details by numeric ID |
| `create_article` | Create a new article or draft |
| `update_article` | Update an existing article |
| `get_my_articles` | Get authenticated user's articles (published, unpublished, or all) |

### Comments

| Tool | Description |
|------|-------------|
| `get_comments` | Get threaded comments for an article or podcast episode |
| `get_comment_by_id` | Get a single comment by ID code |

### Users

| Tool | Description |
|------|-------------|
| `get_authenticated_user` | Get the authenticated user's profile |
| `get_user_by_username` | Get any user's public profile |

### Tags

| Tool | Description |
|------|-------------|
| `get_tags` | List available tags with pagination |
| `get_followed_tags` | Get tags followed by the authenticated user |

### Organizations

| Tool | Description |
|------|-------------|
| `get_organization` | Get organization details by username |
| `get_organization_articles` | List an organization's published articles |
| `get_organization_users` | List users in an organization |

### Reactions

| Tool | Description |
|------|-------------|
| `toggle_reaction` | Toggle a reaction (like, unicorn, readinglist, etc.) on an article or comment |

### Reading List

| Tool | Description |
|------|-------------|
| `get_reading_list` | Get the authenticated user's bookmarked articles |

### Followers

| Tool | Description |
|------|-------------|
| `get_followers` | Get the authenticated user's followers |

## Error Handling & Resilience

The API client includes production-grade resilience features:

- **Timeouts**: All requests have a 30-second timeout via `AbortSignal`
- **Retries**: Automatic retry with exponential backoff (1s → 2s → 4s) for transient errors (HTTP 429, 5xx)
- **Rate Limiting**: Respects `Retry-After` headers; surfaces `x-ratelimit-remaining` in error messages
- **Structured Errors**: `ForemApiError` includes status code, endpoint, HTTP method, request ID, and rate-limit info

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEVTO_API_KEY` | Yes | Your DEV Community API key |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint

# Type check
npm run typecheck

# Unit tests
npm test

# Integration tests (requires DEVTO_API_KEY)
DEVTO_API_KEY=your_key npm run test:integration

# Run locally
DEVTO_API_KEY=your_key node dist/index.js
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

For security concerns, please see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [DEV Community](https://dev.to) for their excellent API
- [Model Context Protocol](https://modelcontextprotocol.io) for the MCP standard
- [Forem](https://forem.com) for the open-source platform