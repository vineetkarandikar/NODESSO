var http = require('http'),

    validation = require("./utilities/validateserviceticket"),

    express = require('express'),

    log = require('winston'),

    Log = require('log'),

    log = new Log('info'),

    token = require('./utilities/generateToken'),

    apiConfigBasedOnRole = require('./utilities/configureHasRole');

var app = express();

function _start() {

    var httpsServer = http.createServer(app);

    httpsServer.listen(9443);

    log.info('Server running at http://127.0.0.1:9443/');

};


app.post('/v1/gettoken', function (req, res) {

    log.info('....generating service token....');

    var jsonString = '';

    req.on('data', function (data) {

        jsonString += data;

    });

    req.on('end', function () {

        console.log(JSON.parse(jsonString));

        var userName = JSON.parse(jsonString).userId;

        var password = JSON.parse(jsonString).password;

        token.generateToken(userName, password, function (err, result) {

            if (err) {

                log.info("...Error occured..." + err + "\n");

                res.end(err);

            }

            else {

                log.info("...Processing of token generation successfully completed ...\n");

                res.end(result);

            }
        });

    });

});

app.post('/v1/validateserviceticket', function (req, res) {

    log.info('....validating service token....');

    var jsonString = '';

    req.on('data', function (data) {

        jsonString += data;

    });

    req.on('end', function () {

        log.info(JSON.parse(jsonString));

        var token = JSON.parse(jsonString).token;

        var userName = JSON.parse(jsonString).userId;

        var requestedapi = JSON.parse(jsonString).requestedapi;

        validation.checkAuthenticationAndAuthorization(userName, token, requestedapi, function (err, result) {

            if (err) {

                log.info("...Error occured..." + err + "\n");

                res.status(404)
                    .send(err);

            }

            else {

                log.info("...Processing of Authenication and authorization successfully completed ...\n");

                res.status(200)
                    .send(result);

            }

        });

    });


});


app.post('/v1/addurlinrole', function (req, res) {

    log.info('....adding api for permitted role ....\n');

    var jsonString = '';

    req.on('data', function (data) {

        jsonString += data;

    });

    req.on('end', function () {

        log.info(JSON.parse(jsonString));

        var roleName = JSON.parse(jsonString).role;

        var apiName = JSON.parse(jsonString).api;

        apiConfigBasedOnRole.configureURLForRole(apiName, roleName, function (err, result) {

            if (err) {

                log.info("...Error occured..." + error + "\n");

                res.status(404)
                    .send(err);

            }

            else {

                log.info("...Configuration for api based on role completed +\n");

                res.status(200)
                    .send(result);

            }

        });

    });


});


exports.start = _start;

//sslOptions = {
//    key: fs.readFileSync('C:/Users/Vineet.karandikar/Downloads/wt20283_privatekey.pem'),
//    cert: fs.readFileSync('C:/Users/Vineet.karandikar/Downloads/wt20283_cert.pem'),
//    requestCert: true,
//    rejectUnauthorized: false
//};


//function _start() {
//    var httpsServer = https.createServer(sslOptions, app);
//    httpsServer.listen(9443);
//    log.info('Server running at https://127.0.0.1:9443/');
//};

