var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

let RestaurantRecord = require('./model').Restaurant;
let MongoStorage = require('./mongo').Mongo;

const API_URL = '/api/menu/:id';

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
    );
    next();
  });

  // API
  app.get(API_URL, function (req, res, _next) {
    const restaurant = storage.getById(req.params.id);

    if (restaurant) {
      return res.status(200).send(restaurant);
    }

    return res
      .status(400)
      .send({ error: 'No restaurant with id "' + req.params.id + '"!' });
  });

  app.put(API_URL, function (req, res, _next) {
    let restaurant = storage.getById(req.params.id);
    const errors = [];

    if (restaurant) {
      restaurant.update(req.body);
      return res.status(200).send(restaurant);
    }

    restaurant = new RestaurantRecord(req.body);  
    if (restaurant.validate(errors)) {
      storage.add(restaurant);
      return res.status(201).send(restaurant);
    }

    return res.status(400).send({ error: errors });
  });

  app.delete(API_URL, function (req, res, _next) {
    if (storage.deleteById(req.params.id)) {
      return res.status(204).send(null);
    }

    return res
      .status(400)
      .send({ error: 'No restaurant with id "' + req.params.id + '"!' });
  });

  // start the server

  app.listen(PORT, function () {
    console.log('Go to http://localhost:' + PORT + '/');
  });
};
