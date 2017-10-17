var fe;
if (!fe) {
	fe = {};
}

$(function () {
	'use strict';

	var m_dpu = null,
		m_eventdialog = null,
		m_plot = null,

		// functions
		draw,
		settings;

	var methods = {
		init: function (options) {

			var selector = this;
			m_dpu = fe.datepickerutils;
			console.log(m_dpu);
			m_eventdialog = fe.logger.eventdialog;
			m_plot = fe.logger.plot;

			settings = $.extend({
				antievents: true,
				handles: true,
				datepicker: true,
				make_events: true,
				enable_selection: true,
				selection: fe.logger.selection,
				annotation: fe.logger.annotation,
				merge_selection: true,
				ui: fe.logger.ui,
				draw_controls: true,
				enabled_annotation: 1,
				hide_unannotated: false,
				draw_xlabels: true,
				callback: undefined,
				axis_channel: 0,
				layers: [],
				colours: [
					"hsla(281,93%,79%,1)", // pink
					"hsla(0,82%,69%,1)", // light red
					"hsla(180,71%,56%,1)", // cyan
					"hsla(227,48%,68%,1)", // light blue
					"hsla(47,95%,53%,1)", // dark yellow
					"hsla(22,100%,67%,1)", // orange
					"hsla(46,100%,50%,1)", // light yellow
					"hsla(349,87%,38%,1)", // red
					"hsla(272,100%,50%,1)", // bright purple
					"hsla(129,71%,43%,1)", // green
					"hsla(0,0%,57%,1)", // grey
				],
			}, options);
			// http://aic-colour-journal.org/index.php/JAIC/article/viewFile/19/16

			fe.logger.plot.init(selector, settings);

			//-------------------------------------------------------

			$(window).resize(function () {
				fe.logger.plot.load_data();
			});

			$('.nav .logger').addClass('selected');

			// Set up the default date params for zoom/pan.
			var dfs = $('#date_from_server').val();
			var dts = $('#date_to_server').val();
			m_dpu.set_start_date(dfs);
			m_dpu.set_end_date(dts);

			if (settings.make_events) {
				m_eventdialog.setup_event_dialog();
			}

			var data_settings = {
				url: server_url + 'sd_store/',
				deployment_url: server_url + 'graphs/',
				data: true,
				sampling_interval: 60 * 60,
				annotations: false,
				deployment: DEPLOYMENT_ID,
			};

			fe.datepickerutils.init(data_settings);

			return this;
		},
		filterChannels: function (channels) {
			fe.logger.plot.filter_channels(channels);
			fe.logger.plot.redraw();
			fe.logger.plot.redraw_selection();
		},
		annotate: function () {
			fe.logger.plot.on_selection_click();
		},
		get_settings: function () {
			return settings;
		}
	};

	$.fn.logger = function (methodOrOptions) {
		console.log(methodOrOptions);
		if (methods[methodOrOptions]) {
			return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
			console.log(methods);
			return methods.init.apply(this, arguments);
		}
	};
});

