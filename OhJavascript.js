var availableTags= ["name", "price", "appointment-time", "dank"];
$(document).ready(function(){ 
    $("#raw").focusin(function(){
        document.getElementById("raw").style.opacity = 100;
    });        
    $("#raw").focusout(function(){
        $("#converted").html(prettifyPLZ($("#raw").text()));
        document.getElementById("raw").style.opacity = 0;
    });
    $("#files").bind('change', handleFileSelect);
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
    console.log("input:"+input);
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
    $.each(data, function (index, value) {
        if (index > 0) {
           console.log(value);
        }
    });
}

function replacePlaceholders(csvInput, userInput) {

}