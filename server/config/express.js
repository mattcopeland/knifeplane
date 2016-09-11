var express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  passport = require('passport'),
  credentials = require('./credentials'),
  mongoose = require('mongoose'),
  MongoStore = require('connect-mongo')(session),
  path = require('path');

module.exports = function (app, config) {
  app.set('views', config.rootPath + '/server/views');
  app.set('view engine', 'jade');
  app.use(cookieParser(credentials.cookieSecret));
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(session({
    secret: credentials.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.static(__dirname + '/../../client/assets'));
  app.use(express.static(__dirname + '/../../bower_components'));
  app.use(express.static(__dirname + '/../../client/app'));
};