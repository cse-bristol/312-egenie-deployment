

var CALENDAR_TOP = '0px';
var CELL_HEIGHT = '20px';

function redraw_calendar(sensor_id, end) {

    // set the calendar month
    var start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 0, 0);
    var parameters = {
        url: server_url + 'sdstore/',
        start: start,
        end: end,
        sensor: sensor_id,
        user: false, // this means "load by user"
        data: true,
        channels: ['temperature',],
        sampling_interval: 60 * 60
    };

    $(".chart").empty();

    // update the calendar view to reflect the current month + year
    var calendarDate = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    $('.month-container').html(calendarDate);

    sd_store.dataloader.load(parameters, function (loaded_data) {
        console.log('data loaded! (by individual sensor):', loaded_data);
        var w, h,
            data = loaded_data[0].readings,
            day_res = 24,
            slot_w,
            slot_h,
            colorScale,
            first_t, last_t,
            start, end,
            delta,
            by_day,
            max_val, min_val,
            ticks,
            dataPadding;

        var start = moment(parameters.start).toDate();
        var end = moment(parameters.end).toDate();

        if (data.length === 0) {
            // if we have no data, just display a message and return
            d3.select('.chart').append("div")
                .html('Sorry, no data available at the moment. Please try again later.');
            return;
        }

        // TODO: Create new list of readings, one for each hour that we're expecting
        // Then fill in the values for those timestamps that actually exist.
        var expected = [];
        var current_time = moment(start);
        for (var i = 0; i < 192; i++) {
            expected.push({ 't': current_time.toDate(), 'value': null });
            current_time = moment(current_time);
            current_time.add(1, 'h');
        }
        var data_pos = 0;
        $.each(expected, function (index, datum) {
            if (data[data_pos] == undefined) {
                data_pos++;
            }
            else {
                ts = moment(data[data_pos]['t']).seconds(0).minutes(0);
                if (ts.isSame(moment(datum['t']))) {
                    datum['value'] = data[data_pos++]['value'];
                }
            }
        });

        data = expected;


        w = $(".chart-container").width();
        h = $(document).height() - 200;

        slot_w = Math.floor(w * 0.11);
        slot_h = Math.floor((h - 40) / day_res);

        // we define a colour scale for the data range we have
        // this creates a function that will be called later
        colorScale = d3.scale.linear()
            .domain([d3.min(data, function (d) { return d.value; }),
            d3.max(data, function (d) { return d.value; })])
            .range(["#ffffff", '#EF9F16']); // "#dd6666"

        // calculate the start and end timestamps of the calendar grid
        first_t = d3.min(data, function (d) { return d.t; });
        last_t = d3.max(data, function (d) { return d.t; });
        var actual_end = new Date(1900 + end.getYear(), end.getMonth(), end.getDate());
        // move the end forward by one day
        actual_end.setTime(actual_end.getTime() + (24 * 60 * 60 * 1000));
        //console.log('start', start);
        //console.log('end', end);

        // clear any existing stuff (in case of refresh)
        d3.select('.chart').select("div").remove();

        // set size and position of the .chart (the overall container)
        d3.select('.chart')
            .style('width', (w) + 'px')
            .style('height', (h - 20) + 'px')
            .style('top', CALENDAR_TOP)
            .style('left', (0.01 * w) + 'px');

        // top headers -- days
        // add a div to contain the entire top header
        d3.select('.chart').append("div")
            .attr("class", "days")
            .style('width', (0.88 * w) + 'px')
            .style('height', CELL_HEIGHT)
            .style('top', '0px')
            .style('left', (0.06 * w) + 'px');

        // add individual div-s for each day
        d3.select('.days').selectAll()
            .data(d3.range(8))
            .enter()
            .append('div')
            .attr('class', 'slotheader')
            .style('width', function (d) {
                return slot_w + 'px';
            })
            .style('left', function (d) {
                return (d * slot_w + 5) + 'px';
            })
            .html(function (d) {
                var date = new Date(start.getTime() + d * 24 * 60 * 60 * 1000);

                return d3.time.format("%a %e")(date);
            });

        // left headers and lines to indicate hours
        ticks = d3.range(0, 24, 4);//[8, 12, 18];
        d3.select('.chart').selectAll()
            .data(ticks)
            .enter()
            .append('div')
            .attr('class', 'slotheader')
            .style('text-align', 'right')
            .style('position', 'absolute')
            .style('left', (0.01 * w) + 'px')
            .style('top', function (d) {
                return (d * slot_h + 20 - 6) + 'px';
            })
            .html(function (d) {
                return d + ':00';
            })
            .append('div')
            .style('position', 'absolute')
            .style('left', (0.05 * w) + 'px')
            .style('width', (slot_w * 8) + 'px')
            .style('z-index', 2)
            .style('border-top', 'solid #777777 1px')
            .style('top', '6px');

        // pad the data to make it fit in a full 8 days grid

        // pad the beginning
        delta = Math.floor((first_t.getTime() - start.getTime()) / (60 * 60 * 1000) * (day_res / 24));
        if (delta > 0) {
            data = d3.range(delta).map(function () {
                return { t: '', value: null };
            }).concat(data);
        }


        // pad the end
        delta = Math.floor((end.getTime() - last_t.getTime()) / (60 * 60 * 1000) * (day_res / 24));
        if (delta > 0) {
            data = data.concat(d3.range(delta).map(function () {
                return { t: '', value: null };
            }));
        }

        // add a container for the entire grid
        d3.select('.chart').append("div")
            .attr("class", "calendar")
            .style('width', (slot_w * 8) + 'px')
            .style('height', (slot_h * day_res) + 'px')
            .style('top', '20px')
            .style('left', (0.06 * w) + 'px');

        // calculate min and max temperature of each day
        // split the data into days
        by_day = d3.nest()
            .key(function (d) {
                if (d.t !== '') {
                    return d.t.getDate();
                }
                return null;
            })
            .entries(data, d3.map);
        max_val = [];
        by_day.forEach(function (d) { max_val[d.key] = d3.max(d.values, function (x) { return x.value; }); });
        min_val = [];
        by_day.forEach(function (d) { min_val[d.key] = d3.min(d.values, function (x) { return x.value; }); });

        // draw the actual grid
        d3.select(".calendar")
            .selectAll()
            .data(data)
            .enter()
            .append("div")
            .attr("class", function (d) {
                return 'slot';
            })
            .style('background-color', function (d) {
                if (d.value !== null) {
                    return colorScale(d.value);
                }
                return '#cccccc';
            })
            .style('width', function (d) {
                return (slot_w - 1) + 'px';
            })
            .style('height', slot_h + 'px')
            .style('top', function (d, i) {
                var k = i % day_res;
                return (k * slot_h) + 'px';
            })
            .style('left', function (d, i) {
                var j = Math.floor(i / day_res);
                return (j * slot_w) + 'px';
            })
            .html(function (d, i) {
                if (d.value === null) {
                    return '&nbsp;';
                }
                if (d.value === max_val[d.t.getDate()]) {
                    return d.value.toFixed(1) + "&deg;";
                }
                if (d.value === min_val[d.t.getDate()]) {
                    return d.value.toFixed(1) + "&deg;";
                }
                return '&nbsp;';
            })
            .style('color', function (d, i) {
                if (d.value === null) {
                    return '';
                }
                if (d.value === max_val[d.t.getDate()]) {
                    return "#df6326";
                }
                if (d.value === min_val[d.t.getDate()]) {
                    return "#89B0D3";
                }
                return '';
            })
            .style('z-index', function (d) {
                if (d.value !== null) {
                    if ((d.value === max_val[d.t.getDate()]) ||
                        (d.value === min_val[d.t.getDate()])) {
                        return "1";
                    }
                    return 'auto';
                }
            });

        $('.slot').first().click(function () { document.location.reload(true); });
    });
}
$(function () {
    'use strict';

    $("#floorplan").on('marker_clicked', function (event, params) {
        redraw_calendar(params.data.id, end);
    });


});
