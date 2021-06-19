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

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });

const shortUrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

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

  if(validURL(req.body.url)){
        createAndSaveUrl(req.body.url, (err, doc) => {
      if (err) return res.json(err);
      return res.json(doc);
    });
  } else {
    return res.json({ error: 'invalid url' });
  }
});

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});