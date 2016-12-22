var availableTags = ["name", "price", "appointment-time", "sweet"];
var serverUrl = 'http://ec2-35-166-174-199.us-west-2.compute.amazonaws.com:8001/'
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
    return input;
}

function postInputCsv(data, text) {
    var url = serverUrl + 'upload_csv';
    $.ajax({
        'method': 'POST',
        'url': url,
        'header': 'application/json',
        'data': { csv: data, userInput: text }
    }).then(function successCallback(res) {
        if (res == true) {
            $('.' + lastBox).removeClass().addClass('box_valid');
            lastBox = "box_valid";
            $("#sendButton").prop("disabled", false);
        }
        else {
            $('.' + lastBox).removeClass().addClass('box_invalid');
            $("#sendButton").prop("disabled", true)
            lastBox = "box_invalid";
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
