

	

$(function(){
	
	
	wildtime.loadTimeframes();
	
	
});



var wildtime = {

	url_base: 'http://api.wildtime.dev',
	//url_base: 'http://wtapi.madebyfieldwork.com',

	loadTimeframes: function() {
		var callback = function(data) {
			var context = {
				items: []
			}
			for (var i in data.timeframes) {
				context.items.push({
					url: '/activities/view/' + i,
					text: data.timeframes[i].human
				});
			}
		console.log(context.items);
			var template = Handlebars.compile($('#template-links-list').html());
			$('#content').html(template(context));
		};
		wildtime.getTimeframes(callback);
	},
	
	loadActivities: function(timeframe_id) {
		var callback = function(data) {
			
		};
		wildtime.getActivities(timeframe_id, callback);
	},
	
	getTimeframes: function(callback) {
		$.getJSON(wildtime.url_base + '/timeframes.jsonp?callback=?', function(data) {
			callback(data);
		});
	},
	
	getActivities: function(timeframe_id, callback) {
		$.getJSON(wildtime.url_base + '/timeframes/' + timeframe_id + '/activities.jsonp?callback=?', function(data) {
			callback(data);
		});
	}
	
}


