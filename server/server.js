var twilio_sid;
var twilio_authToken;
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var twilio = require('twilio');
var smsContents = [];
var to = [];
var from = [];

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Origin", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/sendText', function (req, res, next) {
    var response = "SMS sent successfully";
    twilio_sid = JSON.parse(JSON.stringify(req.body.SID));
    twilio_authToken = JSON.parse(JSON.stringify(req.body.authToken));
    var client = new twilio.RestClient(twilio_sid, twilio_authToken);
    console.log('sending text....');
    for (i = 0; i < smsContents.length; i++) {
        try{
            makeApiCall(client, "+"+from[i], "+"+to[i], smsContents[i]);
        }catch(e){
            response = "SMS failed to be sent";
        }
    }
    res.send(response);
});

app.post('/upload_csv', function (req, res, next) {
    console.log("Received %s on /", JSON.stringify(req.body));
    clearArrays();
    var csvContents = [];
    var csvBuf = Buffer.from(JSON.stringify(req.body.csv), 'base64');
    var userInputBuf = Buffer.from(JSON.stringify(req.body.userInput), 'base64');
    var csv = csvBuf.toString();
    userInput = userInputBuf.toString();
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

function clearArrays() {
    smsContents = [];
    to = [];
    from = [];
}

function convertToArray(csv)
{
    var index = 0;
    var prevIndex = 0;
    var csvRow;
    var csvContents = [];
    while (csv.indexOf("\r\n", index) != -1) {
        prevIndex = index;
        index = csv.indexOf("\r\n", index);
        csvRow = csv.substring(prevIndex, index);
        csvContents.push(csvRow.split(","));
        index+=2;
    }
    return csvContents;
}

function getHeaders(csv, userInput) {
    var endIndex = csv.indexOf("\r\n");
    var headerString = csv.substring(0, endIndex);
    var headerArray = headerString.split(",");
    return headerArray;
}

function prepareSMS(headers, csvContents, userInput) {
    var outputRow;
    var csvRow;
    for (i = 1; i < csvContents.length; i++) {
        outputRow = userInput;
        csvRow = csvContents[i];
        for (j = 0; j < csvRow.length; j++) {
            if (headers[j] == "from"){
                from.push(csvRow[j]);
            }
            else if (headers[j] == "to") {
                to.push(csvRow[1]);
            }
            else {
                var tempString = "{{" + headers[j] + "}}";
                outputRow = outputRow.replace(tempString, csvRow[j]);
            }
        }
        smsContents.push(outputRow);
    }
}

//make this return true
function checkHeaders(csvRow, userInput) {
    var allClear = true;
    var hasFrom = false;
    var hasTo = false;
    var splitLeft = userInput.split("{{").length - 1;
    var splitRight = userInput.split("}}").length - 1;
    if (splitLeft != csvRow.length - 2 || splitRight != csvRow.length - 2) {
        allClear = false;
    }
    
    for (i = 0; i < csvRow.length; i++) {
        if (csvRow[i].toLowerCase() == "from") {
            hasFrom = true;
        }
        else if(csvRow[i].toLowerCase() == "to"){
            hasTo = true;
        }
        else{
            var tempString = "{{" + csvRow[i].toLowerCase() + "}}";
            if (!userInput.toLowerCase().includes(tempString)) {
                allClear = false;
            }
        }
    }
    console.log("hasFrom = " + hasFrom + "\n");
    console.log("hasTo = " + hasTo + "\n");
    console.log("allClear = " + allClear + "\n");
    return allClear&&hasFrom&&hasTo;
}

function makeApiCall(client, from_number, to_number, message) {

	client.messages.create({
		body: message,
		to: to_number,// Text this number
		from: from_number,// From a valid Twilio number
	}, function(err, message) {
		if(err) {
			console.error(err);
		}
	});
}
