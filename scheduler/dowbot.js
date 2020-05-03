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

    this.interval = interval || defaultInterval;
  }

  async botevents(){
    console.log("Staring US BOT with interval ", this.interval/1000,  'sec .....');
    for (const symbol of this.symbols) {
      console.log("Fetching exp weeks for symbol ", symbol);
      const expDates = await dowcrawler.getexpDates(symbol, expWeekCount);

      console.log('Fetching stock current price..');
      let stockQuote = await dowcrawler.getsymbolQuotePrice(symbol);
      for (const week of expDates) {
        console.log('Fetching option data for week ', week, ' and symbol ', symbol);
        dowcrawler.getOptionData(symbol, week,stockQuote);
      }
    }
  }

  async startBot() {
    this.botevents();
    botStatus = setInterval(async () => {
      this.botevents();
    }, this.interval);
  }

  stopBot() {
    console.log('stopping us bot...');
    clearInterval(botStatus);
  }
};