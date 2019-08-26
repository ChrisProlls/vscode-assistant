// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

class Message {
	content: string = "";
	bot: boolean = false
}

var messages = new Array<Message>();

messages.push({ content: "Hello world !", bot: false });
messages.push({ content: "How are you !", bot: false });
messages.push({ content: "Merci !", bot: true });

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-review-assistant" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		const panel = vscode.window.createWebviewPanel(
			'codeReviewAssistant',
			'Code Review Assistant',
			vscode.ViewColumn.One,
			{}
		);

		const extension = vscode.extensions.getExtension("vscode.typescript-language-features");
		if (!extension) {
			return;
		}

		const ide = vscode.languages.getDiagnostics();

		await extension.activate();
		if (!extension.exports || !extension.exports.getAPI) {
			return;
		}
		const api = extension.exports.getAPI(0);
		if (!api) {
			return;
		}

		panel.webview.html = getWebviewContent();
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

var findCommand = function () {
	vscode.commands.getCommands(true).then(
		function (cmds) {
			console.log("fulfilled");
			console.log(cmds);
		},
		function () {
			console.log("failed");
			console.log(arguments);
		}
	)
};

function getWebviewContent() {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Code Review</title>
	  <style>
		.message-content {
			padding: 3px 7px;
			background-color: SteelBlue
			
		} 
	  </style>
  </head>
  <body>
	  ${getMessages()}
  </body>
  </html>`;
}

function getMessages() {
	return messages.map(message => `<div class='message-content'>${message.content}</div>`);
}