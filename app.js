const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
var session = require('express-session');
var mongoose = require('mongoose');
var Store = require('connect-mongo')(session);
var cors = require('cors');

// mongodb connection
mongoose.connect("mongodb://localhost:27042/blog");
var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error:'));
app.use(cors());
// use sessions for tracking logins
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  store: new Store({
    mongooseConnection: db
  })
}));

// use sessions for tracking logins
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false
  }));
  
// make user ID available in templates
app.use(function (req, res, next) {
    res.locals.currentUser = req.session.userId;
    next();
  });

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //err.status = 404;
  next({errorMessage: 'File nor found'});
});

// error handler
app.use(function(err, req, res, next) {
  //res.status(401);
  res.send(err);  
});

app.listen(4242, function () {
    console.log('Express app listening on port 4242');
});
