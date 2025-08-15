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
  const { getConfig, setApiKey, setModel, setMaxTokens, setInputTokenCost, setOutputTokenCost, setCachedTokenCost, setServiceTier, setReasoningEffort, setTemperature, setVerbosity } = await import('./config');
  const config = getConfig();
  
  const apiKey = await prompt(chalk.cyan(`Enter OpenAI API Key (current: ${config.apiKey ? chalk.green('***' + config.apiKey.slice(-4)) : chalk.red('Not set')}): `));
  if (apiKey.trim()) {
    setApiKey(apiKey);
    console.log(chalk.green('✓ API key saved'));
  }

  const model = await prompt(chalk.cyan(`Enter model (current: ${config.model ? chalk.green(config.model) : chalk.red('Not set')}): `));
  if (model.trim()) {
    setModel(model);
    console.log(chalk.green('✓ Model saved'));
  }

  const tokens = await prompt(chalk.cyan(`Enter max tokens (current: ${config.maxTokens ? chalk.green(config.maxTokens.toString()) : chalk.red('Not set')}): `));
  if (tokens.trim()) {
    setMaxTokens(parseInt(tokens) || 150);
    console.log(chalk.green('✓ Max tokens saved'));
  }

  const inputCost = await prompt(chalk.cyan(`Enter input token cost per 1M (current: ${config.inputTokenCost ? chalk.green(config.inputTokenCost.toString()) : chalk.red('Not set')}): `));
  if (inputCost.trim()) {
    setInputTokenCost(parseFloat(inputCost) || 0.15);
    console.log(chalk.green('✓ Input token cost saved'));
  }

  const outputCost = await prompt(chalk.cyan(`Enter output token cost per 1M (current: ${config.outputTokenCost ? chalk.green(config.outputTokenCost.toString()) : chalk.red('Not set')}): `));
  if (outputCost.trim()) {
    setOutputTokenCost(parseFloat(outputCost) || 0.6);
    console.log(chalk.green('✓ Output token cost saved'));
  }

  const cachedCost = await prompt(chalk.cyan(`Enter cached token cost per 1M (current: ${config.cachedTokenCost ? chalk.green(config.cachedTokenCost.toString()) : chalk.red('Not set')}): `));
  if (cachedCost.trim()) {
    setCachedTokenCost(parseFloat(cachedCost) || 0.075);
    console.log(chalk.green('✓ Cached token cost saved'));
  }

  const serviceTier = await prompt(chalk.cyan(`Enter service tier (current: ${config.serviceTier ? chalk.green(config.serviceTier) : chalk.red('Not set')}): `));
  if (serviceTier.trim()) {
    setServiceTier(serviceTier);
    console.log(chalk.green('✓ Service tier saved'));
  }

  const reasoningEffort = await prompt(chalk.cyan(`Enter reasoning effort (current: ${config.reasoningEffort ? chalk.green(config.reasoningEffort) : chalk.red('Not set')}): `));
  if (reasoningEffort.trim()) {
    setReasoningEffort(reasoningEffort);
    console.log(chalk.green('✓ Reasoning effort saved'));
  }

  const temperature = await prompt(chalk.cyan(`Enter temperature (current: ${config.temperature ? chalk.green(config.temperature.toString()) : chalk.red('Not set')}): `));
  if (temperature.trim()) {
    setTemperature(parseFloat(temperature) || 0.2);
    console.log(chalk.green('✓ Temperature saved'));
  }

  const verbosity = await prompt(chalk.cyan(`Enter verbosity (current: ${config.verbosity ? chalk.green(config.verbosity) : chalk.red('Not set')}): `));
  if (verbosity.trim()) {
    setVerbosity(verbosity);
    console.log(chalk.green('✓ Verbosity saved'));
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
          const { logJob } = await import('./jobTracker');
          const cachedTokens = result.usage.prompt_tokens_details?.cached_tokens || 
                              result.usage.cached_tokens || 
                              result.usage.prompt_cache_hit_tokens || 0;
          
          await logJob(
            'commit-generation',
            result.usage.prompt_tokens || 0,
            result.usage.completion_tokens || 0,
            undefined,
            model,
            cachedTokens
          );
          
          console.log(chalk.gray('\n📊 Token Usage:'));
          console.log(chalk.gray(`   Input: ${result.usage.prompt_tokens || 0}`));
          console.log(chalk.gray(`   Output: ${result.usage.completion_tokens || 0}`));
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
  .version(require("../package.json").version)
  .option('-m, --message <msg>', 'Custom commit message')
  .option('--add', 'Stage all changes before committing')
  .option('--push', 'Push after committing');

program
  .command('commit')
  .alias('c')
  .description('Generate and create a commit')
  .option('-m, --message <msg>', 'Custom commit message')
  .option('--add', 'Stage all changes before committing')
  .option('--push', 'Push after committing')
  .action(generateCommit);

program
  .command('configure')
  .alias('setup')
  .description('Configure API key, model, tokens, and costs')
  .option('--show', 'Show current configuration')
  .option('-o', 'Show current configuration')
  .action((options) => {
    if (options.show || options.o) {
      console.log(chalk.blue.bold('\n📋 Current Configuration\n'));
      const { showConfig } = require('./config');
      const config = showConfig();
      const styledConfig = config
        .replace(/API Key: (.+)/, `${chalk.cyan('API Key:')} ${chalk.green('$1')}`)
        .replace(/Model: (.+)/, `${chalk.cyan('Model:')} ${chalk.green('$1')}`)
        .replace(/Max Tokens: (.+)/, `${chalk.cyan('Max Tokens:')} ${chalk.green('$1')}`)
        .replace(/Input Token Cost: (.+)/, `${chalk.cyan('Input Token Cost:')} ${chalk.green('$1')}`)
        .replace(/Output Token Cost: (.+)/, `${chalk.cyan('Output Token Cost:')} ${chalk.green('$1')}`)
        .replace(/Cached Token Cost: (.+)/, `${chalk.cyan('Cached Token Cost:')} ${chalk.green('$1')}`)
        .replace(/Service Tier: (.+)/, `${chalk.cyan('Service Tier:')} ${chalk.green('$1')}`)
        .replace(/Reasoning Effort: (.+)/, `${chalk.cyan('Reasoning Effort:')} ${chalk.green('$1')}`)
        .replace(/Temperature: (.+)/, `${chalk.cyan('Temperature:')} ${chalk.green('$1')}`)
        .replace(/Verbosity: (.+)/, `${chalk.cyan('Verbosity:')} ${chalk.green('$1')}`)
        .replace(/Not set/g, chalk.red('Not set'));
      console.log(styledConfig);
      console.log();
    } else {
      configure();
    }
  });

// Default action (when no command specified)
program.action(generateCommit);

program.parse();