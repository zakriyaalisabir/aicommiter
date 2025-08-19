# Changelog

All notable changes to this project will be documented in this file.

## [2.0.1] - 2025-01-20

### Fixed
- **TypeScript Configuration** - Added `esModuleInterop` and `allowSyntheticDefaultImports` flags to resolve module import issues
- **Build Compatibility** - Fixed figlet and other CommonJS module imports for better cross-platform compatibility

### Technical
- **Module Resolution** - Enhanced TypeScript configuration for better module interoperability
- **Dependencies** - Updated to include figlet and gradient-string for enhanced CLI visuals

## [2.0.0] - 2025-01-20

### Added
- **Enhanced CLI with Beautiful UI** - Colored output with chalk, spinners with ora, and progress indicators
- **Advanced Configuration System** - Comprehensive settings for API, models, costs, and parameters
- **Token Usage Tracking** - Real-time display of input, output, cached, and reasoning tokens
- **Cost Tracking & Job Logging** - Automatic job logging with configurable token costs saved to `~/.commiter-jobs.json`
- **Usage History Command** - `commiter usage` displays job history in beautiful table format
- **Extended Model Parameters** - Support for service tier, reasoning effort, temperature, and verbosity
- **Command Structure Improvements** - Better organized commands with `configure --show` and `usage --limit`

### Changed
- **VS Code Integration** - Moved from sidebar to Command Palette integration
- **CLI Command Structure** - Consolidated configuration commands and improved help text
- **Token Display** - Enhanced token usage display with cached and reasoning token breakdown
- **Configuration Management** - Extended config to include cost tracking and model parameters

### Enhanced
- **User Experience** - Staged files now display as ordered list instead of comma-separated
- **Error Handling** - Better fallback mechanisms and user feedback
- **Documentation** - Comprehensive README updates with usage examples and troubleshooting

### Technical
- **Dependencies** - Added chalk (^5.5.0), commander (^14.0.0), and ora (^8.2.0) for better CLI experience
- **Job Tracking System** - Complete usage analytics with cost calculation and history storage
- **Configuration Schema** - Extended to support all OpenAI API parameters and cost tracking

## [1.2.0] - 2024-12-15

### Added
- **Multiple Model Support** - Added support for GPT-5-nano with optimized settings
- **NPM Registry Publication** - Available as global CLI tool via `npm install -g aicommiter`
- **Enhanced Error Handling** - Better fallback commit message generation

### Changed
- **Model Selection** - Updated VS Code extension to include gpt-5-nano option
- **API Integration** - Improved OpenAI API parameter handling

## [1.1.0] - 2024-11-20

### Added
- **VS Code Marketplace** - Published extension to VS Code Marketplace
- **Configuration Persistence** - Settings saved to `~/.commiter-config.json`
- **Interactive Setup** - First-time configuration prompts

### Changed
- **Installation Methods** - Multiple installation options including marketplace and manual VSIX

## [1.0.0] - 2024-10-15

### Added
- **Initial Release** - AI-powered git commit message generation
- **VS Code Extension** - Sidebar integration with commit generation
- **CLI Tool** - Terminal-based commit message generation
- **OpenAI Integration** - Support for GPT-4o, GPT-4o-mini, and GPT-3.5-turbo
- **Conventional Commits** - Automatic generation following conventional commit standards
- **Staged Files Control** - Only commits pre-staged files with user confirmation
- **Basic Configuration** - API key, model, and token limit settings

### Features
- Git diff analysis for intelligent commit message generation
- User confirmation at each step for safety
- Fallback commit message generation when AI fails
- Cross-platform support (macOS, Linux, Windows)