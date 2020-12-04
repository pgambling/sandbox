const fs = require('fs');
const express = require("express");

const app = express();
app.use(express.json())

app.get("/", (_req, res) => res.send('Success!'));
app.post("/", (req, res) => {
  fs.writeFileSync('webhook-data.json', JSON.stringify(req.body, null, 2))
  res.end();
});

console.log('Server listening on port 3000')
app.listen(3000);
