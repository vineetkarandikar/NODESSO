var randomstring = require("randomstring"),
    redis = require('./../utilities/redis');

function random (low, high) {
    return Math.floor((Math.random() * (high - low) + low)+Date.now() / 1000);
}

function _generateRandomString() {
    return random(1000000,100000000000)+randomstring.generate(7);

};


function _createToken(userId,password,callback)
{
    callback(userId);
}

exports.generateToken = _generateRandomString;
