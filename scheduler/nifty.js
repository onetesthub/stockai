const { getNiftyData, getWeeks } = require("./../crawlers/nifty");
let botStatus;
const defaultSymbols = ["NIFTY", "BANKNIFTY"];
const config = require('../web/config');
const interval = config.pollinterval_in_ms;
const symbols = config.niftysymbols;
const crawler = async (symbol, week) => {
  getNiftyData(symbol, week);
};

module.exports = class NiftyBot {
  constructor() {
    this.symbols = symbols || defaultSymbols;
    this.interval = interval || 300000;
  }

  botEvents(){
    for (const symbol of this.symbols) {
      for (const week of this.weeks) {
        crawler(symbol, week);
      }
    }
  }

  async startBot() {
    const weeks = await getWeeks();
    this.weeks = weeks; //['14MAY2020']; //* for testing
    this.botEvents();
    this.botEvents();
    botStatus = setInterval(() => {
      this.botEvents();
    }, this.interval);
  }
  async stopBot() {
    console.log("stopping us bot...");
    clearInterval(botStatus);
  }
};
