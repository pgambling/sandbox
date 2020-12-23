const fs = require('fs');
const express = require("express");

const CONFIG = require('./config.json')

const app = express();
app.use(express.json())

app.get("/", (_req, res) => res.send('Success!'));
app.post("/", (req, res) => {
  fs.writeFileSync('webhook-data.json', JSON.stringify(req.body, null, 2))
  res.end();
});

function logError (message, data) {
  const fname = 'debug.json';
  let errorLog = [];
  
  if (fs.existsSync(fname)) {
    errorLog = JSON.parse(fs.readFileSync(fname));
  }
  
  errorLog.push({ 
    data,
    message,
    time: (new Date()).toString()
  });
  fs.writeFileSync(fname, JSON.stringify(errorLog, null, 2));
}

app.get("/wifi-state", (req, res) => {
  console.log(`[${(new Date()).toISOString()}] Received GET /wifi-state request: ${JSON.stringify(req.query, null, 2)}`)
  const { authToken, device, status } = req.query;

  if (CONFIG.authToken && CONFIG.authToken !== authToken) {
    logError(`authToken did not match ${CONFIG.authToken}`, req.query)
    return res.sendStatus(403);
  }

  if (!CONFIG.devices.includes(device)) {
    logError(`Unknown device: ${device}`, req.query)
    return res.status(400).send({ error: "Unknown device" });
  }

  const fileName = 'wifi-state.json';
  let state = {};
  if (fs.existsSync(fileName)) {
    state = JSON.parse(fs.readFileSync(fileName));
  }
  
  state[device] = { status, received: (new Date()).toString() };

  const devicesPresent = Object.values(state).reduce((count, { status }) => status === 'connected' ? count+1 : count, 0);

  fs.writeFileSync(fileName, JSON.stringify(state, null, 2))
  console.log(`[${(new Date()).toISOString()}] Returned devicesPresent = ${devicesPresent}`);
  res.send({ value1: devicesPresent });
})

console.log('Server listening on port 3000')
app.listen(3000);
