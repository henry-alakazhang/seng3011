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
	instr_list : [],
	tpc_list : []
    }
    $.ajax({
	type : "Post",
	url : "http://pacificpygmyowl.herokuapp.com/api/query",
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
		s = s.substring(0, m != -1 ? m : o != -1 ? o : n != -1 ? n+1 : 20);
		$('#artTab').parent().remove()
		$("#tabs").append('<li><a data-toggle="tab" href="#art" id = "artTab">' + escapeHtml(s) + '</a></li>');
		items.push('<h2>' + news[id]["headline"] + '</h2>');
		items.push('<small>Date: ' + news[id]["date"] + '</small>');
		$.each(news[id]["instr_list"], function(i, val) {
		    items.push(' <span class="label label-default">' + val + '</span>');
		});
		items.push('<hr><p>' + news[id]["body"] + '</p>');
		$("#artCont").empty().append(items.join(''));
	    });
	}
    });
}

var getEvents = function() {
    start = $('#startValue').val();
    end = $('#endValue').val();
    if (start != '' && end != '') {
	$.get("eventapi/events", {
	    earliest : start,
	    latest : end,
	    file_key : file_key
	}, function(data) {
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
			})
		    });
		});
	    } else {
		$('#datedropdown').empty().append(items.join('')).parents(".dropdown").find('.btn-primary').addClass("disabled").text("No Events in Chosen Range");
	    }
	});
    }
};

$('#startDate').datepicker({
    changeMonth : true,
    changeYear : true,
    minDate : minDate,
    maxDate : maxDate,
    onSelect : function(date, inst) {
	$('#startValue').val(moment(date, "MM/DD/YYYY").format("DD-MMM-YY"));
	$('#endDate').datepicker("option", "minDate", date);
	$(this).hide();
	getEvents();
    },
}).datepicker("setDate", moment($('#startValue').val(), "DD-MMM-YY").format("MM/DD/YYYY")).hide();

$("#startPicker").mousedown(function() {
    dp = $('#startDate');
    if (dp.is(":visible")) {
	dp.hide();
    } else {
	dp.show();
    }
});

$('#endDate').datepicker({
    changeMonth : true,
    changeYear : true,
    minDate : minDate,
    maxDate : maxDate,
    onSelect : function(date, inst) {
	$('#endValue').val(moment(date, "MM/DD/YYYY").format("DD-MMM-YY"));
	$('#startDate').datepicker("option", "maxDate", date);
	$(this).hide();
	getEvents();
    },
}).datepicker("setDate", moment($('#endValue').val(), "DD-MMM-YY").format("MM/DD/YYYY")).hide();

if ($('#endValue').val() != '') {
    $('#endDate').datepicker("option", "defaultDate", moment($('#endValue').val()).format("mm/dd/yy"));
}

$("#endPicker").mousedown(function() {
    dp = $('#endDate');
    if (dp.is(":visible")) {
	dp.hide();
    } else {
	dp.show();
    }
});

nv.addGraph(function() {
    chart = nv.models.cumulativeLineChart().x(function(d) {
	return d["x"]
    }).y(function(d) {
	return d["y"] / 100
    }).useInteractiveGuideline(true).noData("Please choose input in Options tab");

    chart.xAxis.tickFormat(function(d) {
	return moment($('#datedropdown').parents(".dropdown").find('.btn-primary').text(), "DD-MMM-YY").add(d, 'days').format("DD-MMM-YY");
    });

    chart.yAxis.tickFormat(d3.format('.2%')).showMaxMin(false);

    d3.select('#chart svg').datum(chartData).transition().duration(500).call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
});

$('#graphTab').on('shown.bs.tab', function(e) {
    console.log("resizing");
    window.dispatchEvent(new Event('resize'));
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
	    getEvents();
	} else {
	    alert("File upload error! Please check files and try again.");
	}
	$('#uploadProgress').hide();
    }
});
