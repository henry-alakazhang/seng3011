var apiResults;
var news;
var chart;
var chartObjData;
var chartData = [];
var minDate = new Date(2010, 1 - 1, 1)
var maxDate = new Date(2015, 2 - 1, 28)
var file_key = 0;

function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function updateNews(e) {
    console.log(e);
    var ric = jQuery.parseJSON(e);
    var ric_list = [];
    $.each(ric, function(i, val) {
	if (val != '') {
	    ric_list.push(val["portfolio"]);
	}
    });
    var start = moment("2015-10-01").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    var end = moment("2015-10-02").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    var input = {
	"start_date" : start,
	"end_date" : end,
	instr_list : [ ric_list ],
	tpc_list : []
    }
    var url = "https://bhsl.blue/news_request/start_date=" + start + "/end_date=" + end;
    if (ric_list.length > 0)
	url += "instr_list=" + ric_list.toString() + "/tpc_list=''";
    url += '/';
    $.ajax({
	type : "Post",
	url : "https://pacificpygmyowl.herokuapp.com/api/query",
	contentType : 'application/json',
	data : JSON.stringify(input),
	success : function(data) {
	    data.sort(function(a, b) {
		return moment(b.date, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").diff(moment(a.date, "YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
	    })
	    var news = data;
	    var items = [];
	    $.each(data, function(i, val) {
		items.push('<a href="#" id="article' + i + '" class="list-group-item"> <h4 class="list-group-item-heading">' + escapeHtml(val["headline"]) + '</h4>');
		if (val["body"] != '') {
		    var s = val["body"]
		    var n = s.indexOf('.', 200);
		    var m = s.indexOf('。', 200);
		    s = s.substring(0, n != -1 ? n < 300 ? n + 1 : 250 : m != -1 ? m + 1 : 250);
		    items.push('<p class="list-group-item-text">' + escapeHtml(s) + '</p>');
		} else {
		    items.push('<p class="list-group-item-text">No Body Available</p>');
		}
		items.push('<small>' + val['date'] + '</small>')
		$.each(val["instr_list"], function(i, val) {
		    items.push(' <span class="label label-default">' + val + '</span>');
		});
	    });
	    $('#newsItems').empty().append(items.join(''));
	    $("#newsItems a").click(function() {
		var id = $(this).attr('id').substring(7);
		console.log(id);
		items = [];
		var s = news[id]["headline"];
		var n = s.indexOf(' ', 15);
		var m = s.indexOf('，');
		var o = s.indexOf('、');
		s = s.substring(0, m != -1 ? m : o != -1 ? o : n != -1 ? n + 1 : 20);
		$('#artTab').parent().remove()
		$("#tabs").append('<li><a data-toggle="tab" href="#art" id = "artTab">' + escapeHtml(s) + '</a></li>');
		items.push('<h2>' + escapeHtml(news[id]["headline"]) + '</h2>');
		items.push('<small>Date: ' + news[id]["date"] + '</small>');
		$.each(news[id]["instr_list"], function(i, val) {
		    items.push(' <span class="label label-default">' + val + '</span>');
		});
		items.push('<hr><p>' + escapeHtml(news[id]["body"]) + '</p>');
		$("#artCont").empty().append(items.join(''));
		$("#artTab").tab('show');
	    });
	}
    });
}

var eventData;
var ricList = [];
var ricNames = {};
var eventList = [];
var allEvents;
var paramVals = {};
$.get("eventapi/events", {
    file_key : file_key
}, function(data) {
    eventData = data;
    var keys = [];
    for ( var key in data) {
	if (data.hasOwnProperty(key)) {
	    keys.push(key);
	}
    }
    for (var j = 0; j < keys.length; j++) {
	for ( var key in data[keys[j]]) {
	    if (data[keys[j]].hasOwnProperty(key)) {
		if ($.inArray(key, ricList) == -1) {
		    ricList.push(key);
		}
		for ( var i in data[keys[j]]) {
		    if (data[keys[j]].hasOwnProperty(i)) {
			for ( var ev in data[keys[j]][i]) {
			    if (data[keys[j]][i].hasOwnProperty(ev)) {
				if (ev == "Event Date" || ev == "#RIC") {
				    continue;
				}
				if ($.inArray(ev, eventList) == -1) {
				    eventList.push(ev);
				}
				if (!(ev in paramVals)) {
				    paramVals[ev] = {};
				}
				var val = parseFloat(data[keys[j]][i][ev]);
				if (val == 0) {
				    continue
				}
				;
				if (!("min" in paramVals[ev])) {
				    paramVals[ev]["min"] = val;
				} else {
				    if (val < paramVals[ev]["min"]) {
					paramVals[ev]["min"] = val;
				    }
				}
				if (!("max" in paramVals[ev])) {
				    paramVals[ev]["max"] = val;
				} else {
				    if (val > paramVals[ev]["max"]) {
					paramVals[ev]["max"] = val;
				    }
				}
			    }
			}
		    }
		}
	    }
	}
    }
    allEvents = $.extend(true, [], eventList);
})

var graphChanged = false;
var loadEvents = function() {
    $(".in").find("#event_input").select2("destroy").empty();
    $(".in").find("#event_input").select2({
	width : "100%",
	data : eventList,
    })
};

var ricsToDisplay = [];
var oldData = [];
var loadRics = function() {
    var fullRicNames = [];
    ricList.sort();
    var $ajaxCalls = [];
    $.each(ricList, function(i, val) {
	if (!(val in ricNames)) {
	    $ajaxCalls.push($.get("https://query.yahooapis.com/v1/public/yql?q=select%20Name%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22" + val
		    + "%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=", function(data) {
		ricNames[val] = data["query"]["results"]["quote"]["Name"];
	    }));
	}
    });
    console.log(ricNames);
    $.when.apply(null, $ajaxCalls).then(function() {
	$.each(ricList, function(i, val) {
	    if (ricNames[val] != null) {
		fullRicNames.push(val + ' - ' + ricNames[val]);
	    } else {
		fullRicNames.push(val);
	    }
	})
	$(".in").find("#rics_search").select2('destroy').select2({
	    width : '100%',
	    data : fullRicNames,
	    templateSelection : template,
	    matcher : function(params, data) {
		// should return:
		// - null if no matches were found
		// - `data` if data.text matches params.term
		if ($.trim(params.term) === '') {
		    return data;
		}
		if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) == 0) {
		    return data;
		}
		if ((data.text.toUpperCase().indexOf(params.term.toUpperCase()) == data.text.indexOf('-') + 2) && data.text.indexOf('-') != -1) {
		    return data;
		}

		return null;
	    },
	}).on("change", function(e) {
	    var diff = $($(this).select2("data")).not(oldData).get();
	    if (diff.length == 0) {
		var diff = $(oldData).not($(this).select2("data")).get();
		ricsToDisplay.splice(ricsToDisplay.indexOf(diff[0]["text"].replace(/ -.*$/, "")), 1);
	    } else {
		ricsToDisplay.push(diff[0]["text"].replace(/ -.*$/, ""));
	    }
	    oldData = $(this).select2("data");
	    console.log(ricsToDisplay);
	    /*
	     * if (e.val in $(this).val()) { ricsToDisplay.push(e.val.replace(/
	     * -.*$/, "")); } else {
	     * ricsToDisplay.splice(ricsToDisplay.indexOf(e.val.replace(/ -.*$/,
	     * "")),1); }
	     */
	    if ($("#companys").hasClass("in")) { // active panel is company
		updateEvent();
	    }
	});
    });
};

var updateEvent = function() {
    var keys = [];
    for ( var key in eventData) {
	if (eventData.hasOwnProperty(key)) {
	    keys.push(key);
	}
    }
    eventList = [];
    for (var j = 0; j < keys.length; j++) {
	for ( var key in eventData[keys[j]]) {
	    if ($.inArray(key, ricsToDisplay) > -1) {
		for ( var ev in eventData[keys[j]][key]) {
		    if (ev == "Event Date" || ev == "#RIC") {
			continue;
		    }
		    if (eventData[keys[j]][key][ev] > 0) {
			if ($.inArray(ev, eventList) == -1) {
			    eventList.push(ev);
			}
		    }
		}
	    }
	}
    }
    loadEvents();
};

var submit = function() {
    var events = $(".in").find("#event_input").select2("data");
    var params = {
	upper_window : $(".in").find("#startValue").val(),
	lower_window : $(".in").find("#endValue").val(),
	file_key : file_key
    };
    console.log(events);
    $.each(events, function(i, val) {
	var newParams = $.extend(true, {}, params);
	pName = val["text"];
	newParams["upper_" + pName.toLowerCase().replace(/ /g, "_")] = paramVals[pName]['max'];
	newParams["lower_" + pName.toLowerCase().replace(/ /g, "_")] = paramVals[pName]['min'];
	console.log(newParams);
	$.get("eventapi", newParams, function(data) {
	    var rics = [];
	    console.log(data);
	    $.each(data["events"], function(i, val) {
		$.each(val["returns"], function(j, ric) {
		    if ($.inArray(j, rics) == -1) {
			rics.push(j);
		    }
		});
	    });
	    console.log(rics);
	    rics.sort();
	});
    })

};

var bindSubmit = function() {
    $(".in").find("#submitOptions").click(submit);
}

function template(data, container) {
    return data.text.replace(/ -.*$/, "");
}

$('select').select2({});
var drawGraph;

var getEvents = function() {
    start = $('#startValue').val();
    end = $('#endValue').val();
    if (start != '' && end != '') {
	$.get("eventapi/events", {
	    earliest : start,
	    latest : end,
	    file_key : file_key
	}, function(data) {
	    $('#ricTable').empty();
	    chartData = [];
	    d3.select('#chart svg').datum(chartData).transition().duration(500).call(chart);
	    $('#eventSection').show();
	    window.scrollTo(0, document.body.scrollHeight);
	    var keys = [];
	    for ( var key in data) {
		if (data.hasOwnProperty(key)) {
		    keys.push(key);
		}
	    }
	    keys.sort(function(a, b) {
		return moment(a, "DD-MMM-YY").diff(moment(b, "DD-MMM-YY"))
	    })
	    var items = [];
	    if (keys.length > 0) {
		$.each(keys, function(i, val) {
		    items.push('<li><a>' + val + '</a></li>');
		});
		$('#datedropdown').empty().append(items.join('')).parents(".dropdown").find('.btn-primary').removeClass("disabled").text("No Date Chosen");
		$("#datedropdown li a").click(function() {
		    chartData = [];
		    d3.select('#chart svg').datum(chartData).transition().duration(500).call(chart);
		    $('#eventdropdown').empty();
		    $('#ricTable').empty();
		    $(this).parents(".dropdown").find('.btn-primary').text($(this).text());
		    $(this).parents(".dropdown").find('.btn-primary').val($(this).text());
		    var vars = [];
		    date = $(this).text();
		    var ric_keys = [];
		    for ( var key in data[date]) {
			if (data[date].hasOwnProperty(key)) {
			    ric_keys.push(key);
			}
		    }
		    for (var j = 0; j < ric_keys.length; j++) {
			for ( var key in data[date][ric_keys[j]]) {
			    if (data[date][ric_keys[j]].hasOwnProperty(key)) {
				if (data[date][ric_keys[j]][key] > 0) {
				    if ($.inArray(key, vars) == -1) {
					vars.push(key);
				    }
				}
			    }
			}
		    }
		    vars.sort();
		    vars.push("None");
		    items = [];
		    $.each(vars, function(i, val) {
			items.push('<li><a>' + val + '</a></li>');
		    });
		    $('#eventdropdown').empty().append(items.join('')).parents(".dropdown").find('.btn-primary').removeClass("disabled").text("No Event Chosen");
		    $("#eventdropdown li a").click(function() {

			$(this).parents(".dropdown").find('.btn-primary').text($(this).text());
			$(this).parents(".dropdown").find('.btn-primary').val($(this).text());
			$('#ricTable').empty();
			// call api
			var startTime = moment(start, "DD-MMM-YY");
			var endTime = moment(end, "DD-MMM-YY");
			var eventTime = moment(date, "DD-MMM-YY")
			var upperWindow = -eventTime.diff(endTime, 'days') - 1;
			var lowerWindow = -eventTime.diff(startTime, 'days') + 1;
			if ($(this).text() == "None") {
			    var params = {
				upper_window : upperWindow,
				lower_window : lowerWindow,
				file_key : file_key
			    };
			} else {
			    var params = {
				upper_window : upperWindow,
				lower_window : lowerWindow,
				file_key : file_key
			    };
			    params["upper_" + $(this).text().toLowerCase().replace(/ /g, "_")] = 1.5;
			    params["lower_" + $(this).text().toLowerCase().replace(/ /g, "_")] = 0.5;
			}
			console.log(params);
			$('#ricSection').show();
			$.get("eventapi", params, function(data) {
			    apiResults = data;
			    var rics = [];
			    console.log(data);
			    $.each(data["events"], function(i, val) {
				if (val["date"] == moment($('#datedropdown').parents(".dropdown").find('.btn-primary').text(), "DD-MMM-YY").format("DD/MM/YY")) {
				    $.each(val["returns"], function(j, ric) {
					if ($.inArray(j, rics) == -1) {
					    rics.push(j);
					}
				    });
				}
			    });
			    console.log(keys);
			    console.log(rics);
			    rics.sort();
			    items = [];
			    $.each(rics, function(i, val) {
				items.push('<tr><td><div class="RICcheckbox"><label><input type="checkbox" value="' + val + '"></label></div></td><td>' + val + '</td></tr>');
			    });
			    $('#ricTable').empty().append(items.join('')).show();

			})
		    });
		});
	    } else {
		$('#datedropdown').empty().append(items.join('')).parents(".dropdown").find('.btn-primary').addClass("disabled").text("No Events in Chosen Range");
	    }
	});
    }
};

$('.RICcheckbox input:checkbox').on('change', function() {
    // From the other examples
    if (this.checked) {
	var newData = {
	    "key" : $(this).val(),
	    "values" : []
	};
	var cumRets;
	var Date = $('#datedropdown').parents(".dropdown").find('.btn-primary').text();
	Date = moment(Date, "DD-MMM-YY").format("DD/MM/YY");
	for (var i = 0; i < apiResults["events"].length; i++) {
	    if (apiResults["events"][i]["date"] == Date) {
		var event = apiResults["events"][i]["returns"];
		var ric_keys = [];
		for ( var key in event) {
		    if (event.hasOwnProperty(key)) {
			ric_keys.push(key);
		    }
		}
		for (var j = 0; j < ric_keys.length; j++) {
		    if (ric_keys[j] == $(this).val()) {
			cumRets = apiResults["events"][i]["returns"][ric_keys[j]];
			break;
		    }
		}
	    }
	}
	for (var i = lowerWindow; i <= upperWindow; i++) {
	    newData["values"].splice(i - lowerWindow, 0, {
		"x" : i,
		"y" : cumRets[i - lowerWindow]
	    });
	}
	chartData.push(newData);
	if (chartData.length > 1) {
	    for (var i = 0; i < chartData.length; i++) {
		if (chartData[i]["key"] == "average") {
		    chartData.splice(i, 1);
		}
	    }
	    var average = [];
	    for (var j = lowerWindow; j <= upperWindow; j++) {
		average.splice(j - lowerWindow, 0, 0.0);
		for (var i = 0; i < chartData.length; i++) {
		    average[j - lowerWindow] += chartData[i]["values"][j - lowerWindow]["y"];
		}
		average[j - lowerWindow] /= chartData.length;
	    }
	    var aveData = {
		"key" : "average",
		"color" : "red",
		"values" : []
	    };
	    for (var i = lowerWindow; i <= upperWindow; i++) {
		aveData["values"].splice(i - lowerWindow, 0, {
		    "x" : i,
		    "y" : average[i - lowerWindow]
		});
	    }
	    chartData.push(aveData);
	}
	d3.select('#chart svg').datum(chartData).transition().duration(500).call(chart);
    } else {
	for (var i = 0; i < chartData.length; i++) {
	    if (chartData[i]["key"] == $(this).val()) {
		chartData.splice(i, 1);
	    }
	}
	if (chartData.length > 2) {
	    for (var i = 0; i < chartData.length; i++) {
		if (chartData[i]["key"] == "average") {
		    chartData.splice(i, 1);
		}
	    }
	    var average = [];
	    for (var j = lowerWindow; j <= upperWindow; j++) {
		average.splice(j - lowerWindow, 0, 0.0);
		for (var i = 0; i < chartData.length; i++) {
		    average[j - lowerWindow] += chartData[i]["values"][j - lowerWindow]["y"];
		}
		average[j - lowerWindow] /= chartData.length;
	    }
	    var aveData = {
		"key" : "average",
		"color" : "red",
		"values" : []
	    };
	    for (var i = lowerWindow; i <= upperWindow; i++) {
		aveData["values"].splice(i - lowerWindow, 0, {
		    "x" : i,
		    "y" : average[i - lowerWindow]
		});
	    }
	    chartData.push(aveData);
	} else if (chartData.length > 1) {
	    for (var i = 0; i < chartData.length; i++) {
		if (chartData[i]["key"] == "average") {
		    chartData.splice(i, 1);
		}
	    }
	}
	d3.select('#chart svg').datum(chartData).transition().duration(500).call(chart);
    }
});

nv.addGraph(function() {
    chart = nv.models.cumulativeLineChart().x(function(d) {
	return d["x"]
    }).y(function(d) {
	return d["y"] / 100
    }).useInteractiveGuideline(true).noData("Please choose input in Options tab");

    chart.xAxis.axisLabel('Date').tickFormat(function(d) {
	return moment($('#datedropdown').parents(".dropdown").find('.btn-primary').text(), "DD-MMM-YY").add(d, 'days').format("DD-MMM-YY");
    });

    chart.yAxis.axisLabel('Cumulative Returns').tickFormat(d3.format('.2%')).showMaxMin(false);

    d3.select('#chart svg').datum(chartData).transition().duration(500).call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
});

$('#uploadForm').ajaxForm({
    beforeSend : function() {
	$('#uploadProgress').addClass("progress");
	$('#uploadBar').attr('aria-valuenow', 0);
	$('#uploadBar').attr('style', "width:0%");
	$('#uploadProgress').show();
    },
    uploadProgress : function(e, p, t, c) {
	$('#uploadBar').attr('style', "width:" + c + "%");
	$('#uploadBar').empty().append(c + "%");
    },
    complete : function(response) {
	console.log(response);
	if (response.responseJSON) {
	    file_key = response.responseJSON.file_key
	    alert("Files uploaded successfully");
	} else {
	    alert("File upload error! Please check files and try again.");
	}
	$('#uploadProgress').hide();
    }
});

var optPanel = false;

$('#eventopt').click(function() {
    if ($(this).hasClass("disabled")) {
	return;
    }
    if (optPanel) {
	r = confirm("Are you sure you want to change data input?")
	if (!(r)) {
	    return;
	}
	$('#compopt').removeClass("disabled");
    }
    optPanel = true;
    $(this).addClass("disabled");
    eventList = $.extend(true, [], allEvents);
    $('#event').collapse("show");
});

$('#compopt').click(function() {
    if ($(this).hasClass("disabled")) {
	return;
    }
    if (optPanel) {
	r = confirm("Are you sure you want to change data input?")
	if (!(r)) {
	    return;
	}
	$('#eventopt').removeClass("disabled");
    }
    optPanel = true;
    $(this).addClass("disabled");
    $('#companys').collapse("show");
});

$('#event').on("shown.bs.collapse", function() {
    loadEvents();
    loadRics();
    bindSubmit();
});
$('#companys').on("shown.bs.collapse", function() {
    loadRics();
    loadEvents();
    bindSubmit();
});
