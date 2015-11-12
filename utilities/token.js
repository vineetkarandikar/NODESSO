var randomstring = require("randomstring"),
    redis = require('./../utilities/redis'),
    Log = require('log'),
    log = new Log('info');

function random (low, high) {

    log.info("Random number generation started..\n");

    return Math.floor((Math.random() * (high - low) + low)+Date.now() / 1000);



}

function _generateRandomString() {

    log.info("Random string generation started..\n");

    return random(1000000,100000000000)+randomstring.generate(7);

};




exports.generateToken = _generateRandomString;
