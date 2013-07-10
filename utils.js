var fs = require('fs')
  , url = require('url')
  , http = require('http');

exports.getExpiresDate = function(ttl) {
  return new Date(new Date().getTime() + ttl);
}

exports.readJson = function(file, callback) {
  fs.readFile(file, function(data) {
    try{      
      callback(JSON.parse(data));
    } catch(e) {
      callback(false);
    }
  });
};

exports.readJsonSync = function(file) {
  return JSON.parse(fs.readFileSync(file));
};

exports.getJson = function(options, callback) {
  var req = http.request(options, function(res) {
    var str = ''
      , json;
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      try {
        json = JSON.parse(str)
      } catch (e) {
        callback(false);
        return;
      }
      callback(json);
    });
  });
  req.on('error', function(e) {
    console.log('Request error: ' + e.message);
    callback(false);
    return;
  });
  req.end();
};

exports.getHttpOptions = function(uri, proxyUri) {
  var options = {headers:{}}
    , uri = url.parse(uri)
    , header;

  if (proxyUri) proxyUri = url.parse(proxyUri);

  options.protocol = uri.protocol || 'http:';
  options.hostname = uri.hostname || 'localhost';
  options.port = uri.port || null;
  options.path = uri.path || '/';

  if (proxyUri && proxyUri.hostname) {
    options.path = options.protocol +'//' +uri.hostname + uri.path;
    options.hostname = proxyUri.hostname;
    options.headers.Host = uri.hostname;
    options.port = proxyUri.port | null;
  }
  return options;
};

exports.getProjectByPath = function(path, appConfig) {
  var regExp
    , matchedProject
    , hasMatchedRoute;

  project = appConfig.projects.some(function(project){
    hasMatchedRoute = project.routes.some(function(route){
      if (new RegExp(route).test(path)) {
        matchedProject = project;
        return true;
      }
    });
    if (hasMatchedRoute) return true;
  });
  return matchedProject;
};

return exports;
