const path = require("path");
const esClient = require('../publisher/es.js')
const express = require("express");
const PORT = process.env.PORT || 4030;

let app = express();

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});


app.get('/api/crawler/:crawlerType')

/*
categories can be : 'nifty', 'ussymbol', 'niftysymbol'
*/
app.post('/api/publish/:symbolcategory/', async (req, res) => {

  let allowedCategories = ['nifty', 'ussymbol', 'niftysymbol'];

  let symbolCategory = req.params.symbolcategory.toLowerCase();

  if (!allowedCategories.includes(symbolCategory)) {
    res
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

  for (let doc of docArray) {
    esBody.push(esIndex);
    esBody.push(doc)
  }

  try {
    let response = await esClient.bulk({
      body: esBody
    });
    console.log('response from es index is ', response);
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
