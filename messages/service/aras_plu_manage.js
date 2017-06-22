var aras_manage = require('./aras_manage');
var parseString = require('xml2js').parseString;

module.exports = {
    searchPLU: function (plu) {

        var requestAML = '<AML><Item type="Garment" action="get"><Relationships><Item type="Garment Style Contains Option" action="get"><related_id><Item type="Garment Style Option" action="get"><cn_plu>' + plu + '</cn_plu><colorway><Item type="Colorway" action="get"></Item></colorway></Item></related_id></Item></Relationships></Item></AML>';

        var resultData = {};
        // Set up the request
        return new Promise(function (resolve, reject) {
            try {
                aras_manage.runAML(requestAML)
                    .then((responseXML) => {

                        var responseObject = parseString(responseXML, { explicitArray: false, ignoreAttrs: true }, function (err2, result) {
                            if (err2) reject(new Error('Process AML Error:' + err2.message));                            

                            //check data
                            if (result['SOAP-ENV:Envelope']) {
                                var data_Envelope = result['SOAP-ENV:Envelope'];
                                //get body
                                if (data_Envelope['SOAP-ENV:Body']) {
                                    var data_Body = data_Envelope['SOAP-ENV:Body'];

                                    //get fault
                                    if (data_Body['SOAP-ENV:Fault']) {
                                        reject(new Error('Search AML Error:Can Not Found PLU'));
                                    }

                                    //get result
                                    if (data_Body.Result) {
                                        var data_Result = data_Body.Result;
                                        if (data_Result.Item) {
                                            //Item type="Garment"
                                            var item_Garment = data_Result.Item;

                                            if (item_Garment.item_number) {
                                                resultData.styleno = item_Garment.item_number;
                                            } else {
                                                resolve(resultData);
                                            }

                                            if (item_Garment.Relationships) {
                                                //Item type="Garment" Relationships
                                                var item_Garment_Relationships = item_Garment.Relationships;
                                                if (item_Garment_Relationships.Item) {
                                                    //Item type="Garment Style Contains Option"
                                                    var item_Garment_Style_Contains_Option = item_Garment_Relationships.Item;
                                                    if (item_Garment_Style_Contains_Option.related_id) {
                                                        //related_id keyed_name="4133440E547A48C2B157D5A03426DE6F" type="Garment Style Option"
                                                        var related_id_item_Garment_Style_Contains_Option = item_Garment_Style_Contains_Option.related_id;
                                                        if (related_id_item_Garment_Style_Contains_Option.Item) {
                                                            //Item type="Garment Style Option"
                                                            var item_Garment_Style_Option = related_id_item_Garment_Style_Contains_Option.Item;
                                                            if (item_Garment_Style_Option.colorway) {
                                                                //colorway keyed_name="CW000029 BROWN" type="Colorway"
                                                                var colorway_tem_Garment_Style_Option = item_Garment_Style_Option.colorway;
                                                                if (colorway_tem_Garment_Style_Option.Item) {
                                                                    //Item type="Colorway"
                                                                    var item_colorway = colorway_tem_Garment_Style_Option.Item;

                                                                    if (item_colorway.cn_colorway) {
                                                                        resultData.colorway = item_colorway.cn_colorway;
                                                                        resolve(resultData);
                                                                    } else {
                                                                        resolve(resultData);
                                                                    }
                                                                } else {
                                                                    resolve(resultData);
                                                                }
                                                            } else {
                                                                resolve(resultData);
                                                            }
                                                        } else {
                                                            resolve(resultData);
                                                        }

                                                    } else {
                                                        resolve(resultData);
                                                    }
                                                } else {
                                                    resolve(resultData);
                                                }
                                            } else {
                                                resolve(resultData);
                                            }

                                        } else {
                                            reject(new Error('Process AML Error:Result no data'));
                                        }
                                    } else {
                                        reject(new Error('Process AML Error:Result no data'));
                                    }
                                } else {
                                    reject(new Error('Process AML Error:SOAP-ENV:Body no data'));
                                }
                            } else {
                                reject(new Error('Process AML Error:SOAP-ENV:Envelope no data'));
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