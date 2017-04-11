/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var garmentstyle_helper = require('./service/garment_style_search');
var fabricSearchHelper = require('./service/fabric_search');
var trimSearchHelper = require('./service/trim_search');
var adal_manage = require('./service/adal_manage');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('SearchGarmentStyle', [
        function (session, args, next) {
            session.send('hi ,we are analyzing your message: \'%s\' for search garment style, please wait.', session.message.text);
            // try extracting entities
            var garmentStyleEntity = builder.EntityRecognizer.findEntity(args.entities, 'GarmentStyleNo');
            if (garmentStyleEntity) {
                next({ response: garmentStyleEntity.entity });
            } else {
                // no entities detected, ask user for a garment style, same as get parameter from Luis
                builder.Prompts.text(session, 'Please enter garment style no');
            }
        },
        function (session, results) {
            var garmentStyleNo = results.response;
            if (garmentStyleNo) {
                garmentStyleNo = garmentStyleNo.replace(/\s+/g, "");

                //get token
                adal_manage.getToken()
                    .then((token_object) => {
                        // console.log(token_object.accessToken);
                        //call webapi
                        garmentstyle_helper
                            .searchGarmentStyle(garmentStyleNo, token_object.accessToken)
                            .then((GarmentStyles) => {
                                if (GarmentStyles && GarmentStyles.length > 0) {
                                    //foreach data
                                    for (var getstyle of GarmentStyles) {
                                        // add message
                                        var message = new builder.Message()
                                            .text(getstyle.linePlanProducts.productID + '(' + getstyle.linePlanProducts.productVersion + getstyle.linePlanProducts.productVersionSerialNo + ')')
                                            .attachmentLayout(builder.AttachmentLayout.carousel)
                                            .attachments(getstyle.linePlanProducts.productMaterialConfigs.map(garmentStyleColorwayAttachment));

                                        session.send(message);
                                    }

                                    session.endDialog();
                                }
                                else {
                                    // no found
                                    session.send('can not found garment style \"%s\"', garmentStyleNo);
                                    session.endDialog();
                                }
                            },
                            (err) => {
                                session.send('[searchGarmentStyle Error:]' + err.message ? err.message : '');
                                session.endDialog();
                            });
                    }, (error) => {
                        session.send('[getToken Error:]' + err.message ? err.message : '');
                        session.endDialog();
                    });

            } else {
                session.send('can not found garment style number from you message \'%s\' ', session.message.text);
                session.endDialog();
            }
        }
    ])
    .matches('SearchFabric', [
        function (session, args, next) {
            session.send('hi ,we are analyzing your message: \'%s\' for search fabric, please wait.', session.message.text);
            // try extracting entities
            var fabricEntity = builder.EntityRecognizer.findEntity(args.entities, 'FabricNo');
            if (fabricEntity) {
                next({ response: fabricEntity.entity });
            } else {
                // no entities detected, ask user for a fabric, same as get parameter from Luis
                builder.Prompts.text(session, 'Please enter fabric no');
            }
        },
        function (session, results) {
            var fabricNo = results.response;
            if (fabricNo) {
                fabricNo = fabricNo.replace(/\s+/g, "");

                //get token
                adal_manage.getToken()
                    .then((token_object) => {
                        // console.log(token_object.accessToken);
                        //call webapi
                        fabricSearchHelper
                            .searchFabric(fabricNo, token_object.accessToken)
                            .then((Fabrics) => {
                                if (Fabrics && Fabrics.length > 0) {
                                    //foreach data
                                    for (var getfabric of Fabrics) {
                                        // add message
                                        var message = new builder.Message()
                                            .attachmentLayout(builder.AttachmentLayout.carousel)
                                            .attachments(Fabrics.map(fabricAttachment));
                                        //send message
                                        session.send(message);
                                    }

                                    session.endDialog();
                                }
                                else {
                                    // no found
                                    session.send('can not found fabric \"%s\"', fabricNo);
                                    session.endDialog();
                                }
                            },
                            (err) => {
                                session.send('[searchFabric Error:]' + err.message ? err.message : '');
                                session.endDialog();
                            });
                    }, (error) => {
                        session.send('[getToken Error:]' + err.message ? err.message : '');
                        session.endDialog();
                    });
            } else {
                session.send('can not found fabric number from you message \'%s\' ', session.message.text);
                session.endDialog();
            }
        }
    ])
    .matches('SearchTrim', [
        function (session, args, next) {
            session.send('hi ,we are analyzing your message: \'%s\' for search trim, please wait.', session.message.text);
            // try extracting entities
            var trimEntity = builder.EntityRecognizer.findEntity(args.entities, 'TrimNo');
            if (trimEntity) {
                next({ response: trimEntity.entity });
            } else {
                // no entities detected, ask user for a trim, same as get parameter from Luis
                builder.Prompts.text(session, 'Please enter trim no');
            }
        },
        function (session, results) {
            var trimNo = results.response;
            if (trimNo) {
                trimNo = trimNo.replace(/\s+/g, "");

                //get token
                adal_manage.getToken()
                    .then((token_object) => {
                        // console.log(token_object.accessToken);
                        //call webapi
                        trimSearchHelper
                            .searchTrim(trimNo, token_object.accessToken)
                            .then((Trims) => {
                                if (Trims && Trims.length > 0) {
                                    //foreach data
                                    // for (var gettrim of Trims) {
                                    // add message
                                    var message = new builder.Message()
                                        .attachmentLayout(builder.AttachmentLayout.carousel)
                                        .attachments(Trims.map(trimAttachment));
                                    //send message
                                    session.send(message);
                                    // }

                                    session.endDialog();
                                }
                                else {
                                    // no found
                                    session.send('can not found trim \"%s\"', garmentStyleNo);
                                    session.endDialog();
                                }
                            },
                            (err) => {
                                session.send('[searchTrim Error:]' + err.message ? err.message : '');
                                session.endDialog();
                            });
                    }, (error) => {
                        session.send('[getToken Error:]' + err.message ? err.message : '');
                        session.endDialog();
                    });
            } else {
                session.send('can not found trim number from you message \'%s\' ', session.message.text);
                session.endDialog();
            }
        }
    ])
    .matches('Hello', builder.DialogAction.send('hi! welcome use Esquel LPD Bot, try asking me things like \'search germent style XXX\', \'search style XXX\' or \'style XXX\''))
    .onDefault((session) => {
        session.send('sorry , i have no idea what you talking about.\"%s\"', session.message.text);
    });

bot.dialog('/', intents);


// garment style colorway to card Helpers
function garmentStyleColorwayAttachment(colorway) {
    return new builder.ThumbnailCard()
        .title(colorway.colorway + "(" + colorway.optionNo + ")")
        .subtitle(colorway.primaryFabricID)
        .text(colorway.pluNumber)
        .images([new builder.CardImage().url(colorway.PrimaryFabricImageUrl)])
        .buttons([
            new builder.CardAction()
                .title('View Primary Fabric')
                .type('imBack')
                .value('search fabric ' + colorway.primaryFabricID),
            new builder.CardAction()
                .title('View Fabric Image')
                .type('openUrl')
                .value(colorway.PrimaryFabricImageUrl)
        ]);
}

// fabric to card Helplers
function fabricAttachment(fabric) {
    return new builder.HeroCard()
        .title(fabric.fabricID)
        .subtitle(fabric.fabricNo)
        .text(fabric.longDescriptions.join(' '))
        .images([
            new builder.CardImage().url(fabric.imageURL)])
        .buttons([
            new builder.CardAction()
                .title('View Image')
                .type('openUrl')
                .value(fabric.imageURL)
        ]);
}

// trim to card Helplers
function trimAttachment(trim) {
    return new builder.HeroCard()
        .title(trim.apparelTrimID)
        .subtitle(trim.apparelTrimID)
        .text(trim.longDescriptions.join(' '))
        .images([
            new builder.CardImage().url(trim.imageURL)])
        .buttons([
            new builder.CardAction()
                .title('View Image')
                .type('openUrl')
                .value(trim.imageURL)
        ]);
}



if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

