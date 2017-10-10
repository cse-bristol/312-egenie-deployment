/**
 * Created by jacob on 18/08/15.
 */
var wipeSpeed      = 400;
var filterDateMode = 'all';
var filterSelectedDate = null;
var debugMode = true;
var init = false;
var filtered_channels = [];
var selected_axis_l;
var selected_axis_r;

$( document ).ready(function() {
    FastClick.attach(document.body);

    var chart = $(".chart").logger({
        'datepicker': false,
        'antievents': true,
        'draw_controls': false,
    });

    // fe.logger.plot.load_data(rebuild_view);

    filterSelectedDate = moment($("#date_to_server").val()).toDate();
    filterSelectedDate.setHours(0,0,0,0);
    console.log(filterSelectedDate);
    filterDateMode = 'day';

    update_filters(rebuild_view);

    // Prevent undesirable scrolling
    touch_scrolling();

    // Click events
    $('.filter-menu-prev').click(filter_time_prev);
    $('.filter-menu-next').click(filter_time_next);
    $(".filter-menu-now").click(function() { 
        filterSelectedDate = new Date();
        filterDateMode = 'day';
        filter_update_display_text();
    })

    $('#makeNote').bind('touchstart click', addAnnotation);
    $("#makeNote").prop("disabled",true);

    $(".chart").bind("logger:click", function(event, params) {
        if(params.button == 'clear_selection') {
            $("#makeNote").prop("disabled",true);
        }
        else if(params.button == 'create_selection') {
            $("#makeNote").prop("disabled",false);
        }
    });

    $(".notejump").click(function() {
        var annotation = current_annotations[current_annotation_pos];
        var start = new Date(annotation.start);
        start.setHours(0,0,0,0);
        filterSelectedDate = start;
        filterDateMode = 'day';
        filter_update_display_text(function() {
            render_annotation(annotation);
        });
    });

    $(".annotation-prev").click(function() {
        current_annotation_pos--;
        if(current_annotation_pos < 0) {
            current_annotation_pos = current_annotations.length-1;
        }
        render_annotation(current_annotations[current_annotation_pos]);
    });

    $(".annotation-next").click(function() {
        current_annotation_pos++;
        if(current_annotation_pos > current_annotations.length-1) {
            current_annotation_pos = 0;
        }
        render_annotation(current_annotations[current_annotation_pos]);
    });

    $('.swatch').click(stream_item_clicked);
});


var current_annotations = [];
var current_annotation_pos = 0;
var current_annotation_id = -1;

var render_annotation = function(annotation) {
    var start = moment(annotation.start).format('ddd Do MMM HH:mm');
    var end = moment(annotation.end).format('HH:mm');
    $(".annotation-section .date").text(start+'-'+end);
    $(".annotation-section .annotation").text(annotation.text);
    $(".annotation-section .author").text(annotation.author);
    $(".annotation-section .row").removeClass("hidden");
    var current_start = moment(filterSelectedDate);
    var current_end = moment(filterSelectedDate).add(1,'d');
    var start_m = moment(annotation.start);
    var end_m = moment(annotation.end);
    current_annotation_id = annotation.id;

    if(current_start.isBefore(start_m) && current_end.isAfter(end_m)) {
        fe.logger.plot.set_selected_annotation(annotation);
    }
    else {
        fe.logger.plot.set_selected_annotation(null);
    }
};

var annotations_bar_build = function(annotations) {

    $(".subbar").removeClass("hidden");
    annotations.sort(function(a,b) {
        var am = moment(a.created).valueOf();
        var bm = moment(b.created).valueOf();

        if(am < bm) return 1;
        if(am > bm) return -1;
        return 0;
    });

    if(current_annotation_id != -1) {
        $.each(annotations, function(i, annotation) {
            if(current_annotation_id == annotation.id) {
                current_annotation_pos = i;
            }
        });
    }
    else
    {
        current_annotation_pos = 0;
    }

    current_annotations = annotations;

    if(current_annotations.length > 0) {
        render_annotation(current_annotations[current_annotation_pos]);
    }
};

var rebuild_view = function(data) {
    if(!init) {
        if(data.sensors && data.sensors.length > 0) {
            var found = false;
            filtered_channels = [];
            // Find the first valid channel
            $.each(data.sensors,function(i,sensor) {
                if(sensor.channels.length > 0 && !found) {
                    found = true;
                    selected_axis_l = sensor.channels[0].unit;
                    selected_axis_r = sensor.channels[0].unit;
                }
            });
        }
    }
    if(data.annotations.length > 0) {
        annotations_bar_build(data.annotations);
    }
    select_axis_channel(selected_axis_l, true);
    filter_streams();
    init = true;
};

var select_axis_channel = function(key, left) {
    var radio_class = (left ? ".l-radio" : ".r-radio");
    $(".axis-item").each(function(i, axis_item) {
        var channel = $(this).data('channel-id');
        if(channel == key) {
            $(this).find(radio_class).addClass("fa-circle").removeClass("fa-circle-o");
        }
        else {
            $(this).find(radio_class).addClass("fa-circle-o").removeClass("fa-circle");
        }
    });

    if(left) {
        selected_axis_l = key;
    }
    else {
        selected_axis_r = key;
    }
    fe.logger.plot.set_axis_channel(key, left);
};

function toggle_stream_item(item) {
    console.log("Toggle stream");
    var selected = item.data('selected');
    var new_channel = item.data('channel-id');
    var new_sensor = item.data('sensor-ref');
    // var new_unit = item.data('channel-unit');
    var key = ""+new_sensor+":"+new_channel;
    var new_selected = !selected;

    var key_ind = filtered_channels.indexOf(key);
    if(new_selected) {
        if(key_ind != -1) {
            // If we're selecting the channel, it's no longer filtered.
            filtered_channels.splice(key_ind, 1);
        }
    }
    else {
        if(key_ind == -1) {
            // We're filtering the channel
            filtered_channels.push(key);
        }
    }
    
    // show_colour_band(item, new_selected);
    item.data('selected', new_selected);
}

// Stream item clicked
function stream_item_clicked(e) {

    debug('stream_item_clicked called');
    toggle_stream_item($(this));
    filter_streams();
}

function get_selected_streams() {
    var selections = $(".stream-item").filter(function() { 
        return $(this).data('selected'); 
    });
    var streams = [];
    $.each(selections, function(index, selection) {
        var stream = {};
        stream['sensor'] = $(selection).data('sensor-ref');
        stream['channel'] = $(selection).data('channel-id');
        stream['unit'] = $(selection).data('channel-unit');
        streams.push(stream);
    });
    return streams;
};

function filter_streams() {
    // Update filters
    var selections = $(".swatch").filter(function() { 
        return $(this).data('selected'); 
    });

    var channels = [];
    $.each(selections, function(index, selection) {
        var $this = $(selection);
        var filt = {'sensor':$this.data('sensor-ref'), 'channel':$this.data('channel-id')};
        channels.push(filt);
    });
    $(".chart").logger("filterChannels", channels);
}

/**
 * End Device Menu
 **/



// Prevent unwanted scrolling on iPad
function touch_scrolling() {
    // Stop scrolling
    var selScrollable = '.scrollable';
    // Uses document because document will be topmost level in bubbling
    $(document).on('touchmove',function(e){
        e.preventDefault();
    });
    // Uses body because jQuery on events are called off of the element they are
    // added to, so bubbling would not work if we used document instead.
    $('body').on('touchstart', selScrollable, function(e) {
        if (e.currentTarget.scrollTop === 0) {
            e.currentTarget.scrollTop = 1;
        } else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
            e.currentTarget.scrollTop -= 1;
        }
    });
    // Stops preventDefault from being called on document if it sees a scrollable div
    $('body').on('touchmove', selScrollable, function(e) {
        e.stopPropagation();
    });
}

// Filter next
function filter_time_next() {
    debug('filter_time_next called');
    if(filterSelectedDate !== null) {
        if(filterDateMode == 'day') {
            filterSelectedDate = moment(filterSelectedDate).add(1, 'days').toDate();
            filter_update_display_text();
        }
        else if(filterDateMode == 'week' ) {
            filterSelectedDate = moment(filterSelectedDate).add(7, 'days').toDate();
            filter_update_display_text();
        }
        else {

        }
    }
}

// Filter prev
function filter_time_prev() {
    debug('filter_time_prev called');
    if(filterSelectedDate !== null) {
        if(filterDateMode == 'day') {
            filterSelectedDate = moment(filterSelectedDate).subtract(1, 'days').toDate();
            filter_update_display_text();
        }
        else if(filterDateMode == 'week' ) {
            filterSelectedDate = moment(filterSelectedDate).subtract(7, 'days').toDate();
            filter_update_display_text();
        }
        else {

        }
    }
}
// Filter prev

function update_filters(cb) {
    var start;
    var end;
    // Work out start/end dates
    if(filterDateMode == 'day') {
        start = moment(filterSelectedDate).hours(0).toDate();
        end = moment(filterSelectedDate).hours(23).minutes(59).toDate();
    }
    else if(filterDateMode == 'week') {
        start = moment(filterSelectedDate).hours(0).toDate();
        end = moment(filterSelectedDate).hours(23).minutes(59).add(6, 'days').toDate();
    }
    else if(filterDateMode == 'all') {
        start = moment($('#date_from_server').val()).toDate();
        end = moment().toDate();
    }

    $(".startdate").text(moment(start).format('dddd Do MMMM'));

    fe.datepickerutils.set_start_date(start);
    fe.datepickerutils.set_end_date(end);
    fe.logger.plot.load_data(cb);
}

// Filter date changed
function filter_date_changed(datepicker_data) {
    filterSelectedDate = datepicker_data.date;
    debug("Filter date changed");

    filter_update_display_text();
    show_filter_menu(false, function() {
    });
}

function filter_update_display_text(cb) {
    if((filterSelectedDate !== null && filterDateMode !== null) || filterDateMode == 'all') 
    {
        update_filters(function(data) {
            rebuild_view(data);
            if(cb) {
                cb();
            }
        });
    }
}

function debug(string) {
    if (debugMode) {console.log(string);}
}

function displayAnnotation(annotation) {
    debug('displayAnnotation called');
    show_annotation_edit(annotation);
}

function addAnnotation() {
    debug('addAnnotation called');
    var plot = fe.logger.plot;
    var selection = plot.get_selection();
    var selected_time = []
    if (selection.w > 0) {
        var selection_start_t = plot.get_time_for_x(selection.x);
        var selection_end_t   = plot.get_time_for_x(selection.x + selection.w);
        debug( ' - ' + selection_start_t );
        debug( ' - ' + selection_end_t );
        selected_time = [ selection_start_t, selection_end_t ];
    } else {
        debug('No selection');
        alert("Please select a portion of the chart");
        return false;
    }

    var note = fe.logger.annotation;

    show_annotation_add(true, selected_time);
}

function flatten_object(objects) {
    var result = [];
    $.each(objects, function(key, object) {
        result.push(object);
    });
    return result;
}

// Called when adding a new annotation
function show_annotation_add(show, selected_time) {
    var annotation = {
        "id": null,
        "end": selected_time[1],
        "text": "",
        "start": selected_time[0],
        "deployment": DEPLOYMENT_ID,
    };
    $("#author").val("");
    $("#noteText").val("");
    $(".add-annotation-form").submit(function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var url = ANNOTATION_URL + 'create/';
        $('.an-start').val(moment(annotation.start).format('DD/MM/YYYY HH:mm:ss'));
        $('.an-end').val(moment(annotation.end).format('DD/MM/YYYY HH:mm:ss'));
        var data = $(".add-annotation-form").serialize();

        $.post(url, data, function(new_annotation) {
            fe.logger.plot.clear_selection();
            fe.datastore.add_annotation(new_annotation);
            fe.logger.plot.redraw();
            annotations_bar_build(flatten_object(fe.datastore.get_annotations()));
            $("#annotateScreen").modal('hide');
        }).fail(function() {
            console.log("Couldn't create!");
        });
        return false;
    });
    $("#annotateScreen").modal();
}