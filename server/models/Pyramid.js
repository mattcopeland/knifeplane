var mongoose = require('mongoose');

var pyramidSchema = mongoose.Schema({
  name: {
    type: String,
    required: '{PATH} is required!'
  },
  forfeitDays: {
    type: Number,
    default: 1
  },
  open: {
    type: Boolean,
    default: true
  },
  players: {
    type: Array,
    default: []
  },
  pendingPlayers: {
    type: Array,
    default: []
  },
  owners: {
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
        players: [],
        pendingPlayers: [],
        owners: []
      });
    }
  });
}

exports.createDefaultPyramid = createDefaultPyramid;