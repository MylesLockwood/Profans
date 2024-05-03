/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { readdirSync } = require('fs');
const { readFileSync } = require('fs');
const { join, parse } = require('path');
const { DB, COLLECTION } = require('./lib');

const TEMPLATE_DIR = join(__dirname, '..', 'src', 'templates', 'emails');

const templateMap = {
  'admin-payment-success': {
    name: 'Payment success to admin',
    subject: 'New payment success',
    desc: 'Notification email will be sent to admin email after payment made successfully'
  },
  'approved-performer-account': {
    name: 'Approve performer account',
    subject: 'Your account has been approved',
    desc: 'Notification email to performer when admin approved their account'
  },
  contact: {
    name: 'Contact email',
    subject: 'New contact',
    desc: 'Notification email when having submit from contact page'
  },
  'email-verification': {
    name: 'Email verification',
    subject: 'Verify your email address',
    desc: 'Email will be sent to user to verify their email address'
  },
  forgot: {
    name: 'Forgot password',
    subject: 'Recover password',
    desc: 'Email will be sent for forgot password process'
  },
  'new-performer-notify-admin': {
    name: 'Notify new performer to admin',
    subject: 'New model sign up',
    desc: 'Email notification to admin when having new performer register'
  },
  'performer-cancel-subscription': {
    name: 'Cancel susbscription email to performer',
    subject: 'Cancel Subscription',
    desc: 'Email notification to performer when user unfollows performer'
  },
  'performer-new-subscription': {
    name: 'New subscription email to performer',
    subject: 'New Subscription',
    desc: 'Email notification to performer when having new subscriber'
  },
  'performer-payment-success': {
    name: 'Payment success to performer',
    subject: 'New payment success',
    desc: 'Email to performer after user purchased their assets'
  },
  'send-user-digital-product': {
    name: 'Digital product download link',
    subject: 'Digital product download',
    desc: 'Email to user with digital download link after purchased digital product.'
  },
  'update-order-status': {
    name: 'Order status change',
    subject: 'Order Status Changed',
    desc: 'Email notification to user when performer updates order status'
  },
  'user-payment-success': {
    name: 'Payment success to user',
    subject: 'New payment success',
    desc: 'Email to user after user purchased website products'
  },
  'payout-request': {
    name: 'New payout request',
    subject: 'New payout request',
    desc: 'Email will be sent to admin to notify new payout request'
  },
  'free-subscription-expired': {
    name: 'Free subscription expired',
    subject: 'Free subscription expired',
    desc: 'Email to user to nofity his free subscription expired'
  }
};

module.exports.up = async function up(next) {
  const files = readdirSync(TEMPLATE_DIR).filter((f) => f.includes('.html'));
  for (const file of files) {
    const content = readFileSync(join(TEMPLATE_DIR, file)).toString();
    const key = parse(file).name;
    const exist = await DB.collection(COLLECTION.EMAIL_TEMPLATE).findOne({ key });
    if (!exist) {
      await DB.collection(COLLECTION.EMAIL_TEMPLATE).insertOne({
        key,
        content,
        subject: templateMap[key] ? templateMap[key].subject : null,
        name: templateMap[key] ? templateMap[key].name : key,
        description: templateMap[key] ? templateMap[key].desc : 'N/A',
        layout: 'layouts/default',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  // layout file
  const defaultLayout = await DB.collection(COLLECTION.EMAIL_TEMPLATE).findOne({
    key: 'layouts/default'
  });
  if (!defaultLayout) {
    const layoutFile = readFileSync(join(TEMPLATE_DIR, 'layouts/default.html')).toString();
    await DB.collection(COLLECTION.EMAIL_TEMPLATE).insertOne({
      key: 'layouts/default',
      content: layoutFile,
      name: 'Default layout',
      description: 'Default layout, template content will be replaced by [[BODY]]',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  next();
};

module.exports.down = function down(next) {
  next();
};
