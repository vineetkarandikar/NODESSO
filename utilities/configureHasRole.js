var redis = require("./redis"),
    Log = require('log'),
    log = new Log('info'),
    async = require("async");


function _configureURLForRole(apiName, roleName, callback) {


    async.waterfall([

        function _checkLuaAddLoadCheck(cb) {

            log.info("...Lua for add load checking...\n");

            if (redis.addload == false) {

                redis.luaAddLoad(function (err, result) {

                    if (err) {

                        log.info("...Error occured..." + err + "\n");

                        callback(err);

                    }

                    else {

                        log.info("...Lua for add load completed...\n");

                        cb(null);

                    }

                });

            }

            else {

                log.info("...Lua for add load completed...\n");

                cb(null);

            }


        },


        function _loadRequestedApiInRole(cb) {

            redis.addContentBloomFilter(roleName, apiName, function (err, result) {

                if (err) {

                    log.info("...Error occured..." + err + "\n");

                    callback(err);

                }

                else if (result == true) {

                    log.info("...Loading success in role for requested api...\n");

                    cb(null, result);

                }

                else if (result == false) {

                    log.info("...Loading failed in role for requested api...\n");

                    cb(null, result);

                }

            });

        },

    ], function _configurationOfApiStatus(err, result, cb) {

        if (result) {

            log.info("...Configuration of api status success...\n");

            callback(null, "Success \n");

        }

        else {

            log.info("...Configuration of api status failed...\n");

            callback(null, "Failed \n");

        }

    });

}

exports.configureURLForRole = _configureURLForRole;
