import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { generateCommitMessage } from './generateMessage';

// Run a shell command in the workspace folder
function runCommand(cmd: string, args: string[]): Promise<{ code: number | null }> {
  return new Promise((resolve, reject) => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found. Open a folder in VS Code to use Commiter.');
      resolve({ code: 1 });
      return;
    }
    const child = spawn(cmd, args, { cwd: workspaceFolder, stdio: 'inherit' });
    child.on('error', (err) => {
      vscode.window.showErrorMessage(`Error running command: ${cmd} ${args.join(' ')}\n${err.message}`);
      reject(err);
    });
    child.on('close', (code) => resolve({ code }));
  });
}

export function activate(context: vscode.ExtensionContext) {
  // Register the command for generating a commit
  const disposable = vscode.commands.registerCommand('commiter.generateCommit', async () => {
    // Check for workspace
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found. Open a folder in VS Code to use Commiter.');
      return;
    }

    // Stage all changes
    vscode.window.setStatusBarMessage('Staging changes...', 1500);
    const addResult = await runCommand('git', ['add', '-A']);
    if (addResult.code !== 0) {
      vscode.window.showErrorMessage('Failed to stage changes. Ensure git is installed and repository is initialized.');
      return;
    }

    // Generate default commit message
    let defaultMessage: string;
    try {
      defaultMessage = await generateCommitMessage();
    } catch (err: any) {
      vscode.window.showErrorMessage('Failed to generate commit message.');
      return;
    }

    // Prompt user to edit/accept commit message
    const userMessage = await vscode.window.showInputBox({
      prompt: 'Edit commit message',
      value: defaultMessage
    });
    if (userMessage === undefined) {
      // User cancelled
      return;
    }
    const msg = userMessage.trim();
    if (!msg) {
      vscode.window.showErrorMessage('Commit message cannot be empty.');
      return;
    }

    // Commit changes
    vscode.window.setStatusBarMessage('Committing changes...', 1500);
    const commitResult = await runCommand('git', ['commit', '-m', msg]);
    if (commitResult.code !== 0) {
      vscode.window.showErrorMessage('Git commit failed. Check the console output for details.');
      return;
    }
    vscode.window.showInformationMessage('Commit created successfully.');
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}