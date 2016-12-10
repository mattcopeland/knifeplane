var mongoose = require('mongoose');

var notificationSchema = mongoose.Schema({
  userId: {
    type: String,
    required: '{PATH} is required!'
  },
  competitionId: {
    type: String
  },
  description: {
    type: String,
    required: '{PATH} is required!'
  },
  cleared: {
    type: Boolean,
    Default: false
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Notification', notificationSchema);