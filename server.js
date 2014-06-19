var express = require("express");
var app = express();


// Request handlers
app.get('/', function(req, res) {
    // Redirect the root path to our default area.
    res.redirect(307, '/notman');
});

// List of acceptable pages on which to serve the web client.
var pages = ['notman', 'greenhouse'];

app.get('/:identifier', function(req, res) {
  if (pages.indexOf(req.params.identifier) != -1) {
    res.sendfile("public/index.html");
  } else {
    res.status(404).send('Not found');
  }
});

// Static files directory
app.use(express.static('public'));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("smartpaces-server is listening on port", port);
});