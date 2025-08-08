import { spawnSync } from 'child_process';
import OpenAI from 'openai';

function getGitDiff(): string {
  const diffResult = spawnSync('git', ['diff', '--cached'], { encoding: 'utf8' });
  console.log('Git diff command result:');
  console.log('- stdout length:', diffResult.stdout?.length || 0);
  console.log('- stderr:', diffResult.stderr);
  console.log('- exit code:', diffResult.status);
  if (diffResult.stdout) {
    console.log('- first 200 chars:', diffResult.stdout.substring(0, 200));
  }
  return diffResult.stdout || '';
}

function logSeparator() {
  console.log('\n' + '═'.repeat(60));
}

function logSection(title: string) {
  console.log(`\n🔹 ${title}`);
  console.log('─'.repeat(40));
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

function logError(message: string) {
  console.log(`❌ ${message}`);
}

function logInfo(message: string) {
  console.log(`ℹ️  ${message}`);
}

export async function generateCommitMessage(apiKey: string, model: string, maxTokens: number = 150): Promise<string> {
  try {
    const diff = getGitDiff();
    if (!diff.trim()) {
      return 'chore: no staged changes';
    }

    logSeparator();
    logSection('OpenAI API Request');
    logInfo(`Model: ${model}`);
    logInfo(`Max Tokens: ${maxTokens}`);
    
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
      temperature: 0.2
    }

    if (model.startsWith('gpt-5')) {
      delete body.max_tokens;
      logInfo('Using gpt-5 optimized settings');
    }

    if (model.startsWith('gpt-5-nano')) {
      body.temperature = 1;
      logInfo('Using gpt-5-nano optimized settings');
    }

    const options: OpenAI.RequestOptions = {
      maxRetries: 3,
    }
    
    logInfo('Sending request to OpenAI...');
    const response = await openai.chat.completions.create(body, options);
    
    logSection('OpenAI API Response');
    const usage = response.usage;
    if (usage) {
      logInfo(`Prompt tokens: ${usage.prompt_tokens}`);
      logInfo(`Completion tokens: ${usage.completion_tokens}`);
      logInfo(`Total tokens: ${usage.total_tokens}`);
      if (usage.completion_tokens_details?.reasoning_tokens) {
        logInfo(`Reasoning tokens: ${usage.completion_tokens_details.reasoning_tokens}`);
      }
    }
    
    const content = response.choices[0]?.message?.content?.trim();
    
    if (!content || content === '') {
      logError('Empty content received from OpenAI');
      logInfo('Using fallback commit message generator');
      return generateCommitMessageSync();
    }
    
    logSection('Generated Commit Message');
    logSuccess(`"${content}"`);
    logSeparator();
    return content;
  } catch (err) {
    logSeparator();
    logError('OpenAI API request failed');
    console.error('   Error details:', err);
    logInfo('Using fallback commit message generator');
    logSeparator();
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