const express = require('express');
const bodyParser = require('body-parser');
const iscnRoutes = require('./route');

const app = express();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;
app.set('port', port);

app.use(bodyParser.json());
app.use('/iscn', iscnRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  return res.sendStatus(500);
});

app.listen(port, host);
console.log(`iscn server listening on ${host}:${port}`)
