require('dotenv').config();
const express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const shortenedUrls = {};

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:urlId', function(req, res) {
  const urlId = req.params.urlId;
  if(urlId in shortenedUrls){
    window.location.href = shortenedUrls[urlId];
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.original_url;
  const shortUrl = req.body.short_url;

  dns.lookup(originalUrl, (err, addr) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      shortenedUrls[short_url] = originalUrl;
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }})
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
