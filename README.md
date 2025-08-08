# Commiter - VS Code Extension & CLI

A VS Code extension and CLI tool for generating git commit messages and committing changes via the git CLI.

## Features

- **VS Code Extension**: Generate and commit with a single command
- **CLI Tool**: Use from terminal with various options
- **Auto-staging**: Automatically stages all changes before committing
- **Smart commit messages**: Generates descriptive commit messages based on file changes

## Installation

### As VS Code Extension

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Developer: Install Extension from Location"
4. Select this folder

### As CLI Tool

```bash
npm install -g .
```

## Usage

### VS Code Extension

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Commiter: Generate Git Commit"
3. Edit the generated commit message if needed
4. Press Enter to commit

### CLI Tool

```bash
# Basic usage - auto-generate commit message
commiter

# Custom commit message
commiter -m "feat: add new feature"

# Don't auto-stage files
commiter --no-add

# Push after committing
commiter --push

# Limit files in auto-generated message
commiter --max-files 3
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch for changes
npm run watch
```