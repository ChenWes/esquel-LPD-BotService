var adal = require('adal-node');

var AuthenticationContext = adal.AuthenticationContext;

var adalParameters = {
    tenant: 'esquel.onmicrosoft.com',
    authorityHostUrl: 'https://login.windows.net',
    clientId: 'f4489968-3421-4b88-87b0-ccf545835db6',
    clientSecret: 'VzeH2xMC/i+6nyCqKvlBxefb0EYJRIaqpuLFl1vWYRE='
};
var authorityUrl = adalParameters.authorityHostUrl + '/' + adalParameters.tenant;
var resource = 'https://esquel.onmicrosoft.com/705cadd7-d8b2-44f7-9c28-3841c112f04b';
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