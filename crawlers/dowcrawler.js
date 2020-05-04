var request = require("request-promise-native");
const publiser = require("../publisher/publisher.js");
const queue = new publiser("ussymbol");

var contractVolumeLastValues = {};

let requestPayload = function (symbol, expDate) {
  if (!expDate) {
    expDate = Math.round(new Date().getTime() / 1000 + 432000);
  }
  let url = `https://query2.finance.yahoo.com/v7/finance/options/${symbol}?formatted=true&crumb=M1CKxOs5E7G&lang=en-US&region=US' +
    '&straddle=true&corsDomain=finance.yahoo.com&date=${expDate}`;

  return (requestDefault = {
    uri: url,
    transform: function (body) {
      if (body) return JSON.parse(body);
      else return null;
    },
  });
};

let getsymbolQuotePrice = async function (symbol) {

  let url = `https://financialmodelingprep.com/api/v3/stock/real-time-price/${symbol}`;

  requestDefault = {
    uri: url,
    transform: function (body) {
      if (body) return JSON.parse(body);
      else return null;
    },
  };
  let stockQuote = await request(requestDefault);

  return stockQuote || null;
}

let getexpDates = async function (symbol, count) {
  let data = await request(requestPayload(symbol));
  if (data) {
    let expiryDates = data.optionChain.result[0].expirationDates;
    if (count && count < expiryDates.length) {
      expiryDates.length = count;
    }
    console.log("get expiry dates", expiryDates);
    return expiryDates;
  }
  else {
    return null;
  }
};

let getOptionData = async function (symbol, expDate,stockQuote) {
  let optionsArray = [];
  let data = await request(requestPayload(symbol, expDate));
  const timeStamp = new Date().toISOString();
  let optionData = data.optionChain.result[0].options[0].straddles;

  for (let item of optionData) {
    let callData = { ...item.call, symbol, timeStamp, type: "call" };

    for (let key in callData) {
      let value = callData[key];

      if ((typeof value).toLowerCase() == "object") {
        if (key == 'expiration') callData[key] = value.longFmt || 0;
        else if (key == 'lastTradeDate') callData[key] = value.longFmt || 0
        else callData[key] = value.raw || 0;
      }
    }
    //add stock current price
    if (stockQuote) {
      callData['stockPrice'] = stockQuote.price;
    }

    //check if curent volume is bigger than  previou value, if yes push event.
    if (!contractVolumeLastValues[callData.contractSymbol]) {
      console.log('Previous events undefined...')
      queue.push(callData);
    }
    else if(contractVolumeLastValues[callData.contractSymbol] && callData.volume > contractVolumeLastValues[callData.contractSymbol]) {
      console.log('New Events found..',)
      //queue.push(callData);
    }
    else{
      console.log('Ignoring the event as current volume is not greater than previous value...')
    }
    //update cache is vol is not undefined.
    if(callData.volume){
    contractVolumeLastValues[callData.contractSymbol] = callData.volume;
    }

    let putData = { ...item.put, symbol, timeStamp, type: "put" };

    for (let key in putData) {
      let value = putData[key];

      if ((typeof value).toLowerCase() == "object") {
        if (key == 'expiration') putData[key] = value.longFmt || 0;
        else if (key == 'lastTradeDate') putData[key] = value.longFmt || 0
        else putData[key] = value.raw || 0;
      }
    }
    //add stock current price
    if (stockQuote) {
      putData['stockPrice'] = stockQuote.price;
    }
    //check if curent volume is bigger than  previou value, if yes push event.
    if (!contractVolumeLastValues[putData.contractSymbol]) {
      console.log('Previous events undefined..')
      //queue.push(putData);
    }
    else if(contractVolumeLastValues[putData.contractSymbol] && putData.volume > contractVolumeLastValues[putData.contractSymbol]) {
      console.log('Found new event...')
      queue.push(putData);
    }
    else{
      console.log('Ignoring the event as current volume is not greater than previous value...')
    }
    //update cache is vol is not undefined.
    if(putData.volume){
    contractVolumeLastValues[putData.contractSymbol] = putData.volume;
    }
  }
};

module.exports = {
  getexpDates: getexpDates,
  getOptionData: getOptionData,
  getsymbolQuotePrice:getsymbolQuotePrice
};
