TIMEOUT_TIME = 2*60*1000; // 5 minutes
var timeoutTimer;

var timeout = function() {
	// TODO: This URL should come from template.
	window.location.href = '/accounts/logout/';
}

$("body,html").bind("scroll mousedown DOMMouseScroll mousewheel keyup", function(e){
    clearInterval(timeoutTimer);
    timeoutTimer = setInterval(timeout, TIMEOUT_TIME);
});  

timeoutTimer = setInterval(timeout, TIMEOUT_TIME);