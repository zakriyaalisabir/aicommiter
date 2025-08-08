const vscode = require('vscode');

function activate(context) {
    console.log('Commiter extension is now active!');
    
    let disposable = vscode.commands.registerCommand('commiter.test', function () {
        vscode.window.showInformationMessage('Commiter extension is working!');
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};