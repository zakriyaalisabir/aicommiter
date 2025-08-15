#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { spawnSync } from 'child_process';
import { generateCommitMessage, generateCommitMessageSync } from './generateMessage';
import * as readline from 'readline';
import { getApiKey, getModel, setApiKey, setModel, showConfig, getMaxTokens, setMaxTokens } from './config';

const program = new Command();

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer); }));
}

async function configure(): Promise<void> {
  console.log(chalk.blue.bold('\n🔧 Configuration Setup\n'));
  
  const apiKey = await prompt(chalk.cyan(`Enter OpenAI API Key (current: ${getApiKey() ? chalk.green('***' + getApiKey()!.slice(-4)) : chalk.red('Not set')}): `));
  if (apiKey.trim()) {
    setApiKey(apiKey);
    console.log(chalk.green('✓ API key saved'));
  }

  const model = await prompt(chalk.cyan(`Enter model (current: ${getModel() ? chalk.green(getModel()) : chalk.red('Not set')}): `));
  if (model.trim()) {
    setModel(model);
    console.log(chalk.green('✓ Model saved'));
  }

  const tokens = await prompt(chalk.cyan(`Enter max tokens (current: ${getMaxTokens() ? chalk.green(getMaxTokens()?.toString()) : chalk.red('Not set')}): `));
  if (tokens.trim()) {
    setMaxTokens(parseInt(tokens) || 150);
    console.log(chalk.green('✓ Max tokens saved'));
  }

  console.log(chalk.green.bold('\n✅ Configuration updated!\n'));
}

function hasStagedFiles(): boolean {
  const result = spawnSync('git', ['diff', '--cached', '--quiet']);
  return result.status !== 0;
}

function getStagedFilesList(): string[] {
  const result = spawnSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' });
  return result.stdout.trim().split('\n').filter(f => f);
}

async function generateCommit(options: any): Promise<void> {
  console.log(chalk.blue.bold('\n🚀 AI Commiter\n'));

  if (options.add) {
    const spinner = ora('Staging all changes...').start();
    const add = spawnSync('git', ['add', '-A'], { stdio: 'pipe' });
    if (add.status !== 0) {
      spinner.fail('Failed to stage changes');
      process.exit(add.status || 1);
    }
    spinner.succeed('All changes staged');
  } else if (!hasStagedFiles()) {
    console.log(chalk.yellow('⚠️  No staged files found'));
    const choice = await prompt(chalk.cyan('Stage all changes? (Y/n): '));
    if (choice.toLowerCase() === 'y' || choice.trim() === '') {
      const spinner = ora('Staging all changes...').start();
      const add = spawnSync('git', ['add', '-A'], { stdio: 'pipe' });
      if (add.status !== 0) {
        spinner.fail('Failed to stage changes');
        process.exit(add.status || 1);
      }
      spinner.succeed('All changes staged');
    } else {
      console.log(chalk.red('❌ Please stage files manually first'));
      process.exit(0);
    }
  }

  const stagedFiles = getStagedFilesList();
  console.log(chalk.blue('📁 Staged files:'));
  stagedFiles.forEach((file, index) => {
    console.log(chalk.gray(`   ${index + 1}. ${file}`));
  });
  const filesConfirm = await prompt(chalk.cyan('OK with these staged files? (Y/n): '));
  if (filesConfirm.toLowerCase() === 'n') {
    console.log(chalk.red('❌ Please stage the correct files first'));
    process.exit(0);
  }

  let message = options.message;
  if (!message) {
    let apiKey = getApiKey();
    if (!apiKey) {
      console.log(chalk.yellow('⚠️  OpenAI API key not configured'));
      apiKey = await prompt(chalk.cyan('Enter OpenAI API Key (will be saved): '));
      if (apiKey) setApiKey(apiKey);
    }

    let model = getModel();
    if (!model) {
      console.log(chalk.yellow('⚠️  Model not configured'));
      model = await prompt(chalk.cyan('Enter model (gpt-4o-mini/gpt-4o/gpt-3.5-turbo/gpt-5-nano): '));
      if (model) setModel(model);
    }

    let maxTokens = getMaxTokens();
    if (!maxTokens) {
      console.log(chalk.yellow('⚠️  Max tokens not configured'));
      const tokensInput = await prompt(chalk.cyan('Enter max tokens (e.g., 150): '));
      maxTokens = parseInt(tokensInput) || 150;
      setMaxTokens(maxTokens);
    }

    if (apiKey && model) {
      const spinner = ora(`Generating commit message using ${chalk.green(model)}...`).start();
      try {
        const result = await generateCommitMessage(apiKey, model, maxTokens);
        message = result.message;
        spinner.succeed('Commit message generated');
        
        if (result.usage) {
          console.log(chalk.gray('\n📊 Token Usage:'));
          console.log(chalk.gray(`   Input: ${result.usage.prompt_tokens || 0}`));
          console.log(chalk.gray(`   Output: ${result.usage.completion_tokens || 0}`));
          const cachedTokens = result.usage.prompt_tokens_details?.cached_tokens || 
                              result.usage.cached_tokens || 
                              result.usage.prompt_cache_hit_tokens;
          if (cachedTokens) {
            console.log(chalk.gray(`   Cached: ${cachedTokens}`));
          }
          console.log(chalk.gray(`   Total: ${result.usage.total_tokens || 0}`));
        }
      } catch (error) {
        spinner.fail('AI generation failed, using fallback');
        message = generateCommitMessageSync();
      }
    } else {
      console.log(chalk.yellow('⚠️  Using fallback commit message generator'));
      message = generateCommitMessageSync();
    }
  }

  if (!message?.trim()) {
    console.log(chalk.red('❌ Unable to determine commit message'));
    process.exit(1);
  }

  console.log(chalk.green.bold(`\n💬 Commit message: "${message}"`));
  const confirm = await prompt(chalk.cyan('Proceed with commit? (Y/n): '));
  if (confirm.toLowerCase() === 'n') {
    console.log(chalk.yellow('⏹️  Commit cancelled'));
    process.exit(0);
  }

  const spinner = ora('Creating commit...').start();
  const commit = spawnSync('git', ['commit', '-m', message], { stdio: 'pipe' });
  if (commit.status !== 0) {
    spinner.fail('Git commit failed');
    process.exit(commit.status || 1);
  }
  spinner.succeed('Commit created successfully');

  if (options.push) {
    const pushSpinner = ora('Pushing to remote...').start();
    const branchResult = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' });
    const branchName = branchResult.stdout.trim();
    if (!branchName) {
      pushSpinner.fail('Could not determine current branch name');
      process.exit(1);
    }
    const pushResult = spawnSync('git', ['push', 'origin', branchName], { stdio: 'pipe' });
    if (pushResult.status === 0) {
      pushSpinner.succeed(`Pushed to ${branchName}`);
    } else {
      pushSpinner.fail('Push failed');
      process.exit(pushResult.status || 1);
    }
  }

  console.log(chalk.green.bold('\n✅ Done!\n'));
}

program
  .name('commiter')
  .description('AI-powered git commit message generator')
  .version('1.2.0');

program
  .command('commit')
  .alias('c')
  .description('Generate and create a commit')
  .option('-m, --message <msg>', 'Custom commit message')
  .option('--add', 'Stage all changes before committing')
  .option('--push', 'Push after committing')
  .action(generateCommit);

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    console.log(chalk.blue.bold('\n📋 Current Configuration\n'));
    const config = showConfig();
    console.log(config.replace(/API Key: (.+)/, `API Key: ${chalk.green('$1')}`));
    console.log();
  });

program
  .command('configure')
  .alias('setup')
  .description('Configure API key, model, and max tokens')
  .action(configure);

// Default action (when no command specified)
program.action(generateCommit);

program.parse();