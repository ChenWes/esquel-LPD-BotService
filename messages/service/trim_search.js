var fetch = require('node-fetch');
var defaultConfig = require('../config/default.json');

module.exports = {
    searchTrim: function (trimNO, access_token) {
        var queryEntity = {
            "filterType": "LEAF",
            "filters": [{}],
            "attributeName": "item_number",
            "searchOperator": "eq",
            "filterValue": trimNO
        }

        var trims = [];
        // Set up the request
        return new Promise(function (resolve, reject) {
            try {

                fetch(defaultConfig.apiUrl.getTrimSigleApi,
                    {
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
                                        trims.push(getdata[i]);
                                    }
                                    resolve(trims);
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