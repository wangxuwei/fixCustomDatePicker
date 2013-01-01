var brite = brite || {};
brite.ex = brite.ex || {};

(function($) {
	// --------- Component Interface Implementation --------- //

	function DateSelect() {
	}

	brite.ex.DateSelect = DateSelect;
	
	var _calendarCount = 2;
	var _callBack, _closeCallBack;
	var $target;

	DateSelect.prototype.build = function(data, config) {
		var data = data || {};
		$target = data.$target;
		var position = $(data.$target).offset();
		var $html = $($("#tmpl-DateSelect").render({}));
		$("body").append("<div id='transparentScreen'></div>");
		$html.css("left", position.left + "px");
		$html.css("top", position.top + "px");
		return $html;
	}
	
	DateSelect.prototype.postDisplay = function(data, config) {
		var thisC = this;
		var $e = this.$element;
		var now = new Date();
		
		this.currentYear = now.getFullYear();
		this.currentMonth = now.getMonth();
		
		showCalendars.call(thisC);
		$("body").find("#transparentScreen").click(function() {
			thisC.close();
		});
		$e.delegate(".navbuts .navbut", "click", function() {
			var $ico = $(this);
			var action = $ico.attr("data-action");
			if (action == "prev") {
				thisC.currentMonth--;
			} else {
				thisC.currentMonth++;
			}
			showCalendars.call(thisC);
		});

		$e.delegate("table.DateSelect-calendar-table td.calendar-date", "click", function() {
			var $td = $(this);
			// alert($td.attr("data-value"))
			var date = $td.attr("data-value")
			// var date = new Date(Date.parse($td.attr("data-value")));
			$($target).val(date)
			$($target).trigger("change")
			if (typeof _callback != "undefined" && $.isFunction(_callback)) {
				_callback(date);
			}
			thisC.close(true);
		});
		$e.delegate(".DateSelect-buttons .button.close", "click", function() {
			thisC.close();
		});

	}
	
	
	// --------- /Component Interface Implementation --------- //
	
	// --------- Component Public Methods --------- //

	DateSelect.prototype.onChange = function(callback) {
		_callback = callback;
	}

	DateSelect.prototype.onClose = function(closeCallback) {
		_closeCallback = closeCallback;

	}

	DateSelect.prototype.close = function(selected) {
		if (!selected) {
			if (typeof _closeCallback != "undefined" && $.isFunction(_closeCallback)) {
				_closeCallback();
			}
		}

		this.$element.bRemove();
		$("body").find("#transparentScreen").remove();
	}

	// --------- /Component Public Methods --------- //
	
	// --------- Component Private Methods --------- //
	function showCalendars(calendars) {
		var thisC = this;
		var $e = this.$element;
		var $content = $e.find(".DateSelect-content");
		$content.empty();

		var calendars = getCalendars.call(thisC);
		for ( var i = calendars.length - 1; i >= 0; i--) {
			var $calendar = $("#tmpl-DateSelect-calendar").render(calendars[i]);
			$content.append($calendar);
		}

		// select$td.call(thisC,thisC.startDate,thisC.endDate);
	}

	function getCalendars(calendarCount) {
		var currentYear = this.currentYear;
		var currentMonth = this.currentMonth;
		if (typeof calendarCount == 'undefined') {
			calendarCount = _calendarCount;
		}
		var calendars = [];
		for ( var index = 0; index < calendarCount; index++) {
			var calendar = {};
			var firstDateOfMonth = new Date();
			firstDateOfMonth.setFullYear(currentYear);
			firstDateOfMonth.setMonth(currentMonth - index);
			firstDateOfMonth.setDate(1);
			firstDateOfMonth.setHours(0);
			firstDateOfMonth.setMinutes(0);
			firstDateOfMonth.setSeconds(0);
			var endDateOfMonth = new Date(firstDateOfMonth * 1);
			endDateOfMonth.setMonth(firstDateOfMonth.getMonth() + 1);
			endDateOfMonth.setDate(0);

			var weeks = [];
			var week = new Array(7);
			for ( var i = 0; i < endDateOfMonth.getDate(); i++) {
				var date = new Date(firstDateOfMonth * 1 + i * 24 * 60 * 60 * 1000);
				week[date.getDay()] = date;
				if (date.getDay() % 7 == 6) {
					weeks.push(week);
					week = new Array(7);
				}
			}
			weeks.push(week);
			if (weeks.length < 6) {
				weeks.push(new Array(7));
			}

			calendar.year = firstDateOfMonth.getFullYear();
			calendar.month = firstDateOfMonth.getMonth();
			calendar.monthLabel = brite.ex.formatMonth(calendar.month);
			calendar.weeks = weeks;			
			calendars.push(calendar);

		}

		// reinit year and month
		var newDate = new Date();
		newDate.setFullYear(this.currentYear);
		newDate.setMonth(this.currentMonth);
		this.currentYear = newDate.getFullYear();
		this.currentMonth = newDate.getMonth();
		return calendars;
	}
	brite.ex.formatMonth = function(month, p) {
		var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		if (p == "medium") {
			return months[month].substring(0, 3);
		}
		return months[month];
	}

	brite.ex.formatDate = function(date, pattern) {
		if (typeof pattern == "undefined") {
			pattern = "yyyy-MM-dd";
		}
		var o = {
			"M+" : date.getMonth() + 1, // month
			"d+" : date.getDate(), // day
			"h+" : date.getHours(), // hour
			"m+" : date.getMinutes(), // minute
			"s+" : date.getSeconds(), // second
			"q+" : Math.floor((date.getMonth() + 3) / 3), // quarter
			"S" : date.getMilliseconds()
		// millisecond
		}
		var str = "";
		var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		if (pattern.toLowerCase() == "long") {
			str = months[date.getMonth()] + " " + date.getDate() + "," + date.getFullYear();
		} else if (pattern.toLowerCase() == "medium") {
			str = months[date.getMonth()].substring(0, 3) + " " + date.getDate() + "," + date.getFullYear();
		} else {
			str = pattern;
			if (/(y+)/.test(str)) {
				str = str.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
			}

			for ( var k in o) {
				if (new RegExp("(" + k + ")").test(str)) {
					str = str.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
				}
			}

		}
		return str;

	};
	// --------- /Component Private Methods --------- //

    // --------- Component Registration --------- //
	brite.registerComponent("DateSelect", {
		loadTemplate:true,
		loadTmpl:true,
		parent : "body"
	}, function() {
		return new brite.ex.DateSelect();
	});
	// --------- /Component Registration --------- //
})(jQuery);
