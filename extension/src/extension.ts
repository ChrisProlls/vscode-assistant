// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ws from "ws";
import * as xhr2 from "xhr2";
import { DirectLine } from 'botframework-directlinejs';

class Message {
	content: string = "";
	bot: boolean = false;
	response?: BotResponse;
}

class BotResponse {
	IsImage: boolean = false;
	Result: number = 0;
}

var messages = new Array<Message>();
var user = "myUserId";

messages.push({ content: "Bienvenue dans l'assistant le plus cool du monde !", bot: false });
messages.push({ content: "Toujours eu peur des codes review ? Pas de panique, cet assistant va vous aider à améliorer votre code.", bot: false });
messages.push({ content: "Faites Ctrl+Shift+P, et tapez Code Review : Dialog pour commencer à dialoguer avec votre assistant. Ce dernier vous guidera dans la démarche de revue de code.", bot: false });

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
			}
		);

		var directLine = new DirectLine({
			secret: 'Wo9qxhbpTmI.CiKhpuEelxxajOrNkf24ora1l2uxARupIYsf45l8Urs',
			webSocket: false
		});

		context.subscriptions.push(vscode.commands.registerCommand('extension.codeReview.dialog', () => showInputBox(directLine, panel)));

		directLine.activity$
			.subscribe(
				(activity: any) => {
					if (activity.text && activity.from.id !== user) {
						messages.push({ content: activity.text, bot: true, response: activity.channelData });
						refreshView(panel);
					}

					console.log("received activity ", activity);
				}
			);

		refreshView(panel);
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

function showInputBox(directLine: DirectLine, panel: vscode.WebviewPanel) {
	vscode.window
		.showInputBox()
		.then(text => {
			if (!text) {
				return;
			}

			messages.push({ content: text, bot: false });
			refreshView(panel);

			const errors = getErrors();

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

		canvas { display: block; }

		html, body {
			height: 800px;
			width: 100%
		}

		* {margin: 0; padding: 0;}
	  </style>
  </head>
  <body>
  	  <canvas id="c"></canvas>
	  <!--${getMessages()}-->

	  <script> 
		function launchMatrix() {
			var c = document.getElementById("c");
			var ctx = c.getContext("2d");

			//making the canvas full screen
			c.height = window.innerHeight;
			c.width = window.innerWidth;

			console.log();

			//chinese characters - taken from the unicode charset
			var chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
			//converting the string into an array of single characters
			chinese = chinese.split("");

			var font_size = 10;
			var columns = c.width/font_size; //number of columns for the rain
			//an array of drops - one per column
			var drops = [];
			//x below is the x coordinate
			//1 = y co-ordinate of the drop(same for every drop initially)
			for(var x = 0; x < columns; x++)
				drops[x] = 1; 

			//drawing the characters
			function draw()
			{
				//Black BG for the canvas
				//translucent BG to show trail
				ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
				ctx.fillRect(0, 0, c.width, c.height);
				
				ctx.fillStyle = "#0F0"; //green text
				ctx.font = font_size + "px arial";
				//looping over drops
				for(var i = 0; i < drops.length; i++)
				{
					//a random chinese character to print
					var text = chinese[Math.floor(Math.random()*chinese.length)];
					//x = i*font_size, y = value of drops[i]*font_size
					ctx.fillText(text, i*font_size, drops[i]*font_size);
					
					//sending the drop back to the top randomly after it has crossed the screen
					//adding a randomness to the reset to make the drops scattered on the Y axis
					if(drops[i]*font_size > c.height && Math.random() > 0.975)
						drops[i] = 0;
					
					//incrementing Y coordinate
					drops[i]++;
				}
			}

			setInterval(draw, 33);
		}

		setTimeout(() => {
			  //window.scrollTo(0,document.body.scrollHeight);

			  	launchMatrix();
		}, 1000);
	  </script>
  </body>
  </html>`;
}

function getMessages() {
	return messages
		.map(message => {
			var content = message.content;

			if(message.response && message.response.IsImage) {
					content = `<img src="${message.content}">`;
			}

			return `<div class='message-container'>
						<div class='message-content ${(message.bot ? 'message-bot' : '')}'>
							${content}
						</div>
					</div>
					`;
		})
		.join('');
}