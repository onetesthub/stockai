const { getSymbolData, getWeeks } = require("./../crawlers/nifty");
// const symbols = ["NIFTY", "BANKNIFTY"];
let botStatus;
const symbols = ["NIFTY"]; //* for testing
const crawler = async (symbol, week) => {
  getSymbolData(symbol, week);
};

module.exports = class NiftyBot {
  constructor(symbols, interval) {
    console.log(typeof symbols);
    if ((typeof symbols).toLowerCase() == "string") this.symbols = [symbols];
    else this.symbols = symbols || defaultSymbols;
    this.interval = interval;
  }

  async startBot() {
    // const weeks = await getWeeks();
    const weeks = ['30APR2020']; //* for testing

    botStatus = setInterval(() => {
      for (const symbol of this.symbols) {
        for (const week of weeks) {
          crawler(symbol, week);
        }
      }
    }, 10000 || 300000);
  }
  stopBot() {
    console.log("stopping us bot...");
    clearInterval(botStatus);
  }
};
