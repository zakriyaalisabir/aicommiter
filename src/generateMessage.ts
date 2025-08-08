import { spawnSync } from 'child_process';
import OpenAI from 'openai';

function getGitDiff(): string {
  const diffResult = spawnSync('git', ['diff', '--cached'], { encoding: 'utf8' });
  return diffResult.stdout || '';
}

export async function generateCommitMessage(apiKey: string, model: string, maxTokens: number = 150): Promise<string> {
  try {
    const diff = getGitDiff();
    if (!diff.trim()) {
      return 'chore: no staged changes';
    }

    console.log('Calling OpenAI API...');
    console.log(`Using maxTokens: ${maxTokens}`);
    const openai = new OpenAI({ apiKey });
    const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages: [{
        role: 'system',
        content: 'Generate conventional commit messages based on git diffs. Use format: type(scope): description. Types: feat, fix, docs, style, refactor, test, chore. Be concise and descriptive.'
      }, {
        role: 'user',
        content: `Generate a conventional commit message for these staged changes:

${diff}`
      }],
      max_tokens: maxTokens,
      max_completion_tokens: maxTokens,
      reasoning_effort: 'low',
      n: 1,
      temperature: 0.2
    }

    if (model.startsWith('gpt-5')) {
      delete body.max_tokens; // gpt-5 does not support this field
    }

    if (model.startsWith('gpt-5-nano')) {
      body.temperature = 1; // gpt-5-nano uses higher temperature by default
    }

    const options: OpenAI.RequestOptions = {
      maxRetries: 3,
    }
    const response = await openai.chat.completions.create(body, options);
    // console.log('OpenAI response:', JSON.stringify(response));

    const content = response.choices[0]?.message?.content?.trim();
    // console.log('OpenAI API response object:', JSON.stringify(content, null, 2));

    if (!content || content === '') {
      console.log('Empty content received, using fallback');
      return generateCommitMessageSync();
    }

    console.log('OpenAI generated message:', content);
    return content;
  } catch (err) {
    console.error('OpenAI API error:', err);
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