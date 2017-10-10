// TODO: modify this code so that protypes are added only if they
// are not already there (ecmascript 5 browsers)

$.ajaxSetup({
	cache: false,
	timeout: 10000
});

var fe;
if (!fe) {
    fe = {};
}

fe.energy_event = {
    // render the event as an HTML div
    render_as_list_item: function (show_icon) {
        'use strict';
        var html = "",
            dateText,
            date;
        
        if (show_icon === undefined) {
            show_icon = true;
        }
        
        if (this) {
            //date = new Date(this.start.getTime() * 1000);
            date = new Date(this.start.getTime());
            dateText = date.toString();
            dateText = dateText.slice(0, dateText.lastIndexOf(":"));
            
            // render the event for the catalogue
            html = '<div class="event ' + this.id + '">';
            
            if (show_icon === true) {
            	//if (this.name !== 'always on' && this.name !== 'not annotated') {
                html += '<img src="' + server_url + this.event_type.alt_icon + '" width="32px" />';
	                //console.log('forceCatalogue === false');
            	//}
            }
            html += '<span class="name">' + this.name + '</span> ';
            html += '(<span class="consumption">' + this.net_consumption.toFixed(2) + ' kWh</span>)';
            if (!isNaN(this.duration)) {
                html += '<br/>';
                html += '<span class="duration">' + this.duration.toFixed(0) + '</span> minutes ';
                html += 'on <span class="datetime">' + dateText + '</span>';
            } else {
                if (show_icon === true) {
                    html += '<br/>';
                    html += '<span class="duration">&nbsp;</span>';
                    html += '<span class="datetime">&nbsp;</span>';
                }
            }
            html += '</div>';
            
            return html;
        }
        return;
    }
};

$(document).ajaxError(function (event, request, settings) {
    'use strict';
    console.log("ajax error!");
    console.log("event:", event);
    console.log("request:", request);
    console.log("settings:", settings);
});


if(!Array.prototype.last) {
    Array.prototype.last = function () {
        'use strict';
        return this[this.length - 1];
    };
}

/**
 * Extends the Array object to allow searching within the array.
 */
if(!Array.prototype.find) {
    Array.prototype.find = function (f) {
        'use strict';
        var i;
        for (i = 0; i < this.length; i += 1) {
            if (f(this[i]) === true) {
                return i;
            }
        }
        return -1;
    };
}
    
/**
 * Extends the Date object to allow date formats
 * @param specififed format
 */
Date.prototype.format = function (format) {
    'use strict';
    // Format="YYYY-MM-dd hh:mm:ss";
    var o, month_names, k;
    month_names = 'January February March April May June July August September October November December';
    month_names = month_names.split(' ');
    o = {
        "N+":  month_names[this.getMonth()], //month
        "M+":  this.getMonth() + 1, //month
        "d+":  this.getDate(), //day
        "h+":  this.getHours(), //hour
        "m+":  this.getMinutes(), //minute
        "s+":  this.getSeconds(), //second
        "q+":  Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S":  this.getMilliseconds() //millisecond
    };
    
    if (/(y+)/.test(format)) { 
        format = format.replace(RegExp.$1, (this.getFullYear() + String()).substr(4 - RegExp.$1.length));
    }
    for (k in o) {
        if (o.hasOwnProperty(k)){
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr((String() + o[k]).length));
            }
        }
    }
    return format;    
};
 
 
 /**
  * Removes whitespaces
  * @param string
  */
function removeSpaces(string) {
    'use strict';
    return string.split(' ').join('');
}
    


/**
 * jQuery mousehold plugin - fires an event while the mouse is clicked down.
 * Additionally, the function, when executed, is passed a single
 * argument representing the count of times the event has been fired during
 * this session of the mouse hold.
 *
 * @author Remy Sharp (leftlogic.com)
 * @date 2006-12-15
 * @example $("img").mousehold(200, function (i){  })
 * @desc Repeats firing the passed function while the mouse is clicked down
 *
 * @name mousehold
 * @type jQuery
 * @param Number timeout The frequency to repeat the event in milliseconds
 * @param Function fn A function to execute
 * @cat Plugin
 */

$.fn.mousehold = function (timeout, f) {
    'use strict';
    if (timeout && typeof timeout === 'function') {
        f = timeout;
        timeout = 100;
    }
    if (f && typeof f === 'function') {
        var timer = 0,
            fireStep = 0;
        return this.each(function () {
            $(this).mousedown(function () {
                fireStep = 1;
                var ctr = 0,
                    t = this;
                timer = window.setInterval(function () {
                    ctr += 1;
                    f.call(t, ctr);
                    fireStep = 2;
                }, timeout);
            });

            var clearMousehold = function () {
                window.clearInterval(timer);
                if (fireStep === 1) {
                    f.call(this, 1);
                }
                fireStep = 0;
            };
            
            $(this).mouseout(clearMousehold);
            $(this).mouseup(clearMousehold);
        });
    }
};
    

// end of utility functions
