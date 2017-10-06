var rotateTimer;
var ROTATE_TIME = 2*60*1000;
var PAUSED_TIME = 5*60*1000;
var rotate = function() {
	window.location.href = next_screen;
}

var resetTimer = function() {
	console.log("Reset");
    clearInterval(rotateTimer);
	var icon = $(".pause-rotate").find("i");
	if(icon.hasClass("fa-pause")) {
    	rotateTimer = setInterval(rotate, PAUSED_TIME);
	}
	else {
    	rotateTimer = setInterval(rotate, ROTATE_TIME);
	}
}

$("body,html").bind("scroll mousedown DOMMouseScroll mousewheel keyup touchmove touchstart touchend", function(e){
    resetTimer();
});  

$(".pause-rotate").click(function() {
	var icon = $(".pause-rotate").find("i");
	icon.toggleClass("fa-pause fa-play");
	resetTimer();
});

rotateTimer = setInterval(rotate, ROTATE_TIME);