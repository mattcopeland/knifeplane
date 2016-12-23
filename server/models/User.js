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
  username: {
    type: String,
    required: '{PATH} is required!',
    unique: true
  },
  displayName: {
    type: String
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
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
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
        displayName: 'Matt Copeland',
        username: 'matt@matt.com',
        salt: salt,
        hashedPwd: hash,
        roles: ['super-admin', 'admin', 'user'],
        verified: true
      });

      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'tom');
      User.create({
        firstName: 'Tom',
        lastName: 'Klonowski',
        displayName: 'Tom Klonowski',
        username: 'tom@tom.com',
        salt: salt,
        hashedPwd: hash,
        roles: ['user'],
        verified: true
      });

      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'justin');
      User.create({
        firstName: 'Justin',
        lastName: 'Modrzynski',
        displayName: 'j-mod',
        username: 'justin@justin.com',
        salt: salt,
        hashedPwd: hash,
        roles: ['user'],
        verified: true
      });

      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'jt');
      User.create({
        firstName: 'JT',
        lastName: 'Ripper',
        displayName: 'JT Ripper',
        username: 'jt@jt.com',
        salt: salt,
        hashedPwd: hash,
        roles: ['user'],
        verified: true
      });

      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'jodi');
      User.create({
        firstName: 'Jodi',
        lastName: 'Hamann',
        displayName: 'Jodi',
        username: 'jodi@jodi.com',
        salt: salt,
        hashedPwd: hash,
        roles: ['user'],
        verified: true
      });

      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'ryan');
      User.create({
        firstName: 'Ryan',
        lastName: 'Kirkpatrick',
        displayName: 'Classic',
        username: 'ryan@ryan.com',
        salt: salt,
        hashedPwd: hash,
        roles: ['user'],
        verified: true
      });

      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'abdul');
      User.create({
        firstName: 'Abdul',
        lastName: 'Kader',
        displayName: 'Abdul Kader',
        username: 'abdul@abdul.com',
        salt: salt,
        hashedPwd: hash,
        roles: ['user'],
        verified: true
      });
    }
  });
}

exports.createDefaultUsers = createDefaultUsers;