import { spawnSync } from 'child_process';
import OpenAI from 'openai';

function getGitDiff(): string {
  let workspaceFolder: string | undefined;

  // Try to get VS Code workspace if available
  try {
    const vscode = require('vscode');
    workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  } catch {
    // Running in CLI context, use current directory
    workspaceFolder = process.cwd();
  }

  const diffResult = spawnSync('git', ['diff', '--cached'], {
    encoding: 'utf8',
    cwd: workspaceFolder
  });

  return diffResult.stdout || '';
}

export async function generateCommitMessage(apiKey: string, model: string, maxTokens: number = 150): Promise<{ message: string, usage?: any }> {
  try {
    const diff = getGitDiff();
    if (!diff.trim()) {
      return { message: 'chore: no staged changes' };
    }

    const { getConfig } = require('./config');
    const config = getConfig();

    const openai = new OpenAI({ apiKey });
    const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages: [{
        role: 'system',
        content: 'Generate conventional commit messages based on git diffs. Use format: type(scope): description. Types: feat, fix, docs, style, refactor, test, chore. Be concise and descriptive.'
      }, {
        role: 'user',
        content: `Generate a conventional commit message for these staged changes:\n\n${diff}`
      }],
      max_tokens: maxTokens,
      max_completion_tokens: maxTokens,
      reasoning_effort: 'low',
      n: 1,
      temperature: 1,
      service_tier: 'flex',
      prompt_cache_key: `ai-commiter-${model}`,
    }

    if (config.serviceTier) {
      (body as any).service_tier = config.serviceTier;
    }

    if (config.reasoningEffort) {
      (body as any).reasoning_effort = config.reasoningEffort;
    }

    if (config.verbosity) {
      (body as any).verbosity = config.verbosity;
    }

    if (model.startsWith('gpt-5')) {
      delete body.max_tokens;
    }

    if (model.startsWith('gpt-5-nano') && !config.temperature) {
      body.temperature = 1;
    }

    const options: OpenAI.RequestOptions = {
      maxRetries: 3,
    }

    const response = await openai.chat.completions.create(body, options);
    const content = response.choices[0]?.message?.content?.trim();

    if (!content || content === '') {
      return { message: generateCommitMessageSync() };
    }

    return { message: content, usage: response.usage };
  } catch (err) {
    console.error('Error generating commit message:', err);
    return { message: 'chore: auto commit' };
  }
}

export function generateCommitMessageSync(): string {
  const diffResult = spawnSync('git', ['diff', '--cached', '--name-status'], { encoding: 'utf8' });
  const lines = diffResult.stdout.trim().split('\n').filter(l => l);
  if (!lines.length) return 'chore: no staged changes';

  const hasNew = lines.some(l => l.startsWith('A'));
  const hasModified = lines.some(l => l.startsWith('M'));
  const hasDeleted = lines.some(l => l.startsWith('D'));

  if (hasNew && !hasModified && !hasDeleted) return 'feat: add new files';
  if (hasModified && !hasNew && !hasDeleted) return 'fix: update existing files';
  if (hasDeleted && !hasNew && !hasModified) return 'chore: remove files';
  return 'chore: update files';
}