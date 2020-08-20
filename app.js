var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
//for maintaining sessions
const session = require('express-session');
const FileStore = require('session-file-store')(session);
//for maintaining sessions end
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
var favoriteRouter = require('./routes/favoriteRouter');
const Dishes = require('./models/dishes');

//const url = 'mongodb://localhost:27017/conFusion';
const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then((db)=>{
  console.log("Connected correctly to server");
}, (err)=>{
  console.log(err);
})

var app = express();

app.all('*',(req,res,next)=>{
  if(req.secure){
    return next();
  }
  else{
    res.redirect(307,'https://'+req.hostname+':'+app.get('secPort')+req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//below line is used when we set up cookie in auth======
//app.use(cookieParser('12345-67890-09876-54321'));

//maintain session=======
// app.use(session({
//   name:'session-id',
//   secret:'12345-67890-09876-54321',
//   saveUninitialized:false,
//   resave:false,
//   store:new FileStore
// }));

app.use(passport.initialize());
//app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

//set up basic authentication========
/*
function auth(req,res,next){
  console.log(req.headers);
  //console.log(req.signedCookies);
  console.log(req.session);
  if(!req.session.user){
    var err = new Error('You are not authenticated!');
    err.status = 403;
    return next(err);
  }
 else{
  if (req.session.user === 'authenticated') {
    next();
  }
  else {
    var err = new Error('You are not authenticated!');
    err.status = 403;
    return next(err);
  }
 }
}
*/
// with passport==========
// function auth(req,res,next){
//   console.log(req.user);
//   if (!req.user) {
//     var err = new Error('You are not authenticated!');
//     err.status = 403;
//     next(err);
//   }
//   else {
//         next();
//   }
// }

// app.use(auth);
//set up basic authentication end========

app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

//REST API using Express Generator
app.use('/dishes', dishRouter);
app.use('/dishes/:dishId', dishRouter);
app.use('/promotions', promoRouter);
app.use('/promotions/:promoId', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/leaders/:leaderId', leaderRouter);
app.use('/upload', uploadRouter);
app.use('/favorites', favoriteRouter);
app.use('/favorites/:dishId', favoriteRouter);

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
