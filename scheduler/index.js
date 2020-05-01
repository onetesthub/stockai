let dowBot = require('./dowbot.js');
let dowbot;
const startBot = (type) => {
  if(type == 'ussymbol'){
    dowbot = new dowBot('WFC', 20000);
    dowbot.startBot();
  }
}

const stopBot = (type) => {
  if(type == 'ussymbol'){
    dowbot.stopBot();
  }
}

module.exports = { startBot, stopBot }