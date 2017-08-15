let aras_manage = require('./aras_manage');
let parseString = require('xml2js').parseString;

module.exports = {
    searchPLU: function (plu) {

        let requestAML = '<AML><Item type="Garment" action="get"><Relationships><Item type="Garment Style Contains Option" action="get"><related_id><Item type="Garment Style Option" action="get"><cn_plu>' + plu + '</cn_plu><colorway><Item type="Colorway" action="get"></Item></colorway></Item></related_id></Item></Relationships></Item></AML>';

        let resultData = {};
        // Set up the request
        return new Promise(function (resolve, reject) {
            try {
                aras_manage.runAML(requestAML)
                    .then((responseXML) => {

                        let responseObject = parseString(responseXML, { explicitArray: false, ignoreAttrs: true }, function (err2, result) {
                            if (err2) reject(new Error('Process AML Error:' + err2.message));

                            //check data
                            if (result['SOAP-ENV:Envelope']) {
                                let data_Envelope = result['SOAP-ENV:Envelope'];
                                //get body
                                if (data_Envelope['SOAP-ENV:Body']) {
                                    let data_Body = data_Envelope['SOAP-ENV:Body'];

                                    //get fault
                                    if (data_Body['SOAP-ENV:Fault']) {
                                        resolve(resultData);
                                    }

                                    //get result
                                    if (data_Body.Result) {
                                        let data_Result = data_Body.Result;

                                        resultData.styleno = data_Result.Item.item_number;
                                        resultData.colorway = data_Result.Item.Relationships.Item.related_id.Item.colorway.Item.cn_colorway;

                                        resolve(resultData);
                                    } else {
                                        reject(new Error('Result no data'));
                                    }
                                } else {
                                    reject(new Error('SOAP-ENV:Body no data'));
                                }
                            } else {
                                reject(new Error('SOAP-ENV:Envelope no data'));
                            }
                        });
                    })
                    .catch((err) => {
                        reject(new Error('Aras Run AML Error:' + err.message));
                    })
            } catch (e) {
                reject(e);
            }
        });
    }
};