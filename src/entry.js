var $ = require('jquery');

module.exports = {
  getTableWithToken,
  getTableWithHoursData,
  getIntervalWithToken,
  getIntervalWithHoursData
};

function getIntervalWithToken(token, appURL, callback, translationDict) {
  fetchHours(token, appURL, function (hours) {
    callback(getTranslatedIntervals(hours, translationDict));
  });
}

function getTableWithToken(token, appURL, callback, translationDict) {
  getIntervalWithToken(token, appURL, function(intervals) {
    callback(getTableWithIntervals(intervals));
  }, translationDict);
}


function getTableWithHoursData(hours, translationDict) {
  return getTableWithIntervals(getTranslatedIntervals(hours, translationDict));
}


function getIntervalWithHoursData(hours, translationDict) {
  return getTranslatedIntervals(hours, translationDict, translationDict);
}


function getTranslatedIntervals(hours, translationDict) {
  var intervals = getIntervals(hours);
  translateIntervals(intervals, translationDict);
  return intervals;
}


function fetchHours(token, appURL, callback) {
	$.ajax({
		method: "GET",
		url: "https://graph.facebook.com/" + appURL,
		data : {
			access_token: token,
			fields: "hours"
		}
	})
	.done(function( msg ) {
    callback(msg.hours);
	})
	.fail(function( msg ) {
    console.error("Failed to fetch hours data", msg);
	})
}


function getIntervals(hours) {
	var days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
	var intervals = [];
	var prevInterval = {};
	for (var i = 0; i < days.length; i++) {
		var thisDay = getDayFromHours(hours, days[i]);
		if (!prevInterval.from) { //is this the first go?
			prevInterval = getNewInterval(thisDay);
		} else {
			if (thisDay.open === prevInterval.open &&
			 	thisDay.close === prevInterval.close) {
				prevInterval.to = thisDay.day;
			} else {
				intervals.push(prevInterval);
				prevInterval = getNewInterval(thisDay);
			}
		}
	}
	intervals.push(prevInterval);
  return intervals;
}	

//German {mon: "Mo", tue: "Di", wed: "Mi", thu: "Do", fri: "Fr", sat: "Sa", sun: "So"}
function translateIntervals(intervals, translation) {
  if (typeof translation == typeof undefined) return intervals;
	for (var i = 0; i < intervals.length; i++) {
		intervals[i].to = translation[intervals[i].to];
		intervals[i].from = translation[intervals[i].from];
	}
}

function getTableWithIntervals(intervals) {
	var $table = $(document.createElement('table'));
	$('#hours-tables').append($table);
	for (var i = 0; i < intervals.length; i++) {
		var $tr = $(document.createElement('tr'));
		var $tdLeft = $(document.createElement('td'));
		var $tdRight = $(document.createElement('td'));
		if (intervals[i].from !== intervals[i].to) {
			$tdLeft.html('<span class="days">' + intervals[i].from + " - " + intervals[i].to + ': </span>');
		} else {
			$tdLeft.html('<span class="days">' + intervals[i].from + ': </span>');
		}
		$tdRight.html('<span class="numbers">' + intervals[i].open + " - " + intervals[i].close + '</span>');
		$tr.append($tdLeft);
		$tr.append($tdRight);
		$table.append($tr);
	}
}

function getDayFromHours(hours, day) {
	var get_open = day + "_" + "1" + "_" + "open";
	var get_close = day + "_" + "1" + "_" + "close";
	return getNewDay(day, hours[get_open], hours[get_close]);
}

function getNewDay(day, open, close) {
	return {
		day: day,
		open: open,
		close: close
	};
}

function getNewInterval (day) {
	return {
		from: day.day,
		to: day.day,
		open: day.open,
		close: day.close,
	}
}
