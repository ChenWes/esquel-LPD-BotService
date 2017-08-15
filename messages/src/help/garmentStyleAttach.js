let builder = require("botbuilder");
// garment style colorway to card Helpers
exports.garmentStyleColorwayAttachment = function (colorway) {
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