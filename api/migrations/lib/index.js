const crypto = require('crypto');

const mongoose = require('mongoose');

exports.COLLECTION = {
  SETTING: 'settings',
  USER: 'users',
  AUTH: 'auth',
  POST: 'posts',
  MENU: 'menus',
  PERFORMER: 'performers',
  PERFORMER_VIDEO: 'performervideos',
  EMAIL_TEMPLATE: 'emailtemplates'
};

exports.DB = mongoose.connection;

exports.encryptPassword = (pw, salt) => {
  const defaultIterations = 10000;
  const defaultKeyLength = 64;

  return crypto
    .pbkdf2Sync(pw, salt, defaultIterations, defaultKeyLength, 'sha1')
    .toString('base64');
};

exports.generateSalt = (byteSize = 16) => crypto.randomBytes(byteSize).toString('base64');
