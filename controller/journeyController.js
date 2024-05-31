const JourneyProcessor = require('../models/journeyProcessor');
const journeyProcessor = new JourneyProcessor();
journeyProcessor.loadConfig('./config/journeyConfig.json');

exports.startJourney = (req, res) => {
  journeyProcessor.startJourney();
  res.send(`Journey started for user ${user}`);
};
exports.responceJourney = (req, res) => {
  const { email,userid } = req.body;
  journeyProcessor.responceJourney(email,userid);

  res.send(`Journey started for user ${user}`);
};

exports.getFailedNotifications = (req, res) => {
  journeyProcessor.getFailedNotifications();

  res.send(`Journey started for user ${user}`);
};