import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { generateCommitMessage, generateCommitMessageSync } from './generateMessage';
import { getApiKey, getModel, setApiKey, setModel, showConfig, getMaxTokens, setMaxTokens } from './config';

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

async function getStagedFilesList(): Promise<string[]> {
  return new Promise((resolve) => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const child = spawn('git', ['diff', '--cached', '--name-only'], { cwd: workspaceFolder });
    let output = '';
    child.stdout.on('data', (data) => output += data);
    child.on('close', () => resolve(output.trim().split('\n').filter(f => f)));
  });
}

class CommiterViewProvider implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtmlContent();
    
    webviewView.webview.onDidReceiveMessage(message => {
      vscode.commands.executeCommand(`commiter.${message.command}`);
    });
  }

  private getHtmlContent(): string {
    return `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: var(--vscode-font-family); padding: 10px; }
        button { 
          background: var(--vscode-button-background); 
          color: var(--vscode-button-foreground); 
          border: none; 
          padding: 8px 16px; 
          margin: 5px 0; 
          cursor: pointer; 
          width: 100%; 
          border-radius: 2px;
        }
        button:hover { background: var(--vscode-button-hoverBackground); }
      </style>
    </head>
    <body>
      <h3>Commiter</h3>
      <button onclick="generateCommit()">🚀 Generate Commit</button>
      <button onclick="showConfig()">⚙️ Show Config</button>
      <button onclick="configure()">🔧 Configure</button>
      <script>
        const vscode = acquireVsCodeApi();
        function generateCommit() { vscode.postMessage({command:'generateCommit'}); }
        function showConfig() { vscode.postMessage({command:'showConfig'}); }
        function configure() { vscode.postMessage({command:'configure'}); }
      </script>
    </body>
    </html>`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new CommiterViewProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('commiterView', provider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );

  const generateCommitDisposable = vscode.commands.registerCommand('commiter.generateCommit', async () => {
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

    const stagedFiles = await getStagedFilesList();
    const filesConfirm = await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: `OK with staged files: ${stagedFiles.join(', ')}?`
    });
    if (filesConfirm !== 'Yes') return;

    let apiKey = getApiKey();
    if (!apiKey) {
      apiKey = await vscode.window.showInputBox({
        prompt: 'Enter OpenAI API Key (will be saved)',
        password: true
      });
      if (!apiKey) return;
      setApiKey(apiKey);
    }

    let model = getModel();
    if (!model) {
      model = await vscode.window.showQuickPick([
        'gpt-4o-mini',
        'gpt-4o', 
        'gpt-3.5-turbo'
      ], { placeHolder: 'Select OpenAI model' });
      if (!model) return;
      setModel(model);
    }

    let maxTokens = getMaxTokens();
    if (!maxTokens) {
      const tokensInput = await vscode.window.showInputBox({
        prompt: 'Enter max tokens for commit message (e.g., 150)',
        value: '150'
      });
      if (!tokensInput) return;
      maxTokens = parseInt(tokensInput) || 150;
      setMaxTokens(maxTokens);
    }

    vscode.window.showInformationMessage(`Generating commit using ${model}...`);
    
    let defaultMessage: string;
    try {
      defaultMessage = await generateCommitMessage(apiKey, model, maxTokens);
    } catch {
      defaultMessage = generateCommitMessageSync();
    }

    const userMessage = await vscode.window.showInputBox({
      prompt: 'Edit commit message',
      value: defaultMessage
    });
    if (!userMessage?.trim()) return;

    const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: `Commit with message: "${userMessage.trim()}"?`
    });
    if (confirm !== 'Yes') return;

    const commitResult = await runCommand('git', ['commit', '-m', userMessage.trim()]);
    if (commitResult.code === 0) {
      vscode.window.showInformationMessage('Commit created successfully.');
    } else {
      vscode.window.showErrorMessage('Git commit failed.');
    }
  });
  
  const showConfigDisposable = vscode.commands.registerCommand('commiter.showConfig', () => {
    vscode.window.showInformationMessage(showConfig());
  });
  
  const configureDisposable = vscode.commands.registerCommand('commiter.configure', async () => {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter OpenAI API Key',
      password: true,
      value: getApiKey()
    });
    if (apiKey) setApiKey(apiKey);
    
    const model = await vscode.window.showQuickPick([
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-3.5-turbo',
      'gpt-5-nano'
    ], { placeHolder: 'Select OpenAI model' });
    if (model) setModel(model);
    
    const tokensInput = await vscode.window.showInputBox({
      prompt: 'Enter max tokens',
      value: getMaxTokens()?.toString() || '150'
    });
    if (tokensInput) setMaxTokens(parseInt(tokensInput) || 150);
    
    vscode.window.showInformationMessage('Configuration updated!');
  });
  
  context.subscriptions.push(generateCommitDisposable, showConfigDisposable, configureDisposable);
}

export function deactivate() {}