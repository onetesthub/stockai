const dowcrawler = require("../crawlers/dowcrawler.js");
//const defaultSymbols = ["WFC",'vlo','vxx','cvx'];
const defaultSymbols = ['WFC','AMD','DAL','UBER',"CCL",'VLO','VXX','CVX'];
let expWeekCount = 4;
let defaultInterval = 300000;

let botStatus;

module.exports = class DowBot {
  constructor(symbols, interval) {
    console.log(typeof symbols);
    if((typeof symbols).toLowerCase() == 'string') this.symbols = [ symbols ];
    else this.symbols = symbols || defaultSymbols;

    this.symbols = defaultSymbols;
    this.interval = interval || defaultInterval;
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
    }, this.inerval);
  }

  stopBot() {
    console.log('stopping us bot...');
    clearInterval(botStatus);
  }
};