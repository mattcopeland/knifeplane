var crypto = require('crypto');

// Create a salt for storing password
exports.createSalt = function () {
  return crypto.randomBytes(128).toString('base64');
};

// Hash a password using a random salt
exports.hashPwd = function (salt, pwd) {
  var hmac = crypto.createHmac('sha1', salt);
  return hmac.update(pwd).digest('hex');
};