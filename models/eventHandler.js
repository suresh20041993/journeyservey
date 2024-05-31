class EventHandler {
    constructor(journeyProcessor) {
      this.journeyProcessor = journeyProcessor;
    }
  
    handleEvent(user, event) {
      this.journeyProcessor.processEvent(user, event);
    }
  }
  
  module.exports = EventHandler;
  