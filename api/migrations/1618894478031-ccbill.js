const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  CCBILL_COMMISSION: 'ccbillCommission',
  CCBILL_CLIENT_ACCOUNT_NUMBER: 'ccbillClientAccountNumber',
  CCBILL_SUB_ACCOUNT_NUMBER: 'ccbillSubAccountNumber',
  CCBILL_FLEXFORM_ID: 'ccbillFlexformId',
  CCBILL_SALT: 'ccbillSalt',
  CCBILL_DATALINK_USERNAME: 'ccbillDatalinkUsername',
  CCBILL_DATALINK_PASSWORD: 'ccbillDatalinkPassword'
};

const settings = [
  {
    key: SETTING_KEYS.CCBILL_SUB_ACCOUNT_NUMBER,
    value: '',
    name: 'Sub account number',
    description: 'CCbill sub account number',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_SALT,
    value: '',
    name: 'Sub salt number',
    description: 'CCbill salt number',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_FLEXFORM_ID,
    value: '',
    name: 'Flexform ID',
    description: 'CCbill flexform ID',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_CLIENT_ACCOUNT_NUMBER,
    value: '',
    name: 'Client account number',
    description: 'CCbill merchant account number (eg: 987654)',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_DATALINK_USERNAME,
    value: '',
    name: 'Datalink Service username',
    description: 'Log in to CCbill admin panel -> Account Info -> Data link services suite',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_DATALINK_PASSWORD,
    value: '',
    name: 'Datalink Service password',
    description: 'https://admin.ccbill.com/megamenus/ccbillHome.html#AccountInfo/DataLinkServicesSuite(234)',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_COMMISSION,
    value: 0.108, // 10.8% to 14.5% fro adult
    name: 'CCbill commission rate',
    description: 'CCbill commission rate in percentage',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'number'
  }
];

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Migrate ccbill datalink user settings');

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
  console.log('Migrate settings done');
  next();
};

module.exports.down = function down(next) {
  next();
};
