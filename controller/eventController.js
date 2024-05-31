const EventHandler = require('../models/eventHandler');
const JourneyProcessor = require('../models/journeyProcessor');
const journeyProcessor = new JourneyProcessor();
journeyProcessor.loadConfig('./config/journeyConfig.json');
const eventHandler = new EventHandler(journeyProcessor);

exports.handleEvent = (req, res) => {
  const { user, event } = req.body;
  eventHandler.handleEvent(user, event);
  res.send(`Event ${event} processed for user ${user}`);
};
