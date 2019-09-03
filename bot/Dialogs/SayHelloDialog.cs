using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CoreBot.Dialogs
{
    public class SayHelloDialog : ComponentDialog
    {
        public SayHelloDialog() : base(nameof(SayHelloDialog))
        {
            AddDialog(new TextPrompt(nameof(TextPrompt)));
            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), new WaterfallStep[]
            {
                Hi,
                HowAreYou,
            }));

            InitialDialogId = nameof(WaterfallDialog);
        }

        private async Task<DialogTurnResult> Hi(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var helloMessageText = "Bonjour ! Comment allez-vous ? Je serai votre assistant personnel pour vous guider dans votre code !";
            var helloMessage = MessageFactory.Text(helloMessageText, helloMessageText, InputHints.IgnoringInput);

            return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions { Prompt = helloMessage });
        }

        private async Task<DialogTurnResult> HowAreYou(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var promptMessage = MessageFactory.Text("Super ! Pour vérifier votre code, il suffit de me le demander. Par exemple, demandez 'Vérifier mon code'");

            await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions { Prompt = promptMessage });

            return await stepContext.EndDialogAsync();
        }
    }
}
