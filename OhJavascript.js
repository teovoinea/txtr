var availableTags= ["name", "price", "appointment-time", "dank"];
var serverUrl = 'http://localhost:8001/'
$(document).ready(function(){ 
    $("#raw").focusin(function(){
        document.getElementById("raw").style.opacity = 100;
    });        
    $("#raw").focusout(function(){
        $("#converted").html(prettifyPLZ($("#raw").text()));
        document.getElementById("raw").style.opacity = 0;
    });
    $("#files").bind('change', handleFileSelect);

    var obj = $(".box");
    var counter = 0;
    obj.on('dragenter', function (e) 
    {
        console.log("dragenter");
        e.stopPropagation();
        e.preventDefault();
        counter++;
        $(this).switchClass('box','box_is_dragover');
    });
    obj.on('dragover', function (e) 
    {
        e.stopPropagation();
        e.preventDefault();
    });
    obj.on('dragleave', function(e)
    {
        console.log("dragleave");
        e.preventDefault();
        counter--
        if (counter == 0)
        {
            $(this).switchClass('box_is_dragover', 'box');
        }      
    });
    obj.on('drop', function (e) 
    {
 
        $(this).switchClass('box_is_dragover','box');
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
 
        //We need to send dropped files to Server
        handleFileUpload(files,obj);
    });
    $(document).on('dragenter', function (e) 
    {
        e.stopPropagation();
        e.preventDefault();
    });
    $(document).on('dragover', function (e) 
    {
        e.stopPropagation();
        e.preventDefault();
    });
    $(document).on('drop', function (e) 
    {
        e.stopPropagation();
        e.preventDefault();
    });
 
});

function prettifyPLZ(someDopeText) {
    var daUltimateRegex = /{{[a-zA-Z0-9.-]{1,30}}}/g;
    var arrayOfSweetMatches;
    while(arrayOfSweetMatches = daUltimateRegex.exec(someDopeText)){
        someDopeText = someDopeText.replace(arrayOfSweetMatches[0], "<span class=\""+gimmeThatColorPLZ(arrayOfSweetMatches[0].slice(2,-2))+"\"><span class=\"invisible\">{{</span>"+ arrayOfSweetMatches[0].slice(2,-2) +"<span class=\"invisible\">}}</span></span>");
    }
    return someDopeText;
}
            
function gimmeThatColorPLZ(tagToTryTY){
    if (availableTags.indexOf(tagToTryTY)!=-1){
        return "bubble";
    } else {
        return "bubblyRedBubble";
    }
}

function handleFileSelect(evt) {
    var csv = evt.target.files;
    var csv = csv[0];
    getCSV(csv);
    getText();
}

function getText() {
    var input = $(".textarea#converted").text();
    return input;
    console.log("input:"+input);
}

function testServer() {
	exampleGetRequest();
	examplePostRequest();
	//console.log('we clicked fam');
}

function getCSV(file){
    var reader = new FileReader();
    var data;
    reader.readAsText(file);
    reader.onload = function (event) {
        var csv = event.target.result;
        data = $.csv.toArrays(csv);
        //console.log(data);
        parseInput(data);
    }
}

function parseInput(data) {
    var headers = [];
    var userInput = getText();
    $.each(data, function (index, value) {
        if(index==0){
            if(!checkHeaders(value, userInput))
            {
                alert("User input does not match csv headers");
                return false;
            }
            headers = value;
        }
        if (index > 0) {
            console.log(value);
            replacePlaceHolders(headers, value, userInput);
            //makeApiCall(replacePlaceHolders(headers,data,userInput));
        }
    });
}
/*
function getHeaderIndex(headers, userInput) {
    var index = [];
    $.each(headers, function (index, value) {
        index.push(indexOf(value));
    });
}*/

function makeApiCall(){

}

function exampleGetRequest(){
	$.ajax({
		'method' : 'GET',
		'url' : serverUrl + 'user_info',
		'header' : 'application/json'
	}).then(function successCallback(res){
		console.log('Successfully received' + res + 'from the server')
	}, function errorCallback(res) {
		console.log('Error: ' + res)
	});
}

function examplePostRequest(){
	var testObject = {
		'name' : 'This is some arbitrary JSON object',
		'info' : 'Can contain anything'
	};
	console.log('Sending: ' + testObject + ' to the server')
	$.ajax({
		'method' : 'POST',
		'url' : serverUrl + 'upload_csv',
		'header' : 'application/json',
		'data' : testObject
	}).then(function successCallback(res){
		console.log('Successfully received' + res.name + 'from the server')	
	}, function errorCallback(res) {
		console.log('Error: ' + res.data)
	});
}

function replacePlaceHolders(header, csvRow, userInput) {
    outputRow = userInput;
    $.each(csvRow, function(index,value){
        var tempString = "{{" + header[index] + "}}";
        outputRow = outputRow.replace(tempString, value);
    });
    console.log(outputRow);
}

function checkHeaders(csvRow,userInput) {
    var allClear = true;
    var splitLeft = userInput.split("{{").length-1;
    var splitRight = userInput.split("}}").length-1;
    if (splitLeft != csvRow.length ||splitRight  != csvRow.length) {
        allClear = false;
    }
    $.each(csvRow,function(index,value){
        var tempString = "{{"+value+"}}";
        if(!userInput.includes(tempString)){
            allClear = false;
        }
    });
    return allClear;
}

var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

var $form = $('.box');

if (isAdvancedUpload) {
    $form.addClass('has-advanced-upload');
}
