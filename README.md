# Commiter - AI-Powered Git Commit Tool

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/zakriyaalisabir.aicommiter)](https://marketplace.visualstudio.com/items?itemName=zakriyaalisabir.aicommiter)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/zakriyaalisabir.aicommiter)](https://marketplace.visualstudio.com/items?itemName=zakriyaalisabir.aicommiter)
[![npm version](https://img.shields.io/npm/v/aicommiter)](https://www.npmjs.com/package/aicommiter)
[![npm downloads](https://img.shields.io/npm/dm/aicommiter)](https://www.npmjs.com/package/aicommiter)

A VS Code extension and CLI tool that generates intelligent git commit messages using OpenAI's GPT models and commits changes automatically.

**🎆 Now available on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=zakriyaalisabir.aicommiter) and [NPM Registry](https://www.npmjs.com/package/aicommiter)!**

## ✨ Features

- 🤖 **AI-Generated Commits** - Uses OpenAI GPT to analyze git diffs and generate conventional commit messages
- 🎯 **VS Code Integration** - Sidebar panel with one-click commit generation
- 💻 **CLI Tool** - Use from terminal with various options
- 🔧 **Smart Configuration** - Stores API key, model, and token settings
- 📋 **Staged Files Control** - Only commits pre-staged files with user confirmation
- 🎨 **Beautiful Logging** - Formatted console output with progress indicators
- ⚡ **Multiple Models** - Supports GPT-4o, GPT-4o-mini, GPT-3.5-turbo, and GPT-5-nano

## 🚀 Installation

### VS Code Marketplace (Recommended)
1. Open VS Code → Extensions (`Cmd+Shift+X`)
2. Search for "**AI Commiter**" by zakriyaalisabir
3. Click **Install**
4. **Restart VS Code** after installation

### NPM Registry (Global CLI)
```bash
npm install -g aicommiter
```
Installs the CLI tool globally from npm registry.

### Local Development
```bash
npm install -g .
```
This installs both the CLI tool and VS Code extension from source.

### Manual VSIX Installation
1. Download `commiter-1.0.0.vsix`
2. Open VS Code → Extensions (`Cmd+Shift+X`)
3. Click "..." menu → "Install from VSIX..."
4. Select the `commiter-1.0.0.vsix` file
5. **Restart VS Code** after installation
6. Commands are available via Command Palette (`Cmd+Shift+P`)

## 🎮 Usage

### VS Code Extension

1. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. **Type "Commiter"** to see available commands:
   - **Commiter: Generate Commit** - Analyze staged files and commit
   - **Commiter: Show Config** - View current settings
   - **Commiter: Configure** - Set API key, model, and tokens

#### Quick Setup:
1. Stage your files (`git add <files>`)
2. Run **Commiter: Generate Commit**
3. Configure API key and model when prompted
4. Review and confirm the generated commit message

### CLI Tool

```bash
# Basic usage - generates commit message from staged files
commiter

# Custom commit message
commiter -m "feat: add new feature"

# Stage all files before committing
commiter --add

# Push after committing
commiter --push

# Show current configuration
commiter --config

# Configure settings interactively
commiter --configure
```

## ⚙️ Configuration

### First Time Setup
The tool will prompt you to configure:
- **OpenAI API Key** - Your OpenAI API key
- **Model** - Choose from gpt-4o-mini, gpt-4o, gpt-3.5-turbo, gpt-5-nano
- **Max Tokens** - Token limit for generated messages (default: 150)

Settings are saved to `~/.commiter-config.json`

### Supported Models
- **gpt-4o-mini** - Fast and cost-effective
- **gpt-4o** - Most capable model
- **gpt-3.5-turbo** - Good balance of speed and quality
- **gpt-5-nano** - Latest reasoning model (optimized settings)

## 🔄 Workflow

1. **Stage your files** (`git add <files>`)
2. **Run commiter** (CLI or VS Code)
3. **Confirm staged files** - Review what will be committed
4. **AI generates message** - Based on actual git diff
5. **Edit if needed** - Modify the generated message
6. **Confirm commit** - Final approval before committing

## 📊 Console Output

Beautiful formatted logging shows:

```
════════════════════════════════════════════════════════════

🔹 OpenAI API Request
────────────────────────────────────────
ℹ️  Model: gpt-4o-mini
ℹ️  Max Tokens: 150
ℹ️  Sending request to OpenAI...

🔹 OpenAI API Response
────────────────────────────────────────
ℹ️  Prompt tokens: 248
ℹ️  Completion tokens: 25
ℹ️  Total tokens: 273

🔹 Generated Commit Message
────────────────────────────────────────
✅ "feat(auth): add user authentication system"

════════════════════════════════════════════════════════════
```

## 🛠️ CLI Options

| Option | Description |
|--------|-------------|
| `-m, --message <msg>` | Custom commit message |
| `--add` | Stage all changes before committing |
| `--push` | Push after committing |
| `--config` | Show current configuration |
| `--configure` | Interactive configuration setup |
| `-h, --help` | Show help message |

## 🔒 Security

- API keys are stored locally in `~/.commiter-config.json`
- Only staged files are analyzed and committed
- User confirmation required at each step
- No data sent to external services except OpenAI API

## 📝 Conventional Commits

Generated messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run build`
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.

## 🆘 Troubleshooting

### VS Code Extension Not Working
- **Restart VS Code** completely after installation
- Check Extensions panel (`Cmd+Shift+X`) - ensure "AI Commiter" is enabled
- Try `Cmd+Shift+P` → "Developer: Reload Window"
- Commands are accessed via Command Palette, not sidebar
- Ensure you're in a git repository with staged files
- If installed from Marketplace, updates are automatic

### Empty Commit Messages
- Ensure you have a valid OpenAI API key
- Check your API key has available credits
- Try a different model (gpt-4o-mini is most reliable)

### CLI Command Not Found
- For npm registry: `npm install -g aicommiter`
- For local development: `npm install -g .`
- Check your PATH includes npm global binaries
- Try `npx aicommiter` as alternative

---

Made with ❤️ for developers who want smarter git commits.