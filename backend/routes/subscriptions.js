const express = require('express');

const Subscription = require('../models/Subscription');
const {
  sendMail,
  formatWelcomeText,
  formatWelcomeHtml,
  formatNewsletterText,
  formatNewsletterHtml
} = require('../utils/mailer');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    if (!req.app.locals.dbConnected) {
      return res.status(503).json({ message: 'Database is not connected. Subscription was not saved.' });
    }

    const { email } = req.body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanedEmail = email.trim().toLowerCase();

    const subscription = await Subscription.findOneAndUpdate(
      { email: cleanedEmail },
      { email: cleanedEmail },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const emailStatus = await sendSubscriptionWelcome(subscription.email);

    return res.status(201).json({
      id: subscription._id,
      email: subscription.email,
      placedAt: subscription.createdAt,
      emailStatus
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/newsletter', async (req, res, next) => {
  try {
    if (!req.app.locals.dbConnected) {
      return res.status(503).json({ message: 'Database is not connected. Newsletter was not sent.' });
    }

    const subject = String(req.body?.subject || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!subject || !message) {
      return res.status(400).json({ message: 'Newsletter subject and message are required' });
    }

    const subscribers = await Subscription.find().select('email').lean();

    const results = await Promise.all(subscribers.map(async (subscriber) => {
      try {
        return await sendMail({
        to: subscriber.email,
        subject,
          text: formatNewsletterText(message),
          html: formatNewsletterHtml(message)
        });
      } catch (error) {
        return { sent: false, reason: error.message };
      }
    }));

    return res.json({
      message: 'Newsletter sent',
      count: subscribers.length,
      sent: results.filter((result) => result.sent).length,
      failed: results.filter((result) => !result.sent).length
    });
  } catch (error) {
    return next(error);
  }
});

async function sendSubscriptionWelcome(email) {
  try {
    const status = await sendMail({
      to: email,
      subject: 'You are successfully subscribed to Blush & Glow',
      text: formatWelcomeText(email),
      html: formatWelcomeHtml(email)
    });

    if (!status.sent) {
      console.warn(`Subscription welcome email skipped for ${email}: ${status.reason}`);
    }

    return status;
  } catch (error) {
    console.warn(`Subscription welcome email failed for ${email}: ${error.message}`);
    return { sent: false, reason: error.message };
  }
}

module.exports = router;

