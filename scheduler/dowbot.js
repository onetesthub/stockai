const dowcrawler = require("../crawlers/dowcrawler.js");
const defaultSymbols = ['WFC','AMD'];
let expWeekCount = 4;
let defaultInterval = 300000;
const config = require('../web/config');
const interval = config.pollinterval_in_ms;
const symbols = config.ussymbols;

let botStatus;

module.exports = class DowBot {
  constructor() {
    console.log(typeof symbols);
    this.symbols = symbols || defaultSymbols;
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
    //create cache for prevous values
    await this.botevents();
    //to push events after validating with cache build from previous run
    await this.botevents();
    botStatus = setInterval(async () => {
      this.botevents();
    }, this.interval);
  }

  async stopBot() {
    console.log('stopping us bot...');
    clearInterval(botStatus);
  }
};