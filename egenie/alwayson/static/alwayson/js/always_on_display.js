$(function () {
    'use strict';
    var now = new Date(), parameters;

    now.setMinutes(0);
    now.setSeconds(0);

    parameters = {
        url: server_url + 'sdstore/',
        start: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        end: now,
        user: true, // this means "load by user"
        baseline: true,
        sensor: sensor_id,
        channels: ['electricity',],
        sampling_interval: 24 * 60 * 60,
    };

    //console.log(parameters.start, parameters.end);

    sd_store.dataloader.load(parameters, function (loaded_data) {

        var data = loaded_data[0],
            i;

        console.log('data loaded! (by individual sensor):', data);
        console.log(loaded_data);

        for (i = 1; i < data.data.length; i += 1) {
            data.data[i].prev_value = data.data[i - 1].value;
            data.data[i].t += 24 * 60 * 60 * 1000;
        }

        d3.select('.chart')
            .selectAll()
            .data(data.data.slice(0, -1))
            .enter()
            .append('div')
            .attr('class', 'daybox smallbox')
            .append('div')
            .attr('class', 'day panel panel-default')
            .append('div')
            .attr('class', 'panel-body')
            .html(function (d, i) {
                var html = '',
                    img = 'same',
                    date = new Date(d.t),
                    now = new Date(),
                    scale_factor = 24 * 60 * 60,
                    v1 = d.prev_value / 1000.0,
                    v2 = d.value / 1000.0,
                    unit = 'W';

                if (date.getDate() === (now.getDate())) {
                    //d3.time.format("<strong>Today (%a %e)</strong>")(date);
                    html += "<h1> Today (" + d3.time.format('%d %b')(date) + ")</h1>";
                } else {
                    html += "<h1>" + d3.time.format('%a %d %b')(date) + "</h1>";
                }

                html += '<p>Always on electricity use:</p>';

                if (v1 > 1000.0 || v2 > 1000.0) {
                    v1 /= 1000.0;
                    v2 /= 1000.0;
                    unit = 'kW';
                }

                if ((v2 - v1) > (v2 * 0.02)) {
                    html += '<div class="change up">went up <i class="fa fa-arrow-up"></i></div>';
                    html += '<div>From ' + v1.toFixed(2) + ' to ' + v2.toFixed(2) + ' ' + unit + '</div>';
                    html += '<div class="advice">Was something left on overnight?';
                } else if ((v1 - v2) > (v1 * 0.02)) {
                    html += '<div class="change down">went down <i class="fa fa-arrow-down"></i></div>';
                    html += '<div>From ' + v1.toFixed(2) + ' to ' + v2.toFixed(2) + ' ' + unit + '</div>';
                    html += '<div class="advice">Could you do this every night?</div>';
                }
                else {
                    html += '<div class="change same">stayed the same</div>';
                    html += '<div>From ' + v1.toFixed(2) + ' to ' + v2.toFixed(2) + ' ' + unit + '</div>';
                    html += '<div class="advice">(approximately)</div>';
                }
                return html;
            })


        $('.chart').isotope({
            // options
            itemSelector: '.daybox',
            layoutMode: 'fitRows'
        });

        $('.day').first().click(function () { document.location.reload(true); });
    });

});
