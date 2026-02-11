# AGENTS.md - Development Guidelines for MCP TortoiseSVN

## Project Overview
MCP server providing TortoiseSVN integration for Windows environments.

## Build Commands

```bash
# Install dependencies
npm install

# Development build with watch
npm run dev

# Production build
npm run build

# Type check only
npm run typecheck
```

## Test Commands

```bash
# Run all tests
npm test

# Run single test file
npm test -- src/path/to/test.test.ts

# Run tests matching pattern
npm test -- --grep "pattern"

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Lint/Format Commands

```bash
# Lint all files
npm run lint

# Lint with auto-fix
npm run lint:fix

# Format with Prettier
npm run format

# Check formatting
npm run format:check
```

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- No `any` types - use `unknown` with type guards
- Explicit return types on public functions
- Interface over type for object shapes

### Imports
```typescript
// Order: built-in → external → internal → relative
import { spawn } from 'child_process';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SVNCommandBuilder } from './command-builder.js';
import { normalizePath } from '../utils/path.js';
```

### Naming Conventions
- PascalCase: classes, interfaces, types, enums
- camelCase: variables, functions, methods, properties
- SCREAMING_SNAKE_CASE: constants
- kebab-case: file names

### Error Handling
```typescript
// Use custom error classes
class SVNError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.name = 'SVNError';
  }
}

// Always handle errors explicitly
try {
  await executeSVNCommand(args);
} catch (error) {
  if (error instanceof SVNError) {
    logger.error(`SVN failed: ${error.message}`);
    throw error;
  }
  throw new SVNError('Unexpected error', 1);
}
```

### MCP Patterns
- Use `@modelcontextprotocol/sdk` for server/client
- Implement tools with descriptive names
- Return structured JSON in tool responses
- Validate all inputs with Zod schemas

### File Structure
```
src/
  index.ts           # Entry point
  server.ts          # MCP server setup
  tools/             # Tool implementations
    svn-*.ts         # SVN command tools
  utils/             # Shared utilities
  types/             # Type definitions
tests/
  *.test.ts          # Test files mirror src structure
```

### Key Principles
1. Always use `.js` extension in imports (ESM requirement)
2. Prefer async/await over callbacks
3. Log using structured logger
4. Handle Windows path separators correctly
5. Test on Windows with actual TortoiseSVN
6. Document tool parameters in JSDoc
7. Always check TortoiseSVN commands in https://tortoisesvn.net/docs/release/TortoiseSVN_en/tsvn-automation.html
