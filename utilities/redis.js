var redis = require('redis'),
    config = require('../config/default.json'),
    Log = require('log'),
    log = new Log('info'),
    fs = require('fs'),
    addsource = fs.readFileSync('/home/vineet/softwares/redis-lua-scaling-bloom-filter-master/add.lua', 'ascii'),
    checksource = fs.readFileSync('/home/vineet/softwares/redis-lua-scaling-bloom-filter-master/check.lua', 'ascii'),
    client = redis.createClient(config.redis.port, config.redis.host, ''),
    _addload = false,
    _checkload = false,
    checksha,
    addsha;

client.on('connect', function () {

    log.info('....Redis Server Connected....\n');

});

function _redisDisconnect() {

    client.end();

    log.info('....Redis Server Disconnected....\n')

}

function _setExpireKeyTime(key, seconds, callback) {

    client.expire(key, seconds, function (err, reply) {

        if (err) {

            log.info('....Redis Server Disconnected....\n')

            callback(err);

        }

        else {

            log.info("...set key value expiry time in redis...\n");

            callback(null, reply);

        }

    });

}


function _setKeyValue(key, value, callback) {

    client.set(key, value, function (err, reply) {

        if (err) {

            log.info("...info occured..." + err + "\n");

            callback(err);

        }

        else {

            log.info("...set key value in redis...\n");


            callback(null, reply);

        }

    });

}


function _getValueForKey(key, callback) {

    client.get(key, function (err, reply) {

        if (err) {

            log.info("...info occured..." + err + "\n");

            callback(err);

        }

        else {

            log.info("...Get value for a key from redis...\n");

            callback(null, reply);

        }

    });

}

function _getList(key, startPoint, endPoint, callback) {

    client.lrange(key, startPoint, endPoint, function (err, reply) {

        if (err) {

            log.info('....Redis Server Disconnected....\n')

            callback(err);

        }

        else {

            log.info("...Get list from redis...\n");

            callback(null, reply);

        }

    });

}


function _luaAddLoad(callback) {

    client.send_command('script', ['load', addsource], function (err, sha) {

        if (err) {


            log.info("...info occured..." + err + "\n");

            callback(err);

        }

        else {

            _addload = sha;

            addsha = sha;

            log.info("...Add lua script loaded in redis...\n");

            callback(null, sha);

        }

    });

}

function _luaCheckLoad(callback) {

    client.send_command('script', ['load', checksource], function (err, sha) {

        if (err) {

            log.info("...info occured..." + err + "\n");

            callback(err);

        }

        else {

            _checkload = sha;

            checksha = sha;

            log.info("...Check lua script loaded in redis...\n");

            callback(null, sha);

        }

    });
}

function _checkContentInFilter(filterName, content, callback) {

    client.evalsha(checksha, 0, filterName, 1000, .01, content, function (err, found) {

        if (err) {

            log.info("...info occured..." + err + "\n");

            callback(err);

        }

        if (!found) {

            log.info(content + ' was not found!');

            callback(null, false);

        }

        else {

            log.info(content + ' was found!');

            callback(null, true);

        }

    });
}


function _addContentBloomFilter(filterName, content, callback) {

    client.evalsha(addsha, 0, filterName, 1000, .01, content, function (err) {

        if (err) {

            log.info("...info occured..." + err + "\n");

            callback(err);

        }

        else {

            log.info("...add content in bloom filter...\n");

            callback(null, true);

        }


    });
}


exports.closeredis = _redisDisconnect;
exports.setkey = _setKeyValue;
exports.expirekey = _setExpireKeyTime;
exports.getkey = _getValueForKey;
exports.getList = _getList;
exports.luaAddLoad = _luaAddLoad;
exports.luaCheckLoad = _luaCheckLoad;
exports.luaAddLoad = _luaAddLoad;
exports.addContentBloomFilter = _addContentBloomFilter;
exports.addload = _addload;
exports.checkload = _checkload;
exports.checkContentInFilter = _checkContentInFilter;
