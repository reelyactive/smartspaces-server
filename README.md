smartspaces-server
==================

Serves up the static content of webpages for Smart Spaces.  In other words, it serves up webpages like this: [smartspac.es/notman](http://smartspac.es/notman)

Installation
------------

1. Clone the repo
2. `npm install`

Configuration
-------------

1. Update _places.json_ to reflect your places of interest
2. Update _config.json_ with your Twitter key/secret (see [apps.twitter.com](https://apps.twitter.com/))
3. Update _server.js_ to redirect to the desired place of interest (by default the root redirects to _notman_, an existing Smart Space you can use for test & development)
4. Update _server.js_ to use the desired port number, by default it is 3000

The default configuration expects smartspaces-client to reside in a neighbouring folder.  This can be achieved by cloning the [smartspaces-client](https://github.com/reelyactive/smartspaces-client) repository from the same root folder.  If not, be sure to update the _publicDir_ variable in _server.js_. 

Running locally
---------------

1. `node server.js`
2. Open http://localhost:3000

See also
--------

- [hlc-server](https://www.npmjs.org/package/hlc-server) to provide the hyperlocal context consumed by [smartspaces-client](https://github.com/reelyactive/smartspaces-client)
- [reelyActive Technology](http://context.reelyactive.com/technology.html) to understand how this all works

License
-------

MIT License

Copyright (c) 2014 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
