var http = require('http')
  , fs = require('fs')
  , argv = require('optimist').argv
  , vm = require('vm')
  , Cookies = require('cookies')
  , utils = require('./utils');

// setup

var app
  , appConfig = utils.readJsonSync('config/app.json')
  , port = argv.port || 4001
  , redirect_host = argv.redirect_host || 'http://www.bbc.co.uk'
  , cookieName = 'mvt'
  , cookieTTL = argv.cookie_ttl || appConfig.cookieTTL || 60000
  , apiBase = argv.api_base || 'http://localhost:4000'
  , projectConfigs = {};

if (!process.env.NODE_ENV) {
  throw('NODE_ENV is not set');
}
environment = process.env.NODE_ENV;

// functions 

function loadProjectConfigs() {
  appConfig.projects.forEach(function(project){
    (function () {
      var id = project.id
        , apiId = project._id
        , options = utils.getHttpOptions(apiBase +'/projects/id/' +apiId);
      utils.getJson(options, function(data) {
        if (data) {
          projectConfigs[id] = data;
        }
      });
    })()
  });
}

function getVariant(existingVariant, project) {
  var projectConfig;
  this.variant = null;
  if (project && project.id) {
    projectConfig = projectConfigs[project.id];
    if (false !== projectConfig && undefined !== projectConfig && projectConfig.variantRule) {
      try {
        vm.runInThisContext(projectConfig.variantRule);
      } catch(e) {

      }
    }
  }

  return this.variant;
};

function handleRequest(req, res) {
  var project = utils.getProjectByPath(req.url, appConfig)
    , path = req.url
    , cookies = new Cookies(req, res)
    , existingVariant = cookies.get('mvt')
    , result = {
      variant: null,
      expiresDate: null
    };

  if (undefined === existingVariant) {
    result.variant = getVariant(existingVariant, project);
    result.expiresDate = utils.getExpiresDate(cookieTTL);
    if (null !== result.variant && null !== result.expiresDate) {
      cookies.set('mvt', result.variant, {expires: result.expiresDate, path: path});
    }
    return result;
  } else {
    return false;
  }
};

function htmlRequest(req, res) {
  var result = handleRequest(req, res)
    , headers = {'Content-type': 'text/html'}
    , path = req.url;

  headers.Location = 'http://' +redirect_host + path;
  if (false !== result) {
    res.writeHead(302, headers);
    res.end('Set cookie to ' +result.variant +' with expiry ' +result.expiresDate);
  } else {
    res.writeHead(302, headers);
    res.end('Cookie already exists.');
  }
}

function jsonRequest(req, res) {
  var result = handleRequest(req, res)
    , headers = {'Content-type': 'application/json'}
    , path = req.url;

  if (false !== existingVariant) {
    res.writeHead(200, headers);
    res.end('{"message": "Setting new cookie", "variant":"' +result.variant +'", "expires": "' +result.expiresDate +'"}');
  } else {
    res.writeHead(200, headers);
    res.end('{"message": "Cookie already exists."}');
  }
}

// server

loadProjectConfigs();
setInterval(loadProjectConfigs, 30000);

http.createServer(function(req, res) {
  switch (req.url) {
    case '/favicon.ico':
      res.writeHead(404);
      res.end('Not found');
      break;
    case '/service.json':
      jsonRequest(req, res);
      break;
    default:
      htmlRequest(req, res);
      break;
  }
}).listen(port);
