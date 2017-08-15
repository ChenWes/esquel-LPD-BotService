let builder = require("botbuilder");
// garment style colorway to card Helpers
exports.helloAttachment = function (session, helloMessage) {
    return new builder.HeroCard(session)
        .title(helloMessage.title || '')
        .subtitle(helloMessage.subtitle || '')
        .text(helloMessage.text || '')
        .buttons(helloMessage.buttonArray.map(function (buttonAction) {
            return builder.CardAction.postBack(session, buttonAction.command, buttonAction.title);
        }));
}