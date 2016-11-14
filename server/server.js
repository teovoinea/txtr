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

app.post('/upload_csv', function (req, res, next) {
    console.log("Received %s on /", JSON.stringify(req.body));
    //console.log(JSON.stringify(req.body.csv));
    var csvContents = [];
    var csvBuf = Buffer.from(JSON.stringify(req.body.csv), 'base64');
    var userInputBuf = Buffer.from(JSON.stringify(req.body.userInput), 'base64');
    var csv = csvBuf.toString();
    userInput = userInputBuf.toString();
    //console.log(csv);
    console.log("asdfasdfasdfasdfasdfasdf"+userInput);
    var inputIsValid = false;
    var headers = getHeaders(csv);
    inputIsValid = checkHeaders(headers, userInput);
    res.send(inputIsValid);
    if(inputIsValid)
    {
        csvContents = convertToArray(csv);
        prepareSMS(headers, csvContents, userInput);
    }
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

function convertToArray(csv)
{
    var index = 0;
    var prevIndex = 0;
    var csvRow;
    var csvContents = [];
    while (csv.indexOf("\r\n", index) != -1) {
        prevIndex = index;
        index = csv.indexOf("\r\n", index);
        //console.log(csv.indexOf("\r\n", index) + "index = " + index);
        csvRow = csv.substring(prevIndex, index);
        csvContents.push(csvRow.split(","));
        index+=2;
    }
    //console.log(csvContents);
    return csvContents;
}

function getHeaders(csv, userInput) {
    var endIndex = csv.indexOf("\r\n");
    var headerString = csv.substring(0, endIndex);
    var headerArray = headerString.split(",");
    console.log(headerArray);
    return headerArray;
}

function prepareSMS(headers, csvContents, userInput) {
    var smsContents = [];
    var outputRow;
    var csvRow;
    for (i = 1; i < csvContents.length; i++) {
        outputRow = userInput;
        csvRow = csvContents[i];
        for (j = 0; j < csvRow.length; j++) {
            var tempString = "{{" + headers[j] + "}}";
            outputRow = outputRow.replace(tempString, csvRow[j]);
        }
        smsContents.push(outputRow);
    }
    console.log(smsContents);
    return smsContents;
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
        //console.log("index[" + i + "] = " + tempString);
        if (!userInput.includes(tempString)) {
            allClear = false;
        }
    }
    console.log(allClear);
    return allClear;
}

function makeApiCall() {

}
