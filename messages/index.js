/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var Promise = require('bluebird');

var useEmulator = true;// (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: '79697cee-9391-48b7-b164-3036e3e9d105',//process.env['MicrosoftAppId'],
    appPassword: 'JaHsadjeqzSddMrj5ZWuxCN',//process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = '3d117394-44c3-416f-ab11-96e8d451018d';//process.env.LuisAppId;
var luisAPIKey = 'f21ea5607c6b43589c12e6099b0a9614'; //process.env.LuisAPIKey;
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
                // Async search WebAPI
                session.send('found garment style number \'%s\' , search data from API', trimNo);
                session.endDialog();
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
                // Async search WebAPI
                session.send('found fabric number \'%s\' , search data from API', fabricNo);
                session.endDialog();
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
                // Async search WebAPI
                session.send('found trim number \'%s\' , search data from API', trimNo);
                session.endDialog();
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

