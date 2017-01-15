var express = require('express');
var app = express();
var path = require('path');

// Add custom elevationDiff function
var elevation = require('./elevation');
//elevation.elevationDiff([]);

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/elevation', function(request, response) {
    var args = request.body;
    console.log(args);
    elevation.elevationDiff(args, function(val) {

        response.send(val);
    });
});

app.use( express.static( __dirname + '/' ));

port = 8080;
var io = app.listen(port);
// io.clients[0].send();
console.log("Listening on port: " + port);
