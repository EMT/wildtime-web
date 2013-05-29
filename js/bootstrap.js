

	

$(function(){
	
	
	
	
	
});



var wildtime = {

	loadTimefraames: functions() {
		var callback = function() {
			
		};
		getTimeframes(callback);
	},
	
	loadTimefraames: functions(timeframe_id) {
		var callback = function() {
			
		};
		getActivities(timeframe_id, callback);
	},
	
	getTimeframes: function(callback) {
		$.getJSON('http://wtapi.madebyfieldwork.com/timeframes.json?callback=?', function(data) {
			callback(data);
		});
	},
	
	getActivities: function(timeframe_id, callback) {
		$.getJSON('http://wtapi.madebyfieldwork.com/timeframes/' 
				+ timeframe_id + '/activities.json?callback=?', function(data) {
			callback(data);
		});
	}
	
}


