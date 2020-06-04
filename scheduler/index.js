const dowBot = require('./dowbot.js');
const niftyBot = require('./nifty.js');

let dowbot;
let niftybot;

const startBot = (type) => {
  type = type.toLowerCase();
  if(type == 'ussymbol'){
    dowbot = new dowBot();
    dowbot.startBot();
  }else if(type == 'nifty' || type == 'banknifty'){
    niftybot = new niftyBot();
    niftybot.startBot();
  }
}

const stopBot = (type) => {
  if(type == 'ussymbol'){
    dowbot = new dowBot();
    dowbot.stopBot();
  }else if(type == 'nifty' || type == 'banknifty'){
    niftybot = new niftyBot();
    niftybot.stopBot();  
  }
}

module.exports = { startBot, stopBot }