var apiResults;
var news;
var chartData = {average:{data:[]}};
var stockEventData = {};
var minDate = new Date(2010, 1 - 1, 1)
var maxDate = new Date(2015, 2 - 1, 28)
// get filey_key from context variable in embedded script
function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function updateNews(data, lowerWindow, upperWindow) {
	$('#newsItems').empty()
    if (data['events'].length == 0)
    	return;
    var ric = jQuery.parseJSON(portfolio);
    var ric_list = [];
    $.each(ric, function(i, val) {
	if (val != '') {
	    ric_list.push(val["portfolio"]);
	}
    });

    for (var event in data['events']) {
	    var start = moment(data['events'][event]['date'], "DD-MM-YY").add(-1, 'days').format("DD-MMM-YY");
	    var end = moment(data['events'][event]['date'], "DD-MM-YY").add(1, 'days').format("DD-MMM-YY");
	    var param = {
		"earliest" : start,
		"latest" : end,
		"RICs" : [ ric_list ],
	    }
	    $.get("eventapi/news", param, function(data) {
		    data['results'].sort(function(a, b) {
			return moment(b.timestamp, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").diff(moment(a.timestamp, "YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
		    })
		    var news = data['results'];
//		    console.log(news);
		    var items = [];
		    $.each(news, function(i, val) {
			items.push('<a role="button" data-toggle="collapse" data-target="#body' + i + '" \
			 id="article' + i + '" class="list-group-item"> \
			 <h4 class="list-group-item-heading">' + escapeHtml(val["title"]) + '</h4>');
			if (val["body"] != null) {
			    var s = val["body"]
			    var n = s.indexOf('.', 200);
			    var m = s.indexOf('。', 200);
			    s = s.substring(0, n != -1 ? n < 300 ? n + 1 : 250 : m != -1 ? m + 1 : 250);
			    items.push('<p class="collapse list-group-item-text" id="body' + i + '">' + escapeHtml(s) + '</p>');
			} else {
			    items.push('<p class="collapse list-group-item-text" id="body' + i + '"> No Body Available </p>');
			}
			/*
			$.each(val["instr_list"], function(i, val) {
			    items.push(' <span class="label label-default">' + val + '</span>');
			});
			*/
			items.push('<small>' + val['timestamp'] + '</small></a>')
		    });
		    $('#newsItems').append(items.join(''));
		    /*
		    $("#newsItems a").click(function() {
			var id = $(this).attr('id').substring(7);
//			console.log(id);
			items = [];
			var s = news[id]["title"];
			var n = s.indexOf(' ', 15);
			var m = s.indexOf('，');
			var o = s.indexOf('、');
			s = s.substring(0, m != -1 ? m : o != -1 ? o : n != -1 ? n + 1 : 20);
			$('#artTab').parent().remove()
			$("#tabs").append('<li><a data-toggle="tab" href="#art" id = "artTab">' + escapeHtml(s) + '</a></li>');
			items.push('<h2>' + escapeHtml(news[id]["title"]) + '</h2>');
			items.push('<small>Date: ' + news[id]["timestamp"] + '</small>');
			$.each(news[id]["instr_list"], function(i, val) {
			    items.push(' <span class="label label-default">' + val + '</span>');
			});
			items.push('<hr><p>' + escapeHtml(news[id]["body"]) + '</p>');
			$("#artCont").empty().append(items.join(''));
			$("#artTab").tab('show');
		    });
		    */
		});
	}
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
		    stockEventData[key] = {};
		}
		stockEventData[key][keys[j]] = data[keys[j]][key];
		for ( var ev in data[keys[j]][key]) {
		    if (data[keys[j]][key].hasOwnProperty(ev)) {
			if (ev == "Event Date" || ev == "#RIC") {
			    continue;
			}
			if ($.inArray(ev, eventList) == -1) {
			    eventList.push(ev);
			}
			if (!(ev in paramVals)) {
			    paramVals[ev] = {};
			}
			var val = parseFloat(data[keys[j]][key][ev]);
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
    allEvents = $.extend(true, [], eventList);
})

var graphChanged = false;
var loadEvents = function() {
    $(".in").find("#event_input").empty();
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
//    console.log(ricNames);
    $.when.apply(null, $ajaxCalls).then(function() {
	$.each(ricList, function(i, val) {
	    if (ricNames[val] != null) {
		fullRicNames.push(val + ' - ' + ricNames[val]);
	    } else {
		fullRicNames.push(val);
	    }
	})
	$(".in").find("#rics_search").empty().select2({
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
//	    console.log(ricsToDisplay);
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

var insCharData = function(ric, data) {
    var array = chartData[ric]["data"]
    var low = 0, high = array.length;
    if (high > 0 && array[high - 1]["date"] > data["date"]) {
	while (low < high) {
	    var mid = (low + high) >>> 1;
	    if (array[mid]["date"] < data["date"])
		low = mid + 1;
	    else if (array[mid]["date"].getTime() == data["date"].getTime()) {
		return;
	    } else {
		high = mid;
	    }
	}
    } else {
	low = high;
    }
    array.splice(low, 0, data);
}

var insAve = function(date) {
    var array = chartData["average"]["data"];
    var low = 0, high = array.length;
    if (high > 0 && array[high-1]["date"].getTime() >= date) {
	while (low < high) {
	    var mid = (low + high) >>> 1;
//	    console.log(low,mid,high,array);
	    if (array[mid]["date"] < date)
		low = mid + 1;
	    else if (array[mid]["date"].getTime() == date.getTime()) {
		return array[mid];
	    } else {
		high = mid;
	    }
	}
    } else {
	low = high;
    }
    array.splice(low, 0, {date:date,items:0,volume:0,value:0.0});
    return array[low];
}

var comparedSets = {};

var changedMainSet = function(e) {    
    setTimeout(function() {
	console.log("main");
    $.each(chart.dataSets, function(i, val) {
	val.showInCompare = false;
    });
    $.each(comparedSets, function(i, val) {
	if ($.inArray(e.dataSet,val) != -1) {
	    $.each(val, function(j, ds) {
		 ds.showInCompare = true;
	    });
	}
    });  
    var ave = chart.dataSets[0];
    $.each(e.dataSet.dataProvider, function(i,val) {	
	var j = insAve(val.date);
	j["value"] = (j["value"]*j["items"] + val["value"])/++j["items"];
    });  
    
    chart.validateData();;
    }, 100);
};

var addAverage = function(e) {
    console.log(e);
    if (e.dataSet.title == "Average") {
	return;
    }
    if (chart.comparedDataSets.length == 0) {
    chartData.average.dataset.compared = true;
    chart.dataSetSelector.fire({type:"dataSetCompared",dataSet:chartData["average"]["dataset"],chart:chart});
    }
    var ave = chart.dataSets[0];
    $.each(e.dataSet.dataProvider, function(i,val) {
	
	var j = insAve(val.date);
	console.log(j,i,val);
	j["value"] = (j["value"]*j["items"] + val["value"])/++j["items"];
	console.log(j);
    });
    chart.validateData();
};
var remAverage = function(e) {
    console.log(e);
    if (e.dataSet.title == "Average") {
	return;
    }
    if (chart.comparedDataSets.length == 1+1) {
	chartData.average.dataset.compared = false;
	    chart.dataSetSelector.fire({type:"dataSetUncompared",dataSet:chartData["average"]["dataset"],chart:chart});
    }
    var ave = chart.dataSets[0];
    $.each(e.dataSet.dataProvider, function(i,val) {
	
	var j = insAve(val.date);
	console.log(j,i,val);
	j["value"] = (j["value"]*j["items"] - val["value"])/--j["items"];
	console.log(j);
    });
    chart.validateData();
};
var processData = function(data, lower, upper, clear) {
    if (clear) {
        chart.dataSets.splice(1,chart.dataSets.length-1);
        chartData = {average:{data:[],dataset:chartData["average"]["dataset"]}}
	chartData["average"]["dataset"].dataProvider = chartData["average"]["data"];
    }
    $.each(data["events"], function(i, event) {
	var date = moment(event["date"], "DD-MM-YY").utc().hour(0);
	if (!(date in comparedSets)) {
	    comparedSets[date] = [];
	}
	$.each(event["returns"], function(j, ric) {
	    if (!(j in chartData)) {
		chartData[j] = {
		    data : []
		};
	    }
	    if ("dataset" in chartData[j]) {
		chartData[j]["dataset"].dataProvider = [];
	    }
	    $.each(ric, function(k, ret) {
		var newDate = date.clone().add(parseInt(lower) + k, 'd');
		insCharData(j, {
		    date : newDate.toDate(),
		    value : ret*100,
		    volume : event["volume"][j][k]
		})
	    });
	    if (!("dataset" in chartData[j])) {
		var dataSet = new AmCharts.DataSet();
		chartData[j]["dataset"] = dataSet;
		dataSet.title = j;
		dataSet.fieldMappings = [ {
		    fromField : "value",
		    toField : "value"
		}, {
		    fromField : "volume",
		    toField : "volume"
		} ];
		dataSet.dataProvider = chartData[j]["data"];
		dataSet.categoryField = "date";
		dataSet.showInCompare = false;
		chart.dataSets.push(dataSet);
	    } else {
		chartData[j]["dataset"].dataProvider = chartData[j]["data"];
	    }
	    comparedSets[date].push(chartData[j]["dataset"]);	    
	    var desc = "Events:\n";
	    $.each(stockEventData[j][moment(event["date"], "DD-MM-YY").format("DD-MMM-YY").replace(/^0/,'')],function (i,val) {
		if (val > 0) {
		    desc += i + ": " + val + "\n";
		}
	    });
	    chartData[j]["dataset"].stockEvents.push({
		date : date.toDate(),
		type : "pin",
		graph : graph1,
		text : "E",
		description : desc
	    });
	});
    });
    chart.dataSets.sort(function(a, b) {
	if (a.title < b.title)
	    return -1;
	if (a.title > b.title)
	    return 1;
	return 0;
    });
    chart.validateData();
    chart.write("chartdiv");
};

var submit = function() {
    var events = $(".in").find("#event_input").select2("data");
    var params = {
	upper_window : $(".in").find("#endValue").val(),
	lower_window : $(".in").find("#startValue").val(),
	file_key : file_key
    };
    console.log(events);
    if (events.length == 0) {
	$.get("eventapi", params, function(data) {	    
	    processData(data, params['lower_window'], params['upper_window'],true);
	});
    } else {
	var x = 0;
	$.each(events, function(i, val) {
	    var newParams = $.extend(true, {}, params);
	    pName = val["text"];
	    newParams["upper_" + pName.toLowerCase().replace(/ /g, "_")] = paramVals[pName]['max'] || 1;
	    newParams["lower_" + pName.toLowerCase().replace(/ /g, "_")] = paramVals[pName]['min'] || 0.1;
	    console.log(newParams);
	    $.get("eventapi", newParams, function(data) {
	   	console.log(data)
		if (x == 0) {
		    processData(data, params['lower_window'], params['upper_window'],true);
		    x++;
		} else {
		    processData(data, params['lower_window'], params['upper_window'],false);		    
		}
		updateNews(data, params['lower_window'], params['upper_window']);
	    });
	})
    }
};

var bindSubmit = function() {
    $(".in").find("#submitOptions").click(submit);
}

function template(data, container) {
    return data.text.replace(/ -.*$/, "");
}

var chart;
AmCharts.ready(function() {
    createStockChart();
});
var graph1;
function createStockChart() {
    chart = new AmCharts.AmStockChart();
    chart.zoomOutOnDataSetChange = true;
    chart.addListener("rendered",function(e) {
	 chart.dataSetSelector.fire({type:"dataSetSelected",dataSet:chart.mainDataSet,chart:chart});	
    });
    // AVERAGE DATASET //
	var dataSet = new AmCharts.DataSet();
	chartData["average"]["dataset"] = dataSet;
	dataSet.title = "Average";
	dataSet.fieldMappings = [ {
	    fromField : "value",
	    toField : "value"
	}, {
	    fromField : "volume",
	    toField : "volume"
	} ];
	dataSet.dataProvider = chartData["average"]["data"];
	dataSet.showInSelect = false;
	dataSet.showInCompare = false;
	dataSet.categoryField = "date";
	chart.dataSets = [dataSet];
    
    
    // PANELS ///////////////////////////////////////////
    // first stock panel
    var stockPanel1 = new AmCharts.StockPanel();
    stockPanel1.showCategoryAxis = false;
    stockPanel1.title = "Value";
    stockPanel1.percentHeight = 70;
    stockPanel1.precision = 3;

    // graph of first stock panel
    graph1 = new AmCharts.StockGraph();
    graph1.valueField = "value";
    graph1.comparable = true;
    graph1.compareField = "value";
    graph1.bullet = "round";
    graph1.bulletBorderColor = "#FFFFFF";
    graph1.bulletBorderAlpha = 1;
    graph1.balloonText = "[[title]]:<b>[[value]]%</b>";
    graph1.compareGraphBalloonText = "[[title]]:<b>[[value]]%</b>";
    graph1.compareGraphBullet = "round";
    graph1.compareGraphBulletBorderColor = "#FFFFFF";
    graph1.compareGraphBulletBorderAlpha = 1;
    graph1.showEventsOnComparedGraphs = true;
    stockPanel1.addStockGraph(graph1);

    // create stock legend
    var stockLegend1 = new AmCharts.StockLegend();
    stockLegend1.valueTextComparing = "[[value]]%";
    stockLegend1.periodValueTextComparing = "[[percent.value.close]]%";
    stockLegend1.periodValueTextRegular = "[[value.close]]%";
    stockPanel1.stockLegend = stockLegend1;

    // second stock panel
    var stockPanel2 = new AmCharts.StockPanel();
    stockPanel2.title = "Volume";
    stockPanel2.percentHeight = 30;
    var graph2 = new AmCharts.StockGraph();
    graph2.valueField = "volume";
    graph2.type = "column";
    graph2.showBalloon = false;
    graph2.fillAlphas = 1;
    stockPanel2.addStockGraph(graph2);

    var stockLegend2 = new AmCharts.StockLegend();
    stockLegend2.periodValueTextRegular = "[[value.close]]";
    stockPanel2.stockLegend = stockLegend2;

    // set panels to the chart
    chart.panels = [ stockPanel1, stockPanel2 ];

    var scrollbarSettings = new AmCharts.ChartScrollbarSettings();
    scrollbarSettings.graph = graph1;
    scrollbarSettings.updateOnReleaseOnly = false;
    chart.chartScrollbarSettings = scrollbarSettings;

    var cursorSettings = new AmCharts.ChartCursorSettings();
    cursorSettings.valueBalloonsEnabled = true;
    cursorSettings.graphBulletSize = 1;
    chart.chartCursorSettings = cursorSettings;

    var panelsSettings = new AmCharts.PanelsSettings();
    panelsSettings.marginRight = 16;
    panelsSettings.marginLeft = 16;
    panelsSettings.usePrefixes = true;
    panelsSettings.recalculateToPercents = "never"
    chart.panelsSettings = panelsSettings;

    // PERIOD SELECTOR ///////////////////////////////////
    var periodSelector = new AmCharts.PeriodSelector();
    periodSelector.position = "left";
    periodSelector.periods = [ {
	period : "DD",
	count : 10,
	label : "10 days"
    }, {
	period : "MM",
	selected : true,
	count : 1,
	label : "1 month"
    }, {
	period : "YYYY",
	count : 1,
	label : "1 year"
    }, {
	period : "YTD",
	label : "YTD"
    }, {
	period : "MAX",
	label : "MAX"
    } ];
    chart.periodSelector = periodSelector;

    // DATA SET SELECTOR
    var dataSetSelector = new AmCharts.DataSetSelector();
    dataSetSelector.position = "left";
    dataSetSelector.addListener("dataSetSelected",changedMainSet);
    dataSetSelector.addListener("dataSetCompared",addAverage);
    dataSetSelector.addListener("dataSetUncompared",remAverage);
    chart.dataSetSelector = dataSetSelector;

    if (Object.keys(chartData).length == 1) {
	$("#chartdiv").append('<h2 style="display: flex;justify-content:center;align-items:center;height:100%">Please Enter Data</h2>');
    } else {
	chart.write('chartdiv');
    }
}
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
    $('#events').collapse("show");
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

$('#events').on("shown.bs.collapse", function() {
    loadEvents();
    loadRics();
    bindSubmit();
});
$('#companys').on("shown.bs.collapse", function() {
    loadRics();
    loadEvents();
    bindSubmit();
});
