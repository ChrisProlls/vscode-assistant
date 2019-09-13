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
                        var response = new BotResponse();

                        try
                        {
                            var errors = JsonConvert.DeserializeObject<List<ClientError>>(JsonConvert.SerializeObject(data.errors));

                            message = "Erreur(s) trouvée(s) :<br>";

                            foreach (var item in errors)
                            {
                                message += $"Ligne {item.Line} : {item.Message}<br>";

                                if (item.Source == "tslint")
                                {
                                    var reg = new Regex(@"\(([^)]+)\)");
                                    var groups = reg.Match(item.Message).Groups;

                                    if(groups.Count > 0)
                                    message += $"https://palantir.github.io/tslint/rules/{groups[1]}<br>";
                                }
                            }

                            response.Result = 100 - errors.Count;

                        }catch(Exception ex)
                        {
                            message = ex.ToString();
                        }

                        if (response.Result > 90)
                            await SendOk(stepContext, message, response, cancellationToken);
                        else
                            await SendHell(stepContext, message, response, cancellationToken);

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

        private async Task SendHell(WaterfallStepContext stepContext, string message, BotResponse response, CancellationToken cancellationToken)
        {
            var somethingWrong = MessageFactory.Text("https://media.giphy.com/media/fwDprKZ2a3dqUwvEtK/giphy.gif", "https://media.giphy.com/media/fwDprKZ2a3dqUwvEtK/giphy.gif", InputHints.IgnoringInput);
            response.IsImage = true;
            somethingWrong.ChannelData = response;
            await stepContext.Context.SendActivityAsync(somethingWrong);
            await Task.Delay(4000);

            var errorMsg = MessageFactory.Text("J'ai détecté beaucoup trop d'erreurs dans votre code ! Ne bougez pas, j'ai la solution ...", "", InputHints.IgnoringInput);
            response.IsImage = false;
            errorMsg.ChannelData = response;
            await stepContext.Context.SendActivityAsync(errorMsg, cancellationToken);
            await Task.Delay(4000);

            var warnings = MessageFactory.Text("https://ljdchost.com/038/E7BPLat.jpg", "https://ljdchost.com/038/E7BPLat.jpg", InputHints.IgnoringInput);
            response.IsImage = true;
            warnings.ChannelData = response;
            await stepContext.Context.SendActivityAsync(warnings);
            await Task.Delay(4000);
        }

        private async Task SendOk(WaterfallStepContext stepContext, string message, BotResponse response, CancellationToken cancellationToken)
        {
            var successGif = MessageFactory.Text("https://media.giphy.com/media/jlVuRWCKNwYCc/giphy.gif", "https://media.giphy.com/media/jlVuRWCKNwYCc/giphy.gif", InputHints.IgnoringInput);
            response.IsImage = true;
            successGif.ChannelData = response;
            await stepContext.Context.SendActivityAsync(successGif, cancellationToken);

            await Task.Delay(3000);

            var errorMsg = MessageFactory.Text(message, message, InputHints.IgnoringInput);
            response.IsImage = false;
            errorMsg.ChannelData = response;
            await stepContext.Context.SendActivityAsync(errorMsg, cancellationToken);
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
