#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { generateCommitMessage } from './generateMessage';

/**
 * Parse command line arguments for our CLI. Returns an options object.
 */
function parseArgs(): {
  message?: string;
  maxFiles: number;
  addAll: boolean;
  push: boolean;
} {
  const args = process.argv.slice(2);
  let message: string | undefined;
  let maxFiles = 5;
  let addAll = true;
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
      case '--no-add':
        addAll = false;
        break;
      case '--push':
        push = true;
        break;
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
    `  --no-add               Do not automatically stage all changes (default stages all)\n` +
    `  --push                 Push the commit to the current branch after committing\n` +
    `  -h, --help             Show this help message\n`);
}

function run(): void {
  const options = parseArgs();
  // Stage all changes unless disabled
  if (options.addAll) {
    const add = spawnSync('git', ['add', '-A'], { stdio: 'inherit' });
    if (add.status !== 0) {
      process.exit(add.status || 1);
    }
  }
  const message = options.message || generateCommitMessage(options.maxFiles);
  if (!message || message.trim().length === 0) {
    console.error('Unable to determine commit message.');
    process.exit(1);
  }
  const commit = spawnSync('git', ['commit', '-m', message], { stdio: 'inherit' });
  if (commit.status !== 0) {
    // If commit fails (e.g. nothing to commit), exit with its code
    process.exit(commit.status || 1);
  }
  if (options.push) {
    // Determine current branch
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

run();