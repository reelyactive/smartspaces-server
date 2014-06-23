smartspaces-server
==================

Serves up the static content of smartspaces webpages

Installation
------------

1. Clone the repo
2. `npm install`

Configuration
-------------

In server.js:

1. Update the _pages_ array as necessary
2. Change _publicDir_ to the path to the smartspaces-client

The default configuration expects smartspaces-client to reside in a neighbouring folder.  This can be achieved by cloning the [smartspaces-client](https://github.com/reelyactive/smartspaces-client) repository from the same root folder.

Running locally
---------------

1. `node server.js`
2. Open http://localhost:3000
