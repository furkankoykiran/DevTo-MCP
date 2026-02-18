# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-02-18

### Changed
- Enable automated NPM publishing on GitHub Release creation
- Remove manual workflow dispatch for npm-publish

## [1.0.1] - 2026-02-18

### Changed
- Bump version to test GitHub Actions workflows and npm publishing pipeline

## [1.0.0] - 2026-02-18

### Added

- **MCP Server** with 17 tools across 8 domains for the DEV Community (Forem) API
- **Articles**: `get_articles`, `get_article_by_id`, `create_article`, `update_article`, `get_my_articles`
- **Comments**: `get_comments`, `get_comment_by_id`
- **Users**: `get_authenticated_user`, `get_user_by_username`
- **Tags**: `get_tags`, `get_followed_tags`
- **Organizations**: `get_organization`, `get_organization_articles`, `get_organization_users`
- **Reactions**: `toggle_reaction`
- **Reading List**: `get_reading_list`
- **Followers**: `get_followers`
- Robust API client with:
  - Request timeouts (30s default via `AbortSignal`)
  - Automatic retries with exponential backoff for transient errors (429, 5xx)
  - `Retry-After` header respect
  - Rate-limit header extraction and surfacing in errors
  - Structured `ForemApiError` with status, endpoint, method, request-id diagnostics
- TypeScript strict mode with full type definitions
- Zod input validation on all tool parameters
- Unit tests (API client) and integration tests (live API, skipped without key)
- CI/CD workflows: CI (lint, typecheck, test, build), CodeQL, npm publish (manual), stale issues
- Community standards: README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR templates
- MCP client configuration examples for Claude Desktop, Cursor, and VS Code

[1.0.0]: https://github.com/furkankoykiran/DevTo-MCP/releases/tag/v1.0.0
