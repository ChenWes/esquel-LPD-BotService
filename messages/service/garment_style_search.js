var fetch = require('node-fetch');
var defaultConfig = require('../config/default.json');

module.exports = {
    searchGarmentStyle: function (garmentStyleNo, access_token) {
        var queryEntity = {
            "filterType": "LEAF",
            "filters": [{}],
            "attributeName": "item_number",
            "searchOperator": "eq",
            "filterValue": garmentStyleNo
        }

        // var post_options = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json',
        //         'Authorization': 'Bearer ' + access_token
        //     },
        //     body: JSON.stringify(queryEntity),
        //     json: true
        // };

        var garmentstyles = [];
        // Set up the request
        return new Promise(function (resolve, reject) {
            try {

                // var options = {
                //     // "GET": "POST",
                //     "hostname": "designer-workbench.azurewebsites.net",
                //     "port": null,
                //     "path": "/api/v1/masterdata",
                //     "headers": {
                //         "authorization": "Bearer " + access_token,
                //         "content-type": "application/json"
                //     }
                // };

                // var req = http.request(options, function (res) {
                //     var chunks = [];

                //     res.on("data", function (chunk) {
                //         chunks.push(chunk);
                //     });

                //     res.on("end", function () {
                //         var body = Buffer.concat(chunks);
                //         console.log(body.toString());
                //         resolve(null);
                //     });
                // });

                // req.write(JSON.stringify({
                //     filterType: 'LEAF',
                //     filters: [{}],
                //     attributeName: 'item_number',
                //     searchOperator: 'eq',
                //     filterValue: '15CNLI001CL'
                // }));
                // req.end();

                //-------------------------------------------------------------------------------------------------------------

                fetch(defaultConfig.apiUrl.getGarmentStyleSigleApi,
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
                                        garmentstyles.push(getdata[i]);
                                    }
                                    resolve(garmentstyles);
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