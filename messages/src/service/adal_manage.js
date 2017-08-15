let adal = require('adal-node');
let config = require("../../config/default.json").adalConfig;

let AuthenticationContext = adal.AuthenticationContext;

//get value from config
let adalParameters = {
    tenant: config.tenant,
    authorityHostUrl: config.authorityHostUrl,
    clientId: config.clientId,
    clientSecret: config.clientSecret
};
let authorityUrl = adalParameters.authorityHostUrl + '/' + adalParameters.tenant;
let resource = config.resource;

let context = new AuthenticationContext(authorityUrl);

module.exports = {
    getToken: function () {
        return new Promise(function (resolve, reject) {
            try {
                context.acquireTokenWithClientCredentials(resource, adalParameters.clientId, adalParameters.clientSecret, function (err, tokenResponse) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(tokenResponse);
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }
};