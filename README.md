# Commiter - AI-Powered Git Commit Tool

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/zakriyaalisabir.aicommiter)](https://marketplace.visualstudio.com/items?itemName=zakriyaalisabir.aicommiter)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/zakriyaalisabir.aicommiter)](https://marketplace.visualstudio.com/items?itemName=zakriyaalisabir.aicommiter)
[![npm version](https://img.shields.io/npm/v/aicommiter)](https://www.npmjs.com/package/aicommiter)
[![npm downloads](https://img.shields.io/npm/dm/aicommiter)](https://www.npmjs.com/package/aicommiter)

A VS Code extension and CLI tool that generates intelligent git commit messages using OpenAI's GPT models and commits changes automatically.

**🎆 Now available on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=zakriyaalisabir.aicommiter) and [NPM Registry](https://www.npmjs.com/package/aicommiter)!**

## ✨ Features

- 🤖 **AI-Generated Commits** - Uses OpenAI GPT to analyze git diffs and generate conventional commit messages
- 🎯 **VS Code Integration** - Command palette integration with one-click commit generation
- 💻 **Enhanced CLI Tool** - Beautiful colored output with spinners and progress indicators
- 🔧 **Advanced Configuration** - Comprehensive settings for API, models, costs, and parameters
- 📋 **Staged Files Control** - Only commits pre-staged files with user confirmation
- 📊 **Token Usage Tracking** - Real-time display of input, output, cached, and reasoning tokens
- 💰 **Cost Tracking** - Automatic job logging with configurable token costs
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
1. Download `commiter-2.0.1.vsix`
2. Open VS Code → Extensions (`Cmd+Shift+X`)
3. Click "..." menu → "Install from VSIX..."
4. Select the `commiter-2.0.1.vsix` file
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
commiter configure --show
commiter configure -o

# Configure settings interactively
commiter configure

# Show usage history and statistics
commiter usage
commiter usage --limit 20
```

## ⚙️ Configuration

### Comprehensive Setup
Run `commiter configure` to set up:

**API Settings:**
- **OpenAI API Key** - Your OpenAI API key
- **Model** - Choose from gpt-4o-mini, gpt-4o, gpt-3.5-turbo, gpt-5-nano
- **Max Tokens** - Token limit for generated messages (default: 150)

**Cost Tracking:**
- **Input Token Cost** - Cost per 1M input tokens (default: 0.15)
- **Output Token Cost** - Cost per 1M output tokens (default: 0.6)
- **Cached Token Cost** - Cost per 1M cached tokens (default: 0.075)

**Model Parameters:**
- **Service Tier** - OpenAI service tier (e.g., 'flex')
- **Reasoning Effort** - For reasoning models (e.g., 'low', 'medium', 'high')
- **Temperature** - Creativity level (0.0-2.0)
- **Verbosity** - Response verbosity level

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

## 📊 Enhanced CLI Output

Beautiful colored output with spinners:

```
🚀 AI Commiter

📁 Staged files:
   1. src/auth.js
   2. src/config.js
   3. package.json
OK with these staged files? (Y/n): 
⠋ Generating commit message using gpt-5-nano...
✔ Commit message generated

📊 Token Usage:
   Input: 423
   Output: 217
   Cached: 0
   Reasoning: 192
   Total: 640

💬 Commit message: "feat(auth): add user authentication system"
Proceed with commit? (Y/n): 
⠋ Creating commit...
✔ Commit created successfully

✅ Done!
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

## 📈 Usage Tracking

Automatic job logging tracks:
- **Token Usage** - Input, output, cached, and reasoning tokens
- **Cost Calculation** - Based on your configured token costs
- **Model Performance** - Track usage across different models
- **History** - All jobs saved to `~/.commiter-jobs.json`

### View Usage History
```bash
commiter usage          # Show last 10 jobs
commiter usage --limit 20   # Show last 20 jobs
```

**Sample Output:**
```
📈 Usage History

┌─────────┬────────────────────┬─────────────────────┬────────────────────────────┬─────────────┬──────────────┬──────────────┬─────────────┬─────────────────────────┬──────────────┐
│ (index) │ id                 │ name                │ timestamp                  │ inputTokens │ outputTokens │ cachedTokens │ totalTokens │ cost                    │ model        │
├─────────┼────────────────────┼─────────────────────┼────────────────────────────┼─────────────┼──────────────┼──────────────┼─────────────┼─────────────────────────┼──────────────┤
│ 0       │ '9d86c2749f24bd87' │ 'commit-generation' │ '2025-08-15T17:27:27.645Z' │ 708         │ 235          │ 0            │ 943         │ 0.0000647               │ 'gpt-5-nano' │
│ 1       │ 'f8204931a75940f6' │ 'commit-generation' │ '2025-08-15T17:25:55.970Z' │ 423         │ 157          │ 0            │ 580         │ 0.000041975             │ 'gpt-5-nano' │
│ 2       │ 'd30693ab15e1a30e' │ 'commit-generation' │ '2025-08-15T17:21:40.296Z' │ 423         │ 217          │ 0            │ 640         │ 0.000053975             │ 'gpt-5-nano' │
└─────────┴────────────────────┴─────────────────────┴────────────────────────────┴─────────────┴──────────────┴──────────────┴─────────────┴─────────────────────────┴──────────────┘

📊 Summary
Total Jobs: 9
Total Cost: $0.0007
Total Tokens: 17555
```

## 🔒 Security

- API keys are stored locally in `~/.commiter-config.json`
- Job history stored locally in `~/.commiter-jobs.json`
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