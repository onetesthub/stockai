const dowBot = require('./dowbot.js');
const niftyBot = require('./nifty.js');

let dowbot;
let niftybot;

const startBot = (type) => {
  type = type.toLowerCase();
  if(type == 'ussymbol'){
    dowbot = new dowBot('WFC', 20000);
    dowbot.startBot();
  }else if(type == 'nifty' || type == 'banknifty'){
    niftybot = new niftyBot("NIFTY", 20000);
    niftybot.startBot();
  }
}

const stopBot = (type) => {
  if(type == 'ussymbol'){
    dowbot.stopBot();
  }else if(type == 'nifty' || type == 'banknifty'){
    niftybot.startBot();  
  }
}

module.exports = { startBot, stopBot }