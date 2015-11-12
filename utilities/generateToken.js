var redis = require("./redis"),
    Log = require('log'),
    log = new Log('info'),
    async = require("async"),
    token = require('./token'),
    config = require('../config/default.json');


function _checkAuthenticationAndThenGenerateToken(userName, password, cb) {

    var tokenvar = "";

    async.waterfall([

            function _authenticate(callback) {

                log.info('....Authentication process started....\n');

                redis.getkey(userName, function (err, result) {


                        if (err) {

                            log.info("...Error occured..." + err + "\n");

                            callback(err);

                        }

                        else if (result == null) {

                            log.info("...User Name is not present...\n");

                            callback("User Name is not present");

                        }

                        else {

                            if (result == password) {

                                log.info("...Authentication successfull...\n");

                                callback(null);

                            }

                            else {

                                log.info("...Username password not a valid combination...\n");

                                callback("Username password not a valid combination");

                            }

                        }

                    }
                );

            },
            function _generateAndSaveToken(callback) {

                log.info("...Token generation started...\n");

                tokenvar = userName + token.generateToken();

                redis.setkey(userName + "_token", tokenvar, function (err, cb1) {

                    if (err) {

                        log.info("...Error occured..." + err + "\n");

                        cb1(err);

                    }

                    else {

                        redis.expirekey(userName + "_token", config.tokenExpiry, function (err, cb2) {

                            if (err) {

                                log.info("...Error occured..." + err + "\n");

                                cb2(err);

                            }

                            else {

                                log.info("...Token created successfully with expiry of ...+ "+config.tokenExpiry+" \n");

                                callback(null, tokenvar);

                            }

                        });

                    }

                });

            }

        ],

        function _tokenGenerationSuccessfull(err, result, callback) {

            if (result) {

                log.info("...Error occured..." + err + "\n");

                cb(null, result);

            }

            else {

                log.info("...Error occured..." + err + "\n");

                cb(err);

            }

        });
}

exports.generateToken = _checkAuthenticationAndThenGenerateToken;

