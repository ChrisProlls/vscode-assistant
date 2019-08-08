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
                HowIsYourDog,
                YourCodeLooksBad
            }));

            InitialDialogId = nameof(WaterfallDialog);
        }

        private async Task<DialogTurnResult> Hi(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var helloMessageText = "Hi ! How are you ?";
            var helloMessage = MessageFactory.Text(helloMessageText, helloMessageText, InputHints.IgnoringInput);

            return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions { Prompt = helloMessage });
        }

        private async Task<DialogTurnResult> HowAreYou(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var promptMessage = MessageFactory.Text("Yeah, good ! How is your dog ?");

            return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions { Prompt = promptMessage });
        }

        private async Task<DialogTurnResult> HowIsYourDog(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var promptMessage = MessageFactory.Text("Not so bad, and about your code, what do you think ?");

            return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions { Prompt = promptMessage });
        }

        private async Task<DialogTurnResult> YourCodeLooksBad(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var promptMessage = MessageFactory.Text("Hum, from what I see, your code looks not so good. Let's go check out, ask me !");
            await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions { Prompt = promptMessage });

            return await stepContext.EndDialogAsync();
        }
    }
}
