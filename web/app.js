const path = require("path");
const { esClient } = require('../publisher/es.js');
const express = require("express");
const { startBot, stopBot } = require('./../scheduler/index.js');
const PORT = process.env.PORT || 4030;
const allowedCategories = ['nifty', 'ussymbol', 'niftysymbol'];

let app = express();
// body parser
let bodyParser = require('body-parser')
app.use(bodyParser.text({
type: "text/plain"
}));
app.use(express.json())
const jsonParser = bodyParser.json()

app.use(bodyParser.urlencoded({
extended: false
}));
app.use(bodyParser.json())
// body parser
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});


app.get('/api/start/:symbolCategory', (req,res)=>{
  console.log(req.params);
  let symbolCategory = req.params.symbolCategory.toLowerCase();

  if (!allowedCategories.includes(symbolCategory)) {
    return res
      .status(400)
      .json({
        'status': 'error',
        'msg': 'unidentified symbol category',
      })
  }
  startBot(symbolCategory);
  // res.send('okie');
  setTimeout(() => {
    stopBot();
  }, 50000);

  res.sendStatus('ok');
})

/*
categories can be : 'nifty', 'ussymbol', 'niftysymbol'
*/
app.post('/api/publish/:symbolcategory/', async (req, res) => {


  let symbolCategory = req.params.symbolcategory.toLowerCase();

  if (!allowedCategories.includes(symbolCategory)) {
    return res
      .status(400)
      .json({
        'status': 'error',
        'msg': 'unidentified symbol category',
      })
  }

  let docArray = req.body;

  let esBody = [];
  let esIndex = {
    index: {
      _index: symbolCategory,
      _type: 'optionsData'
    }
  };
  // console.log('docArray :>> ', docArray);
  for (let doc of docArray) {
    esBody.push(esIndex);
    esBody.push(doc)
  }

  try {
    let response = await esClient.bulk({
      body: esBody
    });
    //console.log('response from es index is ', response);
    res
      .status(200)
      .json({
        'status': 'success'
      })
  } catch (err) {

    console.log("Error in indexing es data :", err);
    res
      .status(503)
      .json({
        'status': 'error',
        'msg': ' unexpected server error',
      })
  }
});
