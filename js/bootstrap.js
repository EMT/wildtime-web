

	

$(function(){
	
	wildtime.init();
	
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
	$('.menu-nav-item').on('click', function(e) {
		e.preventDefault();
		var $content = $('#' + $(this).data('contentId'));
		if ($content.css('display') === 'none') {
			$content.slideDown(300);
			$('header').css({position: 'absolute'});
		}
		else {
			$content.slideUp(300);
			$('header').css({position: 'fixed'});
		}
	});
	
	$('#content').on('click', '.links-list > li > a', function(e) {
		e.preventDefault();
		wildtime.transitions.toActivityNav($(this).data('timeframeId'));
	});
	
	$('#content').on('click', '#back-to-timeframes', function(e) {
		e.preventDefault();
		wildtime.transitions.toTimeframeNav();
	});
	$('#content').on('swipeRight', '#activities-nav', function(e) {
		wildtime.transitions.toTimeframeNav();
	});
	$('#content').on('click', '#back-to-activities', function(e) {
		e.preventDefault();
		wildtime.transitions.toActivityNav(wildtime.current_timeframe.id);
	});
	
	$('#content').on('click', '.links-sub-list > li > a', function(e) {
		e.preventDefault();
		wildtime.transitions.toActivities($(this).data('timeframeId'), $(this).data('activityId'));
	});
	$('#content').on('swipeLeft', '#activities-nav', function(e) {
		wildtime.transitions.toActivities(wildtime.current_timeframe.id);
	});
	
    $('#wt-logo').on('click', function(e) {
        e.preventDefault();
        wildtime.showNav();
    });
/*
	$('#content').on('click', '#back-to-timeframe', function(e) {
		e.preventDefault();
		wildtime.showNav();
	});
*/
	
	$('#content').on('click', '#activity-next', function(e) {
		e.preventDefault();
		wildtime.nextActivity();
	});
	$('#content').on('swipeLeft', '.activity-slider', function(e) {
		wildtime.nextActivity();
	});
	
	$('#content').on('click', '#activity-prev', function(e) {
		e.preventDefault();
		wildtime.prevActivity();
	});
	$('#content').on('swipeRight', '.activity-slider', function(e) {
		if (wildtime.current_activity_index > 0) {
			wildtime.prevActivity();
		}
		else {
			wildtime.transitions.toActivityNav(wildtime.current_timeframe.id);
		}
	});
	
	fixSvgHeights();
	
});



var wildtime = {

	//url_base: 'http://api.wildtime.dev',
	url_base: 'http://wtapi.madebyfieldwork.com',
	
	timeframes: null,
	current_timeframe: null,
	current_activity_index: null,
	current_activity_id: null,
	
	init: function() {
		wildtime.loadTimeframes(function() {
			wildtime.initTimeframesNav();
			wildtime.initActivitiesNav();
			wildtime.initActivities();
			wildtime.initState();
		});
	},
	
	initTimeframesNav: function() {
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
		$('#timeframes-nav').html(template(context));
	},
	
	initActivitiesNav: function() {
		var template = Handlebars.compile($('#template-timeframe-back-link').html());
		var html = template({});
		template = Handlebars.compile($('#template-sub-links-list').html());
		var context;
		for (var i in wildtime.timeframes) {
			context = {
				id: wildtime.timeframes[i].id,
				activities: wildtime.timeframes[i].activities
			};
			html += template(context);
		}
		$('#activities-nav').html(html);
	},
	
	initActivities: function() {
		var back_btn_template = Handlebars.compile($('#template-activity-back-link').html());
		var activity_slider_nav = Handlebars.compile($('#template-activity-slider-nav').html());
		var slider_template = Handlebars.compile($('#template-activity-slider').html());
		var activity_template = Handlebars.compile($('#template-activity').html());
		var html = back_btn_template({}), activities_html;
		for (var i in wildtime.timeframes) {
			activities_html = '';
			for (var ii = 0, len = wildtime.timeframes[i].activities.length; ii < len; ii ++) {
				activities_html += activity_template(wildtime.timeframes[i].activities[ii]);
			}
			html += slider_template({
				timeframe_id: wildtime.timeframes[i].id, 
				activities_html: activities_html
			});
		}
		html += activity_slider_nav({});
		$('#activities-container').html(html);
		wildtime.initActivitySliders();
	},
	
	initState: function() {
		$('#timeframes-nav').css({height: Math.max($('#timeframes-nav .links-list').height(), window.innerHeight)});
	},
	
	initActivitySliders: function() {
		$('.activity-slider').each(function() {
			var $items = $(this).find('.activity');
			$(this).css({width: (100 * $items.length) + '%'});
			$items.css({width: (100 / $items.length) + '%', float: 'left'});
		});
	},
	
	
	

	loadTimeframes: function(callback) {
		var cb = function(data) {
			wildtime.timeframes = data.timeframes;
			if (callback) {
				callback();
			}
		};
		wildtime.getTimeframes(cb);
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
	
	goToActivity: function(activity_id, no_animation) {
		var $current = $('#activity-' + wildtime.current_activity_id);
		var index = $('#activity-' + activity_id).index();
		var activity = wildtime.current_timeframe.activities[index];
		var offset = index * (-100 / wildtime.current_timeframe.activities.length);
		$('#activity-' + activity_id + ' img').css({visibility: 'visible'});
		wildtime.matchContentHeight($('#activity-' + activity_id), 111);
		if (no_animation) {
			$('#activity-slider-' + activity.timeframe_id).css({'-webkit-transform': 'translate3d(' + offset + '%,0,0)'});
			$current.find('img').css({visbilility: 'hidden'});
		}
		else {
			$('#activity-slider-' + activity.timeframe_id).animate({'-webkit-transform': 'translate3d(' + offset + '%,0,0)'}, 300, 'ease-out', function() {
				$current.find('img').css({visbilility: 'hidden'});
			});
		}
		wildtime.current_activity_index = index;
		wildtime.current_activity_id = activity_id;
	},
	
	getTimeframes: function(callback) {
		$.getJSON(wildtime.url_base + '/timeframes.jsonp?with=Activities&callback=?', function(data) {
			callback(data);
		});
	},

	transitions: {
	
		toTimeframeNav: function() {
			wildtime.matchContentHeight($('#timeframes-nav .links-list'));
			$('#content').animate({'-webkit-transform': 'translate3d(0,0,0)'}, 240, 'ease-out');
		},
		
		toActivityNav: function(timeframe_id) {
			wildtime.matchContentHeight($('#timeframe-nav-' + timeframe_id));
			if (wildtime.current_timeframe && timeframe_id !== wildtime.current_timeframe.id) {
				$('#timeframe-nav-' + wildtime.current_timeframe.id).css({'-webkit-transform': 'translate3d(0,-999em,0)'});
				$('#activity-slider-' + wildtime.current_timeframe.id).css({'-webkit-transform': 'translate3d(0,-999em,0)'});
			}
			if (!wildtime.current_timeframe || timeframe_id !== wildtime.current_timeframe.id) {
				$('#timeframe-nav-' + timeframe_id).css({'-webkit-transform': 'translate3d(0,0,0)'});
				$('#activity-slider-' + timeframe_id).css({'-webkit-transform': 'translate3d(0,0,0)'});
				wildtime.current_timeframe = wildtime.timeframes[timeframe_id];
			}
			$('#content').animate({'-webkit-transform': 'translate3d(-25%,0,0)'}, 240, 'ease-out');
		},
		
		toActivities: function(timeframe_id, activity_id) {
			$('#content').animate({'-webkit-transform': 'translate3d(-50%,0,0)'}, 240, 'ease-out');
			wildtime.current_timeframe = wildtime.timeframes[timeframe_id];
			if (!activity_id) {
				activity_id = wildtime.current_timeframe.activities[0].id;
			}
			wildtime.goToActivity(activity_id, true);
		}
			
	},
	
	matchContentHeight: function($to_this, add_this) {
		add_this = (add_this) ? add_this : 0;
		$('#content').css({height: Math.max($to_this.height(), window.innerHeight) + add_this});
	}
	
}


Handlebars.registerHelper('paragraphs', function(text) {
  return '<p>' + text.replace("\n\r", "\n").replace("\n", '<\p><p>') + '</p>';
});



;(function ($) {
  $.fn.slideDown = function (duration, callback) {    
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
	
	var self = this;
	var cb = function() {
		self.css({height: 'auto'});
		if (callback) {
			callback();
		}
	};
	
    // animate to gotten height
    this.animate({
      height: height
    }, duration, 'ease-out', cb);
  };
})(Zepto);

;(function ($) {
  $.fn.slideUp = function (duration, callback) {
  	var height = this.css('height');  
    this.css({
    	overflow: 'hidden',
    	height: this.height()
    });
	var cb = function() {
		if (callback) {
			callback();
		}
	};
    this.animate({
      height: 0
    }, duration, 'ease-out', function() {
	    $(this).hide().css({height: height});
	    cb();
    });
  };
})(Zepto);


zeptoScroll = function(endY, duration) {
    endY = endY || ($.os.android ? 1 : 0);
    duration = duration || 200;

    var startY = document.body.scrollTop,
        startT  = +(new Date()),
        finishT = startT + duration;

    var interpolate = function (source, target, shift) { 
        return (source + (target - source) * shift); 
    };

    var easing = function (pos) { 
        return (-Math.cos(pos * Math.PI) / 2) + .5; 
    };

    var animate = function() {
        var now = +(new Date()),
            shift = (now > finishT) ? 1 : (now - startT) / duration;

        window.scrollTo(0, interpolate(startY, endY, easing(shift)));

        (now > finishT) || setTimeout(animate, 15);
    };

    animate();
};


function fixSvgHeights() {
	$('img[src*="svg"]').each(function() {
		fixSvgHeight(this);
	});
}

function fixSvgHeight(el) {
	$(el).one('load', function() {
		var settings = {
			position: $(el).css('position'),
			top: $(el).css('top'),
			display: $(el).css('display')
		}
		$(el).css({position: 'absolute', top: '-999em', display: 'block'});
		var w = $(el).width(),
			h = $(el).height(),
			ratio = w / h;
		$(el).css({position: settings.position, top: settings.top, display: settings.display, width: (w / ratio) + 'px'});
		$(el).css({width: Math.floor(w / ratio) + 'px'});
		$(el).css({width: Math.floor(w) + 'px'});
	}).each(function() {
		if (this.complete) {
			$(this).trigger('load');
		}
	});
	
}




