#! /usr/bin/env node

console.log('This script populates some test user, event and order to your database. Specified database as argument - e.g.: populatedb <mongodbstr>');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')
var User = require('./models/user')
var Event = require('./models/event')
var Order = require('./models/order')
var mongoose = require('mongoose');
const config = require('./config.js');


var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



var users = []
var events = []

function userCreate(name, email, joinDate, callback) {
  var userDetail = {
    name: name,
    email: email,
    joinDate: joinDate,
  }

  var user = new User(userDetail);
  user.save(function (err) {
    if (err) {
      callback(err, null)
      return
    }
    users.push(user)
    console.log('new user: ' + user);
    callback(null, user)
  });
}

function createUserInstances(cb) {
  async.parallel([
    function (callback) {
      userCreate("user 1", 'user1@gmail.com', "2020-Nov-1 16:27", callback)
    },
    function (callback) {
      userCreate("user 2", 'user2@gmail.com', "2020-Nov-2 16:27", callback)
    },
    function (callback) {
      userCreate("user 3", 'user3@gmail.com', "2020-Nov-3 16:27", callback)
    }

  ],
    // Optional callback
    cb);
}

function eventCreate(name, date, location, price, quantity, callback) {
  var eventDetail = {
    name: name,
    date: date,
    location: location,
    price: price,
    quantity: quantity
  }

  var event = new Event(eventDetail);
  event.save(function (err) {
    if (err) {
      callback(err, null)
      return
    }
    events.push(event)
    console.log('new event: ' + event);
    callback(null, event)
  });
}

function createEventInstances(cb) {
  async.parallel([
    function (callback) {
      eventCreate("event 1", "2020-Nov-1 16:00", "Ha Noi - Viet Nam", 50, 10000, callback)
    },
    function (callback) {
      eventCreate("event 2", "2021-Nov-1 16:00", "Ha Noi - Viet Nam", 70, 20000, callback)
    },
    function (callback) {
      eventCreate("event 3", "2022-Nov-1 16:00", "Ha Noi - Viet Nam", 80, 30000, callback)
    },


  ],
    // Optional callback
    cb);
}


function orderCreate(user, event, order_date, quantity, callback) {
  var orderDetail = {
      user: user, 
      event: event,
      order_date: order_date,
      quantity: quantity,
  }

  var order = new Order(orderDetail);
  order.save(function (err) {
    if (err) {
      callback(err, null)
      return
    }
    console.log('new order: ' + order);
    callback(null, order)
  });
}

function createOrderInstances(cb) {
  async.parallel([
    function (callback) {
      orderCreate(users[0], events[0], "2020-Nov-1 10:00", 5, callback)
    },
    function (callback) {
      orderCreate(users[1], events[0], "2020-Nov-1 5:00", 10, callback)
    },
    function (callback) {
      orderCreate(users[2], events[1], "2020-Nov-1 3:00", 15, callback)
    },
  ],
    // Optional callback
    cb);
}



async.series([
  createUserInstances,
  createEventInstances,
  createOrderInstances
],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    }
    else {
      console.log('DONE');
    }
    // All done, disconnect from database
    mongoose.connection.close();
  });




