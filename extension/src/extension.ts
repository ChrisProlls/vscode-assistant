// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ws from "ws";
import * as xhr2 from "xhr2";
import * as fs from 'fs';
import * as path from 'path';
import { DirectLine } from 'botframework-directlinejs';

class Message {
	content: string = "";
	bot: boolean = false;
	response?: BotResponse;
	hellMode = false;
}

class BotResponse {
	IsImage: boolean = false;
	Result: number = 0;
}

var messages = new Array<Message>();
var user = "myUserId";

messages.push({ content: "Bienvenue dans l'assistant le plus cool du monde !", bot: false, hellMode: false });
messages.push({ content: "Toujours eu peur des codes review ? Pas de panique, cet assistant va vous aider à améliorer votre code.", bot: false, hellMode: false });
messages.push({ content: "Faites Ctrl+Shift+P, et tapez Code Review : Dialog pour commencer à dialoguer avec votre assistant. Ce dernier vous guidera dans la démarche de revue de code.", bot: false, hellMode: false });

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
			{
				enableScripts: true
			},

		);

		var directLine = new DirectLine({
			secret: 'Wo9qxhbpTmI.CiKhpuEelxxajOrNkf24ora1l2uxARupIYsf45l8Urs',
			webSocket: false
		});

		context.subscriptions.push(vscode.commands.registerCommand('extension.codeReview.dialog', () => showInputBox(directLine, panel, context.extensionPath)));

		directLine.activity$
			.subscribe(
				(activity: any) => {
					if (activity.text && activity.from.id !== user) {
						sendMessage(panel, { content: activity.text, bot: true, response: activity.channelData, hellMode: false });
					}

					console.log("received activity ", activity);
				}
			);

		panel.webview.html = getWebviewContent(context.extensionPath, panel.webview);
	});

	context.subscriptions.push(disposable);
}

function getErrors() {
	const ide = vscode.languages.getDiagnostics();
	const errors = ide
		.filter(item => item[1].length > 0)
		.map(item => item[1])
		.reduce((prev, next) => prev.concat(next), [])
		.map(item => {
			return {
				message: item.message,
				code: item.code,
				source: item.source,
				line: item.range.start.line,
			};
		});
	return errors;
}

function showInputBox(directLine: DirectLine, panel: vscode.WebviewPanel, extensionPath: string) {
	vscode.window
		.showInputBox()
		.then(text => {
			if (!text) {
				return;
			}

			sendMessage(panel, { content: text, bot: false, hellMode: false });

			const errors = getErrors();

			if (errors.length < 15) {
				directLine.postActivity({
					from: { id: user },
					type: 'message',
					text: text,
					channelData: {
						errors: errors
					}
				}).subscribe(
					id => console.log("Posted activity, assigned ID ", id),
					error => console.log("Error posting activity", error)
				);
			} else {
				sendMessage(panel, { content: '', bot: false, hellMode: true });
			}
		});
}

function sendMessage(panel: vscode.WebviewPanel, message: Message) {
	panel.webview.postMessage(message);
}
// this method is called when your extension is deactivated
export function deactivate() { }

function getWebviewContent(extensionPath: string, webView: vscode.Webview) {
	const onDiskPath = vscode.Uri.file(
		path.join(extensionPath, 'assets', 'sounds', 'gameSound.mp3')
	);

	const gameSound = webView.asWebviewUri(onDiskPath);

	const spaceinvadersJs = fs.readFileSync(
		path.join(extensionPath, 'assets', 'js', 'spaceinvaders.js'),
		{
			encoding: 'utf8'
		}
	);

	var content = fs.readFileSync(
		path.join(extensionPath, 'assets', 'index.html'),
		{
			encoding: 'utf8'
		}
	);

	//content = content.replace("{{starfieldJs}}", `<script>${starfieldJs}</script>`);
	content = content.replace("{{spaceinvadersJs}}", `<script>${spaceinvadersJs}</script>`);
	content = content.replace("{{gameSoundUrl}}", gameSound.toString());

	return content;
}