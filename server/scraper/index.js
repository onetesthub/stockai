const axios = require("axios");
const cheerio = require("cheerio");
const baseUrl = "https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp";
const scrapeUrl = "https://www1.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?segmentLink=17&instrument=OPTIDX&symbol=NIFTY&date=14MAY2020";

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
  return [ 'NIFTY' ];
};

const getCurrentValue = async () =>{
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
  const respoonse = await axios.get(scrapeUrl);
  const $ = cheerio.load(respoonse.data);
  //todo get dynamic current value 
  let currIndexValue = 9382;
  const currIndexValueRoundOff =  currIndexValue + ( 50 - ( currIndexValue % 50));
  let tableRows = $("#octable tbody tr");
  let rowsArray = [], strikePriceArray = [];

  const currStrikePriceIndex = await getCurrStrikePriceIndex(tableRows,currIndexValueRoundOff, $);

  tableRows.each((index, element) => {
    if(index == tableRows.length - 1)  return true // for skipping last iteration
    if(index < currStrikePriceIndex - 20) return true
    if(index > currStrikePriceIndex + 20) return false

    const strikePrice = Number( $(element).children(".grybg").children("a").last().children("b").last().html().trim() );
    strikePriceArray.push(strikePrice);

  //   rowsArray.push(element);
  //   // $(element).children('td').each((index, elem)=>{
  //   //   if($(elem).hasClass('nobg')) set1.push($(elem).text().trim());
  //   //   else if($(elem).hasClass('grybg')) strikePrice = $(elem).children('a').last().children('b').last().html().trim();
  //   //   else if($(elem).hasClass('ylwbg')) set2.push($(elem).text().trim());
  //   // });
  //   // * get current stock value
    // let callObj = {
    //     type: "call",
    //     symbol: "NIFTY",
    //     expiryDate: "14MAY2020",
    //     currentValue: "9,364.40",
    //   },
    //   putObj = {
    //     type: "put",
    //     symbol: "NIFTY",
    //     expiryDate: "14MAY2020",
    //     currentValue: "9,364.40",
    //   };
  //   // $(element).children('td').each((index, elem)=>{
  //   //   if($(elem).hasClass('nobg')){
  //   //     callObj.push($(elem).text().trim());
  //   //   }
  //   //   else if($(elem).hasClass('grybg')) strikePrice = $(elem).children('a').last().children('b').last().html().trim();
  //   //   else if($(elem).hasClass('ylwbg')) putObj.push($(elem).text().trim());
  //   // });

  //   // temp.push({set1, set2,strikePrice});
  });
  // console.log(strikePriceArray);
  return res.status(200).json({ data: strikePriceArray });
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
function getCurrStrikePriceIndex(tableRows, currIndexValueRoundOff, $){
  let currIndex;
  console.log(currIndexValueRoundOff);
  tableRows.each((index, element) => {
    if(index == tableRows.length - 1)  return true // same as continue for loops
    if(currIndexValueRoundOff == Number( $(element).children(".grybg").children("a").last().children("b").last().html().trim() )){
      currIndex = index;
      return false; //same as break for loops
    }
  });
  return currIndex;
}