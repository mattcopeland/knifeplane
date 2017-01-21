var mongoose = require('mongoose');

var competitionSchema = mongoose.Schema({
  name: {
    type: String,
    required: '{PATH} is required!'
  },
  type: {
    type: String,
    required: '{PATH} is required!',
    default: 'pyramid'
  },
  activity: {
    type: String,
    required: '{PATH} is required!'
  },
  forfeitDays: {
    type: Number,
    default: 1
  },
  waitingPeriodDays: {
    type: Number,
    default: 1
  },
  restrictJoins: {
    type: Boolean,
    default: false
  },
  private: {
    type: Boolean,
    default: false
  },
  allowWeekendChallenges: {
    type: Boolean,
    default: false
  },
  players: {
    type: Array,
    default: []
  },
  pendingPlayers: {
    type: Array,
    default: []
  },
  admins: {
    type: Array,
    default: []
  }  
});

var Competition = mongoose.model('Competition', competitionSchema);

function createDefaultCompetition() {
  Competition.find({}).exec(function (err, collection) {
    if (collection.length === 0) {
      Competition.create({
        name: 'Default Competition',
        type: 'pyramid',
        activity: 'Testing',
        players: [],
        pendingPlayers: [],
        admins: []
      });
    }
  });
}

exports.createDefaultCompetition = createDefaultCompetition;