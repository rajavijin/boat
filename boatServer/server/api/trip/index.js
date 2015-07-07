'use strict';

var express = require('express');
var controller = require('./trip.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:boatid/:uuid', controller.trips);
router.get('/:id', controller.show);
router.get('/:boatid/:uuid/:start/:end', controller.alltrips);
router.post('/', controller.create);
router.post('/:id', controller.update);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id/:boatid/:debt', controller.destroy);

module.exports = router;