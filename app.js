var http = require('http')
  , argv = require('optimist').argv
  , Cookies = require('cookies');

// setup

var app
  , port = argv.port || 4001
  , cookieName = 'mvt'
  , cookieTTL = 60 * 1000 //ms
  , htmlHeaders = {'Content-type': 'text/html'}
  , jsonHeaders = {'Content-type': 'application/json'};


if (!process.env.NODE_ENV) {
  throw('NODE_ENV is not set');
}
environment = process.env.NODE_ENV;


// utility functions

function getVariant(existingVariant) {
  // generate 5 HP change location colour variants
  return 'hp_loc_col_' +Math.floor(Math.random() / 0.2);
};

function getExpiresDate() {
  return new Date(new Date().getTime() + cookieTTL);
}

function htmlRequest(req, res) {
  var cookies = new Cookies(req, res)
    , existingVariant = cookies.get('mvt')
    , variant
    , expiresDate;

  if (undefined === existingVariant) {
    variant = getVariant(existingVariant);
    expiresDate = getExpiresDate();
    cookies.set('mvt', variant, {expires: expiresDate});
    res.writeHead(200, htmlHeaders);
    res.end('Set cookie to ' +variant +' with expiry ' +expiresDate);
  } else {
    res.writeHead(200, htmlHeaders);
    res.end('Cookie already exists.');
  }
}

function jsonRequest(req, res) {
  var cookies = new Cookies(req, res)
    , existingVariant = cookies.get('mvt')
    , variant
    , expiresDate;

  if (undefined === existingVariant) {
    variant = getVariant(existingVariant);
    expiresDate = getExpiresDate();
    cookies.set('mvt', variant, {expires: expiresDate});
    res.writeHead(200, jsonHeaders);
    res.end('{"message": "Setting new cookie", "variant":"' +variant +'", "expires": "' +expiresDate +'"}');
  } else {
    res.end('{"message": "Cookie already exists."}');
  }
}

// server

http.createServer(function(req, res) {
  switch (req.url) {
    case '/service.json':
      jsonRequest(req, res);
      break;
    default:
      htmlRequest(req, res);
      break;
  }
}).listen(port);
