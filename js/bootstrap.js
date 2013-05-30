

	

$(function(){
	
	wildtime.loadTimeframes();
	
	$('#content').on('click', '.links-list > li > a', function(e) {
		e.preventDefault();
		var $sublist = $(this).siblings('.links-sub-list');
		if ($sublist.css('display') === 'none') {
			$sublist.slideDown(500);
		}
		else {
			$sublist.slideUp(500);
		}
	});
	
	$('#content').on('click', '.links-sub-list > li > a', function(e) {
		e.preventDefault();
		var timeframe_id = $(this).parents('li').data('timeframeId');
		var activity_id = $(this).attr('href').split('/')[3];
		wildtime.showActivities(wildtime.timeframes[timeframe_id], activity_id);
	});
	
	$('#content').on('click', '#back-to-timeframe', function(e) {
		e.preventDefault();
		// TODO
	});
	
	$('#content').on('click', '#activity-next', function(e) {
		e.preventDefault();
		wildtime.nextActivity();
	});
	
});



var wildtime = {

	//url_base: 'http://api.wildtime.dev',
	url_base: 'http://wtapi.madebyfieldwork.com',
	
	timeframes: null,
	current_activity_id: 0,

	loadTimeframes: function() {
		var callback = function(data) {
			wildtime.timeframes = data.timeframes;
			wildtime.initNav();
		};
		wildtime.getTimeframes(callback);
	},
	
	initNav: function() {
		var context = {
			items: []
		}
		for (var i in wildtime.timeframes) {
			context.items.push({
				url: '/timeframes/' + i + '/activities',
				text: wildtime.timeframes[i].human,
				activities: wildtime.timeframes[i].activities
			});
		}
		var template = Handlebars.compile($('#template-links-list').html());
		$('#content').html(template(context));
	},
	
/*
	loadActivities: function(activity_id) {
		var callback = function(data) {
			var template = Handlebars.compile($('#template-activity-back-link').html());
			$('#content').html(template(data.activity.timeframe));
			
			template = Handlebars.compile($('#template-activity-slider').html());
			$('#content').append(template({}));
		}
		wildtime.nextActivity(activity_id, callback);
	},
*/

	showActivities: function(timeframe, activity_id) {
		var template = Handlebars.compile($('#template-activity-back-link').html());
		$('#content').html(template(timeframe));
		template = Handlebars.compile($('#template-activity-slider').html());
		$('#content').append(template({}));
		wildtime.initActivities(timeframe);
	},
	
	initActivities: function(timeframe) {
		var html = '', template;
		for (var i = 0, len = timeframe.activities.length; i < len; i ++) {
			template = Handlebars.compile($('#template-activity').html());
			html += template(timeframe.activities[i]);
		}
		$('#activity-slider').html(html);
	},
	
	nextActivity: function(activity_id, callback) {
		wildtime.appendActivity(timeframe);
	},
	
	appendActivity: function(data) {
		var template = Handlebars.compile($('#template-activity').html());
		$('#activity-slider').append(template(data.activity));
	},
	prependActivity: function(data) {
		var template = Handlebars.compile($('#template-activity').html());
		$('#activity-slider').prepend(template(data.activity));
	},
	
/*
	loadActivities: function(timeframe_id) {
		var callback = function(data) {
			var context = {
				items: []
			}
			for (var i in data.activities) {
				context.items.push({
					url: '/activities/view/' + i,
					text: data.activities[i].title
				});
			}
			var template = Handlebars.compile($('#template-links-list').html());
			$('#content').html(template(context));
		};
		wildtime.getActivities(timeframe_id, callback);
	},
*/
	
	getTimeframes: function(callback) {
		$.getJSON(wildtime.url_base + '/timeframes.jsonp?with=Activities&callback=?', function(data) {
			callback(data);
		});
	}
	
/*
	getActivity: function(activity_id, callback) {
		$.getJSON(wildtime.url_base + '/activities/view/' + activity_id + '.jsonp?callback=?', function(data) {
			callback(data);
		});
	}
*/
	
/*
	getActivities: function(timeframe_id, callback) {
		$.getJSON(wildtime.url_base + '/timeframes/' + timeframe_id + '/activities.jsonp?callback=?', function(data) {
			callback(data);
		});
	}
*/
	
}



;(function ($) {
  $.fn.slideDown = function (duration) {    
    // get old position to restore it then
    var position = this.css('position');

    // show element if it is hidden (it is needed if display is none)
    this.show();

    // place it so it displays as usually but hidden
    this.css({
      position: 'absolute',
      visibility: 'hidden'
    });

    // get naturally height
    var height = this.height();

    // set initial css for animation
    this.css({
      position: position,
      visibility: 'visible',
      overflow: 'hidden',
      height: 0
    });

    // animate to gotten height
    this.animate({
      height: height
    }, duration, 'ease-out');
  };
})(Zepto);

;(function ($) {
  $.fn.slideUp = function (duration) {
  	var height = this.css('height');  
    this.css({
    	overflow: 'hidden',
    	height: this.height()
    });
    this.animate({
      height: 0
    }, duration, 'ease-out', function() {
	    $(this).hide().css({height: height});
    });
  };
})(Zepto);




