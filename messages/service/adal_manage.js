var adal = require('adal-node');
var config = require("../config/default.json").adalConfig;

var AuthenticationContext = adal.AuthenticationContext;

//get value from config
var adalParameters = {
    tenant: config.tenant,
    authorityHostUrl: config.authorityHostUrl,
    clientId: config.clientId,
    clientSecret: config.clientSecret
};
var authorityUrl = adalParameters.authorityHostUrl + '/' + adalParameters.tenant;
var resource = config.resource;

var context = new AuthenticationContext(authorityUrl);

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