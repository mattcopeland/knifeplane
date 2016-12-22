var mongoose = require('mongoose');

var challengeSchema = mongoose.Schema({
  competitionId: {
    type: String,
    required: '{PATH} is required!'
  },
  type: {
    type: String,
    required:  '{PATH} is required!'
  },
  challenger: {
    type: Object,
    required: '{PATH} is required!'
  },
  opponent: {
    type: Object,
    required: '{PATH} is required!'
  },
  forfeit: {
    type: Boolean,
    Default: false
  },
  complete: {
    type: Boolean,
    Default: false
  },
  timeLimit: {
    type: Number,
    default: 24
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  },
  completed: {
    type: Date
  },
  winner: {
    type: String
  }
});

mongoose.model('Challenge', challengeSchema);