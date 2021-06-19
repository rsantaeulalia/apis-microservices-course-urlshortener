require('dotenv').config();
const express = require('express');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var mongoose = require('mongoose');

const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI);

const shortUrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


const createAndSaveUrl = (url, done) => {
  ShortUrl.count((err, docsLenght) => {
    if (err) return done(err);
    new ShortUrl({ original_url: url, short_url: docsLenght })
      .save((err, doc) => {
        if (err) return done(err);
        done(null, { original_url: doc.original_url, short_url: doc.short_url });
      });
  });
}

const getByShortUrl = (url, done) => {
  ShortUrl.findOne({ short_url: url }, (err, doc) => {
    if (err) return done(err);
    done(null, { original_url: doc.original_url, short_url: doc.short_url });
  });
}

app.get('/api/shorturl/:urlId', function (req, res) {
  getByShortUrl(req.params.urlId, (err, doc) => {
    if (err) return res.json(err);
    if (doc == null)
      res.json({ error: 'invalid short URL' });
    else
      res.redirect(doc.original_url);
  });
});

app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  testValidUrl(req.body.url, (err, address) => {
    if (err) return res.json({ error: 'invalid url' });
    if (address == null)
      return res.json({ error: 'invalid url' });

    createAndSaveUrl(req.body.url, (err, doc) => {
      if (err) return res.json(err);
      res.json(doc);
    });
  })
});

const testValidUrl = (url, done) => {
  dns.lookup(url.replace(/^https?:\/\//, ''), (err, address, family) => {
    if (err) return done(err);
    done(null, address);
  });
}

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});