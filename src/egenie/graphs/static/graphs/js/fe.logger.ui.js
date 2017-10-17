/**
 * 
 */
var fe;
if (!fe) {
    fe = {};
}
if (!fe.logger) {
    fe.logger = {};
}

fe.logger.ui = (function () {
    'use strict';
    var show_multi_event_dialog,
        //setup_date_pickers,
        //setup_links,
        
        draw,
        m_dpu, 
        m_ui,
        m_store;
    
    show_multi_event_dialog = function (events) {
        var label = "There are " + events.length + " events close together here. ";
        label += "Please click on one of them to see, edit or delete it:";
        $('.multi_event_dialog').dialog('option', 'title', 'Multiple events');
        //console.log(label);
        //console.log(events.map(function (x) {return x.name;}));
        $(".multi_event_dialog .event_list .label").text(label);
        $(".multi_event_dialog .event_list .list").empty();
        events.sort(function (a, b) {return a.start -  b.start;});
        /*jslint unparam: true*/
        $.each(events, function (index, event) {
            //var html;
            //html = '<div>' + event.name + '</div>'
            //$(".multi_event_dialog .event_list .list").append(html);
            $(".multi_event_dialog .event_list .list").append(event.render_as_list_item());
        });
        /*jslint unparam: false*/
        
//        $(".multi_event_dialog .event_list .list .event").unbind('click');
//        $(".multi_event_dialog .event_list .list .event").click(function () {
//        $('.multi_event_dialog').dialog('close');
//            console.log($(this));
//        });
        
        // here we use d3 on click listenere, because it allows to more conveniently
        // bind the events to the DOM element
        d3.selectAll(".multi_event_dialog .event_list .list .event")
            .data(events)
            .on('click', function (e) {
                $('.multi_event_dialog').dialog('close');
                fe.logger.eventdialog.show_event_dialog(e);
            });
        
        $('.multi_event_dialog').dialog('open');
    };

    m_dpu = fe.datepickerutils;
    m_store = fe.datastore;
    
    //setup_event_dialog();

    m_ui = {
        show_multi_event_dialog: show_multi_event_dialog,
        pan_forward: function () {
            var loader_start = new Date(fe.datastore.get_xrange()[0]); 
            var loader_end = new Date(fe.datastore.get_xrange()[1]); 
            
            var end, delta;
            delta = m_dpu.parameters().end.getTime() - m_dpu.parameters().start.getTime();
            end = new Date(m_dpu.parameters().end.getTime() + delta / 4);
            
            // on Firefox Math.max converts the dates to timestamps
            // so I convert them explicitly to avoid confusion
            // TODO: m_loader.end doesn't exist
            end = new Date(Math.min(end.getTime(), loader_end.getTime()));
            //m_selected_end = new Date(m_selected_end);
            m_dpu.set_end_date(end);
            //m_selected_start = new Date(m_selected_end.getTime() - delta);
            m_dpu.set_start_date(end - delta);
            
            //m_parameters.start = m_selected_start;
            //m_parameters.end = m_selected_end;
            fe.logger.plot.load_data();
        },
        
        pan_backward: function () {
            var loader_start = new Date(fe.datastore.get_xrange()[0]); 
            var loader_end = new Date(fe.datastore.get_xrange()[1]); 
            var start, delta;
            delta = m_dpu.parameters().end.getTime() - m_dpu.parameters().start.getTime();
            start = new Date(m_dpu.parameters().start.getTime() - delta / 4);
            // on Firefox Math.max converts the dates to timestamps
            // TODO: m_loader.start doesn't exist. Use data.
            start = new Date(Math.max(start.getTime(),loader_start.getTime()));
            m_dpu.set_start_date(start);
            m_dpu.set_end_date(start.getTime() + delta);

            console.log("Paramters:");
            console.log(m_dpu.parameters());
            
            fe.logger.plot.load_data();
        },

        zoom: function (start, end, cb) {
            m_dpu.set_start_date(start);
            m_dpu.set_end_date(end);

            fe.logger.plot.load_data(cb);
        },

        zoom_in: function (cb) {
            var delta = m_dpu.parameters().end.getTime() - m_dpu.parameters().start.getTime();
            delta /= 8;
            m_dpu.set_start_date(m_dpu.parameters().start.getTime() + delta);
            m_dpu.set_end_date(m_dpu.parameters().end.getTime() - delta);

            fe.logger.plot.load_data(cb);
        },
        
        zoom_out: function (cb) {
            var delta = m_dpu.parameters().end.getTime() - m_dpu.parameters().start.getTime();
            delta /= -4;
            m_dpu.set_start_date(m_dpu.parameters().start.getTime() + delta);
            m_dpu.set_end_date(m_dpu.parameters().end.getTime() - delta);

            fe.logger.plot.load_data(cb);
        }
    };
    
    return m_ui;
}());
