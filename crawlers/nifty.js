const axios = require("axios");
const cheerio = require("cheerio");
const publiser = require('../publisher/publisher');
const queue = new publiser();
const niftyBaseUrl = "https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp";
const stockBaseUrl = null;

const getCurrStrikeData = (tableRows, currentIndex, $) => {
  let currIndex, currValue;
  tableRows.each((index, element) => {
    if (index == tableRows.length - 1) return true // same as continue for loops
    if (Number($(element).children(".grybg").children("a").last().children("b").last().html().trim()) > currentIndex) {
      currIndex = index;
      currValue = Number($(element).children(".grybg").children("a").last().children("b").last().html().trim())
      return false; //same as break for loops
    }
  });
  return { currStrikePriceIndex: currIndex, currentValueRoundOff: currValue } ;
}

const getWeeks = async (weekCount = 3) => {

  const response = await axios.get("https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp");
  $ = cheerio.load(response.data);
  
  let dateDropDown = $("#date option");
  let dateArray = [];
  dateDropDown.each((index, element) => {
    dateArray.push($(element).val());
  });
  dateArray.splice(0, 1);
  dateArray.splice(3, dateArray.length - 3);
  return dateArray;
};

const getCurrentNiftyValue = async ($) => {
  let currentValuelabel = $("#wrapper_btm table tbody tr div").last().children('span').first().children('b').first().html().trim();
  return {
    currentIndex: currentValuelabel.split(' ')[0],
    currentValue: Number(currentValuelabel.split(' ')[1])
  }
};

const getCrawlUrl = (symbol, week) =>{
  if(symbol.toLowerCase() == "nifty" || symbol.toLowerCase() == "banknifty") return `https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?segmentLink=17&instrument=OPTIDX&symbol=${symbol}&date=${week}`
  else return `HDFC URL`;
};

const getNiftyData = async (crawlUrl, symbol, week) => {
  const respoonse = await axios.get(crawlUrl);

  const $ = cheerio.load(respoonse.data);
  let tableRows = $("#octable tbody tr");

  const { currentValue } = await getCurrentNiftyValue($);

  const { currStrikePriceIndex, currentValueRoundOff } = await getCurrStrikeData(tableRows, currentValue, $);
  
  if (tableRows.length > currStrikePriceIndex + 20)
    tableRows.splice(currStrikePriceIndex + 20, tableRows.length); // removing enteries from end

  let temp = 20;
  if (currStrikePriceIndex > 20 && tableRows.length > 20)
    tableRows.splice(0, currStrikePriceIndex - 20); // removing enteries from starting
  else temp = currStrikePriceIndex;
  
  const symbolData = [];
  tableRows.each((index, element) => {
    const strikePrice = Number( $(element).children(".grybg").children("a").last().children("b").last().html().trim() );
    
    let set1 = [], set2 = [];
    
    $(element).children('td').each((index, elem)=>{
      if($(elem).hasClass('nobg')) set1.push(Number(($(elem).text().trim() == '-')? 0 : ($(elem).text().trim()).replace(',', '')));
      else if($(elem).hasClass('ylwbg')) set2.push(Number(($(elem).text().trim() == '-')? 0 : ($(elem).text().trim()).replace(',', '')));
    });

    let callObj = { type: "call", symbol, expiryDate: week, currentValue, strikePrice },
      putObj = { type: "put", symbol, expiryDate: week, currentValue, strikePrice };

    if(strikePrice < currentValueRoundOff){
      callObj.values = set2;
      putObj.values = set1;
    }else{
     callObj.values = set1;
     putObj.values = set2;
    }

    if(index < temp - 5) queue.push(putObj);
    else if(index > temp + 4) queue.push(callObj);
    else{
      queue.push(callObj);
      queue.push(putObj);
    }

  });
  return true
}

const getStockData = async (crawlUrl, symbol, week) =>{
  return null
}

const getSymbolData = async (symbol, week)=>{
  const crawlUrl = getCrawlUrl(symbol, week);
  let data;
  if(symbol.toLowerCase() == "nifty" || symbol.toLowerCase() == "banknifty") {
    data = await getNiftyData(crawlUrl, symbol, week);
  }else{
    // data = await getStockData(crawlUrl, symbol, week);
  }
}
module.exports = { getSymbolData, getWeeks }