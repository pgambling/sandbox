const express = require("express");

const app = express();

app.get("/test", (_req, res) => res.send('Success!'));

console.log('Server listening on port 3000')
app.listen(3000);
