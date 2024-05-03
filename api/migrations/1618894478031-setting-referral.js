const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  REFERRAL_COMMISSION: 'referralCommission'
};

const settings = [
  {
    key: SETTING_KEYS.REFERRAL_COMMISSION,
    value: 0.05,
    name: 'Referral commission',
    description: 'Percentage per charge',
    public: true,
    group: 'commission',
    editable: true,
    type: 'number'
  }
];

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Migrate referral settings');

  // eslint-disable-next-line no-restricted-syntax
  for (const setting of settings) {
    // eslint-disable-next-line no-await-in-loop
    const checkKey = await DB.collection(COLLECTION.SETTING).findOne({
      key: setting.key
    });
    if (!checkKey) {
      // eslint-disable-next-line no-await-in-loop
      await DB.collection(COLLECTION.SETTING).insertOne({
        ...setting,
        type: setting.type || 'text',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      // eslint-disable-next-line no-console
      console.log(`Inserted setting: ${setting.key}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Setting: ${setting.key} exists`);
    }
  }
  // eslint-disable-next-line no-console
  console.log('Migrate referral settings done');
  next();
};

module.exports.down = function down(next) {
  next();
};
