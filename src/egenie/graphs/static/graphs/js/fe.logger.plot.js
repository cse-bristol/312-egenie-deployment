/**
 * 
 */

var fe;

$(function () {
    'use strict';
    if (!fe) {
        fe = {};
    }
    if (!fe.logger) {
        fe.logger = {};
    }
    
    $(".progressBar").show();
    
    fe.logger.plot = (function () {
        var api;
        var chart;

        var w, h;
        var xSc;
        var axis_channel_l;
        var axis_channel_r;
        
        var format_date;
        var selected_annotation;

        // Selection functions
        var redraw,
            resize_selection,
            create_selection,
            on_selection_click,
            enable_selection_click,
            get_selection,
            get_selection_x,
            on_event_click,
            clear_selection,
            complete_selection,
            redraw_selection;

        var limit_bounds,
            select_datasets,
            get_chart,
            get_x_for_time,
            get_time_for_x,
            get_width,
            get_height,
            filter_channels,
            get_x_min,
            get_x_max,
            get_y_min,
            get_y_max,
            get_y_range,
            set_axis_channel,
            set_selected_annotation;

        var draw_x_axis,
            draw_x_grid,
            draw_y_axis,
            draw_y_grid,
            draw_data,
            draw_events,
            draw_antievents,
            get_flat_annotations,
            draw_controls,
            setup_interaction,
            handle_event_click,
            update_dates,
            toggle_suggestions,
            load_data,
            get_colours;

        var drag_handle_behaviour = null;
        var selection = {x:0, w:0, channels:[], start:0, end:0};


        /* 
         * largely based on:
         * http://mbostock.github.com/d3/tutorial/bar-1.html
         * http://mbostock.github.com/d3/tutorial/bar-2.html
         * http://www.janwillemtulp.com/2011/04/01/tutorial-line-chart-in-d3/
         * 
         */
        
        $('#whitespaceDiv .drag_msg').hide();
        $('#whitespaceDiv .click_msg').hide();

        var selector;
        var settings;

        function init(_selector, _settings) {
            selector = _selector;
            settings = _settings;

            // allow some pixels for right axis
            w = selector.width();
            h = selector.height() - 50;

            axis_channel_l = settings.axis_channel;
            axis_channel_r = settings.axis_channel;
        };

        function draw(data) {
            redraw();

            fe.datastore.load(data, settings);
            redraw();
        };

        get_height = function() {
            return selector.height() - 50;
        };

        get_width = function() {
            return selector.width();
        };

        filter_channels = function(state) {
            // Currently very inefficient!
            var datasets = fe.datastore.get_datasets();
            $.each(datasets, function(index, dataset) {
                var found = false;
                $.each(state, function(j, item) {
                    if(item.channel == dataset.channel && item.sensor == dataset.sensor) {
                        found = true;
                    }
                });
                dataset.visible = found;
            });
        };

        set_axis_channel = function(channel, left) {
            if(left) {
                axis_channel_l = channel;
            }
            else {
                axis_channel_r = channel;
            }
            redraw();
        };

        redraw_selection = function() {
            var datasets = fe.datastore.get_datasets();
            if(datasets.length > 0) {
                if(selection.w > 0) {
                    create_selection(selection.x, selection.w, selection.channels);
                }
                select_datasets(selection.channels);
            }
        };

        get_x_min = function() {
            var x_min = -1;
            $.each(fe.datastore.get_datasets(), function(index, dataset) {
                if(x_min == -1 || dataset.x_min < x_min) {
                    x_min = dataset.x_min;
                }
            });
            return x_min;
        }

        get_x_max = function() {
            var x_max = -1;
            $.each(fe.datastore.get_datasets(), function(index, dataset) {
                if(x_max == -1 || dataset.x_max > x_max) {
                    x_max = dataset.x_max;
                }
            });
            return x_max;
        }

        get_y_min = function(unit) {
            var y_min = 0;
            var y_min_set = false;
            $.each(fe.datastore.get_datasets(), function(index, dataset) {
                if(dataset.unit == unit && (!y_min_set || dataset.y_min < y_min)) {
                    y_min = dataset.y_min;
                    y_min_set = true;
                }
            });
            return y_min;
        }

        get_y_max = function(unit) {
            var y_max = 0;
            var y_max_set = false;
            $.each(fe.datastore.get_datasets(), function(index, dataset) {
                if(dataset.unit == unit && (!y_max_set || dataset.y_max > y_max)) {
                    y_max = dataset.y_max;
                    y_max_set = true;
                }
            });
            return y_max;
        }

        get_y_range = function(unit) {
            var y_min = get_y_min(unit);
            var y_max = get_y_max(unit);
            var pad = (y_max-y_min)/10;
            y_max = y_max + pad;

            // If y_min is positive and greater than the pad, or negative.
            if(y_min >= pad || y_min < 0) {
                y_min = y_min - pad;
            }
            // If y_min is positive, but small, then just set min to 0.
            else if(y_min > 0) {
                y_min = 0;
            }

            y_max = Math.ceil(y_max/10)*10;
            y_min = Math.floor(y_min/10)*10;

            // y_max = Math.floor((y_max+pad)/10)*10;
            // y_min = Math.floor((y_min-pad)/10)*10;

            return [y_min, y_max];
        }

        redraw = function() {
            var y_max,
                data;
                // always_on = loader.always_on(), 
                
                // functions


            w = selector.width() - 80;
            h = selector.height();
            
            var x_min = get_x_min();
            var x_max = get_x_max();

            xSc = d3.time.scale().domain([x_min, x_max]).range([0, w]);

            // clear any existing stuff (in case of refresh)
            d3.selectAll(selector.toArray()).select("svg").remove();
            
            // the selector div is defined in the html file
            chart = d3.selectAll(selector.toArray()).append("svg")
                .attr("height", h + 80)
                .attr("width", w + 120)
                .append("g")
                .attr("transform", "translate(50,20)");
            
            if (fe.datastore.get_datasets().length === 0) {
                chart.append("text")
                    .attr("x", 200)
                    .attr("class", "no_data_text")
                    .attr("y", h / 3)
                    .text('No data, yet');
                
                $(".progressBar").hide();
                
                return;
            }
            
            draw_x_axis();
            draw_x_grid();
            draw_y_axis();
            if(axis_channel_l || axis_channel_r) {
                draw_y_grid();
            }
            draw_data();
            select_datasets(selection.channels);

            draw_events($( "#show_suggestions_checkbox" ).is(':checked'));

            if(settings.draw_controls) {
                draw_controls();
            }
            setup_interaction();
            update_dates();
            
            //$( "#suggestions_checkbox" ).buttonset();
            $( "#show_suggestions_checkbox" ).change(toggle_suggestions);
            $( "#hide_suggestions_checkbox" ).change(toggle_suggestions);
            
            $(".progressBar").hide();
        };

        // We only draw a single X axis
        draw_x_axis = function () {
            // draw horizontal axis
            chart.append("line")
                .attr("x1", 0)
                .attr("x2", w)
                .attr("y1", h)
                .attr("y2", h)
                .style("stroke", "#000");   
    

            if(settings.draw_xlabels) {
                // draw horizontal axis labels
                chart.selectAll(".xRule")
                    .data(xSc.ticks(10))
                    .enter().append("text")
                    .attr("class", "xRule")
                    .attr("x", function (d) {return xSc(d) - 16; })
                    .attr("y", h + 2 + 15)
                    // .attr("dy", 15)
                    .attr("dx", ".45em") // vertical-align: middle
                    .attr("text-anchor", "left")
                    // .text(function (d) { return d3.time.format("%I%p")(d).toLowerCase(); });
                	.text(function (d) { return d3.time.format("%H:%M")(d); });

                // draw horizontal axis ticks
                chart.selectAll(".xTicks")
                    .data(xSc.ticks(10))
                    .enter().append("line")
                    .attr("x1", xSc)
                    .attr("x2", xSc)
                    .attr("y1", h - 5)
                    .attr("y2", h + 5)
                    .style("stroke", "#333");   
                }
        };
        
        draw_x_grid = function () {
            var grid_w,
                grid_data,
                // functions
                is_weekend,
                is_weekday,
                calc_grid_w;
            
            is_weekend = function (x) { return x[0].getDay() === 0 || x[0].getDay() === 6; };
            is_weekday = function (x) { return !is_weekend(x); };

            grid_data = xSc.ticks(d3.time.hours, 24);
            var ds0 = fe.datastore.get_datasets()[0]
            grid_data = [ds0.x_min].concat(grid_data);
            
            // this uses closure on grid_data
            /*jslint unparam: true*/
            calc_grid_w = function (d, i) {
                var x0, x1;
                x0 = xSc(grid_data[i]);
                x1 = xSc(grid_data[i + 1]);
                if (x1 === undefined || isNaN(x1)) {
                    x1 = xSc.range()[1];
                }
                return x1 - x0; 
            };
            /*jslint unparam: false*/
            
            grid_w = grid_data.map(calc_grid_w);
            grid_data = grid_data.map(function (d, i) { return [d, grid_w[i]]; });
                
            chart.selectAll(".xGridBg1")
                .data(grid_data.filter(is_weekday))
                //.data(xSc.ticks(d3.time.hours, 24))
                .enter().append("rect")
                .attr('class', 'xGridBg1')
                .attr("x", function (d) { return xSc(d[0]); })
                .attr("y", 0)
                .attr("width", function (d) { return d[1]; })
                .attr("height", h);
                // .style("stroke", "#333");   
    
            // chart.selectAll(".xGridBg2")
            //     .data(grid_data.filter(is_weekend))
            //     .enter().append("rect")
            //     .attr('class', 'xGridBg2')
            //     .attr("x", function (d) { return xSc(d[0]); })
            //     .attr("y", 0)
            //     .attr("width", function (d) { return d[1]; })
            //     .attr("height", h);
                // .style("stroke", "#333");   

            // // draw horizontal axis grid
            chart.selectAll(".xGrid")
                .data(xSc.ticks(d3.time.hours, 24))
                .enter().append("line")
                .attr("x1", xSc)
                .attr("x2", xSc)
                .attr("y1", 0)
                .attr("y2", h)
                .style('stroke-width', '1px')
                .style("stroke-dasharray", ("1, 1"))
                .style("stroke", "#333");   
            
        
        };
            
        draw_y_grid = function () {
            var fmt = d3.format('.0f');
            
            //// Left axis
            
            if(axis_channel_l) {
                var y_range_l = get_y_range(axis_channel_l);
                var ySc_l = d3.scale.linear().domain([y_range_l[0], y_range_l[1]]).range([0, h]);
                // var channel_l = fe.datastore.lookup_channel(axis_channel_l);

                // draw vertical axis "ticks" (they are actually grid lines)
                chart.selectAll(".yTicks-l")
                    .data(ySc_l.ticks(10))
                    .enter().append("line")
                    .attr("x1", -3)
                    .attr("x2", 3)
                    .attr("y1", function (d) { return h - ySc_l(d); })
                    .attr("y2", function (d) { return h - ySc_l(d); })
                    .style("stroke", "#333");   
                
                // draw vertical axis labels
                chart.selectAll(".yRule-l")
                    .data(ySc_l.ticks(10))
                    .enter().append("text")
                    .attr("class", "yRule-l")
                    .attr("x", -5)
                    .attr("y", function (d) { return h - ySc_l(d) + 3; })
                    // .attr("dy", 3)
                    .attr("dx", 0)
                    .attr("text-anchor", "end")
                    .text(fmt);

                chart.append("text")
                    .attr("class", "yLabel-l")
                    .attr("x", 0)
                    .attr("y", -9)
                    .attr("dy", 0)
                    .attr("dx", 0)
                    .attr("text-anchor", "middle")
                    .text(axis_channel_l);
            }
            //// Right axis

            if(axis_channel_r) {
                var y_range_r = get_y_range(axis_channel_r);
                var ySc_r = d3.scale.linear().domain([y_range_r[0], y_range_r[1]]).range([0, h]);
                // draw vertical axis "ticks" (they are actually grid lines)
                chart.selectAll(".yTicks-r")
                    .data(ySc_r.ticks(10))
                    .enter().append("line")
                    .attr("x1", w-3)
                    .attr("x2", w+3)
                    .attr("y1", function (d) { return h - ySc_r(d); })
                    .attr("y2", function (d) { return h - ySc_r(d); })
                    .style("stroke", "#333");   
                
                // draw vertical axis labels
                chart.selectAll(".yRule-r")
                    .data(ySc_r.ticks(10))
                    .enter().append("text")
                    .attr("class", "yRule-r")
                    .attr("x", w+5)
                    .attr("y", function (d) { return h - ySc_r(d); })
                    .attr("dy", 3)
                    .attr("dx", 0)
                    .attr("text-anchor", "start")
                    .text(fmt);

                chart.append("text")
                    .attr("class", "yLabel-r")
                    .attr("x", w)
                    .attr("y", -13)
                    .attr("dy", 3)
                    .attr("dx", 0)
                    .attr("text-anchor", "middle")
                    .text(axis_channel_r);
            }
        };
        
        draw_y_axis = function () {
            // draw vertical axis
            chart.append("line")
                .attr("y1", 0)
                .attr("y2", h)
                .style("stroke", "#000");  


            chart.append("line")
                .attr("x1", w)
                .attr("x2", w)
                .attr("y1", 0)
                .attr("y2", h)
                .style("stroke", "#000");  
        };

        draw_data = function () {
            var data_sets = fe.datastore.get_datasets();

            $.each(data_sets, function(index, data_set) {
                // var y_min = get_y_min(data_set.channel);
                // var y_max = get_y_max(data_set.channel);
                var y_range = get_y_range(data_set.unit);
                var ySc = d3.scale.linear().domain([y_range[0], y_range[1]]).range([0, h]);
                var line;
                // create path generator
                line = d3.svg.line()
                    .x(function (d) { return xSc(d.t); })
                    .y(function (d) { return h - ySc(d.value); });
                
                d3.svg.area()
                    .x(function (d) { return xSc(d.t); })
                    .y0(function (d) { return h - ySc(d.value); })
                    .y1(function () { return h; });

              // append data plot/path to svg
              var line = chart.append("svg:path")
                              .style("fill", "none")
                              .style("stroke-width", 2)
                              .style("stroke", data_set.colour)
                              .attr("d", line(data_set.data))
                              .style("display", "block");

              
              /* if(!data_set.visible) {
               *     line.style("display", "none");
               * }
               */
            });
    
        };
        
        draw_antievents = function() {

            chart.selectAll('.bgs').remove();

            var flat_annotations = get_flat_annotations();
            // antiEvents are the segments outside events in the 
            // current view
            var antiEvents = [];
            antiEvents.push({
                start: get_x_min()
            });
            var i = 0;
            // calculate the extend of each event on the plot
            // map is used to avoid creating functions in a loop
            if(settings.antievents) {

                var selected_layer;
                if(fe.logger.annotation.get_selected_layer) {
                    selected_layer = fe.logger.annotation.get_selected_layer();
                }
                // TODO: Maybe add an 'init' to carpet.
                if(selected_layer == null) {
                    selected_layer = {'ref':1};
                }

                flat_annotations.map(function () {
                    flat_annotations[i].proxy = null;
                    flat_annotations[i].compr = [];
                    var end_date = moment(flat_annotations[i].end).toDate();
                    var start_date = moment(flat_annotations[i].start).toDate();
                    flat_annotations[i].duration = (end_date.getTime() - start_date.getTime())/60/1000;
                    if(selected_layer.ref == flat_annotations[i].layer) {
                        antiEvents[antiEvents.length-1].end = start_date;
                        antiEvents.push({
                            start: new Date(start_date.getTime() + 
                                    (flat_annotations[i].duration + 2) * 60 * 1000)
                        });
                    }
                    i += 1;
                });
            }
            
            antiEvents[antiEvents.length - 1].end = get_x_max();
            // the .bgs are used for listening to drag events
            // they are the segments of the graph between events
            chart.selectAll('.bgs')
                .data(antiEvents).enter()
                .append("rect")
                .attr('class', 'bgs')
                .attr("y", 0)
                .attr("x", function (d) {
                    return xSc(d.start); 
                })
                .attr("height", h)
                .attr("width", function (d) {return xSc(d.end.getTime()) - xSc(d.start.getTime()); });                    
                
            setup_interaction();
        };

        get_flat_annotations = function() {
            var flat_annotations = [];
            $.each(fe.datastore.get_annotations(), function(key, annotation) {
                flat_annotations.push(annotation);
            }); 
            
            // Sort the events chronologically
            flat_annotations = flat_annotations.sort(function (a, b) { return a.start - b.start; });
            
            // Filter out any which end too far to the lhs of the plot
            flat_annotations = flat_annotations.filter(function (d) { return xSc(d.end) > 10;});
            return flat_annotations;
        };

        draw_events = function (display_suggestions) {
            var i,
            	events,
                eStart, 
                eEnd,
                eTail,
                antiEvents,
                events_w_icons,
                calculate_icon_y,
                get_ids,
                icon_size,
                icon_group,
                display_labels;
			
            d3.selectAll('.labels_label').remove();
            
            display_labels = false;
            
            get_ids = function (d) {
            	var ids;
            	if (d.proxy) {
            		d = d.proxy;
            	}
            	ids = d.compr.map(function (x) {return x.id;});
            	ids.push(d.id);
            	ids = ids.map(function (x) {return '._' + x;});
            	if (ids.length > 1) {
                	ids = ids.reduce(function (x, y) {return x + ', ' + y;});
            	} else {
            		ids = ids[0];
            	}
            	return ids;
            };
            
            // clear all event related DOM elements
            chart.selectAll('.event').remove();
            chart.selectAll('.event_unclassified').remove();
            chart.selectAll('.event_icon').remove();

            if(selected_annotation) {
                settings.annotation.draw_events([selected_annotation]);
            }
            draw_antievents();

    //         events_w_icons = [];

    //         calculate_icon_y = function (d) {
    //             var y, ev_data, tail_h, start;
    //             start = d3.max([d.end_index - 20, d.start_index]);
    //             ev_data = data.slice(start, d.end_index);
    //             y = d3.max(ev_data, function (x) { return x.value; });
    //             //y = d3.mean(ev_data, function (x) { return x.value; });
                
    //             tail_h = d3.max(data.slice(d.end_index, d.tail_index),
    //                     function (x) { return x.value; });
    //             tail_h *= 1.2;
                
    //             y = d3.min([y, tail_h]);
    //             y = h - ySc(y);
                
    //             return y;
    //         };
			
    //         icon_size = 60;
    //         icon_group = chart.selectAll(".event_icon")
    //             .data(events_w_icons)
    //             .enter().append('svg:g')
    //             .attr("class", function (d) {
    //                 return "event_icon _" + d.id;
    //             })
    //             .attr('display', function () {
    //             	if (display_labels === false) {
    //             		return 'none';
    //             	}
    //             	return 'block';
    //             })
    //             .on('mouseover', function (d) {
    //             	var ids = get_ids(d);
    //             	d3.selectAll(ids).classed('highlight', true);
    //             	return; 
    //             })
    //             .on('mouseout', function (d) {
    //             	var ids = get_ids(d);
    //             	d3.selectAll(ids).classed('highlight', false);
    //             	return; 
    //             })
    //             .on('contextmenu', handle_event_click)
    //             .on('click', handle_event_click)
    //             .attr("transform", function (d) {
    //             	var x, y;
    //               	x = xSc(d.end) - icon_size / 4;
    //               	y = calculate_icon_y(d) - icon_size;
    //             	return "translate(" + x + ", " + y + ")";
    //             });
            
    //         icon_group.append('image')
    //             .attr('width', icon_size)
    //             .attr('height', icon_size)
    //             .attr("class", function () {
    //                 return "event_icon_bubble";
    //             })
    //             .attr("xlink:href", function (d) { 
    //                 if (d.compr.length > 0) {
    //                     return server_url + 'media/graphs/imgs/multi_bubbles.png';
    //                 }
    //                 return server_url + 'media/graphs/imgs/logger_bubble.png';
    //             });
			
    //         icon_group.filter(function (d) {return d.compr.length === 0;})
    //         	.append('image')
    //             .attr('width', icon_size / 2)
    //             .attr('height', icon_size / 2)
    //             .attr('x', 13)
    //             .attr('y', 10)
    //             .attr("xlink:href", function (d) { 
    //                 if (d.compr.length > 0) {
    //                     return null;
    //                 }
    //                 return server_url + d.event_type.alt_icon;
    //             });
            
    //         icon_group.filter(function (d) {return d.compr.length > 0;})
    //         	.append('text')
				// .attr("class", "event_icon_text")
    //             .attr('x', 22)
    //             .attr('y', 35)
				// .text(function (d) {return String(d.compr.length + 1);});
        };
        
        draw_controls = function () {
            // pan & zoom controls 
            var bs = 18,
                c_group,
                c_group2, 
                svg;
            
            svg = d3.selectAll(selector.toArray()).select("svg");
            c_group = svg.append('svg:g')
                .attr("transform", "translate(" + (w - (5 + (bs + 2) * 5)) + ", 2)");
            
            c_group.append("rect")
                .attr("class", 'pz_controls')
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", (bs + 2) * 5)
                .attr("height", (bs + 2) * 2);
            
            c_group2 = c_group.append('svg:g')
                .attr("transform", "translate(1, 1)");
           
            c_group2.append("image")
                .attr("class", 'pz_button fbw')
                .attr("x", 0)
                .attr("y", (bs + 2) / 2)
                .attr("width", bs)
                .attr("height", bs)
                .attr("xlink:href", server_url + 'static/graphs/imgs/fbwd.svg')
                .on('click', settings.ui.pan_backward);
            c_group2.append("image")
                .attr("class", 'pz_button bw')
                .attr("x", (bs + 2))
                .attr("y", (bs + 2) / 2)
                .attr("width", bs)
                .attr("height", bs)
                .attr("xlink:href", server_url + 'static/graphs/imgs/bwd.svg')
                .on('click', settings.ui.pan_backward);
            c_group2.append("image")
                .attr("class", 'pz_button zin')
                .attr("x", (bs + 2) * 2)
                .attr("y", 0)
                .attr("width", bs)
                .attr("height", bs)
                .attr("xlink:href", server_url + 'static/graphs/imgs/zin.svg')
                .on('click', settings.ui.zoom_in);
            c_group2.append("image")
                .attr("class", 'pz_button zout')
                .attr("x", (bs + 2) * 2)
                .attr("y", (bs + 2))
                .attr("width", bs)
                .attr("height", bs)
                .attr("xlink:href", server_url + 'static/graphs/imgs/zout.svg')
                .on('click', settings.ui.zoom_out);
            c_group2.append("image") 
                .attr("class", 'pz_button fw')
                .attr("x", (bs + 2) * 3)
                .attr("y", (bs + 2) / 2)
                .attr("width", bs)
                .attr("height", bs)
                .attr("xlink:href", server_url + 'static/graphs/imgs/fwd.svg')
                .on('click', settings.ui.pan_forward); 
            c_group2.append("image")
                .attr("class", 'pz_button ffw')
                .attr("x", (bs + 2) * 4)
                .attr("y", (bs + 2) / 2)
                .attr("width", bs)
                .attr("height", bs)
                .attr("xlink:href", server_url + 'static/graphs/imgs/ffwd.svg')
                .on('click', settings.ui.pan_forward);
            
        };

        get_chart = function() {
            return chart;
        };

        limit_bounds = function(container, x0, x1) {
            var cntX, cntW, w;

            cntX = parseFloat(container.attr('x'));
            cntW = parseFloat(container.attr('width'));
            // constrain x1 to the container (x0 is bound to be inside, 
            // because that's a click event)
            // (i.e. x1 is at most the rhs of the container, 
            // at least the lhs of the container)
            x1 = Math.max(cntX, Math.min(cntW + cntX - 1, x1));
            
            w = x1 - x0;
            
            if (w < 0) {
                x0 = x1;
                w = -w;
            }
            return {'x':x0, 'w':w};
        };
        
        clear_selection = function (trigger_events) {
            if (typeof trigger_events === 'undefined') { trigger_events = true; }
            if(trigger_events) {
                $(".chart").trigger("logger:click", {
                    'button':'clear_selection', 
                    'params':{
                    }
                });
            }
            selection.x = 0;
            selection.w = 0;
            selection.channels = [];
            chart.selectAll('.selection').remove();
            chart.selectAll('.selection_handle').remove();
            var data_sets = fe.datastore.get_datasets();
            $.each(data_sets, function(index, dataset) {
                dataset.selected = false;
            });
            select_datasets(selection.channels);
        };

        resize_selection = function(x, w) {
            var t0, t1;

            t0 = get_time_for_x(x);
            t1 = get_time_for_x(x + w);

             // Update the width of the selection.
            chart.selectAll('.selection')
                .attr('x', x)
                .attr("width", w);

            // Move the drag handles, and labels, to the correct positions.
            chart.selectAll('.selection_handle.end')
                .attr("x", x + w - 10);
            chart.selectAll('.selection_handle.start')
                .attr("x", x);

            chart.selectAll('.selection_handle.start.label')
                .attr("x", x - 5)
                .text('start: ' + t0.format('hh:mm'));
            chart.selectAll('.selection_handle.end.label')
                .attr("x", x + w + 5)
                .text('end: ' + t1.format('hh:mm'));
        };

        create_selection = function(x, w, selections, trigger_events) {

            if (typeof trigger_events === 'undefined') { trigger_events = true; }
            var t, t2;
            if(settings.merge_selection) {
                // new end x
                var x0 = x + w;
                // old end x
                var x1 = selection.x + selection.w;
                
                // r1: left=x, right=x0
                // r2: left=selection.x, right=x1

                if(!(selection.x > x0 || x1 < x)) {
                    // new x is the smallest x
                    var newX = Math.min(x, selection.x);
                    // new w is the largest w
                    var newW = Math.max(x0, x1)-newX;
                    x = newX;
                    w = newW;

                    // merge selection channels
                    $.each(selection.channels, function(index, channel) {
                        if(selections.indexOf(channel) == -1) {
                            selections.push(channel);
                        }
                    });
                }
            }

            clear_selection(false);

            selection.x = x;
            selection.w = w;
            selection.channels = selections;

            select_datasets(selection.channels);

            // Create a new selection rectangle, initially with width 1px.
            chart.append('rect')
                .attr('class', 'selection')
                .attr("y", 0)
                .attr("height", h)
                .attr("x", selection.x)
                .attr("width", selection.w);

            if(settings.handles) {
                // Draw left drag handle.
                chart.append('svg:image')
                    .attr("xlink:href", server_url + 'static/graphs/imgs/selection_handle.svg')
                    .attr('class', 'selection_handle start')
                    .attr("y", h / 2 - 10)
                    .attr("height", 20)
                    .attr("x", selection.x)
                    .attr("width", 10);
                
                t =  get_time_for_x(selection.x);
                t2 = get_time_for_x(selection.x+selection.w);
                
                // Add text at left of selection
                // chart.append('text')
                //     .attr('class', 'selection_handle start label')
                //     .attr("y", h / 2 - 30)
                //     .attr("x", selection.x - 5)
                //     .attr("fill", "black")
                //     .attr("text-anchor", "end")
                //     .text('start: ' + t.format('hh:mm'));
                
                // Draw right drag handle.
                chart.append('svg:image')
                    .attr("xlink:href", server_url + 'static/graphs/imgs/selection_handle.svg')
                    .attr('class', 'selection_handle end')
                    .attr("y", h / 2 - 10)
                    .attr("height", 20)
                    .attr("x", selection.x + selection.w - 10)
                    .attr("width", 10);

                // Add text at right of selection
                // chart.append('text')
                //     .attr('class', 'selection_handle end label')
                //     .attr("y", h / 2 - 30)
                //     .attr("x", selection.x + selection.w + 5)
                //     .attr("fill", "black")
                //     .attr("text-anchor", "start")
                //     .text('end: ' + t2.format('hh:mm'));


                // Add drag behaviour for handles.
                d3.selectAll('.selection_handle').call(drag_handle_behaviour);
            }

            if(trigger_events) {
                $(".chart").trigger("logger:click", {
                    'button':'create_selection', 
                    'params':{
                    }
                });
            }
            // enable_selection_click();
        };

        complete_selection = function(x, w, selections, points) {
            // x, w: inner selection
            // selx, selw: overall selection
            var datasets = fe.datastore.get_datasets();
            var channels = [];
            $.each(selections, function(index, selection) {
                channels.push(datasets[selection].name);
            });

            var all_channels = [];
            $.each(selection.channels, function(index, selection) {
                all_channels.push(datasets[selection].name);
            });
       }

        on_selection_click = function() {
            var event = {}, temp;

            if(d3.event) {
                d3.event.preventDefault();
            }
            var x = selection.x
            var w = selection.w

            event.start = get_time_for_x(x);
            event.end = get_time_for_x(x + w);
            
            if (event.start >= event.end) {
                temp = event.start;
                event.start = event.end;
                event.end = temp;
            }
            
            event.delta = event.end.getTime() - event.start.getTime();
            
            var pairs = [];
            // Store the selected channels.
            $.each(fe.datastore.get_datasets(), function(index, dataset) {
                if(dataset.selected) {
                    pairs.push({'sensor':{'id':dataset.sensor}, 'channel':{'id':dataset.channel}});
                }
            });

            event.pairs = pairs;
            if(settings.make_events) {
                fe.logger.eventdialog.show_event_dialog(event);
            }
        };
        
        enable_selection_click = function() {
            $(".selection").click(on_selection_click);
            chart.selectAll('.selection')
                .on('contextmenu', on_selection_click)
                .on('touchstart', on_selection_click)
                .on('click', on_selection_click);
        };

        on_event_click = function(event) {
            if(settings.make_events) {
                (function () {
                    fe.logger.eventdialog.show_event_dialog(event);
                }());
            }
        };

        select_datasets = function(selection) {
            var data_sets = fe.datastore.get_datasets();

            // Deselect everything
            $.each(data_sets, function(index, dataset) {
                dataset.selected = false;
            });
            
            // Select ones to show
            $.each(selection, function(index, value) {
                data_sets[value].selected = true;
            });
            d3.selectAll('path.linechart').classed("filtered", function(d,i) { return selection.indexOf(i) == -1; });
        };
        
        // interaction
        // create a new nested scope to avoid variables mess 
        setup_interaction = function () {
            var container = null,
                drag_behaviour = null,
                drag_handle_start,
                drag_handle_move,
                drag_handle_end,
                drag_handle_aux_behaviour = null;

            drag_handle_start = function () {
                
                d3.selectAll('.bgs').call(drag_handle_aux_behaviour);
                
                // find the bg container we are in
                d3.selectAll('.bgs').each(function () {
                    var cw, cx, bg_x, bg_w, bg_rhs, curr = d3.select(this);
                    cx = d3.mouse(this)[0];
                    bg_x = parseInt(curr.attr('x'), 10);
                    bg_w = parseInt(curr.attr('width'), 10);
                    bg_rhs = bg_x + bg_w;
                    if (cx >= bg_x && 
                            cx <= bg_rhs) {
                        container = curr;
                    }
                });
                
            };

            drag_handle_end = function () {
                d3.selectAll('.bgs').call(drag_behaviour);
            };

            drag_handle_move = function () {
                var bounds, x0, x1, w, t0, t1, dt, cntX, cntW, handle_x, handles_coords;
                
                // get the container horizontal bounds
                cntX = parseFloat(container.attr('x'));
                cntW = parseFloat(container.attr('width'));
                
                handle_x = parseFloat(d3.select(this).attr('x'));
                handles_coords = d3.selectAll('image.selection_handle')[0].map(function (d) {
                    return parseFloat(d3.select(d).attr('x'));
                });
                
                var newX = parseFloat(chart.select('.selection').attr('x'));

                if (handle_x === d3.max(handles_coords)) {
                    // right (end) handle
                    x0 = newX;
                    x1 = d3.mouse(this)[0];
                    // constrain x1 to the container (x0 is bound to be inside, 
                    // because that's a click event)
                    x1 = Math.max(cntX, Math.min(cntW + cntX, x1));
                } else {
                    // left (start) handle
                    w = parseFloat(chart.select('.selection').attr('width'));
                    
                    x0 = d3.mouse(this)[0];
                    x1 = newX + w;
                    
                    x0 = Math.max(cntX, Math.min(cntW + cntX, x0));
                }
                
                w = x1 - x0;
                
                if (w < 0) {
                    x0 = x1;
                    w = -w;
                }

                resize_selection(x0, w);
            };
            
            // based on https://github.com/mbostock/d3/wiki/Drag-Behavior

        
            var wrapped_selection_settings = function(selection_settings) {
                return {
                    'drag_start': function() {
                        selection.start = moment().format("YYYY-MM-DD HH:mm:ss");
                        selection_settings.drag_start(this);
                    },
                    'drag_end': function() {
                        selection.end = moment().format("YYYY-MM-DD HH:mm:ss");
                        selection_settings.drag_end(this);
                    },
                    'drag_move': function() {
                        selection_settings.drag_move(this);
                    }
                };
            };

            var hooks = wrapped_selection_settings(settings.selection);

            if(settings.enable_selection) {
                drag_behaviour = d3.behavior.drag()
                    .on("dragstart", hooks.drag_start)
                    .on("drag", hooks.drag_move)
                    .on("dragend", hooks.drag_end);
                
                d3.selectAll('.bgs').call(drag_behaviour);
            }
            
            drag_handle_behaviour = d3.behavior.drag()
                .on("dragstart", drag_handle_start)
                .on("dragend", drag_handle_end)
                .on("drag", drag_handle_move);
            
            drag_handle_aux_behaviour = d3.behavior.drag()
                .on("drag", drag_handle_move);
        };

        get_selection = function() {
            return selection;
        };

        get_selection_x = function() {
            return selection.x;
        };

        update_dates = function () {
            var range = fe.datastore.get_xrange();
            $('#id_fromField').datepicker('setDate', range[0]);
            $('#id_toField').datepicker('setDate', range[1]);
        };


        get_x_for_time = function(t) {
            return xSc(t);
        };
            
        get_time_for_x = function(x) {
            var t = xSc.invert(x);
            t.setMilliseconds(0);

            // round t to the closest sample (2 minutes)
            // TODO: make this flexible (not 2 minutes..)
            t.setMinutes(2 * ((t.getMinutes() + t.getSeconds() / 60) / 2).toFixed(0));
            return t;
        };
        
        toggle_suggestions = function () {
        	var show_suggestions = $("#show_suggestions_checkbox").is(':checked');
            if(Object.keys(fe.datastore.get_annotations()).length > 0) {
        	   draw_events(show_suggestions);
            }
            //$("#show_suggestions_checkbox").attr('checked', show_suggestions);
            //$("#hide_suggestions_checkbox").attr('checked', !show_suggestions);

        	setup_interaction();
        	return;
        };
        format_date = function (date) {
            
            var ye = date.getYear() + 1900,
                mo = date.getMonth() + 1,
                da = date.getDate(),
                ho = date.getHours(),
                mi = date.getMinutes(),
                se = date.getSeconds();
            if (mo < 10) {
                mo = '0' + mo;
            }
            if (da < 10) {
                da  = '0' + da;
            }
            if (ho < 10) {
                ho = '0' + ho;
            }
            if (mi < 10) {
                mi = '0' + mi;
            }
            if (se < 10) {
                se = '0' + se;
            }
            return ye + '-' + mo + '-' + da + ' ' + ho + ':' + mi + ':' + se;
        };

        get_colours = function() {
            return settings.colours;
        };

        load_data = function(callback) {
            $(".chart").spin();
            var params = fe.datepickerutils.parameters();
            var points_on_screen = 100;
            var second_diff = moment(params.end).diff(moment(params.start), 'seconds');
            params.sampling_interval = Math.round(second_diff / points_on_screen);
            $.getJSON( GROUP_URL, {
               start: format_date(params.start),
               end: format_date(params.end),
               sampling_interval: params.sampling_interval,
            }, function( loaded_data ) {
                sd_store.dataloader.load(params, function(data) {
                    var obj = {};
                    obj.readings = data;
                    obj.annotations = loaded_data.annotations;
                    obj.sensors = loaded_data.sensors;
                    $(".chart").spin(false);
                    fe.logger.plot.draw(obj);
                    if(callback) {
                        callback(obj);
                    }
                });
            });
        };

        set_selected_annotation = function(annotation) {
            selected_annotation = annotation;
            draw_events();
        };
        
        // export the API
        return {
            init: init,
            draw: draw,
            redraw: redraw,
            clear_selection: function(trigger_events) { clear_selection(trigger_events); },
            create_selection: function(x, w, selections, trigger_events) { create_selection(x, w, selections, trigger_events); },
            resize_selection: function(x, w) { resize_selection(x, w); },
            complete_selection: function(x, w, selections, points) { complete_selection(x, w, selections, points); },
            limit_bounds: function(container, x0, x1) { return limit_bounds(container, x0, x1); },
            enable_selection_click: function() { enable_selection_click(); },
            get_selection: function () { return get_selection(); },
            get_selection_x: function () { return get_selection_x(); },
            get_chart: function() { return get_chart(); },
            redraw_selection: function() { return redraw_selection(); },
            select_datasets: function(selection) { select_datasets(selection); },
            get_time_for_x: function(x) { return get_time_for_x(x); },
            get_x_for_time: function(t) { return get_x_for_time(t); },
            get_width: function() { return get_width(); },
            get_height: function() { return get_height(); },
            on_event_click: function(event) { return on_event_click(event); },
            filter_channels: function(state) { return filter_channels(state); },
            on_selection_click: function(event) { return on_selection_click(); },
            get_x_min: function() { return get_x_min(); },
            get_x_max: function() { return get_x_max(); },
            get_y_min: function() { return get_y_min(); },
            get_y_max: function() { return get_y_max(); },
            set_axis_channel: function(channel, left) { return set_axis_channel(channel, left); },
            load_data: function(callback) { return load_data(callback); },
            draw_events: function(suggestions) { return draw_events(suggestions); },
            draw_antievents: function() { return draw_antievents(); },
            get_colours: function() { return get_colours(); },
            set_selected_annotation: function(annotation) { set_selected_annotation(annotation); },
        };
    }());
});
