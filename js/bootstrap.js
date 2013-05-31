

	

$(function(){
	
	wildtime.loadTimeframes();
	
	$('#menu-button').on('click', function(e) {
		e.preventDefault();
		var $menu = $('#menu');
		if ($menu.css('display') === 'none') {
			$menu.slideDown(300);
		}
		else {
			$menu.slideUp(300);
		}
	});
	
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
		wildtime.showNav();
	});
	
	$('#content').on('click', '#activity-next', function(e) {
		e.preventDefault();
		wildtime.nextActivity();
	});
	
	$('#content').on('click', '#activity-prev', function(e) {
		e.preventDefault();
		wildtime.prevActivity();
	});
	
});



var wildtime = {

	url_base: 'http://api.wildtime.dev',
	//url_base: 'http://wtapi.madebyfieldwork.com',
	
	timeframes: null,
	current_timeframe: null,
	current_activity_index: null,

	loadTimeframes: function() {
		var callback = function(data) {
			wildtime.timeframes = data.timeframes;
			wildtime.initNav();
		};
		wildtime.getTimeframes(callback);
	},
	
	initNav: function() {
		$('#content').html(wildtime.constructNav());
	},
	
	showNav: function() {
		var after = function() {
			if (wildtime.current_timeframe) {
				$('#timeframe-' + wildtime.current_timeframe.id + ' > a').trigger('click');
				$('html, body').animate({scrollTop: 100}, 300, 'ease-out');
			}
		}
		wildtime.transitionRight(wildtime.constructNav(), after);
	},
	
	constructNav: function() {
		var context = {
			items: []
		}
		for (var i in wildtime.timeframes) {
			context.items.push({
				id: wildtime.timeframes[i].id,
				url: '/timeframes/' + i + '/activities',
				text: wildtime.timeframes[i].human,
				activities: wildtime.timeframes[i].activities
			});
		}
		var template = Handlebars.compile($('#template-links-list').html());
		return template(context);
	},

	showActivities: function(timeframe, activity_id) {
		wildtime.current_timeframe = timeframe;
		var template = Handlebars.compile($('#template-activity-back-link').html());
		var html = template(timeframe);
		template = Handlebars.compile($('#template-activity-slider').html());
		html += template({});
		wildtime.transitionLeft(html, null, function() {wildtime.initActivities(timeframe); });
		if (activity_id) {
			wildtime.goToActivity(activity_id);
		}
	},
	
	initActivities: function(timeframe) {
		var html = '', template;
		for (var i = 0, len = timeframe.activities.length; i < len; i ++) {
			template = Handlebars.compile($('#template-activity').html());
			html += template(timeframe.activities[i]);
		}
		$('#activity-slider').html(html).css({width: (timeframe.activities.length * 100) + '%'});
		$('#activity-slider .activity').css({width: ((1 / timeframe.activities.length) * 100) + '%'});
	},
	
	nextActivity: function() {
		if (wildtime.current_activity_index < wildtime.current_timeframe.activities.length - 1) {
			wildtime.goToActivity(wildtime.current_timeframe.activities[wildtime.current_activity_index + 1].id);
		}
	},
	
	prevActivity: function() {
		if (wildtime.current_activity_index > 0) {
			wildtime.goToActivity(wildtime.current_timeframe.activities[wildtime.current_activity_index - 1].id);
		}
	},
	
	goToActivity: function(activity_id) {
		var index = $('#activity-' + activity_id).index();
		$('#activity-slider').animate({left: (-100*index) + '%'}, 300, 'ease-out');
		wildtime.current_activity_index = index;
	},
	
	appendActivity: function(data) {
		var template = Handlebars.compile($('#template-activity').html());
		$('#activity-slider').append(template(data.activity));
	},
	prependActivity: function(data) {
		var template = Handlebars.compile($('#template-activity').html());
		$('#activity-slider').prepend(template(data.activity));
	},
	
	getTimeframes: function(callback) {
		$.getJSON(wildtime.url_base + '/timeframes.jsonp?with=Activities&callback=?', function(data) {
			callback(data);
		});
	},
	
	getActivityIndex: function(timeframe, activity_id) {
		for (var i = 0, len = timeframe.activities.length; i < len; i ++) {
			if (timeframe.activities[i].id == activity_id) {
				return i;
			}
		}
		return null;
	},
	
	transitionLeft: function(new_content, post, pre) {
		//	Set the stage
		$('#content').css({width: '200%'});
		$('#content').html($('<div id="content-out" style="width: 50%; float: left;"></div>').append($('#content').html()));
		$('#content').append($('<div id="content-in" style="width: 50%; float: left;"></div>').html(new_content));
		if (pre) {
			pre();
		}
		//	Do the slide
		$('#content').animate({left: '-100%'}, 300, 'ease-out', function() {
			//	Tidy up
			$('#content-out').remove();
			$('#content').html($('#content-in').html()).css({width: '100%', left: 0});
			if (post) {
				post();
			}
		});
	},
	
	transitionRight: function(new_content, post, pre) {
		//	Set the stage
		$('#content').css({width: '200%', left: '-100%'});
		$('#content').html($('<div id="content-out" style="width: 50%; float: left;"></div>').append($('#content').html()));
		$('#content').prepend($('<div id="content-in" style="width: 50%; float: left;"></div>').html(new_content));
		if (pre) {
			pre();
		}
		//	Do the slide
		$('#content').animate({left: 0}, 300, 'ease-out', function() {
			//	Tidy up
			$('#content-out').remove();
			$('#content').html($('#content-in').html()).css({width: '100%', left: 0});
			if (post) {
				post();
			}
		});
	}
	
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
      visibility: 'hidden',
      left: 0,
      right: 0
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




