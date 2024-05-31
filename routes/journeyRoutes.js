const express = require('express');
const journeyController = require('../controller/journeyController');

const router = express.Router();

router.post('/journeyservey', journeyController.startJourney);
router.post('/journey-responce', journeyController.responceJourney);
router.post('/failed-notifications', journeyController.getFailedNotifications);


module.exports = router;
