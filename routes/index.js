var express = require('express');
var router = express.Router();
var Member = require('../models/member');
var Message = require('../models/message');
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');

// GET /logout
router.get('/api/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// POST /login
router.post('/api/login', function (req, res, next) {
  if (req.body.email && req.body.password) {
    Member.authenticate(req.body.email, req.body.password, function (error, member) {
      if (error || !member) {
        return next({ errorMessage: 'Wrong email or password.' });
      } else {
        req.session.userId = member._id;
        console.log(member._id)
        return res.send({ email: member.email, login: member.login, id: member._id });
      }
    });
  } else {
    return next({ errorMessage: 'Email and password are required' });
  }
});

// GET /api/profile/list
router.get('/api/profile/list/:id', function (req, res, next) {
  Member.findById(req.params.id,
    function (error, member) {
      if (error) { return next(error) }
      else {
        if (member) {
          Member.find({ "_id": { "$ne": req.params.id } }, function (error, members) {
            if (error) { return next(error) }
            else return next(members);
          });
        }
        else {
          return next({ errorMessage: 'Member not found' });
        }
      }
    })
});


// GET /profile
router.get('/api/profile/:id', function (req, res, next) {
  Member.findById(req.params.id,
    function (error, member) {
      if (error) { return next(error) }
      else {
        if (member) {
          return next({
            email: member.email,
            login: member.login,
            _id: member._id
          });
        }
        else {
          return next({ errorMessage: 'Member not found' });
        }
      }
    })
});

// POST /profile
router.post('/api/profile', function (req, res, next) {
  if (req.body.email &&
    req.body.login &&
    req.body.password &&
    req.body.confirmPassword) {

    // vérif que le mot de passe correspond
    if (req.body.password !== req.body.confirmPassword) {
      return next({ errorMessage: 'Passwords do not match.' });
    }

    // vérif de la longueur
    if (req.body.login.length < 5 || req.body.login.length > 20) {
      return next({ errorMessage: 'Login must be between 5 and 20 caracters' });
    }

    // on vérifie si le membre existe

    Member.findOne({ email: req.body.email },
      function (error, member) {
        if (error) { return next(error); }
        else {
          if (!member) {
            return next({ errorMessage: 'No member found with this email' });
          }
          else {
            // on met à jour
            var memberData = {
              email: req.body.email,
              login: req.body.login,
              password: bcrypt.hashSync(req.body.password, 10)
            };
            Member.findOneAndUpdate({ email: req.body.email }, memberData, function (error, member) {
              if (error) {
                return next(error);
              } else {
                req.session.userId = member._id;
                memberData.id = member._id;
                return res.send(memberData);
              }
            });
          }
        }
      })
  } else {
    return next({ errorMessage: 'All fields required.' });
  }
})


// POST /register
router.post('/api/register', function (req, res, next) {
  if (req.body.email &&
    req.body.login &&
    req.body.password &&
    req.body.confirmPassword) {

    // vérif que le mot de passe correspond
    if (req.body.password !== req.body.confirmPassword) {
      return next({ errorMessage: 'Passwords do not match.' });
    }

    // vérif de la longueur
    if (req.body.login.length < 5 || req.body.login.length > 20) {
      return next({ errorMessage: 'Login must be between 5 and 20 caracters' });
    }
    // create object with form input
    var memberData = {
      email: req.body.email,
      login: req.body.login,
      type: false,
      password: req.body.password
    };

    // on vérifie si le membre existe

    Member.findOne({ email: req.body.email },
      function (error, member) {
        if (error) { return next(error); }
        else {
          if (member) {
            return next({ errorMessage: 'A member already exists with this email' });
          }
          else {
            // on crée le membre si il n'existe pas
            Member.create(memberData, function (error, member) {
              if (error) {
                return next(error);
              } else {
                req.session.userId = member._id;
                memberData.id = member._id;
                return res.send(memberData);
              }
            });
          }
        }
      })
  } else {
    return next({ errorMessage: 'All fields required.' });
  }
})

// PUT /api/message/ create message
router.put('/api/message/:id', function (req, res, next) {
  Member.findById(req.params.id,
    function (error, member) {
      if (error) { return next(error) }
      else {
        if (member) {
          Message.create({
            content: req.body.content,
            author: member._id
          },
            function (error, message) {
              if (error) {
                return next(error);
              } else {
                return res.send({ user: member, message: message });
              }
            })
        }
        else {
          return next({ errorMessage: 'Member not found' });
        }
      }
    })
});

// POST /api/message/ (update message)
router.post('/api/message/:id', function (req, res, next) {
  Member.findById(req.params.id,
    function (error, member) {
      if (error) { return next(error) }
      else {
        if (member) {
          Message.findOneAndUpdate({ _id: req.body.id }, { content: req.body.content }, function (error, message) {
            if (error) {
              return next(error);
            } else {
              return res.send(message);
            }
          });
        }
        else {
          return next({ errorMessage: 'Member not found' });
        }
      }
    })
});

// DELETE /api/message/ (delete message)
router.delete('/api/message/:id', function (req, res, next) {
  Member.findById(req.params.id,
    function (error, member) {
      if (error) { return next(error) }
      else {
        if (member) {
          Message.findOneAndDelete({ _id: req.body.id }, function (error, message) {
            if (error) {
              return next(error);
            } else {
              return res.send(message);
            }
          });
        }
        else {
          return next({ errorMessage: 'Member not found' });
        }
      }
    })
});

// GET /api/message/list
router.get('/api/message/list/:id', function (req, res, next) {
  Member.findById(req.params.id,
    function (error, member) {
      if (error) { return next(error) }
      else {
        if (member) {
          Message.find({ author: member._id }, 
            { 'content': 1, 'created_at': 1 }, 
            { sort: '-created_at' }).populate('author').exec(
            function (error, messages) {
            if (error) { return next(error) }
            else {
              member.followed.forEach(m => {
                Message.find({ author: m },
                  { 'content': 1, 'created_at': 1 },
                  { sort: '-created_at' }).populate('author').exec(
                  function (error, mess){
                    if (error) { return next(error) }
                    else { 
                      messages=[...messages,...mess]; 
                      messages.sort((m1,m2)=>{
                        if (new Date(m1.created_at)<new Date(m2.created_at))
                          return 1;
                        if (new Date(m1.created_at)>new Date(m2.created_at))
                          return -1;
                        if (new Date(m1.created_at)==new Date(m2.created_at))
                          return 0;
                      })
                      return next(messages)
                    }
                  });
              })
            }
          });
        }
        else {
          return next({ errorMessage: 'Member not found' });
        }
      }
    })
});

// PUT /api/member/follower add a follower
router.put('/api/member/follower/:id', function (req, res, next) {
  console.log('follower:', req.params.id, 'user', req.body.follower)
  Member.findById(req.params.id,
    function (error, member) {
      if (error) return next(error)
      else {
        if (member) {
          if (member.followed)
            member.followed.push(mongoose.Types.ObjectId(req.body.follower))
          else
            member.followed = [{ id: mongoose.Types.ObjectId(req.body.follower) }]
          Member.findOneAndUpdate({ _id: member._id }, member, function (error, member) {
            if (error) {
              console.log(error);
              return next(error);
            } else {
              //return res.send(member);
            }
          });
        }
        else {
          return next({ errorMessage: 'Member not found' });
        }
      }
    });
    Member.findById(req.body.follower,
      function (error, member) {
        if (error) return next(error)
        else {
          if (member) {
            if (member.followers)
              member.followers.push(mongoose.Types.ObjectId(req.params.id))
            else
              member.followers = [{ id: mongoose.Types.ObjectId(req.params.id) }]
            Member.findOneAndUpdate({ _id: member._id }, member, function (error, member) {
              if (error) {
                console.log(error);
                return next(error);
              } else {
                return res.send(member);
              }
            });
          }
          else {
            return next({ errorMessage: 'Member not found' });
          }
        }
      })
});

module.exports = router;
