var mongoose = require('mongoose');

var alertSchema = mongoose.Schema({
  userId: {
    type: String,
    required: '{PATH} is required!'
  },
  competitionId: {
    type: String
  },
  details: {
    type: Object,
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

mongoose.model('Alert', alertSchema);