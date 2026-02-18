# Contributing to DevTo-MCP

Thank you for your interest in contributing to DevTo-MCP! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/DevTo-MCP.git
   cd DevTo-MCP
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes in the `src/` directory
2. Build the project: `npm run build`
3. Lint your code: `npm run lint`
4. Test your changes locally with a DEV Community API key

## Code Style

- Follow the existing TypeScript patterns in the codebase
- Use strict TypeScript types — avoid `any`
- Include proper error handling in all tool handlers
- Write descriptive tool descriptions for MCP clients

## Pull Request Process

1. Ensure your code builds without errors (`npm run build`)
2. Ensure linting passes (`npm run lint`)
3. Update the README.md if you add new tools or change functionality
4. Fill out the pull request template completely
5. Request a review from a maintainer

## Adding New Tools

When adding a new MCP tool:

1. Create or update the appropriate file in `src/tools/`
2. Add necessary TypeScript interfaces in `src/types/index.ts`
3. Register the tool in `src/server.ts`
4. Update the tools table in `README.md`
5. Test thoroughly with real API calls

## Reporting Issues

- Use the provided issue templates
- Include steps to reproduce the issue
- Include relevant error messages and logs
- Specify your Node.js version and operating system

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
