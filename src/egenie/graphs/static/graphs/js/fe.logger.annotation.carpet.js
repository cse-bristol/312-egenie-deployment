var fe;
$(function () {
    'use strict';
    if (!fe) {
        fe = {};
    }

    if (!fe.logger) {
        fe.logger = {};
    }

    fe.logger.annotation = (function () {
        var draw_events, get_ids, api;
        var carpet;
        var selected_layer = null;

        get_ids = function (d) {
                    var ids = [];
                    // if (d.proxy) {
                    //     d = d.proxy;
                    // }
                    // ids = d.compr.map(function (x) {return x.id;});
                    ids.push(d.id);
                    ids = ids.map(function (x) {return '._' + x;});
                    if (ids.length > 1) {
                        ids = ids.reduce(function (x, y) {return x + ', ' + y;});
                    } else {
                        ids = ids[0];
                    }
                    return ids;
                };

        api = {
            get_selected_layer: function() {
              return selected_layer;
            },
            draw_events: function(annotations) {
                console.log("Redraw annotations");
                console.log(annotations);

                var plot = fe.logger.plot;
                var chart = plot.get_chart();
                var w = plot.get_width();
                var h = 150;
                var bar_h = 40;
                var font_size = 10;

                // Expand plot height to accommodate carpet
                d3.select("svg").attr("height", plot.get_height()+210);

                // Add carpet group
                carpet = chart.append("g")
                    .attr("transform", "translate(0,450)")
                    .attr("height", h)
                    .attr("width", w)
                    .attr("class","carpet");

                // Captuyre clicks and pass to plot
                var handle_event_click = function(d) {
                    d3.event.preventDefault();
                    plot.on_event_click(d);
                }

                // Parse date
                var parseDate = function(string) {
                    var d = moment(string);
                    return d;
                }

                // Remove existing events from rects
                carpet.selectAll('.event').remove();
                chart.selectAll('.event').remove();
                carpet.selectAll('.carpetevent').remove();

                // Create event per annotation (on plot)
                var chartEventNodes = chart.selectAll('.event')
                    .data(annotations);

                // Handle event events (on plot)
                var eventEnter = chartEventNodes.enter()
                    .append("g")
                    .on('contextmenu', handle_event_click)
                    .on('click', handle_event_click);

                // Set up carpet
                var layers = [
                    {
                      "ref": 1,
                      "name": "",
                      "colour": "#990000"
                    },
                    {
                      "ref": 2,
                      "name": "",
                      "colour": "#009900"
                    },
                    {
                      "ref": 3,
                      "name": "",
                      "colour": "#000099"
                    }
                  ];

                var groups = carpet.selectAll(".carpetrow")
                    .data(layers)
                    .enter()
                    .append("g");

                // Add background rectangles to carpet
                groups.append("rect")
                    .attr("class", "carpetrow")
                    .attr("x", 0)
                    .attr("y", function(layers, i) {
                        return i*bar_h;
                    })
                    .attr("width", w)
                    .attr("height", function(layers, i) {
                        return bar_h;
                    })
                    .attr("fill", function(layers) {
                        return layers.colour;
                    })
                    .style("opacity", 0.3)
                    .on('click', function (layer, i) {
                        selected_layer = layer;
                        d3.selectAll('.carpetrow').style("opacity", 0.3);
                        d3.select(this).style("opacity", 1);
                        fe.logger.plot.draw_antievents();
                    });

                if(selected_layer == null) {
                    console.log("First time");
                    selected_layer = layers[0];
                }

                var selected_row = $(".carpetrow")[selected_layer.ref-1];
                // TODO: Put this into a separate function
                d3.selectAll('.carpetrow').style("opacity", 0.3);
                d3.select(selected_row).style("opacity", 1);
                // Add titles to rectangles
                groups.append("text")
                    .attr("x", -3)
                    .attr("y", function(layers, i) {
                        var y_top = (i*bar_h);
                        var padding = (bar_h-font_size)/2;
                        return y_top+bar_h-padding;
                    })
                    .text(function(d) {
                        return d.name;
                    })
                    .attr("font-family", "sans-serif")
                    .attr("font-size", font_size+"px")
                    .attr("fill", "black")
                    .style("text-transform", "uppercase")

                    .attr("text-anchor", "end");

                    // Add annotations
                    var carpetEventNodes = carpet.selectAll('.event')
                        .data(annotations);

                    // Handle events
                    var carpetEnter = carpetEventNodes.enter()
                        .append("g")
                        .append("rect")
                        .attr('class', function (d) {
                            var c;
                            c = 'carpetevent'
                            return c+' _' + d.id;
                        })
                        .attr("x", function(d) {
                            console.log("Got a rect");
                            var x0 = fe.logger.plot.get_x_for_time(parseDate(d.start) );
                            return x0;
                        })
                        .attr("fill", "#000")
                        .style('opacity', 0.4)
                        .attr("height", bar_h)
                        .attr("y", function(d) {
                            return (d.layer-1)*bar_h;
                        })
                        .attr("width", function(d) {
                            var x0 = fe.logger.plot.get_x_for_time(parseDate(d.start));
                            var x1 = fe.logger.plot.get_x_for_time(parseDate(d.end));
                            var segment = fe.datastore.get_data_segment(x0, x1)[0];
                            return x1 - x0;
                        })
                        .on('mouseover', function (d) {
                            var ids = get_ids(d);
                            d3.selectAll(ids).classed('highlight', true);
                            return;
                        })
                        .on('mouseout', function (d) {
                            var ids = get_ids(d);
                            d3.selectAll(ids).classed('highlight', false);
                            return;
                        })
                        .on('contextmenu', function () { return null; })
                        .on('click', function (e) {
                            displayAnnotation(e);
                            return null;
                        });

                    //
                    // Plot overlay bit
                    //

                var chartEventNodes = chart.selectAll('.event')
                    .data(annotations);

                // Handle events
                var eventEnter = chartEventNodes.enter()
                    .append("g")

                    .on('contextmenu', handle_event_click)
                    .on('click', handle_event_click);

                // Create selection rectangle
                eventEnter.append('rect')
                    .attr('class', function (d) {
                        var c;
                        c = 'event';
                        return c + ' _' + d.id;
                    })
                    .style("fill", "#005a63")
                    .style("stroke", "white")
                    .attr("y", 0)
                    .attr("height", plot.get_height())
                    .attr("x", function(d) {
                        var x0 = fe.logger.plot.get_x_for_time(parseDate(d.start));
                        var x1 = fe.logger.plot.get_x_for_time(parseDate(d.end));
                        var segment = fe.datastore.get_data_segment(x0, x1)[0];
                        return x0;
                    })
                    .attr("width", function(d) {
                        var x0 = fe.logger.plot.get_x_for_time(parseDate(d.start));
                        var x1 = fe.logger.plot.get_x_for_time(parseDate(d.end));
                        var segment = fe.datastore.get_data_segment(x0, x1)[0];
                        return x1 - x0;
                    });

            }
        };

        return api;
    }());
});