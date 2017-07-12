var request = require('request');
var MD5 = require('md5');

// var HttpsProxyAgent = require('https-proxy-agent');
var defaultConfig = require('../config/default.json');

module.exports = {
    runAML: function (requestAML) {
        //get base setting
        var BaseSetting = defaultConfig.ArasSetting;

        // requestAML = '<AML><Item type="Garment" action="get"><Relationships><Item type="Garment Style Contains Option" action="get"><related_id><Item type="Garment Style Option" action="get"><cn_plu>11161006525</cn_plu><colorway><Item type="Colorway" action="get"></Item></colorway></Item></related_id></Item></Relationships></Item></AML>';

        //soap setting
        var nameSpace = "http://www.aras-corp.com/";
        var remoteMethod = "ApplyAML";
        var characterEncoding = "UTF-8";
        var SOAPmessage = "<SOAP-ENV:Envelope xmlns:SOAP-ENV='http://schemas.xmlsoap.org/soap/envelope/' encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'><SOAP-ENV:Body><" + remoteMethod + " xmlns:m='" + nameSpace + "'>" + requestAML + "</" + remoteMethod + "></SOAP-ENV:Body></SOAP-ENV:Envelope>";

        var url = BaseSetting.serverUrl;

        var fabrics = [];

        var requestOpetion = {
            method: 'POST',
            // agent: new HttpsProxyAgent('http://192.168.27.4:8083'),
            headers: {
                'Content-Length': SOAPmessage.length,
                'Content-Type': 'text/xml; charset=' + characterEncoding + '\'',
                'SOAPAction': 'ApplyAML',
                'AUTHUSER': BaseSetting.AUTHUSER,
                'AUTHPASSWORD': MD5(BaseSetting.AUTHPASSWORD),
                'DATABASE': BaseSetting.DATABASE
            },
            body: SOAPmessage
        }

        // Set up the request
        return new Promise(function (resolve, reject) {
            try {
                request(url, requestOpetion, function (err, response, body) {
                    if (err) reject(err);
                    resolve(body);
                });
            } catch (e) {
                reject(e);
            }

        });
    }
};