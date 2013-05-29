

	

$(function(){
	
	
	wildtime.loadTimeframes();
	
	$('#content').on('click', '.links-list a', function(e) {
		e.preventDefault();
		var $sublist = $(this).children('ul');
		if ($sublist.css('display') === 'none') {
			$(this).children('ul').slideDown();
		}
		else {
			$(this).children('ul').slideUp();
		}
	});
	
	
});



var wildtime = {

	//url_base: 'http://api.wildtime.dev',
	url_base: 'http://wtapi.madebyfieldwork.com',

	loadTimeframes: function() {
		var callback = function(data) {
			var context = {
				items: []
			}
			for (var i in data.timeframes) {
				context.items.push({
					url: '/timeframes/' + i + '/activities',
					text: data.timeframes[i].human,
					activities: data.timeframes[i].activities
				});
			}
			var template = Handlebars.compile($('#template-links-list').html());
			$('#content').html(template(context));
		};
		wildtime.getTimeframes(callback);
	},
	
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
	
	getTimeframes: function(callback) {
		$.getJSON(wildtime.url_base + '/timeframes.jsonp?with=Activities&callback=?', function(data) {
			callback(data);
		});
	},
	
	getActivities: function(timeframe_id, callback) {
		$.getJSON(wildtime.url_base + '/timeframes/' + timeframe_id + '/activities.jsonp?callback=?', function(data) {
			callback(data);
		});
	}
	
}


