require('dotenv').config();
const express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const url = require('url'); 
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const shortenedUrls = {};
let numberOfUrls = 0;

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
  const originalUrl = req.body.url;
  
  dns.lookup(originalUrl, (err, addr) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      numberOfUrls += numberOfUrls;
      shortenedUrls[numberOfUrls] = originalUrl;
      res.json({ original_url: originalUrl, short_url: numberOfUrls });
    }})
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
