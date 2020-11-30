var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const config = require('./config.js');
var bodyParser = require('body-parser')

const logger = require('./winston');

var bodyParser = require("body-parser"),
  swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


var indexRouter = require('./routes/index');
app.use('/', indexRouter);

var usersRouter = require('./routes/users');
app.use('/users', usersRouter);

var eventsRouter = require('./routes/events');
app.use('/events', eventsRouter);

var ordersRouter = require('./routes/orders');
app.use('/orders', ordersRouter);

// setup database
var mongoose = require('mongoose');

var mongoUrl = `${config.MONGODB_CONNECTION}`
// when using with docker, at the time we up containers. Mongodb take few seconds to starting, during that time NodeJS server will try to connect MongoDB until success.
const connectWithRetry = function () { 
  return mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology:true, useFindAndModify: false }, (err) => {
    if (err) {
      console.error('Failed to connect to mongo on startup - retrying in 5 sec', err)
      setTimeout(connectWithRetry, 5000)
    }
  })
}
connectWithRetry()
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// swagger definition
const swaggerDefinition = {
  info: {
    title: 'Tiket app API',
    version: '1.0.0',
    description: 'This is tiket app API spec.',
  },
  host: `${config.HOST}:${config.PORT}`,
  basePath: '/',
};
// options for swagger jsdoc 
const swaggerOptions = {
  swaggerDefinition: swaggerDefinition, // swagger definition
  apis: ['./controllers/*.js', './models/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in dev
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
