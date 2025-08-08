import { spawnSync } from 'child_process';
import OpenAI from 'openai';

function getGitDiff(): string {
  const diffResult = spawnSync('git', ['diff', '--cached'], { encoding: 'utf8' });
  return diffResult.stdout || '';
}

export async function generateCommitMessage(apiKey: string, model: string): Promise<string> {
  try {
    const diff = getGitDiff();
    if (!diff.trim()) {
      return 'chore: no staged changes';
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model,
      messages: [{
        role: 'user',
        content: `Generate a conventional commit message for this git diff. Use format: type(scope): description

Types: feat, fix, docs, style, refactor, test, chore

Git diff:
${diff}`
      }],
      max_tokens: 100,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content?.trim() || 'chore: auto commit';
  } catch (err) {
    return 'chore: auto commit';
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