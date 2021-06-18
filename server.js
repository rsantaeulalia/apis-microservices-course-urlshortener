require('dotenv').config();
const express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
var validUrl = require('valid-url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const shortenedUrls = {};
let numberOfUrls = 0;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:urlId', function (req, res) {
  const urlId = req.params.urlId;
  if (urlId in shortenedUrls) {
    res.writeHead(301, { Location: shortenedUrls[urlId] });
    res.end();
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  if (validUrl.isUri(originalUrl)) {
    numberOfUrls += numberOfUrls;
    shortenedUrls[numberOfUrls] = originalUrl;
    res.json({ original_url: originalUrl, short_url: numberOfUrls });
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
