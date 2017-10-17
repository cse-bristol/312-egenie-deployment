var fe;
if (!fe) {
    fe = {};
}
if (!fe.logger) {
    fe.logger = {};
}

fe.logger.eventdialog = (function () {
    'use strict';
    var show_event_dialog,
        setup_event_dialog,
        
        validate_form,
        sanitize,
        populate_dialog_content,
        that;
    
    validate_form = function () {
        if ($('#eventImageIdField').val() === '') {
            //$('#iconField').css('border', '1px solid #B0171F');
            return "ERROR: Please choose an icon before pressing OK.";
        }
        if ($('#eventNameField').val() === '') {
            //$('#eventNameField').css('border', '1px solid #B0171F');
            return "ERROR: Please write a description before pressing OK.";
        }
        return '';
    };


    sanitize = function (event) {
        if (event.name === undefined) {
            event.name = '';
            event.title = "Annotate event";
        } else {
            event.title = "Edit event";
        }
        if (event.description === undefined) {
            event.description = '';
        }
        if (event.event_type_id === undefined) {
            event.event_type_id = '';
        }
        if (event.icon === undefined) {
            event.icon = '';
        }

        return event;
    };
    
    populate_dialog_content = function (event) {
        var startDate, dateText, endDate, timeText, duration, durationText, 
            consumption, always_on, consumptionText, date_format, time_format;
        
        event = sanitize(event);
        
        date_format = d3.time.format("%a %e %b");
        time_format = d3.time.format("%H:%M");
        
        //startDate = new Date(event.startLocal.getTime());
        startDate = new Date(event.start.getTime());
        endDate = new Date(event.end.getTime());

        dateText = date_format(startDate);
        if (date_format(endDate) !== dateText) {
            dateText += ' - ' + date_format(endDate);
        }

        timeText = time_format(startDate) + ' - ' + time_format(endDate);
        
        duration = endDate.getTime() - startDate.getTime();
        durationText = (duration / 60000).toFixed(0) + " minute(s) "; 
 
        $("#eventNameField").val(event.text);
        $("#eventDescriptionField").val(event.text);
        $("#eventStartField").val(event.start);
        $("#eventEndField").val(event.end);
        
        $("#event_dialog .date .value").text(dateText);
        $("#event_dialog .time .value").text(timeText);
        $("#event_dialog .duration .value").text(durationText);
  
        
        $('.event_dialog').dialog('option', 'title', event.title);
        
        if (event.event_type) {
            //$('#iconField .' + event.event_type.id).css('background-color', '#57B6DD');
        	$('#iconField .' + event.event_type.id).css('border', 'black solid 2px');
            $("#eventImageIdField").val(event.event_type.id);
            console.log("Event with an event_type; setting icon_url");
        } else {
            // This else added to cope with detections with no event type showing incorrect icons.
            console.log("event without an event type; hiding icon");
        }
        
        if (event.predictions) {
            // Set the border opacity based on predicted values
            event.predictions.map(function (prediction) {
                // If I had the data, this is where I would be setting the opacity based on the prediction certainties...
                $("." + prediction.event_type.id).css("border-bottom-color", "rgba(255,105,180," + prediction.certainty + ")");
            });
        }            
    };
    
    
    // show dialog function
    show_event_dialog = function (event) {
        populate_dialog_content(event);
        
        // TODO: is there a cleaner solution? e.g. one where the binding only happens once?
        // remove previous event listners
        $('#submitEventButton').unbind('click');
        $('#submitEventButton').click(function () {
            var errormessage,
	            url,
	            post_data,
	            channel,
	            all_channels,
	            tz_offset,
	            type_index,
	            index;
            
            errormessage = validate_form();
            if (errormessage !== '') {
                alert(errormessage);
                // TODO: check what does false do?
                return false;                       
            }
    
            if (event.id === undefined) {
                //post a new event
                url = server_url + "sdstore/annotation/";
                console.log("creating new event");
            } else {
                //update an existing event
                url = server_url + "sdstore/annotation/" + event.id + "/";
                console.log("update existing event");
            }
            
            // event.sensor = m_loader.meter_info().id;
            // event.channel = channel.id;
            event.text = $('#eventForm #eventNameField').val();
            // event.description = $('#eventForm #eventDescriptionField').val();
            // event.event_type_id = $('#eventForm #eventImageIdField').val();
			


            post_data = {};
            //post_data = $.extend(post_data, event);
            // post_data.sensor = event.sensor;
            // post_data.channel = event.channel;
            post_data.pairs = JSON.stringify(event.pairs);
            post_data.text = event.text;
            // post_data.event_type_id = event.event_type_id;
            post_data.id = event.id;
            
            tz_offset = (new Date()).getTimezoneOffset() * 60000.0;

            //post_data.start = (new Date(event.start.getTime() - tz_offset)).toISOString();
            //post_data.start = d3.time.format("%Y-%m-%d %H:%M:%S")(new Date(event.start.getTime() - tz_offset));
            post_data.start = d3.time.format("%Y-%m-%d %H:%M:%S")(new Date(event.start.getTime()));
            console.log("Start is before end:" + (event.end >= event.start));
            //post_data.end = (new Date(event.end.getTime() - tz_offset)).toISOString();
            //post_data.end = d3.time.format("%Y-%m-%d %H:%M:%S")(new Date(event.end.getTime() - tz_offset));
            post_data.end = d3.time.format("%Y-%m-%d %H:%M:%S")(new Date(event.end.getTime()));
            //console.log(event.auto_detected);
            
            //*
            $.ajax({
                url: url,
                type: "POST",
                data: post_data,
                success: function (data) {
                    var response = JSON.parse(data);
                    event.id = response.id;
                    fe.datastore.add_annotation(event);  
                    fe.logger.plot.redraw();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    var response, msg = '', k;
                    msg += "Sorry, there was an error :-(\n" + 
                        "Please contact the FigureEnergy team\n" + 
                        "and tell them about the following:\n\n";
                    response = JSON.parse(jqXHR.responseText);
                    response = response.error.reason;
                    if (response === 'string') {
                        msg += response;
                    } else {
                        for (k in response) {
                            if (response.hasOwnProperty(k)) {
                                msg += k + ': ' + response[k] + "\n";
                            }
                        }
                    }
                    alert(msg);
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });

            // close the dialog
            $('#event_dialog').modal("hide");
        });
            
        // TODO: is there a cleaner solution? e.g. one where the binding only happens once?
        // remove previous event listners
        $('#deleteEventButton').unbind('click');
        $('#deleteEventButton').click(function () {
            // delete existing event
            $.ajax({
                url: server_url + "sdstore/annotation/" + event.id + "/",
                type: "DELETE",
                success: function (data) {
                    // refresh
                    fe.datastore.remove_annotation(event); 
                    fe.logger.plot.redraw();
                }
            });
            fe.logger.plot.clear_selection();
            $('#event_dialog').modal("hide");
        });

        $('#event_dialog').on('shown.bs.modal', function () {
            $('#eventNameField').focus();
        })
     
        $('#event_dialog').modal();
        // $('.event_dialog').dialog('open');
    };
    
    setup_event_dialog = function () {
        $(".event_dialog").dialog({       
            draggable: false,
            resizable: false,
            autoOpen: false,
            width: 474,
            modal: true,
            open: function () { return; }
        });
        $(".multi_event_dialog").dialog({       
            draggable: false,
            resizable: false,
            autoOpen: false,
            width: 380,
            modal: true,
            open: function () { return; }
        });
    };

    that = {
        show_event_dialog: show_event_dialog,
        setup_event_dialog: setup_event_dialog
    };
    
    return that;
}());
