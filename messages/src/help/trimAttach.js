let builder = require("botbuilder");
// trim to card Helplers
exports.trimAttachment = function (trim) {
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