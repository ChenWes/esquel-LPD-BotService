var fetch = require('node-fetch');
var defaultConfig = require('../config/default.json');
var HttpsProxyAgent = require('https-proxy-agent');

module.exports = {
    searchFabric: function (fabricNO, access_token) {
        var queryEntity = {
            "filterType": "LEAF",
            "filters": [{}],
            "attributeName": "item_number",
            "searchOperator": "eq",
            "filterValue": fabricNO
        }

        var fabrics = [];
        // Set up the request
        return new Promise(function (resolve, reject) {
            try {

                fetch(defaultConfig.apiUrl.getFabricSigleApi,
                    {
                        agent: new HttpsProxyAgent('http://192.168.27.4:8083'),
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': 'Bearer ' + access_token
                        },
                        body: JSON.stringify(queryEntity)
                    })
                    .then((response) => {
                        return response.json();
                    })
                    .then((responseJsonData) => {
                        var getresponse = responseJsonData;
                        if (getresponse.resultType === "SUCCESS") {
                            if (getresponse.results) {
                                if (getresponse.results[0].data) {
                                    var getdata = getresponse.results[0].data;

                                    for (let i = 0; i < getdata.length; i++) {
                                        fabrics.push(getdata[i]);
                                    }
                                    resolve(fabrics);
                                }
                                else {
                                    reject(new Error('WebAPI Error :resultType.results[0].data Value Is Null Or Empty'));
                                }
                            }
                            else {
                                reject(new Error('WebAPI Error :resultType.results Value Is Null Or Empty'));
                            }
                        }
                        else {
                            reject(new Error('WebAPI Error :resultType Value Is ' + getresponse.resultType));
                        }
                    })
                    .catch((error) => {
                        reject(new Error('WebAPI Error :' + error.message));
                    });

            } catch (e) {
                reject(e);
            }

        });
    }
};