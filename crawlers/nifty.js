const axios = require("axios");
const cheerio = require("cheerio");
const publiser = require("../publisher/publisher");
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
  return { currStrikePriceIndex: currIndex, currentValueRoundOff: currValue };
};

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
  let currentValuelabel = $("#wrapper_btm table tbody tr div").last().children("span").first().children("b").first().html().trim();
  return {
    currentIndex: currentValuelabel.split(" ")[0],
    currentValue: Number(currentValuelabel.split(" ")[1]),
  };
};

const getCrawlUrl = (symbol, week) => `https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?segmentLink=17&instrument=OPTIDX&symbol=${symbol}&date=${week}`;

const getNiftyData = async (crawlUrl, symbol, week) => {
  const respoonse = await axios.get(crawlUrl);

  const $ = cheerio.load(respoonse.data);
  
  let headers = [];
  let tableHeaders = $("#octable thead tr");
  let headersRow = $(tableHeaders[1]);
  headersRow.children("th").each((i, e) => {
    headers.push($(e).text().trim());
  });
  
  let tableRows = $("#octable tbody tr");

  const { currentValue } = await getCurrentNiftyValue($);

  const { currStrikePriceIndex, currentValueRoundOff } = await getCurrStrikeData(tableRows, currentValue, $);

  if (tableRows.length > currStrikePriceIndex + 20)
    tableRows.splice(currStrikePriceIndex + 20, tableRows.length); // removing enteries from end

  let temp = 20;
  if (currStrikePriceIndex > 20 && tableRows.length > 20)
    tableRows.splice(0, currStrikePriceIndex - 20); // removing enteries from starting
  else temp = currStrikePriceIndex;

  tableRows.each((index, element) => {
    const strikePrice = Number( $(element).children(".grybg").children("a").last().children("b").last().html().trim() );

    let callObj = { type: "call", symbol, expiryDate: week, currentValue, strikePrice },
      putObj = { type: "put", symbol, expiryDate: week, currentValue, strikePrice };

    $(element).children('td').each((index, elem)=>{
      let currValue = Number(($(elem).text().trim() == '-')? 0 : ($(elem).text().trim()).replace(',', ''));
      if(strikePrice < currentValueRoundOff){
        if($(elem).hasClass('nobg')){
          putObj[headers[index]] = currValue;
        } else if ($(elem).hasClass("ylwbg")) {
          callObj[headers[index]] = currValue;
        }
      } else {
        if ($(elem).hasClass("nobg")) {
          callObj[headers[index]] = currValue;
        } else if ($(elem).hasClass("ylwbg")) {
          putObj[headers[index]] = currValue;
        }
      }
    });

    if (index < temp - 5) queue.push(putObj);
    else if (index > temp + 4) queue.push(callObj);
    else {
      queue.push(callObj);
      queue.push(putObj);
    }
  });
  return true;
};

const getStockData = async (crawlUrl, symbol, week) => {
  return null;
};

const getSymbolData = async (symbol, week) => {
  const crawlUrl = getCrawlUrl(symbol, week);
  let data = await getNiftyData(crawlUrl, symbol, week);
};

module.exports = { getSymbolData, getWeeks };
