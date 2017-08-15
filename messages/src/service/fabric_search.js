let fetch = require('node-fetch');
let defaultConfig = require('../../config/default.json');

module.exports = {
    searchFabric: function (fabricNO, access_token) {
        let queryEntity = {
            "filterType": "LEAF",
            "filters": [{}],
            "attributeName": "item_number",
            "searchOperator": "eq",
            "filterValue": fabricNO
        }

        let fabrics = [];
        // Set up the request
        return new Promise(function (resolve, reject) {
            try {
                fetch(defaultConfig.apiUrl.getFabricSigleApi,
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
                        let getresponse = responseJsonData;
                        if (getresponse.resultType === "SUCCESS" && getresponse.results && getresponse.results.length > 0) {
                            if (getresponse.results[0].data && getresponse.results[0].data.length > 0) {
                                fabrics = getresponse.results[0].data;
                                resolve(fabrics);
                            } else {
                                resolve(null);
                            }
                        }
                        else {
                            resolve(null);
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