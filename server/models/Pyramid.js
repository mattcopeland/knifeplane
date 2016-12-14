var mongoose = require('mongoose');

var pyramidSchema = mongoose.Schema({
  name: {
    type: String,
    required: '{PATH} is required!'
  },
  activity: {
    type: String,
    required: '{PATH} is required!'
  },
  forfeitDays: {
    type: Number,
    default: 1
  },
  restrictJoins: {
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

var Pyramid = mongoose.model('Pyramid', pyramidSchema);

function createDefaultPyramid() {
  Pyramid.find({}).exec(function (err, collection) {
    if (collection.length === 0) {
      Pyramid.create({
        name: 'Default Pyramid',
        activity: 'Testing',
        players: [],
        pendingPlayers: [],
        admins: []
      });
    }
  });
}

exports.createDefaultPyramid = createDefaultPyramid;