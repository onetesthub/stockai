const esHost = process.env.esHost || '34.69.76.149';
console.log('ehOst is ', esHost);
//const esHost = '10.128.0.28';
const esPort = '9200';

const es = require('elasticsearch');
const esClient = new es.Client({
    host: esHost + ':' + esPort
});

esClient.ping({
    requestTimeout: 30000,
}, function (error) {
    if (error) {
        res.json({
            'status': 'error',
            'msg': 'es is down!'
        }
        );
    } else {
        res.json({
            'status': 'up',
            'msg': 'es is up and running'
        })
    }
});

module.exports = {
    esClient: esClient
}