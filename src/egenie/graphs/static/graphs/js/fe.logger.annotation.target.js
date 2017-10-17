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
            draw_events: function(annotations) {
                var plot = fe.logger.plot;
                var chart = plot.get_chart();
                chart.selectAll('.event').remove();
                var eventNodes = chart.selectAll('.event')
                    .data(annotations);

                // Handle events
                var eventEnter = eventNodes.enter()
                    .append("g");

                var data_sets = fe.datastore.get_datasets();

                // Add select paths where applicable.
                $.each(data_sets, function(index, dataset) {
                    if(!dataset.visible) {
                        return;
                    }
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
                        .attr("d", function (ev) {
                            var x0 = fe.logger.plot.get_x_for_time(ev.start);
                            var x1 = fe.logger.plot.get_x_for_time(ev.end);
                            var segment = fe.datastore.get_data_segment(x0, x1)[index];
                            var lineFunc = d3.svg.line()
                                .x(function (d) { return segment.xSc(d.t); })
                                .y(function (d) { return 410 - segment.ySc(d.value); });
                            return lineFunc(segment.data);
                        }).attr("class", "target");
                });
            }
        };

        return api;
    }());
});