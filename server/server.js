var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var csv;

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

app.post('/upload_csv', function (req, res, next) {
    console.log("Received %s on /", JSON.stringify(req.body));
    //console.log(JSON.stringify(req.body.csv));
    
    var csvBuf = Buffer.from(JSON.stringify(req.body.csv), 'base64');
    var userInputBuf = Buffer.from(JSON.stringify(req.body.userInput), 'base64');
    csv = csvBuf.toString();
    userInput = userInputBuf.toString();
    console.log(csv);
    console.log(userInput);
    res.send(checkHeaders(getHeaders(csv, userInput), userInput));
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

function getHeaders(csv, userInput) {
    var endIndex = csv.indexOf("\r\n");
    var headerString = csv.substring(0, endIndex);
    var headerArray = headerString.split(",");
    console.log(headerArray);
    return headerArray;
}

function parseInput(data) {
    var headers = [];
    var userInput = getText();
    $.each(data, function (index, value) {
        if (index == 0) {
            if (!checkHeaders(value, userInput)) {
                console.log("User input does not match csv headers");
                return false;
            }
            headers = value;
        }
        if (index > 0) {
            console.log(value);
            //replacePlaceHolders(headers, value, userInput);
            //makeApiCall(replacePlaceHolders(headers,data,userInput));
        }
    });
}

function replacePlaceHolders(header, csvRow, userInput) {
    outputRow = userInput;
    $.each(csvRow, function (index, value) {
        var tempString = "{{" + header[index] + "}}";
        outputRow = outputRow.replace(tempString, value);
    });
    console.log(outputRow);
}

function checkHeaders(csvRow, userInput) {
    var allClear = true;
    var splitLeft = userInput.split("{{").length - 1;
    var splitRight = userInput.split("}}").length - 1;
    if (splitLeft != csvRow.length || splitRight != csvRow.length) {
        allClear = false;
    }
    for(i=0;i<csvRow.length;i++) {
        var tempString = "{{" + csvRow[i] + "}}";
        console.log("index[" + i + "] = " + tempString);
        if (!userInput.includes(tempString)) {
            allClear = false;
        }
    }
    console.log(allClear);
    return allClear;
}

function makeApiCall() {

}
