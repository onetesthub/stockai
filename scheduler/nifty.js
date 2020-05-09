const { getNiftyData, getWeeks } = require("./../crawlers/nifty");
let botStatus;
const symbols = ["NIFTY", "BANKNIFTY"];
// const symbols = ["NIFTY"]; //* for testing
const crawler = async (symbol, week) => {
  getNiftyData(symbol, week);
};

module.exports = class NiftyBot {
  constructor(symbols, interval) {
    console.log(typeof symbols);
    if ((typeof symbols).toLowerCase() == "string") this.symbols = [symbols];
    else this.symbols = symbols || defaultSymbols;
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
    // this.weeks = ['14MAY2020']; //* for testing
    this.botEvents();
    this.botEvents();
    botStatus = setInterval(() => {
      this.botEvents();
    }, this.interval);
  }
  stopBot() {
    console.log("stopping us bot...");
    clearInterval(botStatus);
  }
};
