/**
 * 
 */

var fe;
if (!fe) {
    fe = {};
}

fe.datepickerutils = (function () {
    'use strict';
    var m_selected_start,
        m_selected_end,
        m_parameters,
        fromSelector,
        toSelector,
        // methods
        setup_links,
        trim_dates,
        setup_date_pickers,
        display_hours,
        settings,
        init;
    
    
    m_parameters = function () {
        return $.extend(settings,
            {
                'start':m_selected_start,
                'end':m_selected_end
            });
    };
    
    fromSelector = $('#id_fromField');
    toSelector = $('#id_toField');
    
    init = function(_settings) {
        settings = _settings;
        console.log(settings);
    }

    //--------------
    setup_links = function () {
        // the following calls are to make the dates on
        // the logger apply to the practice
    
        $('a.practice').click(function () {
            $('#datesForm').attr('action', server_url + 'practice/');
            $('#datesForm').submit();
            return false;
        });
        
        $('a.logger').click(function () {
            $('#datesForm').attr('action', server_url + 'logger/');
            $('#datesForm').submit();
            return false;
        });
    };
    
    display_hours = function (noHours, load, draw) {
        return function () {
            var selectedStartTime;
            // calculate the last seven days
            // m_selected_end = new Date();
            // m_selected_end.setHours(23, 59, 59, 0);
            selectedStartTime = m_selected_end.getTime() - noHours * 60 * 60 * 1000;
            m_selected_start = new Date();
            m_selected_start.setTime(selectedStartTime);
            //m_selected_start.setHours(0, 0, 0);
            
            // set the datepickers
            toSelector.datepicker('setDate', m_selected_end);
            fromSelector.datepicker('setDate', m_selected_start);

            // refresh the graph
            load(m_parameters(), draw);
        };
    };
    
    setup_date_pickers = function (load, draw) {
        var dateFormat = 'dd M yy',
            
            // functions
            setFromDate,
            setToDate;
        
        fromSelector = $('#id_fromField');
        toSelector = $('#id_toField');
        
        m_selected_start = d3.time.format("%Y-%m-%d %H:%M:%S").parse($('#date_from_server').val());
        m_selected_end = d3.time.format("%Y-%m-%d %H:%M:%S").parse($('#date_to_server').val());
        m_selected_end.setHours(23, 59, 59);
        
        setFromDate = function (dateText) {
            $("img.progressBar").show();
            var selectedDate = $.datepicker.parseDate(
                    fromSelector.datepicker("option", "dateFormat"), 
                    dateText
                );
            
            if (selectedDate > m_selected_end) {
                m_selected_start = m_selected_end;
                m_selected_end = selectedDate;
                m_selected_start.setHours(0, 0, 0);
                m_selected_end.setHours(23, 59, 59);
                toSelector.datepicker('setDate', m_selected_end);
                fromSelector.datepicker('setDate', m_selected_start);
                load(m_parameters(), draw);
            } else {
                m_selected_start = selectedDate;
                m_selected_start.setHours(0, 0, 0);
                load(m_parameters(), draw);
            }
        };
    
        setToDate = function (dateText) {
            // TODO: check / fix this function
            $(".progressBar").show();
            var selectedDate = $.datepicker.parseDate(
                toSelector.datepicker("option", "dateFormat"), 
                dateText
            );
            
            if (selectedDate < m_selected_start) {
                m_selected_end = m_selected_start;
                m_selected_start = selectedDate;
                m_selected_start.setHours(0, 0, 0);
                m_selected_end.setHours(23, 59, 59);
                toSelector.datepicker('setDate', m_selected_end);
                fromSelector.datepicker('setDate', m_selected_start);
                load(m_parameters(), draw);
            } else {
                selectedDate.setHours(23, 59, 59);
                m_selected_end = selectedDate;
                load(m_parameters(), draw);
            }
        };
        
        fromSelector.datepicker({
            autoSize: true,
            onSelect: setFromDate,
            selectWeek: true,
            inline: true,
            dateFormat: dateFormat,
            startDate: '01/01/2010',
            firstDay: 1,
            defaultDate: m_selected_start
        });
        
        fromSelector.datepicker().keydown(function (event) {
            if (event.which === $.ui.keyCode.ENTER) {
                setFromDate(fromSelector.val(), 
                        fromSelector.datepicker('widget'));
            }
        });
        
        toSelector.datepicker({
            autoSize: true,
            onSelect: setToDate,
            selectWeek: true,
            inline: true,
            dateFormat: dateFormat,
            startDate: '01/01/2010',
            firstDay: 1,
            defaultDate: m_selected_end
        });
        
        toSelector.datepicker().keydown(function (event) {
            if (event.which === $.ui.keyCode.ENTER) {
                setToDate(toSelector.val(), 
                        toSelector.datepicker('widget'));
            }
        });
        
        fromSelector.datepicker().click(function () { 
            fromSelector.datepicker('show'); 
        });
        toSelector.datepicker().click(function () { 
            toSelector.datepicker('show'); 
        });
    
        //initially display the date        
        fromSelector.datepicker('setDate', m_selected_start);    
        toSelector.datepicker('setDate', m_selected_end);
        
        $('.lastHalfDay').click(display_hours(12, load, draw));
        $('.lastDay').click(display_hours(24, load, draw));
        $('.lastTwoDays').click(display_hours(2 * 24, load, draw));
        $('.lastSevenDays').click(display_hours(7 * 24, load, draw));
        $('.lastHalfDay').button();
        $('.lastDay').button();
        $('.lastTwoDays').button();
        $('.lastSevenDays').button();
    };
    
    trim_dates = function () {
        m_selected_start.setHours(0, 0, 0);
        m_selected_end.setHours(23, 59, 0);
        // increment by one day 
        m_selected_end.setDate(m_selected_end.getTime() + 24 * 60 * 60 * 1000 - 60000);
    };
    
    // export the API
    return {
        init: init,
        setup_links: setup_links,
        trim_dates: trim_dates,
        setup_date_pickers: setup_date_pickers,
        parameters: function () { return m_parameters(); },
        set_end_date: function (end_date) {
        	try {
    	    	m_selected_end = d3.time.format("%Y-%m-%d %H:%M:%S").parse(end_date); 
	    	} catch (exception) {
	    		m_selected_end = new Date(end_date);
	    	}
        },
        set_start_date: function (start_date) {
        	try {
        		m_selected_start = d3.time.format("%Y-%m-%d %H:%M:%S").parse(start_date);
        	} catch (exception) {
        		m_selected_start = new Date(start_date);
        	}
    	},
        display_hours: display_hours
    };
}());
