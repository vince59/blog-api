var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var MemberSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    login: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    type: {
        type: Boolean,
        required: true
      },
    followers: [{ type: Schema.ObjectId, ref: 'Member', required: false }],
    followed: [{ type: Schema.ObjectId, ref: 'Member', required: false }],
});
// authenticate input against database documents
MemberSchema.statics.authenticate = function(email, password, callback) {
  Member.findOne({ email: email })
      .exec(function (error, member) {
        if (error) {
          return callback(error);
        } else if ( !member ) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, member.password , function(error, result) {
          if (result === true) {
            return callback(null, member);
          } else {
            return callback();
          }
        })
      });
}
// hash password before saving to database
MemberSchema.pre('save', function(next) {
  var member = this;
  bcrypt.hash(member.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    member.password = hash;
    next();
  })
});

var Member = mongoose.model('Member', MemberSchema);
module.exports = Member;
