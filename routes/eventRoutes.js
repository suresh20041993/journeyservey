const express = require('express');
const eventController = require('../controller/eventController');

const router = express.Router();

router.post('/event', eventController.handleEvent);

module.exports = router;
