var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cons = require('consolidate');
var multer = require('multer');
const upload = multer({dest: __dirname + '/'});


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login.js');
var adminPanelRouter = require('./routes/admin-panel');
var buyerPanelRouter = require('./routes/buyer-panel');
var sellerPanelRouter = require('./routes/seller-panel');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('view engine', 'pug');
app.set('views', './views'); // for parsing application/json

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({secret: "A nice hard to guess key"}));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/admin-panel', adminPanelRouter);
app.use('/buyer-panel', buyerPanelRouter);
app.use('/seller-panel', sellerPanelRouter);
app.all('/logout', (req, res) =>{
  req.session.destroy();
  console.log(path.join(req.headers.host, "index.html"));
  res.redirect("/index.html");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;