var path = require('path');
var express = require('express');
var app = express();

// Config file
var config = require('./config');

// Twitter API setup
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret
});

// Caching for social API responses
var NodeCache = require('node-cache');
var tweetCache = new NodeCache({ stdTTL: 300 });

// List of acceptable pages on which to serve the web client.
var pages = ['reelyactive', 'notman'];

// Directory containing the web client.
var publicDir = '../smartspaces-client';

// Request handlers
app.get('/', function(req, res) {
  // Redirect the root path to our default area.
  res.redirect(307, '/reelyactive');
});

app.get('/:identifier', function(req, res) {
  if (pages.indexOf(req.params.identifier) != -1) {
    res.sendfile(path.resolve(publicDir + "/index.html"));
  } else {
    res.status(404).send('Not found');
  }
});

// Retrieve tweets
app.get('/twitter/:user', function(req, res) {
  tweetCache.get(req.params.user, function(error, value) { // check cache
    if (!error) {
      if (isEmpty(value)) { // user not found in cache
        twitter.getTimeline('user', {
            screen_name: req.params.user
          }, '', '', // no access token/secret required
          function(error, data, response) {
            if (error) {
              res.status(error.statusCode).send('Error');
            } else {
              res.json(data);
              tweetCache.set(req.params.user, data);
              console.log('STORED IN CACHE');
            }
          }
        );
      } else { // user found in cache
        res.json(value);
        console.log('RETRIEVED FROM CACHE');
      }
    } else {
      res.status(404).send('Error');
    }
  });
});

function isEmpty(obj) {
  return !Object.keys(obj).length;
}

// Static files directory
app.use(express.static(publicDir));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("smartpaces-server is listening on port", port);
});
