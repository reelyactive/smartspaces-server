var path = require('path');
var express = require('express');
var md5 = require('MD5');
var app = express();
//var config = require('./config');
var Datastore = require('nedb');
var twitterAPI = require('node-twitter-api');
var NodeCache = require('node-cache');
var bodyParser = require('body-parser');
var request = require('request');
var PeriodicTask = require('periodic-task');
var places = require('./places');


// Directory containing the web client.
var publicDir = '../smartspaces-client';
var HTTP_PORT = 3000;
var TWITTER_CONSUMER_KEY = 'z2Ge4SaxYCzpuUomhE8lQ';
var TWITTER_CONSUMER_SECRET = 'jFEDqN28VVRPmPonqZbqrQT99unamLotIJY3XHSpU';

// These SHOULD NOT be global, refactor so that they aren't!
var peopleDB = new Datastore({ filename: 'people.db', autoload: true });
var noticesDB = new Datastore({ filename: 'notices.db', autoload: true });


/**
 * SmartspacesServer Class
 * Serves up Smart Spaces webpages.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function SmartspacesServer(options) {
  options = options || {};
  var httpPort = options.httpPort || HTTP_PORT;
  var twitter = {};
  twitter.consumerKey = options.twitterConsumerKey || TWITTER_CONSUMER_KEY;
  twitter.consumerSecret = options.twitterConsumerSecret || TWITTER_CONSUMER_SECRET;

  var twitter = new twitterAPI({
    consumerKey: twitter.consumerKey,
    consumerSecret: twitter.consumerSecret
  });
  var tweetCache = new NodeCache({ stdTTL: 300 });
  var remoteCache = new NodeCache({ stdTTL: 86400 });
  var trackers = {};

  // Read places.json and create list of acceptable pages on which to serve the web client.
  var pages = [];
  for (var identifier in places) {
    pages.push(identifier);
  }

  app.use(bodyParser.json());       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({ extended: false })); // to support URL-encoded bodies

  // Request handlers
  app.get('/', function(req, res) {
    // Redirect the root path to our default area.
    res.redirect(307, '/notman');
  });

  app.get('/:identifier', function(req, res) {
    if (pages.indexOf(req.params.identifier) != -1) {
      res.sendfile(path.resolve(publicDir + "/index.html"));
    } else {
      res.status(404).send('Not found');
    }
  });

  app.get('/:identifier/info', function(req, res) {
    if (req.params.identifier in places) {
      res.json(places[req.params.identifier]);
    } else {
      res.status(404).send('Not found');
    }
  });

  app.get('/:identifier/notices', function(req, res) {
    getNotices(req.params.identifier).exec(function (err, notices) {
      res.json(notices);
    });
  });

  app.post('/:identifier/notices/new', function(req, res) {
    console.log(req.body);
    if (req.body.hasOwnProperty('message')) {
      var notice = { place: req.params.identifier, message: req.body.message, posted: Date.now() };
      noticesDB.insert(notice);
      console.log('Notice posted: ' + req.body.message);
      getNotices(req.params.identifier).exec(function (err, notices) {
        res.json(notices);
      });
    } else {
      res.status(400).send('Error');
    }
  });

  // Retrieve tweets
  app.get('/twitter/:user', function(req, res) {
  //  tweetCache.flushAll(); // uncomment this line to disable caching
    tweetCache.get(req.params.user, function(error, value) { // check cache
      if (!error) {
        if (isEmpty(value)) { // user not found in cache
          twitter.getTimeline('user', { // get tweets
              screen_name: req.params.user,
              count: 50,
              exclude_replies: true
            }, '', '', // no access token/secret required
            function(error, data, response) {
              if (error) {
                res.status(error.statusCode).send('Error');
              } else {
                tweetCache.set(req.params.user, data);
                res.json(data);
                console.log('stored in cache');
              }
            }
          );
        } else { // user found in cache
          res.json(value);
          console.log('retrieved from cache');
        }
      } else {
        res.status(404).send('Error');
      }
    });
  });

  app.get('/:identifier/recent', function(req, res) {
    var yesterday = Date.now() - (1000 * 60 * 60 * 24);
    peopleDB.find({ place: req.params.identifier, lastSeen: { $gt: yesterday} }, function (err, people) {
      res.json(people);
    });
  });

  app.post('/remote', function(req, res) {
    var url = req.body.url;
    var urlHash = md5(url);
    request.get(url, function (error, response, body) {
      if (!error) {
        remoteCache.set(urlHash, body);
        res.json({ hash: urlHash });
      } else {
        res.status(404).send('Error');
      }
    });
  });

  app.get('/remote/:urlHash', function(req, res) {
    remoteCache.get(req.params.urlHash, function(error, value) { // check cache
      if (!error) {
        if (isEmpty(value)) { // page not found in cache
          res.status(404).send('Not found');
        } else { // page found in cache
          res.send(value[req.params.urlHash]);
        }
      } else {
        res.status(404).send('Error');
      }
    });
  });

  app.post('/track', function(req, res) {
    var url = req.body.apiRoot + req.body.place;
    if (!(url in trackers)) {
      var attributes = req.body.attributes.split(',');
      var delay = 600; // delay in seconds
      task = new PeriodicTask(delay*1000, function () {
        updatePeople(req.body.apiRoot, req.body.place, attributes);
      });
      trackers[url] = task;
      console.log('Running tracker.');
      console.log(attributes);
      task.run();
    }
  });

  // Static files directory
  app.use(express.static(publicDir));

  var port = process.env.PORT || httpPort;
  app.listen(port, function() {
    console.log("smartspaces-server is listening on port", port);
  });
}

function getNotices(location) {
  return noticesDB.find({ place: location }).sort({ posted: -1 });
}

function updatePeople(apiRoot, place, attributes) {
  console.log('Updating tracker.');
  request.get(apiRoot + place, function (err, res, body) {
    if (!err) {
      try {
        var resultsObj = JSON.parse(body); 
      } catch(e) {
        return false;
      }
      for (var key in resultsObj) {
        if (resultsObj[key].hasOwnProperty('url')) {
          request.get(resultsObj[key]['url'], function (err, res, body) {
            if (!err) {
              try {
                var itemObj = JSON.parse(body); 
              } catch(e) {
                return false;
              }
                var id = resultsObj[key]['value'];
                updatePerson(id, place, itemObj, attributes);
            }
          });
        } else {
          var id = key;
          updatePerson(id, place, resultsObj[key], attributes);
        }
      }
    }
  });
}

function updatePerson(id, place, itemObj, attributes) {
  var person = { 'uuid': id, 'place': place }
  var hasAllAttributes = true;
  for (var i in attributes) {
    if (attributes[i] in itemObj) {
      person[attributes[i]] = itemObj[attributes[i]];
    } else {
      hasAllAttributes = false;
    }
  }
  if (hasAllAttributes) {
    person['lastSeen'] = Date.now();
    peopleDB.update({ uuid: id, place: place }, person, { upsert: true });
    peopleDB.persistence.compactDatafile();
  }
  console.log(person);
}

function isEmpty(obj) {
  return !Object.keys(obj).length;
}

module.exports = SmartspacesServer;
