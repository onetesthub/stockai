const esHost = process.env.esHost || "127.0.0.1";
console.log("ehOst is ", esHost);
//const esHost = '10.128.0.28';
const esPort = "9200";

const es = require("elasticsearch");
const esClient = new es.Client({
  host: esHost + ":" + esPort,
});

esClient.ping(
  {
    requestTimeout: 30000,
  },
  function (error) {
    if (error) {
      return {
        status: "error",
        msg: "es is down!",
      };
    } else {
      return {
        status: "up",
        msg: "es is up and running",
      };
    }
  }
);

module.exports = { esClient }
