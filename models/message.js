var mongoose = require('mongoose');
var Member = require('../models/member');
var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
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
MessageSchema.pre('update', function (next) {
    now = new Date();
    this.updated_at = now;
    next();
});

var Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
