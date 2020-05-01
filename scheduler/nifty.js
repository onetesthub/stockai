<<<<<<< HEAD
const { getSymbolData, getWeeks } = require('../crawlers/nifty.js');
=======
const { getSymbolData, getWeeks } = require('./../crawlers/nifty');
>>>>>>> 6edf134a4674414010efc16d97873015e68554f7

const symbols = ["NIFTY", "BANKNIFTY", "HDFC"];
// const symbols = ["NIFTY"]; //* for testing

const crawler = async (symbol, week) => {
  getSymbolData(symbol, week);
};

async function runBot(symbols) {
  const weeks = await getWeeks();
  
  // setInterval(() => {
    for (const symbol of symbols) {
      for (const week of weeks) {
        crawler(symbol, week);
      }
    }
  // }, 10000 || 300000);
} 
runBot(symbols);