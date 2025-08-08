import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { generateCommitMessage, generateCommitMessageSync } from './generateMessage';

function runCommand(cmd: string, args: string[]): Promise<{ code: number | null }> {
  return new Promise((resolve, reject) => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const child = spawn(cmd, args, { cwd: workspaceFolder, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code }));
  });
}

async function hasStagedFiles(): Promise<boolean> {
  return new Promise((resolve) => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const child = spawn('git', ['diff', '--cached', '--quiet'], { cwd: workspaceFolder });
    child.on('close', (code) => resolve(code !== 0));
  });
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('commiter.generateCommit', async () => {
    if (!(await hasStagedFiles())) {
      const choice = await vscode.window.showQuickPick([
        'Stage all changes and commit',
        'Cancel - stage files manually first'
      ], { placeHolder: 'No staged files found' });
      
      if (choice === 'Stage all changes and commit') {
        const addResult = await runCommand('git', ['add', '-A']);
        if (addResult.code !== 0) {
          vscode.window.showErrorMessage('Failed to stage changes.');
          return;
        }
      } else {
        return;
      }
    }

    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter OpenAI API Key',
      password: true
    });
    if (!apiKey) return;

    const model = await vscode.window.showQuickPick([
      'gpt-4o-mini',
      'gpt-4o', 
      'gpt-3.5-turbo'
    ], { placeHolder: 'Select OpenAI model' });
    if (!model) return;

    vscode.window.showInformationMessage('Generating commit message...');
    
    let defaultMessage: string;
    try {
      defaultMessage = await generateCommitMessage(apiKey, model);
    } catch {
      defaultMessage = generateCommitMessageSync();
    }

    const userMessage = await vscode.window.showInputBox({
      prompt: 'Edit commit message',
      value: defaultMessage
    });
    if (!userMessage?.trim()) return;

    const commitResult = await runCommand('git', ['commit', '-m', userMessage.trim()]);
    if (commitResult.code === 0) {
      vscode.window.showInformationMessage('Commit created successfully.');
    } else {
      vscode.window.showErrorMessage('Git commit failed.');
    }
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}