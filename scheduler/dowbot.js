const dowcrawler = require('../crawlers/dowcrawler.js');

const defaultSymbols = ["WFC"];

let expWeekCount = 4;


module.exports = class DowBot {
    
    constructor(symbols) {
        this.symbols = symbols || defaultSymbols;
    }

    async startBot() {

        console.log('Staring US BOT.....');

        setInterval(async () => {
            for (const symbol of this.symbols) {

                console.log('Fetching exp weeks for symbol ', symbol);
                const expDates = await dowcrawler.getexpDates(symbol, expWeekCount);

                for (const week of expDates) {
                    dowcrawler.getOptionData(symbol, week);
                }
            }
        }, 10000 || 300000);
    }

    stopBot(){

        
    }
}

runBot(symbols);

module.exports = {


}