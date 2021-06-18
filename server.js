require('dotenv').config();
const express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
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

  testValidUrl(req.body.url, (err, address) => {
    if(err) return res.json(err);
    if (address == null)
      return res.json({error: 'invalid url'});
    
    numberOfUrls = numberOfUrls++;
    shortenedUrls[numberOfUrls] = originalUrl;
    res.json({ original_url: originalUrl, short_url: numberOfUrls });
  })
});

const testValidUrl = (url, done) => {
  if ( /^https?:\/\/(w{3}.)?[\w-]+.com(\/\w+)*/.test(url) ){
    dns.lookup(url.replace(/^https?:\/\//, ''), (err, address, family) => {
      if(err) return done(err);
    done(null, address);
    });
  }
  else
    done(null, null);
}

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});