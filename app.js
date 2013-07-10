var http = require('http')
  , fs = require('fs')
  , path = require('path')
  , os = require("os")
  , argv = require('optimist').argv
  , express = require('express');
 
var app
  , port = argv.port || 4000;

// detect env

if (!process.env.NODE_ENV) {
  throw('NODE_ENV is not set');
}
environment = process.env.NODE_ENV;


// create express app

app = express();

app.configure(function(){
  app.set('port', port);
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.logger('dev'));
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('production', function () {
  app.use(express.compress());
  app.use(express.errorHandler());
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: 120 * 1000 }));
});


require('./routes/projects').init(app);
require('./routes/experiments').init(app);
require('./routes/tracking').init(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Server listening on port " + app.get('port'));
});

