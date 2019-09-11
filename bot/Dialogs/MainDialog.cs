// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using CoreBot.Dialogs;
using CoreBot.Models;
using Luis;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Logging;
using Microsoft.Recognizers.Text.DataTypes.TimexExpression;
using Newtonsoft.Json;

namespace Microsoft.BotBuilderSamples.Dialogs
{
    public class MainDialog : ComponentDialog
    {
        private readonly GlobalRecognizer _luisRecognizer;
        protected readonly ILogger Logger;

        // Dependency injection uses this constructor to instantiate MainDialog
        public MainDialog(GlobalRecognizer luisRecognizer, ILogger<MainDialog> logger)
            : base(nameof(MainDialog))
        {
            _luisRecognizer = luisRecognizer;
            Logger = logger;

            AddDialog(new TextPrompt(nameof(TextPrompt)));
            AddDialog(new SayHelloDialog());
            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), new WaterfallStep[]
            {
                IntroStepAsync,
                ActStepAsync,
                FinalStepAsync,
            }));

            // The initial child Dialog to run.
            InitialDialogId = nameof(WaterfallDialog);
        }

        private async Task<DialogTurnResult> IntroStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            if (!_luisRecognizer.IsConfigured)
            {
                await stepContext.Context.SendActivityAsync(
                    MessageFactory.Text("NOTE: LUIS is not configured. To enable all capabilities, add 'LuisAppId', 'LuisAPIKey' and 'LuisAPIHostName' to the appsettings.json file.", inputHint: InputHints.IgnoringInput), cancellationToken);

                return await stepContext.NextAsync(null, cancellationToken);
            }

            return new DialogTurnResult(DialogTurnStatus.Waiting);
        }

        private async Task<DialogTurnResult> ActStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Call LUIS and gather any potential booking details. (Note the TurnContext has the response to the prompt.)
            var luisResult = await _luisRecognizer.RecognizeAsync<Intro>(stepContext.Context, cancellationToken);
            switch (luisResult.TopIntent().intent)
            {
                //case FlightBooking.Intent.BookFlight:
                //    //await ShowWarningForUnsupportedCities(stepContext.Context, luisResult, cancellationToken);

                //    // Initialize BookingDetails with any entities we may have found in the response.
                //    var bookingDetails = new BookingDetails()
                //    {
                //        // Get destination and origin from the composite entities arrays.
                //        Destination = luisResult.ToEntities.Airport,
                //        Origin = luisResult.FromEntities.Airport,
                //        TravelDate = luisResult.TravelDate,
                //    };

                //    // Run the BookingDialog giving it whatever details we have from the LUIS call, it will fill out the remainder.
                //    return await stepContext.BeginDialogAsync(nameof(BookingDialog), bookingDetails, cancellationToken);
                case Intro.Intent.SayHello:
                    return await stepContext.BeginDialogAsync(nameof(SayHelloDialog), cancellationToken);
                case Intro.Intent.CheckCode:
                    {
                        var data = stepContext.Context.Activity.ChannelData as dynamic;
                        var message = string.Empty;

                        try
                        {
                            var errors = JsonConvert.DeserializeObject<List<ClientError>>(JsonConvert.SerializeObject(data.errors));

                            message = "Erreur trouvé :<br>";

                            foreach (var item in errors)
                            {
                                message += $"Ligne {item.Line} : {item.Message}<br>";

                                if (item.Source == "tslint")
                                {
                                    var reg = new Regex(@"\(([^)]+)\)");
                                    var flag = reg.Match(item.Message);

                                    message += $"https://palantir.github.io/tslint/rules/{item.Code}<br>";
                                }
                            }

                        }catch(Exception ex)
                        {
                            message = ex.ToString();
                        }

                        var errorMsg = MessageFactory.Text(message, message, InputHints.IgnoringInput);
                        await stepContext.Context.SendActivityAsync(errorMsg, cancellationToken);

                        break;
                    }

                default:
                    // Catch all for unhandled intents
                    var didntUnderstandMessageText = $"Désolé, je n'ai pas très bien compris. Veuillez recommencer.";
                    var didntUnderstandMessage = MessageFactory.Text(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
                    await stepContext.Context.SendActivityAsync(didntUnderstandMessage, cancellationToken);
                    break;
            }

            return await stepContext.NextAsync(null, cancellationToken);
        }

        private async Task<DialogTurnResult> FinalStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // If the child dialog ("BookingDialog") was cancelled, the user failed to confirm or if the intent wasn't BookFlight
            // the Result here will be null.
            if (stepContext.Result is BookingDetails result)
            {
                // Now we have all the booking details call the booking service.

                // If the call to the booking service was successful tell the user.

                var timeProperty = new TimexProperty(result.TravelDate);
                var travelDateMsg = timeProperty.ToNaturalLanguage(DateTime.Now);
                var messageText = $"I have you booked to {result.Destination} from {result.Origin} on {travelDateMsg}";
                var message = MessageFactory.Text(messageText, messageText, InputHints.IgnoringInput);
                await stepContext.Context.SendActivityAsync(message, cancellationToken);
            }

            return await stepContext.ReplaceDialogAsync(InitialDialogId);
        }
    }
}
