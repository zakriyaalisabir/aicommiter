#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { generateCommitMessage, generateCommitMessageSync } from './generateMessage';
import * as readline from 'readline';
import { getApiKey, getModel, setApiKey, setModel, showConfig, getMaxTokens, setMaxTokens } from './config';

async function parseArgs(): Promise<{
  message?: string;
  maxFiles: number;
  addAll: boolean;
  push: boolean;
}> {
  const args = process.argv.slice(2);
  let message: string | undefined;
  let maxFiles = 5;
  let addAll = false;
  let push = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-m':
      case '--message':
        message = args[i + 1];
        i++;
        break;
      case '--max-files':
        maxFiles = parseInt(args[i + 1], 10) || maxFiles;
        i++;
        break;
      case '--add':
        addAll = true;
        break;
      case '--push':
        push = true;
        break;
      case '--config':
        console.log(showConfig());
        process.exit(0);
      case '--configure':
        await configure();
        process.exit(0);
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
    }
  }
  return { message, maxFiles, addAll, push };
}

function printHelp() {
  console.log(`Usage: commiter [options]\n\n` +
    `Options:\n` +
    `  -m, --message <msg>    Specify a custom commit message\n` +
    `  --max-files <n>        Maximum number of file names to include in the auto-generated message (default 5)\n` +
    `  --add                  Stage all changes before committing\n` +
    `  --push                 Push the commit to the current branch after committing\n` +
    `  --config               Show current configuration\n` +
    `  --configure            Configure API key, model, and max tokens\n` +
    `  -h, --help             Show this help message\n`);
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer); }));
}

async function configure(): Promise<void> {
  const apiKey = await prompt(`Enter OpenAI API Key (current: ${getApiKey() ? '***' + getApiKey()!.slice(-4) : 'Not set'}): `);
  if (apiKey.trim()) setApiKey(apiKey);

  const model = await prompt(`Enter model (current: ${getModel() || 'Not set'}): `);
  if (model.trim()) setModel(model);

  const tokens = await prompt(`Enter max tokens (current: ${getMaxTokens() || 'Not set'}): `);
  if (tokens.trim()) setMaxTokens(parseInt(tokens) || 150);

  console.log('Configuration updated!');
}

function hasStagedFiles(): boolean {
  const result = spawnSync('git', ['diff', '--cached', '--quiet']);
  return result.status !== 0;
}

function getStagedFilesList(): string[] {
  const result = spawnSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' });
  return result.stdout.trim().split('\n').filter(f => f);
}

async function run(): Promise<void> {
  const options = await parseArgs();

  if (options.addAll) {
    const add = spawnSync('git', ['add', '-A'], { stdio: 'inherit' });
    if (add.status !== 0) process.exit(add.status || 1);
  } else if (!hasStagedFiles()) {
    const choice = await prompt('No staged files. Stage all changes? (Y/n): ');
    if (choice.toLowerCase() === 'y' || choice.trim() === '') {
      const add = spawnSync('git', ['add', '-A'], { stdio: 'inherit' });
      if (add.status !== 0) process.exit(add.status || 1);
    } else {
      console.log('Please stage files manually first.');
      process.exit(0);
    }
  }

  const stagedFiles = getStagedFilesList();
  console.log(`Staged files: ${stagedFiles.join(', ')}`);
  const filesConfirm = await prompt('OK with these staged files? (Y/n): ');
  if (filesConfirm.toLowerCase() === 'n') {
    console.log('Please stage the correct files first.');
    process.exit(0);
  }

  let message = options.message;
  if (!message) {
    let apiKey = getApiKey();
    if (!apiKey) {
      apiKey = await prompt('Enter OpenAI API Key (will be saved): ');
      if (apiKey) setApiKey(apiKey);
    }

    let model = getModel();
    if (!model) {
      model = await prompt('Enter model (gpt-4o-mini/gpt-4o/gpt-3.5-turbo): ');
      if (model) setModel(model);
    }

    let maxTokens = getMaxTokens();
    if (!maxTokens) {
      const tokensInput = await prompt('Enter max tokens (e.g., 150): ');
      maxTokens = parseInt(tokensInput) || 150;
      setMaxTokens(maxTokens);
    }

    if (apiKey && model) {
      console.log(`Generating commit using ${model}...`);
      try {
        message = await generateCommitMessage(apiKey, model, maxTokens);
      } catch {
        message = generateCommitMessageSync();
      }
    } else {
      message = generateCommitMessageSync();
    }
  }

  if (!message?.trim()) {
    console.error('Unable to determine commit message.');
    process.exit(1);
  }

  console.log(`\nCommit message: ${message}`);
  const confirm = await prompt('Proceed with commit? (Y/n): ');
  if (confirm.toLowerCase() === 'n') {
    console.log('Commit cancelled.');
    process.exit(0);
  }

  const commit = spawnSync('git', ['commit', '-m', message], { stdio: 'inherit' });
  if (commit.status !== 0) process.exit(commit.status || 1);

  if (options.push) {
    const branchResult = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' });
    const branchName = branchResult.stdout.trim();
    if (!branchName) {
      console.error('Could not determine current branch name.');
      process.exit(1);
    }
    const pushResult = spawnSync('git', ['push', 'origin', branchName], { stdio: 'inherit' });
    process.exit(pushResult.status || 0);
  }
}

run().catch(console.error);