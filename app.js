const path = require("path");
const express = require("express");
const { getWeeks, getSymbols, getCurrentValue, scrape } = require(path.join(__dirname, "server", "scraper"));
const PORT = process.env.PORT || 8080;

let app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

app.get("/scrape", scrape);

app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});
