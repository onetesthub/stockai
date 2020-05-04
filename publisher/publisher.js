// const esClient = require("./connection.js");
const request = require("request");

module.exports = class Queue {
  constructor(symbolCategory) {
    this.symbolCategory = symbolCategory,
    this.elements = [];
  }

  push(data) {
    // console.log('event added to queue.......\n', data);
    this.elements.push(data);
    if(this.elements.length >= 10) this.dequeue();
  }

  dequeue() {

    let data = this.elements.splice(0, 10);
    console.log('Publishing events ...', data.length);
    let symbolCategory = this.symbolCategory;
    let url = `http://localhost:4030/api/publish/${symbolCategory}`
    request({
      url : url,
      method :"POST",
      headers : {
        "content-type": "application/json",
      },
      body: data,
      json: true
    },(error, res, body) => {
      if (error) {
        console.error('error in publishing')
        return
      }
      //console.log(`statusCode: ${res.statusCode}`)
      // console.log(body)
    });
  }

  isEmpty() {
    return this.elements.length == 0;
  }

  length() {
    console.log("\nLength of queue is :", this.elements.length);
    return this.elements.length;
  }
  
  print() {
    console.log("\nYour Queue is :", this.elements);
    return this.elements;
  }
}
