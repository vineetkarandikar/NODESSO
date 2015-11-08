var http = require('http'),
    validation = require("./utilities/validateserviceticket"),
    express = require('express'),
    fs = require('fs'),
    log = require('winston'),
    config = require('./config/default.json'),
    randomnum = require('./utilities/token'),
    Log = require('log'),
    log = new Log('info'),
    redis = require('./utilities/redis');
//sslOptions = {
//    key: fs.readFileSync('C:/Users/Vineet.karandikar/Downloads/wt20283_privatekey.pem'),
//    cert: fs.readFileSync('C:/Users/Vineet.karandikar/Downloads/wt20283_cert.pem'),
//    requestCert: true,
//    rejectUnauthorized: false
//};
var app = express();


//function _start() {
//    var httpsServer = https.createServer(sslOptions, app);
//    httpsServer.listen(9443);
//    log.info('Server running at https://127.0.0.1:9443/');
//};


function _start() {
    var httpsServer = http.createServer(app);
    httpsServer.listen(9443);
    log.INFO('Server running at http://127.0.0.1:9443/');
};


app.post('/gettoken', function (req, res) {
    log.info('....generating service token....');
    var jsonString = '';
    req.on('data', function (data) {
        jsonString += data;
    });
    req.on('end', function () {
        console.log(JSON.parse(jsonString));
        var userName = JSON.parse(jsonString).userId;

        var password = JSON.parse(jsonString).password;

        if(redis.getkey(userName) == password)
        {
            var token = randomnum.generateToken();
            var roles = [];
            roles   = redis.getkey(userName+'_roles');
            redis.setkey(token,roles);
        }

        console.log(randomnum.generateToken());
    });
});

app.post('/validateserviceticket', function (req, res) {

    log.info('....validating service token....');
    var jsonString = '';
    req.on('data', function (data) {
        jsonString += data;
    });
    req.on('end', function () {
        log.info(JSON.parse(jsonString));
        var token = JSON.parse(jsonString).token;

        var requestedapi = JSON.parse(jsonString).requestedapi;

        validation.checkAuthenticationAndAuthorization(token, requestedapi, function (err, result) {

            if (err) {
                res.end(err);
            }
            else {
                res.end(""+result+"");
            }

        });

    });

});



app.get('/deleteUser', function (req, res) {

    log.info('Deleting User get');
    res.end(JSON.stringify(sslOptions));

});


exports.start = _start;
