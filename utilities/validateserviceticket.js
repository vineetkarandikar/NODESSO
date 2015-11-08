var redis = require("./redis"),
    Log = require('log'),
    log = new Log('info'),
    async = require("async");
var tokenvar = null;

function _checkAuthenticationAndAuthorization(token, requestedapi, cb) {
    tokenvar = token;
    var found = false;
    async.waterfall([
        function _checkServiceTicket(callback) {
            redis.getkey(tokenvar, function (err, result) {

                    if (err) {
                        callback(err);
                    }
                    else if (result == null) {
                        var error = "Service Token Invalid \n";
                        callback(error);

                    }
                    else {
                        callback(null, true);
                    }

                }
            );

        },
        function _retrieveRolesForGivenToken(tokenValid, callback) {
            var Roles = [];
            redis.getList(tokenvar+"_Roles", 0, 20, function (err, result) {

                if (err) {
                    callback(err);
                }
                else {
                    result.forEach(function (item) {
                        Roles.push(item);

                    });
                    callback(null, Roles);
                }

            });

        },
        function _checkRequestedApiInListOfRoles(Roles, callback) {
            if (redis.checkload == false) {
                redis.luaCheckLoad(function (err, result) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        Roles.forEach(function (item) {
                            redis.checkContentInFilter(item, requestedapi, function (err, result) {
                                if (err) {
                                    callback(err);
                                }
                                else if (result) {
                                    found = result;
                                    callback(null, true);

                                }
                            });

                        });
                        if (!result) {
                            callback(null, false);
                        }

                    }
                });
            }

        }

    ], function _returnAuthorizationStatus(err, result, callback) {

        if (result) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    });
}
exports.checkAuthenticationAndAuthorization = _checkAuthenticationAndAuthorization;
