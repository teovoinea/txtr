var availableTags = ["name", "price", "appointment-time", "dank"];
var serverUrl = 'http://localhost:8001/'
var lastBox = "box";
$(document).ready(function () {
    $("#raw").focusin(function () {
        document.getElementById("raw").style.opacity = 100;
    });
    $("#raw").focusout(function () {
        $("#converted").html(prettifyPLZ($("#raw").text()));
        document.getElementById("raw").style.opacity = 0;
    });
    $("#input_file").bind('change', handleFileUpload);

    var obj = $("."+lastBox);
    var counter = 0;
    obj.on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
        counter++;
        $(this).removeClass().addClass('box_is_dragover');
    });
    obj.on('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    obj.on('dragleave', function (e) {
        e.preventDefault();
        counter--;
        if (counter == 0) {
            $(this).removeClass().addClass(lastBox);
            console.log("dragleave")
        }
    });
    obj.on('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).removeClass().addClass('box');
        storeCSV(e.originalEvent.dataTransfer.files);
    });
    $(document).on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    $(document).on('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    $(document).on('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });

});

function handleFileUpload(e) {
    storeCSV(e.target.files);
}

function storeCSV(files)
{
    var file = files[0];
    var reader = new FileReader();
    sessionStorage.clear();
    reader.readAsText(file);
    reader.onload = function (event) {
        var csv = event.target.result;
        sessionStorage.setItem("csv", csv);
        console.log(sessionStorage.getItem("csv"));
        validateCSV();
    }
}

function prettifyPLZ(someDopeText) {
    var daUltimateRegex = /{{[a-zA-Z0-9.-]{1,30}}}/g;
    var arrayOfSweetMatches;
    while (arrayOfSweetMatches = daUltimateRegex.exec(someDopeText)) {
        someDopeText = someDopeText.replace(arrayOfSweetMatches[0], "<span class=\"" + gimmeThatColorPLZ(arrayOfSweetMatches[0].slice(2, -2)) + "\"><span class=\"invisible\">{{</span>" + arrayOfSweetMatches[0].slice(2, -2) + "<span class=\"invisible\">}}</span></span>");
    }
    return someDopeText;
}

function gimmeThatColorPLZ(tagToTryTY) {
    if (availableTags.indexOf(tagToTryTY) != -1) {
        return "bubble";
    } else {
        return "bubblyRedBubble";
    }
}

function validateCSV() {
    try{
        var input_Csv = window.btoa(sessionStorage.getItem("csv"));
        var input_Text = window.btoa(getText());
        postInputCsv(input_Csv, input_Text);
    } catch (e) {
        $('.' + lastBox).removeClass().addClass('box_invalid');
        $("#sendButton").prop("disabled", true)
        lastBox = "box_invalid";
    }

}

function getText() {
    var input = $(".textarea#converted").text();
    console.log("input:" + input);
    return input;
}

function testServer() {
    exampleGetRequest();
    examplePostRequest();
    //console.log('we clicked fam');
}

function postInputCsv(data, text) {
    console.log('Sending: ' + data + ' to the server')
    var url = serverUrl + 'upload_csv';
    console.log(url);
    $.ajax({
        'method': 'POST',
        'url': url,
        'header': 'application/json',
        'data': { csv: data, userInput: text }
    }).then(function successCallback(res) {
        console.log('Successfully received' + res + 'from the server')
        if (res == true) {
            $('.' + lastBox).removeClass().addClass('box_valid');
            lastBox = "box_valid";
            $("#sendButton").prop("disabled", false);
        }
        else {
            $('.' + lastBox).removeClass().addClass('box_invalid');
            $("#sendButton").prop("disabled", true)
            lastBox = "box_invalid";
            console.log("false");
            //$('.box').css('background-color', 'red');
        }
    }, function errorCallback(res) {
        console.log('Error: ' + res.data)
    });
}

function sendSMS() {
    var sid = $('#SID').val();
    var authToken = $('#authToken').val();
    $.ajax({
        'method': 'POST',
        'url': serverUrl + 'sendText',
        'header': 'application/json',
        'data': { SID: sid, authToken: authToken }
    });
}

function exampleGetRequest() {
    $.ajax({
        'method': 'GET',
        'url': serverUrl + 'user_info',
        'header': 'application/json'
    }).then(function successCallback(res) {
        console.log('Successfully received' + res + 'from the server')
    }, function errorCallback(res) {
        console.log('Error: ' + res)
    });
}

function examplePostRequest() {
    var testObject = {
        'name': 'This is some arbitrary JSON object',
        'info': 'Can contain anything'
    };
    console.log('Sending: ' + testObject + ' to the server')
    $.ajax({
        'method': 'POST',
        'url': serverUrl + 'upload_csv',
        'header': 'application/json',
        'data': testObject
    }).then(function successCallback(res) {
        console.log('Successfully received' + res.name + 'from the server')
    }, function errorCallback(res) {
        console.log('Error: ' + res.data)
    });
}

var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

var $form = $('.box');

if (isAdvancedUpload) {
    $form.addClass('has-advanced-upload');
}
