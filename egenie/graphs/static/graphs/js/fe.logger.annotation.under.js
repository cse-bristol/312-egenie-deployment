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

        api = {
            draw_events: function(annotations) {
                var plot = fe.logger.plot;
                var chart = plot.get_chart();
                
                // Filter to only those of the first dataset.
                // var dataset = plot.get_datasets()[0];
                // var annotations = plot.filter_annotations(annotations, dataset.sensor, dataset.channel);

                var handle_event_click = function(d) {
                    d3.event.preventDefault();
                    plot.on_event_click(d);
                }

                chart.selectAll('.event').remove();
                var eventNodes = chart.selectAll('.event')
                    .data(annotations);

                // Handle events
                var eventEnter = eventNodes.enter()
                    .append("g")
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
                    .on('contextmenu', handle_event_click)
                    .on('click', handle_event_click);

                // Create selection rectangle
                // eventEnter.append('rect')
                //     .attr("y", 0)
                //     .attr("height", 410)
                //     .attr("x", function(d) {
                //         var x0 = fe.logger.plot.get_x_for_time(d.start);
                //         var x1 = fe.logger.plot.get_x_for_time(d.end);
                //         return x0;
                //     })
                //     .attr("width", function(d) {
                //         var x0 = fe.logger.plot.get_x_for_time(d.start);
                //         var x1 = fe.logger.plot.get_x_for_time(d.end);
                //         return x1 - x0;
                //     });


                var data_sets = fe.datastore.get_datasets();
                // Add select paths where applicable.
                $.each(fe.datastore.get_datasets(), function(index, dataset) {
                    eventEnter
                        .filter(function(d,i) {
                            var match = false;
                            $.each(d.pairs, function(index, pair) {
                                if(pair.sensor.id == dataset.sensor && pair.channel.id == dataset.channel) {
                                    match = true;
                                }
                            });
                            return match;
                        })
                        .append("svg:path")
                        .attr('class', function (d) {
                            var c;
                            c = 'event';
                            return c + ' _' + d.id;
                        })
                        .attr("d", function (ev) {
                            var x0 = fe.logger.plot.get_x_for_time(ev.start);
                            var x1 = fe.logger.plot.get_x_for_time(ev.end);
                            var segment = fe.datastore.get_data_segment(x0, x1)[index];
                            var areaFunc = d3.svg.area()
                                .x(function (d) { return segment.xSc(d.t); })
                                .y0(410)
                                .y1(function (d) { return 410 - segment.ySc(d.value); });
                            return areaFunc(segment.data);
                        })
                        // .attr("stroke", "#fff")
                        // .style("stroke-dasharray", ("5, 5"))
                        .style("fill", dataset.colour)
                        .attr("opacity", "0.3");
                });
            }
        };

        return api;
    }());
});