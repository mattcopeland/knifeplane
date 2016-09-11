var mongoose = require('mongoose');

var pyramidSchema = mongoose.Schema({
  name: {
    type: String,
    required: '{PATH} is required!'
  },
  levels: {
    type: Number,
    required: '{PATH} is required!'
  },
  players: {
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
        levels: 4,
        players: []
      });
    }
  });
}

exports.createDefaultPyramid = createDefaultPyramid;