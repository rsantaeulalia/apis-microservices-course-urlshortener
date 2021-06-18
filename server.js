require('dotenv').config();
const express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const url = require('url'); 
const LocalStorage = require('node-localstorage'),
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

var localStorage = new LocalStorage('./scratch'); 

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
  shortenedUrls = localStorage.getItem("shortenedUrls");
  if (urlId in shortenedUrls) {
    res.writeHead(301, { Location: shortenedUrls[urlId] });
    res.end();
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  dns.lookup(url.parse(originalUrl).hostname, err => {
    if (err && err.code === 'ENOTFOUND') {
      res.json({ error: 'invalid url' });
    } else {
      numberOfUrls = localStorage.getItem("numberOfUrls");
      numberOfUrls = numberOfUrls++;
      localStorage.setItem("numberOfUrls", numberOfUrls);

      shortenedUrls = localStorage.getItem("shortenedUrls");
      shortenedUrls[numberOfUrls] = originalUrl;
      localStorage.setItem("shortenedUrls", shortenedUrls);
      res.json({ original_url: originalUrl, short_url: numberOfUrls });
    }
  })
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});