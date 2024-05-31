const fs = require('fs');
const nodemailer = require('nodemailer');
const Queue = require('bull');
const redis = require('redis');
const User = require('./users'); // Import the User model

// Create a new queue
const emailQueue = new Queue('email', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Create a new queue
const WhatsAppQueue = new Queue('WhatsApp', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

class JourneyProcessor {
  constructor() {
    this.config = null;
    this.userStates = {};
  }


  loadConfig(configPath) {
    const configFile = fs.readFileSync(configPath);
    this.config = JSON.parse(configFile);
  }

  startJourney(user) {
    this.userStates[user] = { stage: 'SurveyEmail' };
    this.executeAction(user, this.config.stages.SurveyEmail.action);
  }

  responceJourney(email, userid) {
    this.userStates[email, userid] = { stage: 'updateCRM' };
    this.executeAction(user, this.config.stages.updateCRM.action);
  }
  getFailedNotifications() {
    this.executeAction(user, this.config.stages.updateCRM.action);
  }
  processEvent(user, event) {
    const currentState = this.userStates[user];
    const currentStageConfig = this.config.stages[currentState.stage];
    if (currentStageConfig.events[event]) {
      this.userStates[user].stage = currentStageConfig.events[event].nextStage;
      this.executeAction(user, this.config.stages[this.userStates[user].stage].action);
    }
  }

  async executeAction(user, action) {
    // Process the queue
    emailQueue.process(async (job, done) => {
      await this.sendEmail(job.user, job.action.details);
      done();
    });

    WhatsAppQueue.process(async (job, done) => {
      await this.sendEmail(job.user, job.action.details);
      done();
    });
    switch (action.type) {

      case 'sendEmail':
        // Function to add emails to the queue
        const users = await User.find({});

        users.forEach((user) => {
          emailQueue.add(user, action.details);
        });

        break;
      case 'whatsuapp':
        // Function to add emails to the queue
        const failedUserList = await User.find({crmUpdated: false });

        failedUserList.forEach((user) => {
          WhatsAppQueue.add(user, action.details);
        });
        break;
      case 'updateCRM':
        this.updateCRM(user);
        break;
      case 'updateFailureCount':
        this.FailureCount(user);
        break;
      case 'waitForEvent':
        this.waitForEvent(user, action.event, action.timeout);
        break;
      default:
        console.log(`Unknown action type: ${action.type}`);
    }
  }

  async sendEmail(user, details) {
    // Configure your email transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    let mailOptions = {
      from: 'test@gmail.com',
      to: user.email,
      subject: 'Please respond',
      text: 'Click on this link to respond: [link]'
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${user.email}`);
      user.emailSentAt = new Date();
      if (details.includes("Survey")) {

        this.waitForEvent(user, 'emailResponded', 48 * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error(`Error sending email to ${user.email}:`, error);
    }

  }

  // Function to send WhatsApp message
  async sendWhatsAppMessage(user, details) {
    try {

      let url = "https:whatsapp/send"
      await axios.post(url, {
        to: user.phoneNumber,
        body: 'Please respond: [link]'
      });
      console.log(`WhatsApp message sent to ${user.phoneNumber}`);

      if (details.includes("Survey")) {

        this.waitForEvent(user, 'emailResponded', 48 * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error(`Error sending WhatsApp message to ${user.phoneNumber}:`, error);
    }
  }


  waitForEvent(user, event, timeout) {
    console.log("user, event, timeout", user, event, timeout);
    setTimeout(() => {
      if (this.userStates[user].stage.includes('wait')) {
        console.log(`Timeout for ${user} on event ${event}`);
        this.processEvent(user, 'timeout');
      }
    }, timeout);
  }

  async updateCRM(user) {
    try {
      const userDoc = await User.findOneAndUpdate(
        { userId: user },
        { crmUpdated: true },
        { upsert: true, new: true }
      );
      console.log(`CRM updated for user ${user}`);
    } catch (error) {
      console.error(`Failed to update CRM for user ${user}: ${error}`);
    }
  }

  async updateFailureCount(user) {
    try {
      const userDoc = await User.findOneAndUpdate(
        { userId: user },
        { $inc: { failureCount: 1 } },
        { upsert: true, new: true }
      );
      console.log(`Failure count updated for user ${user}`);
    } catch (error) {
      console.error(`Failed to update failure count for user ${user}: ${error}`);
    }
  }

}

module.exports = JourneyProcessor;
