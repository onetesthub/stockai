const axios = require("axios");
const cheerio = require("cheerio");
const publiser = require("../publisher/publisher");
const queue = new publiser('nifty');
const niftyBaseUrl = "https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp";
const stockBaseUrl = null;
let contractVolumeLastValues = {};

const getNiftyCurrentPrice = (tableRows, currentIndex, $) => {
  let currIndex, currValue;
  tableRows.each((index, element) => {
    if (index == tableRows.length - 1) return true;
    if (Number($(element).children(".grybg").children("a").last().children("b").last().html().trim()) > currentIndex) {
      currIndex = index;
      currValue = Number($(element).children(".grybg").children("a").last().children("b").last().html().trim())
      return false;
    }
  });
  return { currstrikepriceIndex: currIndex, currentValueRoundOff: currValue };
};

const getWeeks = async (symbol, count = 3) => {
  try {
    const response = await axios.get("https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp");
    if(response){
      $ = cheerio.load(response.data);
    
      let dateDropDown = $("#date option");
      let dateArray = [];
      dateDropDown.each((index, element) => {
        dateArray.push($(element).val());
      });
      dateArray.splice(0, 1);
      if(dateArray.length > count){
        dateArray.splice(count, dateArray.length - count);
      }
      return dateArray;
    }else{
      return null
    }
  } catch (error) {
    return null
  }
};

const getCurrentNiftyValue = async ($) => {
  let currentValuelabel = $("#wrapper_btm table tbody tr div").last().children("span").first().children("b").first().html().trim();
  return {
    currentIndex: currentValuelabel.split(" ")[0],
    currentValue: Number(currentValuelabel.split(" ")[1]),
  };
};

const getCrawlUrl = (symbol, week) => `https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?segmentLink=17&instrument=OPTIDX&symbol=${symbol}&date=${week}`;

const getNiftyData = async (symbol, week) => {
  const crawlUrl = getCrawlUrl(symbol, week);
  const response = await axios.get(crawlUrl);

  const $ = cheerio.load(response.data);
  
  let headers = [];
  let tableHeaders = $("#octable thead tr");
  let headersRow = $(tableHeaders[1]);
  headersRow.children("th").each((i, e) => {
    headers.push($(e).text().trim());
  });
  
  let tableRows = $("#octable tbody tr");

  const currentvalue = (await getCurrentNiftyValue($)).currentValue;

  const { currstrikepriceIndex, currentValueRoundOff } = await getNiftyCurrentPrice(tableRows, currentvalue, $);

  if (tableRows.length > currstrikepriceIndex + 20)
    tableRows.splice(currstrikepriceIndex + 20, tableRows.length); // removing enteries from end

  let temp = 20;
  if (currstrikepriceIndex > 20 && tableRows.length > 20)
    tableRows.splice(0, currstrikepriceIndex - 20); // removing enteries from starting
  else temp = currstrikepriceIndex;


  let today = new Date();
  const formattedDate = 
    String(today.getFullYear()).slice(2, 4)
    + String((today.getMonth() + 1 < 10) ? '0' + (today.getMonth()+1) : (today.getMonth()+1))
    + String(today.getDate() < 10 ? '0' + today.getDate() : today.getDate())

  tableRows.each((index, element) => {
    const strikeprice = Number( $(element).children(".grybg").children("a").last().children("b").last().html().trim() );

    const callContractSymbol = `${symbol.toUpperCase()}${formattedDate}C${strikeprice}`,
      putContractSymbol = `${symbol.toUpperCase()}${formattedDate}P${strikeprice}`;

    let callData = { type: "call", symbol, expirydate: week, currentvalue, strikeprice, contractsymbol: callContractSymbol },
      putData = { type: "put", symbol, expirydate: week, currentvalue, strikeprice, contractsymbol: putContractSymbol };

    $(element).children('td').each((index, elem)=>{

      let currValue = Number(($(elem).text().trim() == '-')? 0 : ($(elem).text().trim()).replace(',', ''));

      const __key = headers[index].toLowerCase().split(' ').join('');

      if(strikeprice < currentValueRoundOff){
        if($(elem).hasClass('nobg')){
          putData[__key] = currValue;
        } else if ($(elem).hasClass("ylwbg")) {
          callData[__key] = currValue;
        }
      } else {
        if ($(elem).hasClass("nobg")) {
          callData[__key] = currValue;
        } else if ($(elem).hasClass("ylwbg")) {
          putData[__key] = currValue;
        }
      }
    });

    if (index < temp - 5){
      if (!contractVolumeLastValues[putData.contractSymbol]) {
        console.log('Previous events undefined...')
        queue.push(putData);
      }
      else if(contractVolumeLastValues[putData.contractSymbol] && putData.volume > contractVolumeLastValues[putData.contractSymbol]) {
        console.log('New Events found..',)
        queue.push(putData);
      }
      else{
        console.log('Ignoring the event as current volume is not greater than previous value...')
      }
    }else if (index > temp + 4){
      if (!contractVolumeLastValues[callData.contractSymbol]) {
        console.log('Previous events undefined...')
        queue.push(callData);
      }
      else if(contractVolumeLastValues[callData.contractSymbol] && callData.volume > contractVolumeLastValues[callData.contractSymbol]) {
        console.log('New Events found..',)
        queue.push(callData);
      }
      else{
        console.log('Ignoring the event as current volume is not greater than previous value...')
      }
    }else {
      if (!contractVolumeLastValues[callData.contractSymbol]) {
        console.log('Previous events undefined...')
        queue.push(callData);
      }
      else if(contractVolumeLastValues[callData.contractSymbol] && callData.volume > contractVolumeLastValues[callData.contractSymbol]) {
        console.log('New Events found..',)
        queue.push(callData);
      }
      else{
        console.log('Ignoring the event as current volume is not greater than previous value...')
      }
      ////
      if (!contractVolumeLastValues[putData.contractSymbol]) {
        console.log('Previous events undefined...')
        queue.push(putData);
      }
      else if(contractVolumeLastValues[putData.contractSymbol] && putData.volume > contractVolumeLastValues[putData.contractSymbol]) {
        console.log('New Events found..',)
        queue.push(putData);
      }
      else{
        console.log('Ignoring the event as current volume is not greater than previous value...')
      }
    }
    if(callData.volume){
      contractVolumeLastValues[callData.contractSymbol] = callData.volume;
    }
    if(putData.volume){
      contractVolumeLastValues[putData.contractSymbol] = callData.volume;
    }
  });
  return true;
};

module.exports = { getNiftyData, getWeeks };
