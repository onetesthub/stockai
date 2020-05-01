const { getSymbolData, getWeeks } = require('./../crawlers/nifty');

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