const axios = require("axios");
const cheerio = require("cheerio");
const baseUrl = "https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp";
// const scrapeUrl = "https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?segmentLink=17&instrument=OPTIDX&symbol=NIFTY&date=14MAY2020";

const getWeeks = async (noOfWeeks = 3) => {
  const response = await axios.get(baseUrl);
  const $ = cheerio.load(response.data);

  let dateDropDown = $("#date option");
  let dateArray = [];
  dateDropDown.each((index, element) => {
    dateArray.push($(element).val());
  });
  dateArray.splice(0, 1);
  dateArray.splice(3, dateArray.length - 3);
  return dateArray;
};

const getSymbols = async () => {
  return ['NIFTY'];
};

const getCurrentValue = async () => {
  //? wrapper_btm > table(first)
  const response = await axios.get(baseUrl);
  const $ = cheerio.load(response.data);
  let currentValuelabel = $("#wrapper_btm table tbody tr div").last().children('span').first().children('b').first().html().trim();
  return {
    currentIndex: currentValuelabel.split(' ')[0],
    currentValue: Number(currentValuelabel.split(' ')[1])
  }
};

//  ! new code for full page extraction
const scrape = async (req, res) => {
  const respoonse = await axios.get(baseUrl);
  const $ = cheerio.load(respoonse.data);

  const { currentValue } = await getCurrentValue(); //todo -> get dynamic current value
  const expiryDate = '14MAY2020'; //todo -> get expiry date from url || scrape from page
  const symbol = "NIFTY"; //todo -> get dynamic symbol

  const currentValueRoundOff = currentValue + (50 - (currentValue % 50));

  let tableRows = $("#octable tbody tr");
  const currStrikePriceIndex = await getCurrStrikePriceIndex(tableRows, currentValueRoundOff, $);
  if (tableRows.length > currStrikePriceIndex + 20)
    tableRows.splice(currStrikePriceIndex + 20, tableRows.length); // removing enteries from end

  let temp = 20;
  if (currStrikePriceIndex > 20 && tableRows.length > 20)
    tableRows.splice(0, currStrikePriceIndex - 20); // removing enteries from starting
  else temp = currStrikePriceIndex;
  
  const tableData = [];
  tableRows.each((index, element) => {

    const strikePrice = Number( $(element).children(".grybg").children("a").last().children("b").last().html().trim() );
    
    let set1 = [], set2 = [];
    $(element).children('td').each((index, elem)=>{
      if($(elem).hasClass('nobg')) set1.push($(elem).text().trim());
      else if($(elem).hasClass('ylwbg')) set2.push($(elem).text().trim());
    });

    let callObj = { type: "call", symbol, expiryDate, currentValue, strikePrice, index },
      putObj = { type: "put", symbol, expiryDate, currentValue, strikePrice, index };

    if(strikePrice < currentValueRoundOff){
      callObj.values = set2;
      putObj.values = set1;
    }else{
     callObj.values = set1;
     putObj.values = set2;
    }
    if(index < temp - 5) tableData.push(putObj);
    else if(index > temp + 4) tableData.push(callObj);
    else tableData.push(callObj, putObj);

  });
  console.log(currentValueRoundOff);
  return res.status(200).json({ data: tableData });
}

// 
module.exports = {
  getWeeks,
  getSymbols,
  getCurrentValue,
  scrape
};

/*
 ? ==========================
 ? ==== helper functions ====
 ? ==========================
*/
function getCurrStrikePriceIndex(tableRows, currentValueRoundOff, $) {
  let currIndex;
  tableRows.each((index, element) => {
    if (index == tableRows.length - 1) return true // same as continue for loops
    if (currentValueRoundOff == Number($(element).children(".grybg").children("a").last().children("b").last().html().trim())) {
      currIndex = index;
      return false; //same as break for loops
    }
  });
  return currIndex;
}