const fs = require('fs');
const express = require("express");

const app = express();
app.use(express.json())

app.get("/", (_req, res) => res.send('Success!'));
app.post("/", (req, res) => {
  fs.writeFileSync('webhook-data.json', JSON.stringify(req.body, null, 2))
  res.end();
});

app.post("/wifi-state", (req, res) => {
  const fileName = 'wifi-state.json';
  let state = {};

  if (fs.existsSync(fileName)) {
    state = JSON.parse(fs.readFileSync(fileName));
  }
  
  const { device, status, time } = req.body;

  state[device] = { status, time, received: (new Date()).toString() };

  const devicesPresent = Object.values(state).reduce((count, { status }) => status === 'connected' ? count+1 : count, 0);

  fs.writeFileSync(fileName, JSON.stringify(state, null, 2))
  res.send({ devicesPresent });
})

console.log('Server listening on port 3000')
app.listen(3000);
