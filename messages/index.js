/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add
natural language support to a bot.
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
let builder = require("botbuilder");
let botbuilder_azure = require("botbuilder-azure");

let garmentstyle_service_helper = require('./src/service/garment_style_search');
let fabrich_service_helper = require('./src/service/fabric_search');
let trim_service_helper = require('./src/service/trim_search');
let adal_manage_helper = require('./src/service/adal_manage');
let aras_plu_manage_helper = require('./src/service/aras_plu_manage');
let config = require('./config/default.json');


let hello_attachment_helper = require('./src/help/helloAttach');
let garmentstyle_attachment_helper = require('./src/help/garmentStyleAttach');
let fabric_attachment_helper = require('./src/help/fabricAttach');
let trim_attachment_helper = require('./src/help/trimAttach');

let useEmulator = (process.env.NODE_ENV == 'development');

let connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

let bot = new builder.UniversalBot(connector);

//set localizer
bot.set('localizerSettings', {
    botLocalePath: "./config/customLocale",
    defaultLocale: config.default_locale
});

//first time send hello message
bot.on('conversationUpdate', function (activity) {
    if (activity.membersAdded) {
        activity.membersAdded.forEach(function (identity) {
            if (identity.id === activity.address.bot.id) {

                let reply = new builder.Message()
                    .address(activity.address)
                    .text('hi');
                bot.send(reply);
            }
        });
    }
});


// Make sure you add code to validate these fields
let luisAppId = process.env.LuisAppId;
let luisAPIKey = process.env.LuisAPIKey;
let luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
let recognizer = new builder.LuisRecognizer(LuisModelUrl);
let intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('SearchGarmentStyle', [
        function (session, args, next) {
            let start_message = session.gettext('searchGarmentStyle_ReceiveReply', session.message.text);
            session.send(start_message);
            // try extracting entities
            let garmentStyleEntity = builder.EntityRecognizer.findEntity(args.entities, 'GarmentStyleNo');
            if (garmentStyleEntity) {
                next({ response: garmentStyleEntity.entity });
            } else {
                // no entities detected, ask user for a garment style, same as get parameter from Luis
                builder.Prompts.text(session, 'searchGarmentStyle_Parameter_prompt');
            }
        },
        function (session, results) {
            let garmentStyleNo = results.response;
            if (garmentStyleNo) {
                garmentStyleNo = garmentStyleNo.replace(/\s+/g, "");

                adal_manage_helper.getToken()
                    .then((token_object) => {
                        return garmentstyle_service_helper.searchGarmentStyle(garmentStyleNo, token_object.accessToken);
                    })
                    .then((GarmentStyles) => {
                        if (GarmentStyles && GarmentStyles.length > 0) {
                            return GarmentStyles[0];
                        } else {
                            return null;
                        }
                    })
                    .then((getstyle) => {
                        if (getstyle) {
                            let message = new builder.Message()
                                .text(getstyle.linePlanProducts.productID + '(' + getstyle.linePlanProducts.productVersion + getstyle.linePlanProducts.productVersionSerialNo + ')')
                                .attachmentLayout(builder.AttachmentLayout.carousel)
                                .attachments(getstyle.linePlanProducts.productMaterialConfigs.map(garmentstyle_attachment_helper.garmentStyleColorwayAttachment));

                            session.send(message).endDialog();
                        } else {
                            session.send('searchGarmentStyle_NoFound').endDialog();
                        }
                    })
                    .catch((err) => {
                        session.send('searchGarmentStyle_Error').endDialog();
                    });

            } else {
                session.send('searchGarmentStyle_Error').endDialog();
            }
        }
    ])
    .matches('SearchFabric', [
        function (session, args, next) {
            let start_message = session.gettext('searchFabric_ReceiveReply', session.message.text);
            session.send(start_message);
            // try extracting entities
            let fabricEntity = builder.EntityRecognizer.findEntity(args.entities, 'FabricNo');
            if (fabricEntity) {
                next({ response: fabricEntity.entity });
            } else {
                // no entities detected, ask user for a fabric, same as get parameter from Luis
                builder.Prompts.text(session, 'searchFabric_Parameter_prompt');
            }
        },
        function (session, results) {
            let fabricNo = results.response;
            if (fabricNo) {
                fabricNo = fabricNo.replace(/\s+/g, "");

                adal_manage_helper.getToken()
                    .then((token_object) => {
                        return fabrich_service_helper.searchFabric(fabricNo, token_object.accessToken);
                    })
                    .then((Fabrics) => {
                        if (Fabrics) {
                            let message = new builder.Message()
                                .attachmentLayout(builder.AttachmentLayout.carousel)
                                .attachments(Fabrics.map(trim_attachment_helper.trimAttachment));
                            //send message
                            session.send(message).endDialog();
                        } else {
                            session.send('searchFabric_NoFound').endDialog();
                        }
                    })
                    .catch((err) => {
                        session.send('searchFabric_Error').endDialog();
                    });
            } else {
                session.send('searchFabric_Error').endDialog();
            }
        }
    ])
    .matches('SearchTrim', [
        function (session, args, next) {
            let start_message = session.gettext('searchTrim_ReceiveReply', session.message.text);
            session.send(start_message);
            // try extracting entities
            let trimEntity = builder.EntityRecognizer.findEntity(args.entities, 'TrimNo');
            if (trimEntity) {
                next({ response: trimEntity.entity });
            } else {
                // no entities detected, ask user for a trim, same as get parameter from Luis
                builder.Prompts.text(session, 'searchTrim_Parameter_prompt');
            }
        },
        function (session, results) {
            let trimNo = results.response;
            if (trimNo) {
                trimNo = trimNo.replace(/\s+/g, "");

                adal_manage_helper.getToken()
                    .then((token_object) => {
                        return trim_service_helper.searchTrim(trimNo, token_object.accessToken);
                    })
                    .then((Trims) => {
                        if (Trims && Trims.length > 0) {
                            let message = new builder.Message()
                                .attachmentLayout(builder.AttachmentLayout.carousel)
                                .attachments(Trims.map(trim_attachment_helper.trimAttachment));
                            //send message
                            session.send(message).endDialog();
                        } else {
                            session.send('searchTrim_NoFound').endDialog();
                        }
                    })
                    .catch((err) => {
                        session.send('searchTrim_Error').endDialog();
                    });
            } else {
                session.send('searchTrim_Error').endDialog();
            }
        }
    ])
    .matches('SearchPLU', [
        function (session, args, next) {
            let start_message = session.gettext('searchPLU_ReceiveReply', session.message.text);
            session.send(start_message);
            let garmentStyleEntity = builder.EntityRecognizer.findEntity(args.entities, 'GarmentStyleNo');
            if (garmentStyleEntity) {
                //save user data - styleNo
                // session.userData.styleNo = garmentStyleEntity.entity;
                next({ response: garmentStyleEntity.entity });
            } else {
                // no entities detected, ask user for a garment style, same as get parameter from Luis
                builder.Prompts.text(session, 'searchPLU_Parameter_style_prompt');
            }
            // }
        },
        function (session, results) {
            let garmentStyleNo = results.response;
            if (garmentStyleNo) {
                garmentStyleNo = garmentStyleNo.replace(/\s+/g, "");

                //save user data - styleNo
                // session.userData.styleNo = garmentStyleNo;

                adal_manage_helper.getToken()
                    .then((token_object) => {
                        return garmentstyle_service_helper.searchGarmentStyle(garmentStyleNo, token_object.accessToken);
                    })
                    .then((GarmentStyles) => {
                        if (GarmentStyles && GarmentStyles.length > 0) {
                            let getstyle = GarmentStyles[0];
                            let colorways = getstyle.linePlanProducts.productMaterialConfigs;
                            if (colorways) {
                                let colorwayArray = [];
                                for (let i = 0; i < colorways.length; i++) {
                                    colorwayArray.push(colorways[i].colorway);
                                }
                                //set temp data , we can found colorway in next function
                                session.userData.colorwayData = colorways;

                                builder.Prompts.choice(session, 'searchPLU_Parameter_colorway_choice', colorwayArray);
                            } else {
                                session.send('searchPLU_nocolorway_reply', garmentStyleNo).endDialog();
                            }
                        }
                        else {
                            session.send('searchPLU_Parameter_style_nofound').endDialog();
                        }
                    })
                    .catch((err) => {
                        session.send('searchPLU_Error').endDialog();
                    });

            } else {
                session.send('searchPLU_Error').endDialog();
            }
        },
        function (session, results) {
            let selectColorwayData = session.userData.colorwayData[results.response.index];

            if (selectColorwayData) {
                if (selectColorwayData.pluNumber) {
                    // session.send('garment style [' + session.userData.styleNo + '] colorway [' + results.response.entity + '] plu number is');
                    session.send(selectColorwayData.pluNumber);
                } else {
                    session.send('garment style ' + session.userData.styleNo + ' colorway ' + results.response.entity + ' plu number is empty');
                }
            } else {
                session.send('garment style ' + session.userData.styleNo + ' can not found colorway ' + results.response.entity);
            }
            session.endDialog();
        }
    ])
    .matches('CheckPLU', [
        function (session, args, next) {
            let start_message = session.gettext('checkPLU_ReceiveReply', session.message.text);
            session.send(start_message);
            let pluNoEntity = builder.EntityRecognizer.findEntity(args.entities, 'PLUNo');
            if (pluNoEntity) {
                //save user data - pluNo
                // session.userData.pluNo = pluNoEntity.entity;
                next({ response: pluNoEntity.entity });
            } else {
                // no entities detected, ask user for a garment style, same as get parameter from Luis
                builder.Prompts.text(session, 'checkPLU_Parameter_prompt');
            }
        },
        function (session, results) {
            let pluNo = results.response;

            aras_plu_manage_helper.searchPLU(pluNo)
                .then((getdata) => {
                    if (getdata.styleno && getdata.colorway) {
                        // session.send('checkPLU_PLUReply');
                        // session.send(pluNo);
                        session.send('checkPLU_StyleReply');
                        session.send(getdata.styleno);
                        session.send('checkPLU_ColorwayReply');
                        session.send(getdata.colorway);

                        session.endDialog();
                    } else {
                        session.send('checkPLU_NoFound').endDialog();
                    }
                })
                .catch((err) => {
                    session.send('checkPLU_Error').endDialog();
                });

        }
    ])
    .matches('Hello',
    function (session, args) {
        let helloMessage =
            {
                'title': session.gettext('hello_title'),
                'subtitle': session.gettext('hello_subtitle'),
                'text': session.gettext('hello_text') ,
                'buttonArray': [
                    {
                        'title': session.gettext('hello_action_searchstyle_title'),
                        'command': session.gettext('hello_action_searchstyle_command'),
                    },
                    {
                        'title': session.gettext('hello_action_searchfabric_title'),
                        'command': session.gettext('hello_action_searchfabric_command'),
                    },
                    {
                        'title': session.gettext('hello_action_searchtrim_title'),
                        'command': session.gettext('hello_action_searchtrim_command'),
                    },
                    {
                        'title': session.gettext('hello_action_searchplu_title'),
                        'command': session.gettext('hello_action_searchplu_command'),
                    },
                    {
                        'title': session.gettext('hello_action_checkplu_title'),
                        'command': session.gettext('hello_action_checkplu_command'),
                    }
                ]
            };

        let card = hello_attachment_helper.helloAttachment(session, helloMessage);
        var message = new builder.Message(session).addAttachment(card);
        session.send(message);
    }
    )
    .onDefault((session) => {
        session.send('default', session.message.text);
    });

bot.dialog('/', intents);


bot.dialog('localeDialog', [
    function (session) {
        // Prompt the user to select their preferred locale
        builder.Prompts.choice(session, "locale_prompt", 'English|中文');
    },
    function (session, results) {
        // Update preferred locale
        var locale;
        switch (results.response.entity) {
            case 'English':
                locale = 'en';
                break;
            case '中文':
                locale = 'cn';
                break;
        }
        session.preferredLocale(locale, function (err) {
            if (!err) {
                // Locale files loaded
                session.endDialog('locale_updated');
            } else {
                // Problem loading the selected locale
                session.error(err);
            }
        });
    }
]);

if (useEmulator) {
    let restify = require('restify');
    let server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

