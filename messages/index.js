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
.matches('SearchGarmentStyle',[
    function(session,arg,next){
        session.send('Welcome to the Hotels finder! We are analyzing your message: \'%s\'', session.message.text);
        var garmentStyleEntity = builder.EntityRecognizer.findEntity(args.entities, 'GarmentStyleNo');
        if (garmentStyleEntity) {
            next({ response: garmentStyleEntity.entity });
        } else {
            builder.Prompts.text(session, 'Please enter garment style no');
        }
    },
    function(session,results){
        var garmentStyleNo = results.response;
    
        if(garmentStyleNo)
        {
            garmentStyleNo = garmentStyleNo.replace(/\s+/g, "");
            searchHotels(garmentStyleNo)
            .then(function (hotels) {
                // args
                session.send('I found %d hotels:', hotels.length);

                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(hotels.map(hotelAsAttachment));

                session.send(message);

                // End
                session.endDialog();
            });
        }else{
            session.send('can not found garment style number from you message,please try again .');
            session.endDialog();
        }
    }
])
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});


//get image
// Helpers
function hotelAsAttachment(hotel) {
    return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        .images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=hotels+in+' + encodeURIComponent(hotel.location))
        ]);
}



var searchHotels= function (destination) {
    return new Promise(function (resolve) {

        // Filling the hotels results manually just for demo purposes
        var hotels = [];
        for (var i = 1; i <= 5; i++) {
            hotels.push({
                name: destination + ' Hotel ' + i,
                location: destination,
                rating: Math.ceil(Math.random() * 5),
                numberOfReviews: Math.floor(Math.random() * 5000) + 1,
                priceStarting: Math.floor(Math.random() * 450) + 80,
                image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=Hotel+' + i + '&w=500&h=260'
            });
        }

        hotels.sort(function (a, b) { return a.priceStarting - b.priceStarting; });

        // complete promise with a timer to simulate async response
        setTimeout(function () { resolve(hotels); }, 1000);
    });
}




bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

