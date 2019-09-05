// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ws from "ws";
import * as xhr2 from "xhr2";
import { DirectLine } from 'botframework-directlinejs';

class Message {
	content: string = "";
	bot: boolean = false;
}

var messages = new Array<Message>();
var user = "myUserId";

messages.push({ content: "Bienvenue dans l'assistant le plus cool du monde !", bot: false });
messages.push({ content: "Toujours eu peur des codes review ? Pas de panique, cet assistant va vous aider à améliorer votre code.", bot: false });
messages.push({ content: "Faites Ctrl+Shift+P, et tapez Code Review : Dialog pour commencer à dialoguer avec votre assistant. Ce dernier vous guidera dans la démarche de revue de code.", bot: false });
messages.push({ content: "TEst <br> TEST.<br> TEST.", bot: false });

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	(<any>global).XMLHttpRequest = xhr2;
	(<any>global).WebSocket = ws;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-review-assistant" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.codeReview', async () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		const panel = vscode.window.createWebviewPanel(
			'codeReviewAssistant',
			'Code Review Assistant',
			vscode.ViewColumn.One,
			{}
		);
		const ide = vscode.languages.getDiagnostics();
		const errors = ide
			.filter(item => item[1].length > 0)[0][1]
			.map(item => {
				return {
					message: item.message,
					code: item.code,
					source: item.source,
					line: item.range.start.line
				};
			});

		console.log(errors);

		var directLine = new DirectLine({
			secret: 'Wo9qxhbpTmI.CiKhpuEelxxajOrNkf24ora1l2uxARupIYsf45l8Urs',
			webSocket: false
		});

		context.subscriptions.push(vscode.commands.registerCommand('extension.codeReview.dialog', () => showInputBox(directLine, panel, errors)));

		directLine.activity$
			.subscribe(
				(activity: any) => {
					if (activity.text && activity.from.id !== user) {
						messages.push({ content: activity.text, bot: true });
						refreshView(panel);
					}

					console.log("received activity ", activity);
				}
			);

		refreshView(panel);
	});

	context.subscriptions.push(disposable);
}

function showInputBox(directLine: DirectLine, panel: vscode.WebviewPanel, errors: Array<any>) {
	vscode.window
		.showInputBox()
		.then(text => {
			if (!text) {
				return;
			}

			messages.push({ content: text, bot: false });
			refreshView(panel);

			directLine.postActivity({
				from: { id: user},
				type: 'message',
				text: text,
				channelData: {
					errors: errors
				}
			}).subscribe(
				id => console.log("Posted activity, assigned ID ", id), 
				error => console.log("Error posting activity", error)
			);
		});
}

function refreshView(panel: vscode.WebviewPanel) {
	panel.webview.html = getWebviewContent();
}
// this method is called when your extension is deactivated
export function deactivate() { }

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
			background-color: SteelBlue;
			border-radius: 5px;
			display: inline-block;
		}

		.message-container {
			margin: 20px;
		}

		.message-bot {
			background-color: SeaGreen;
		}
	  </style>
  </head>
  <body>
	  ${getMessages()}
  </body>
  </html>`;
}

function getMessages() {
	return messages
	.map(message => `<div class='message-container'>
						<div class='message-content ${(message.bot ? 'message-bot' : '')}'>${message.content}</div>
					</div>
					`)
	.join('');
}