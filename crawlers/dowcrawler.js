var request = require('request-promise-native');
const publiser = require('../publisher/publisher.js');
const queue = new publiser();

let requestPayload = function (symbol, expDate) {

    if (!expDate) {
        expDate = Math.round(new Date().getTime() / 1000 + 432000);
    }
    let url = `https://query2.finance.yahoo.com/v7/finance/options/${symbol}?formatted=true&crumb=M1CKxOs5E7G&lang=en-US&region=US' +
    '&straddle=true&corsDomain=finance.yahoo.com&date=${expDate}`;

    console.log('crawl url is: ', url);

    return requestDefault = {
        uri: url,
        transform: function (body) {
            if (!undefined)
                return JSON.parse(body);
            else return null;
        }
    };
}


let getexpDates = async function (symbol, count) {
    let data = await request(requestPayload(symbol));
    let expiryDates = data.optionChain.result[0].expirationDates;
    if (count && count < expiryDates.length) {
        expiryDates.length = count;
    }
    console.log('get expiry dates', expiryDates);
    return expiryDates;
}


let getOptionData = async function (symbol, expDate) {

    let optionsArray = [];
    let data = await request(requestPayload(symbol, expDate));
    let optionData = data.optionChain.result[0].options[0].straddles;

    for(let item of optionData){

        let callData = {...item.call, type: "call"};

        for(let key in callData){
            
            let value = callData[key];

            if((typeof value).toLowerCase() =='object' ){
                callData[key] = value.raw || 0 ;
            }
        }
        queue.push(callData);

        let putData = {...item.put, type: "put"};

        for(let key in putData){
            
            let value = putData[key];

            if((typeof value).toLowerCase() =='object' ){
                putData[key] = value.raw || 0 ;
            }
        }
        
        queue.push(putData);
    }

}

module.exports = {
    getexpDates : getexpDates,
    getOptionData : getOptionData
}
