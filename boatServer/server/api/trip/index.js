'use strict';

var express = require('express');
var controller = require('./trip.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:boatid', controller.trips);
router.get('/:boatid/:id', controller.show);
router.get('/:boatid/:start/:end', controller.alltrips);
router.post('/', controller.create);
router.post('/:id', controller.update);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;