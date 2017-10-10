var fe;
$(function () {
    'use strict';
    if (!fe) {
        fe = {};
    }

    if (!fe.logger) {
        fe.logger = {};
    }

    fe.logger.selection = (function () {
        var dragstart, dragmove, dragend, api;

        var points = [];

        var point_distance = function(dataset, p) {
            var min_dist = -1;
            var best1, best2;
            var result = {};

            $.each(dataset.data, function(index, point) {
                if(index < dataset.data.length-1) {

                    var y1 = 410 - dataset.ySc(point.value);
                    var x1 = dataset.xSc(point.t);
                    var y2 = 410 - dataset.ySc(dataset.data[index+1].value);
                    var x2 = dataset.xSc(dataset.data[index+1].t);
                    var x0 = p.x;
                    var y0 = p.y;

                    var a = x0 - x1;
                    var b = y0 - y1;
                    var c = x2 - x1;
                    var d = y2 - y1;
                    var dot = a*c + b*d;
                    var len_sq = c*c + d*d;
                    var param = -1;
                    if(len_sq != 0) {
                        param = dot/len_sq;
                    }
                    var xx, yy;
                    if(param < 0) {
                        xx = x1;
                        yy = y1;
                    }
                    else if(param > 1) {
                        xx = x2;
                        yy = y2;
                    }
                    else {
                        xx = x1 + param * c;
                        yy = y1 + param * d;
                    }
                    var dx = x0 - xx;
                    var dy = y0 - yy;
                    var dist = Math.sqrt(dx*dx + dy*dy);
                    if(min_dist == -1 || dist < min_dist) {
                        min_dist = dist;
                        best2 = {'x':x2, 'y':y2};
                        best1 = {'x':x1, 'y':y1};
                    }
                }

            });

            result.dist = min_dist;
            result.p1 = {'x':best1.x, 'y':best1.y};
            result.p2 = {'x':best2.x, 'y':best2.y};

            return result;
        };


        var c_group, group;

        api = {

            drag_start: function(instance) {
               var plot = fe.logger.plot;
        	   points = [];
               // var parent = d3.select(this);
               group = plot.get_chart().append("svg:g");
            },

            drag_move: function(instance) {
                var rect = d3.select(instance);
                var pos = d3.mouse(rect.node());
                points.push({x:pos[0], y:pos[1]});

                var line = d3.svg.line()
                    .x(function (d) { return d.x})
                    .y(function (d) { return d.y});

                // // append data plot/path to svg
                group.append("svg:path")
                    .attr('class', "trace")
                    .attr("d", line(points.slice(-2)));

                // points = simplify(points);
        	},

            drag_end: function(instance) {
                group.remove();

                var rect = d3.select(instance);

                var all_points = points.slice();
                points = simplify(points);

                var x_max = d3.max(points, function(d) { return d.x });
                var x_min = d3.min(points, function(d) { return d.x });

                var datasets = fe.datastore.get_datasets();
                console.log(datasets);

                var data_segment = fe.datastore.get_data_segment(x_min, x_max);
                console.log(data_segment);
                // Only add set if entirely in polygon
                var bounds = [x_min, x_max];

                var selections = [];

                var THRESHOLD = 10;
                var min_dataset = -1;
                var min_dataset_dist = THRESHOLD;
                $.each(datasets, function(index, dataset) {
                    if(!dataset.visible) {
                        return;
                    }
                    var min_dist = THRESHOLD;
                    var match = true;
                    $.each(points, function(pt_index, point) {
                        var dst = point_distance(dataset, point);
                        if(dst.dist > THRESHOLD) {
                            match = false;
                        }
                        else {
                            if(dst.dist < min_dist) {
                                min_dist = dst.dist
                            }
                        }
                    });

                    if(match && min_dist < min_dataset_dist) {
                        min_dataset = index;
                        min_dataset_dist = min_dist;
                    }

                });

                console.log(min_dataset);
                console.log(min_dataset_dist);

                selections = [min_dataset];

                if(selections.length > 0) {
                    if(bounds[1] - bounds[0] > 2) {
                        console.log(points);
                        var new_selection = selections.slice();
                        fe.logger.plot.create_selection(bounds[0], bounds[1]-bounds[0], selections);
                        console.log("Done?");
                        fe.logger.plot.complete_selection(bounds[0], bounds[1]-bounds[0], new_selection, all_points);
            	    }
                    else {
                        fe.logger.plot.clear_selection();
                    }
                }
                else {
                    fe.logger.plot.clear_selection();
                }
            }
        };

        return api;
    }());
});