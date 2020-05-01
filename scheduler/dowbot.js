const dowcrawler = require('../crawlers/dowcrawler.js');

const symbols = ["WFC"];

let expWeekCount = 4;


async function runBot(symbols) {

    console.log('Staring US BOT.....');

    setInterval(async () => {
        for (const symbol of symbols) {

            console.log('Fetching exp weeks for symbol ', symbol);
            const expDates = await dowcrawler.getexpDates(symbol, expWeekCount);

            for (const week of expDates) {
                dowcrawler.getOptionData(symbol, week);
            }
        }
    }, 10000 || 300000);
}
runBot(symbols);