var express = require('express');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var app = express();
var config = require('./server/config/config')[env];
var websockets = require('./server/websockets');

require('./server/config/express')(app, config);

require('./server/config/mongoose')(config);

require('./server/config/passport')();

require('./server/config/routes')(app);

//app.listen(config.port);
//console.log('Listening on port ' + config.port + '...');

var server = app.listen(config.port, function () {
  console.log('Server listening on', config.port);
});
websockets.connect(server);