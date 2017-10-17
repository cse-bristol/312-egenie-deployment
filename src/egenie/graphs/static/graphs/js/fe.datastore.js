var fe;
if (!fe) {
    fe = {};
}



$(function () {
    'use strict';
    if (!fe) {
        fe = {};
    }
    if (!fe.logger) {
        fe.logger = {};
    }


    function convolute(data, kernel, accessor){
        var kernel_center = Math.floor(kernel.length/2);
        var left_size = kernel_center;
        var right_size = kernel.length - (kernel_center-1);
        if(accessor == undefined){
            accessor = function(datum){
                return datum;
            }
        }

        function constrain(i,range){
            if(i<range[0]){
                i=0;
            }
            if(i>range[1]){
                i=range[1];
            }
            return i;
        }

        var convoluted_data = data.map(function(d,i){
            var s = 0;
            for(var k=0; k < kernel.length; k++){
                var index = constrain( ( i + (k-kernel_center) ), [0, data.length-1] ); 
                s += kernel[k] * accessor(data[index]);
            }
            return s;
        });


        return convoluted_data;
    }

    function normaliseKernel(a){
        function arraySum(a){
            var s = 0;
            for (var i =0;i<a.length;i++){
                s += a[i];
            }
            return s;
        }

        var sum_a = arraySum(a);
        var scale_factor = sum_a / 1;
        a = a.map(function(d){
            return d / scale_factor;
        })
        return a;
    }

    fe.datastore = (function() {
    	var api;
    
    	var data_sets = [];
    	var annotations = {};

    	var x_min = -1;
    	var x_max = -1;

    	var build_dataset,
    		get_data_segment,
    		filter_annotations,
    		get_annotations_for_pair,
    		get_datasets,
    		add_annotation,
    		add_dataset,
    		get_annotations,
    		clear,
    		load,
    		get_xrange,
            remove_annotation,
            lookup,
            lookup_channel;

    	get_xrange = function() {
    		return [x_min, x_max];
    	}

    	clear = function() {
    		data_sets = [];
    		annotations = {};
    	}

    	add_annotation = function(annotation) {
    		annotations[annotation.id] = annotation;
            annotations[annotation.id].start = moment(annotation.start);
            annotations[annotation.id].end = moment(annotation.end);
    	};

        remove_annotation = function(annotation) {
            delete annotations[annotation.id];
        };

    	add_dataset = function(dataset, colour) {
    		data_sets.push(build_dataset(dataset, colour))

            $.each(fe.datastore.get_datasets(), function(index, dataset) {
                if(x_min == -1 || dataset.x_min < x_min) {
                    x_min = dataset.x_min;
                }
                if(x_max == -1 || dataset.x_max > x_max) {
                    x_max = dataset.x_max;
                }
            });
    	};

        lookup = function(sensor_id, channel_id) {
            var found;
            $.each(data_sets, function(index, dataset) {
                if(dataset.channel == channel_id && dataset.sensor == sensor_id) {
                    found = dataset;
                }
            });
            return found;
        }

        lookup_channel = function(channel_id) {
            var found;
            $.each(data_sets, function(index, dataset) {
                if(dataset.channel == channel_id) {
                    found = dataset;
                }
            });
            return found;
        }

        build_dataset = function(data, colour) {
            var kernel = normaliseKernel( [0.1, 0.2, 0.3, 0.2, 0.1] );

            var dataset = {};
            dataset.y_max = Math.max(d3.max(data.readings, function(d) { return d.value; }), 0);
            dataset.y_max = Math.max(1.0, dataset.y_max);
            dataset.y_min = d3.min(data.readings, function(d) { return d.value; });
            dataset.x_max = data.readings[data.readings.length-1].t;
            dataset.x_min = data.readings[0].t;
            var rawdata = data.readings;
            // var smoothed = convolute(rawdata, kernel, function(datum) {
            //     return datum.value;
            // });
            // $.each(rawdata, function(index, datum) {
            //     datum.value = smoothed[index];
            // });
            dataset.data = rawdata;
            dataset.channel = data.channel.id;
            dataset.sensor = data.sensor.id;
            dataset.unit = data.channel.unit;

            // These properties are more for view purposes.
            dataset.colour = data.channel.colour;
            dataset.name = data.channel.name;
            // Whether there's a selected portion.
            dataset.selected = false;
            // Whether the dataset is actually visible on the graph.
            dataset.visible = true;


            var h = fe.logger.plot.get_height();
            var w = fe.logger.plot.get_width();
            dataset.ySc = d3.scale.linear().domain([0, 1.1*dataset.y_max]).range([0, h]);
            dataset.xSc = d3.time.scale().domain([dataset.x_min, dataset.x_max]).range([0, w]);

            return dataset;
        };

        load = function(data, settings, should_clear) {
            clear();
            console.log(data);
            $.each(data.annotations, function(index, annotation) {
                fe.datastore.add_annotation(annotation);
            });

            var pos = 0;
            $.each(data.readings, function(index, datum) {
                if(datum.readings.length > 0) {
                    fe.datastore.add_dataset(datum, data.colour);
                }
                pos++;
            });
        };

        get_data_segment = function(x0, x1) {
            var result = [];

            // TODO: Remove view requirement from here.
            var min_time = fe.logger.plot.get_time_for_x(x0);
            var max_time = fe.logger.plot.get_time_for_x(x1);
            var h = fe.logger.plot.get_height();
            var w = fe.logger.plot.get_width();
            $.each(data_sets, function(index, data_set) {
                var filtered_set = {};
                filtered_set.data = [];
                filtered_set.ySc = d3.scale.linear().domain([0, 1.1*data_set.y_max]).range([0, h]);
                filtered_set.xSc = d3.time.scale().domain([data_set.x_min, data_set.x_max]).range([0, w]);

                var first = true;
                $.each(data_set.data, function(index, entry) {
                    if(entry.t >= min_time && entry.t <= max_time) {
                        if(first) {
                            if(index > 0) {
                                filtered_set.data.push(data_set.data[index-1]);
                            }
                            first = false;
                        }
                        filtered_set.data.push(entry);
                    }
                });
                result.push(filtered_set);
            });
            return result;
        };

        filter_annotations = function(annotations, sensor_id, channel_id) {
            var result = [];
            $.each(annotations, function(k, annotation) {
                $.each(annotation.pairs, function(index, pair) {
                    if(pair.sensor.id == sensor_id && pair.channel.id == channel_id) {
                        if(result.indexOf(annotation) == -1) {
                            result.push(annotation);
                        }
                    }
                });
            });
            return result;
        };

        get_annotations_for_pair = function(sensor_id, channel_id) {
            return filter_annotations(annotations, sensor_id, channel_id);
        };


        get_datasets = function() {
            return data_sets;
        };

        get_annotations = function() {
        	return annotations;
        };

        // export the API
        return {
        	add_annotation: function(annotation) { add_annotation(annotation); },
        	add_dataset: function(dataset, colour) { add_dataset(dataset, colour); },
        	build_dataset: function(data, colour) { build_dataset(data, colour); },
            get_data_segment: function(x0, x1) { return get_data_segment(x0, x1); },
            get_datasets: function() { return get_datasets(); },
            get_annotations: function() { return get_annotations(); },
            filter_annotations: function(annotations, sensor_id, channel_id) { return filter_annotations(annotations, sensor_id, channel_id); },
            get_annotations_for_pair: function(sensor_id, channel_id) { return get_annotations_for_pair(sensor_id, channel_id); },
        	clear: function() { clear(); },
        	load: function(data, colours) { load(data, colours); },
        	get_xrange: function() { return get_xrange(); },
            remove_annotation: function(annotation) { return remove_annotation(annotation); },
            lookup: function(sensor_id, channel_id) { return lookup(sensor_id, channel_id); },
            lookup_channel: function(channel_id) { return lookup_channel(channel_id); },
        };
    }());
});