var express         = require('express');
var _               = require('underscore');
var async           = require('async');
var User            = require('../models/User');
var ScannerUser     = require('../models/ScannerUser');
var ScannerResult   = require('../models/ScannerResult');

var bodyParser      = require('body-parser');

module.exports = function (config) {
  var router = express.Router();

  // Needed so JSON parser errors can be handled
  // by the route's error handler
  router.use(bodyParser.json());

  var tokens = {};

  var token_expiry_time = 15 * 60 * 1000;

  function createToken(scannerUser) {
    var chars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var token;

    do {
      var str = [];
      for(var i = 0; i < 18; i++){
        str[i] = chars[Math.floor(Math.random() * chars.length)];
      }
      token = str.join("");

    } while (tokens[token]);

    tokens[token] = {
      created_timestamp: new Date(),
      scanner_user_id: scannerUser._id
    };

    return token;
  }

  function isTokenValid(token) {
    var tokenInfo = tokens[token];
    if (!tokenInfo) {
      return false;
    }

    return new Date() - tokenInfo.created_timestamp <= token_expiry_time;
  }

  function revokeToken(token) {
    delete tokens[token];
  }

  function getTokenTimestamp(token) {
    var tokenInfo = tokens[token];
    if (tokenInfo) {
      return tokenInfo.created_timestamp;
    }

    return null;
  }

  function updateTokenTimestamp(token) {
    var tokenInfo = tokens[token];
    if (tokenInfo) {
      tokenInfo.created_timestamp = new Date();
    }
  }

  function getScannerUserIdFromToken(token) {
    var tokenInfo = tokens[token];
    if (tokenInfo) {
      return tokenInfo.scanner_user_id;
    }
    return null;
  }

  function success(res, body) {
    res.send({
      success: true,
      result: body
    });
  }

  function badRequest(message) {
    var err = new Error(message);
    err.status = 400;
    return err;
  }

  router.all('/', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.type('json');
    next();
  });

  router.post('/token', function (req, res) {
    var username =  req.body.username;
    var password =  req.body.password;

    if (!username || !password) {
      throw badRequest("Username and/or password not provided.");
    }

    var authenticate = ScannerUser.authenticate();
    var body = {};

    async.waterfall([
      function (next) {
        authenticate(username, password, next);
      },
      function (scannerUser, next, err) {
        var token = createToken(scannerUser);
        var body = {
          display_name: scannerUser.display_name,
          token: token
        };
        success(res, body);
        next();
      }
    ]);

  });

  router.get('/token', function (req, res) {
    var token = req.query.token;

    if (!token) {
      throw badRequest("No token provided.");
    }

    var valid = isTokenValid(token);
    success(res, {"valid": valid});
  });

  router.post('/ticketinfo', function (req, res, next) {
    var token = req.query.token;

    if (!token) {
      throw badRequest("No token provided.");
    }

    if(!isTokenValid(token)) {
      throw badRequest("Invalid token provided.");
    }

    var scanner_user_id = getScannerUserIdFromToken(token);

    var user_id = req.body.user_id;

    if (!user_id) {
      throw badRequest("No user ID provided.");
    }

    async.waterfall([
      function (next) {
          User.findById(user_id).exec(function (err, user) {
              if (err) {
                  next(badRequest("Invalid user ID provided."), user);
              } else {
                  next(null, user);
              }
          });
      },
      function (user, next) {
        ScannerResult.findOne({ scanner_user: scanner_user_id, user: user._id }).exec(
          function (err, scanner_result) {
            if (err) {
              next(null, null, user);
            } else {
              next(null, scanner_result, user);
            }
          });
      },
      function (scanner_result, user, next) {
        // TODO: add permission to be scanned

        if (!scanner_result) {
          scanner_result = new ScannerResult({
            scanner_user: scanner_user_id,
            user: user._id
          });
        }

        if (req.body.comment !== undefined) {
          if (req.body.comment === null || req.body.comment === "") {
            scanner_result.comment = undefined;
          } else {
            scanner_result.comment = req.body.comment;
          }
        }

        scanner_result.save(function (err) {
          next(err, scanner_result, user);
        });
      },
      function (scanner_result, user, next) {
        success(res, {
          ticket: {
            name: user.firstname + " " + user.surname,
            email: user.email,
            study_programme: user.studyProgramme || ""
          },
          comment: scanner_result.comment
        });
      }
    ],
    function (err) {
      if (err) {
        return next(err);
      }
    });
  });

  // 404 catcher
  router.use(function(req, res, next) {
    // throw error and forward to error handler
    var err = new Error('Invalid API route');
    err.status = 404;
    next(err);
  });

  router.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      "success": false,
      "error": err.message
    });
  });

  return router;
};