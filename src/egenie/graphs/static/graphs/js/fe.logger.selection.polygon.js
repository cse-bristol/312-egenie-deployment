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

        var get_poly_area = function(polygon) {
            var i, j, area = 0;
            j = polygon.length - 1;
            for(i=0; i<polygon.length; i++) {
                area = area + ((polygon[j][0] + polygon[i][0]) * (polygon[j][1] - polygon[i][1]));
                j = i;
            }
            return Math.abs(area/2);
        };

        var inside_poly = function(point, polygon) {
            var x = point.x, y = point.y;
            var inside = false;
            for(var i=0, j=polygon.length-1; i<polygon.length; j=i++) {
                var xi = polygon[i].x, yi = polygon[i].y;
                var xj = polygon[j].x, yj = polygon[j].y;
                var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
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
                console.log(points);

                var x_max = d3.max(points, function(d) { return d.x });
                var x_min = d3.min(points, function(d) { return d.x });

                var datasets = fe.datastore.get_datasets();
                console.log(datasets);

                var data_segment = fe.datastore.get_data_segment(x_min, x_max);
                console.log(data_segment);
                // Only add set if entirely in polygon
                var bounds = [-1,-1];

                var selections = [];

                $.each(data_segment, function(index, segment) {
                    if(!datasets[index].visible) {
                        console.log("Skip "+index);
                        return;
                    }
                    var continuous = true;
                    // To test for a continuous set of data points, we need
                    // to see if the data segment stays inside the polygon,
                    // without going outside and back in again.
                    // We assume we're outside at the start, in case the first
                    // point is inside.
                    var gone_outside = false;
                    var gone_inside = false;
                    var outside = true;
                    var inside = false;
                    var seg_bounds = [x_min, x_max];
                    console.log(points);
                    $.each(segment.data, function(index, point) {
                        var y = 410 - segment.ySc(point.value);
                        var x = segment.xSc(point.t);

                        if(inside_poly({'x':x, 'y':y}, points)) {
                            if(outside) {
                                console.log("gone inside");
                                gone_inside = true;
                                seg_bounds[0] = x;
                            }

                            if(gone_outside) {
                                continuous = false;
                            }

                            inside = true;
                            outside = false;
                        }
                        else {
                            if(inside) {
                                seg_bounds[1] = x;
                                console.log("gone outside");
                                gone_outside = true;
                            }
                            inside = false;
                            outside = true;
                        }
                    });
                    if(gone_inside) {
                        if(continuous) {
                            if(bounds[0] == -1 || seg_bounds[0] < bounds[0]) {
                                bounds[0] = seg_bounds[0];
                            }
                            if(bounds[1] == -1 || seg_bounds[1] > bounds[1]) {
                                bounds[1] = seg_bounds[1];
                            }
                            selections.push(index);
                        }
                    }
                });

                console.log("Selections:");
                console.log(selections);

                if(selections.length > 0) {
                    if(bounds[1] - bounds[0] > 2) {
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