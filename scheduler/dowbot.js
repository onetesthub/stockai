const dowcrawler = require("../crawlers/dowcrawler.js");
const defaultSymbols = ["WFC"];
let expWeekCount = 4;

let botStatus;

module.exports = class DowBot {
  constructor(symbols, interval) {
    console.log(typeof symbols);
    if((typeof symbols).toLowerCase() == 'string') this.symbols = [ symbols ];
    else this.symbols = symbols || defaultSymbols;
    this.interval = interval;
  }

  async startBot() {
    console.log("Staring US BOT.....");
    botStatus = setInterval(async () => {
      for (const symbol of this.symbols) {
        console.log("Fetching exp weeks for symbol ", symbol);
        const expDates = await dowcrawler.getexpDates(symbol, expWeekCount);

        for (const week of expDates) {
          dowcrawler.getOptionData(symbol, week);
        }
      }
    }, this.inerval || 10000);
  }

  stopBot() {
    console.log('stopping us bot...');
    clearInterval(botStatus);
  }
};