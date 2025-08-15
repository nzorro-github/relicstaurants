var express = require('express');
var fs = require('fs');
var logger = require('morgan');
var bodyParser = require('body-parser');

let RestaurantRecord = require('./model').Restaurant;
let MongoStorage = require('./mongo').Mongo;

var API_URL = '/api/restaurants';

var removeMenuItems = function (restaurant) {
  var clone = {};

  Object.getOwnPropertyNames(restaurant).forEach(function (key) {
    if (key !== 'menuItems') {
      clone[key] = restaurant[key];
    }
  });

  return clone;
};

exports.start = function (PORT, STATIC_DIR, DATA_FILE) {
  const app = express();
  const storage = new MongoStorage();

  // log requests
  app.use(logger('combined'));

  // serve static files for demo client
  app.use(express.static(STATIC_DIR));

  // parse body into req.body
  app.use(bodyParser.json());

  // set header to prevent cors errors
  app.use(function (_req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'newrelic, tracestate, traceparent'
    ),
      next();
  });

  // API
  app.get(API_URL, async function (_req, res, _next) {
    // get all restaurants
    // and remove menuItems from the response
    try {
      const items = await storage.getAll();
      if (!items || items.length === 0) {
        return res.status(404).send({ error: 'No restaurants found' });
      }
      console.log(`Found ${items.length} restaurants`);

      const response = res.status(200).send(items.map(removeMenuItems));
      return response;
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
      return res.status(500).send({ error: 'Failed to fetch restaurants' });
    }
  });

  app.post(API_URL, function (req, res, _next) {
    var restaurant = new RestaurantRecord(req.body);
    var errors = [];

    if (restaurant.validate(errors)) {
      storage.add(restaurant);
      return res.status(201).send(restaurant);
    }

    return res.status(400).send({ error: errors });
  });

  // start the server

  app.listen(PORT, function () {
    console.log('Go to http://localhost:' + PORT + '/');
  });

  // Windows and Node.js before 0.8.9 would crash
  // https://github.com/joyent/node/issues/1553
  //  try {
  //    process.on('SIGINT', function() {
  //      // save the storage back to the json file
  //      fs.writeFile(DATA_FILE, JSON.stringify(storage.getAll()), function() {
  //        process.exit(0);
  //      });
  //    });
  //  } catch (e) {}
};
