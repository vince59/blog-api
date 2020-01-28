var mongoose = require('mongoose');
var Member = require('../models/member');
var Schema = mongoose.Schema;

var FollowerSchema = new mongoose.Schema({
  content: {
    status: String,
    required: true
  },
  followed: {
    type: Schema.Types.ObjectId,
    ref: "Member"
  },
  follower: {
    type: Schema.Types.ObjectId,
    ref: "Member"
  },
  created_at: { type: Date },
  updated_at: { type: Date }
});

// change date before saving to database
MessageSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
      this.created_at = now;
    }
    next();
});

// change date saving to database
FollowerSchema.pre('update', function (next) {
    now = new Date();
    this.updated_at = now;
    next();
});

var Follower = mongoose.model('Follower', MessageSchema);
module.exports = Follower;
