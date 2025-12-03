# Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks.

## Available Hooks

### pre-commit
Runs automatically before each commit:
- Formats code using Biome formatter
- Ensures consistent code style across the codebase

### pre-push
Runs automatically before pushing to remote:
- Runs all tests (`npm run test:run`)
- Builds the project (`npm run build`)
- Prevents pushing if tests fail or build breaks

## Bypassing Hooks

If you need to bypass hooks (use sparingly):
- Skip pre-commit: `git commit --no-verify`
- Skip pre-push: `git push --no-verify`

## Setup

Hooks are automatically installed when you run `npm install` (via the `prepare` script in package.json).

If hooks aren't working, you can manually reinstall them:
```bash
npm run prepare
```
