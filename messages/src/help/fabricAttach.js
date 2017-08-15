let builder = require("botbuilder");
// fabric to card Helplers
exports.fabricAttachment = function (fabric) {
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