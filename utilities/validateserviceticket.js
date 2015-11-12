var redis = require("./redis"),
    Log = require('log'),
    log = new Log('info'),
    async = require("async");


function _checkAuthenticationAndAuthorization(userName, token, requestedapi, cb) {


    async.waterfall([

        function _checkServiceTicket(callback) {

            log.info("..Checking service token..\n");

            redis.getkey(userName + "_token", function (err, result) {

                    if (err) {

                        log.info("...Error occured..." + err + "\n");

                        cb(err);

                    }

                    else if (result != token) {

                        log.info("...Service token invalid...\n");

                        cb("Service token invalid");

                    }

                    else {

                        log.info("...Service token valid..\n");

                        callback(null, true);

                    }

                }
            );

        },
        function _retrieveRolesForGivenToken(tokenValid, callback) {

            log.info("..Retrieving roles for service token...\n");

            var Roles = [];


            redis.getList(userName + "_Roles", 0, 20, function (err, result) {

                if (err) {

                    log.info("...Error occured..." + err + "\n");

                    cb(err);

                }

                else {

                    result.forEach(function (item) {

                        Roles.push(item);

                    });

                    log.info("...Role list for given user created..\n");

                    callback(null, Roles);

                }

            });

        },
        function _loadLuaForCheck(Roles, callback) {

            if (redis.checkload == true) {

                log.info("...Lua for check is already loaded...\n");

                callback(null, Roles);

            }

            else {

                redis.luaCheckLoad(function (err, result) {

                    if (err) {

                        log.info("...Error occured..." + err + "\n");

                        cb(err);

                    }

                    else {

                        log.info("...Lua for check is loaded...\n");

                        callback(null, Roles);

                    }

                });

            }

        },

        function _checkRequestedApiInListOfRoles(Roles, callback) {

            Roles.forEach(function (item, rolecount) {

                redis.checkContentInFilter(item, requestedapi, function (err, result) {

                    if (err) {

                        log.info("...Error occured..." + err + "\n");

                        cb(err);

                    }

                    else if (result == true) {

                        log.info("...Api not found in role...\n");

                        callback(null, result);

                    }

                    else if (rolecount == Roles.length - 1 && result == false) {

                        log.info("...Api not found in role list..\n");

                        callback(null, false);

                    }

                });

            });


        },

    ], function _returnAuthorizationStatus(err, result, callback) {

        if (result) {

            log.info("...Authorization successfull..\n");

            cb(null, "Authorization successfull");

        }

        else {

            log.info("...Authorization unsuccessfull..\n");

            cb(null, "Authorization unsuccessfull");

        }

    });

}

exports.checkAuthenticationAndAuthorization = _checkAuthenticationAndAuthorization;
