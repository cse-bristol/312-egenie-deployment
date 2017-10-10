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
        var selections = [];

        api = {
            drag_start: function(instance) {
                selections = [];
                var plot = fe.logger.plot;
                // TODO: Pass through selected channels.
                var ds = fe.datastore.get_datasets();
                $.each(ds, function(index, dataset) {
                    if(dataset.visible) {
                        selections.push(index);
                    }
                });

        		plot.create_selection(d3.mouse(instance)[0], 2, selections, false);
        	},

            drag_move: function(instance) {
                var plot = fe.logger.plot;
                var bounds = plot.limit_bounds(d3.select(instance), plot.get_selection_x(), d3.mouse(instance)[0]);
                plot.resize_selection(bounds.x, bounds.w);
        	},

            drag_end: function(instance) {
                console.log("Drag end");
                var plot = fe.logger.plot;
                var bounds, x, w;
                bounds = plot.limit_bounds(d3.select(instance),  plot.get_selection_x(), d3.mouse(instance)[0]);
                x = bounds.x;
                w = bounds.w;
                
                // If width is too small, bail.
                if (w < 2 && w > -2) {
                    plot.clear_selection(true);
                    return;
                }

                plot.resize_selection(x, w);
                plot.enable_selection_click();

                var new_selection = selections.slice();
                plot.create_selection(x, w, selections, true);
        	}
        };

        return api;
    }());
});