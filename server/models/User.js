var mongoose = require('mongoose'),
  encrypt = require('../utilities/encryption');

var userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: '{PATH} is required!'
  },
  lastName: {
    type: String,
    required: '{PATH} is required!'
  },
  nickname: {
    type: String
  },
  username: {
    type: String,
    required: '{PATH} is required!',
    unique: true
  },
  image: {
    type: String
  },
  salt: {
    type: String,
    required: '{PATH} is required!'
  },
  hashedPwd: {
    type: String,
    required: '{PATH} is required!'
  },
  roles: [
   String
 ],
  created: {
    type: Date,
    required: true,
    default: Date.now
  }
});

userSchema.methods = {
  authenticate: function (passwordToMatch) {
    return encrypt.hashPwd(this.salt, passwordToMatch) === this.hashedPwd;
  },
  hasRole: function (role) {
    return this.roles.indexOf(role) > -1;
  }
};

var User = mongoose.model('User', userSchema);

function createDefaultUsers() {
  User.find({}).exec(function (err, collection) {
    if (collection.length === 0) {
      var salt, hash;
      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'matt');
      User.create({
        firstName: 'Matt',
        lastName: 'Copeland',
        username: 'matt@matt.com',
        salt: salt,
        hashedPwd: hash,
        roles: ['super-admin', 'admin', 'user']
      });
    }
  });
}

exports.createDefaultUsers = createDefaultUsers;