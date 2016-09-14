var mongoose = require('mongoose');

var challengeSchema = mongoose.Schema({
  competitionId: {
    type: String,
    required: '{PATH} is required!'
  },
  challenger: {
    type: Object,
    required: '{PATH} is required!'
  },
  opponent: {
    type: Object,
    required: '{PATH} is required!'
  },
  winner: {
    type: Object
  },
  forfeit: {
    type: Boolean,
    Default: false
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  }
});

var Challenge = mongoose.model('Challenge', challengeSchema);