var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Origin", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/*', function(req, res, next) {
	console.log('GET on /');
	res.send('Wassup fam');
});

app.post('/*', upload.array(), function(req, res, next) {
	console.log("Received %s on /", JSON.stringify(req.body));
	res.send(req.body);
});

var server = app.listen(8001, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log("Started at http://%s:%s", host, port);
});
