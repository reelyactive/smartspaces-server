var express = require("express");
var app = express();


// List of acceptable pages on which to serve the web client.
var pages = ['notman', 'greenhouse'];

// Directory containing the web client.
var publicDir = 'public';


// Request handlers
app.get('/', function(req, res) {
    // Redirect the root path to our default area.
    res.redirect(307, '/notman');
});

app.get('/:identifier', function(req, res) {
  if (pages.indexOf(req.params.identifier) != -1) {
    res.sendfile(publicDir + "/index.html");
  } else {
    res.status(404).send('Not found');
  }
});

// Static files directory
app.use(express.static(publicDir));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("smartpaces-server is listening on port", port);
});