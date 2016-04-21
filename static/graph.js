var apiResults;
var chart;
var chartData;
var getEvents = function() {
	start = $('#startValue').val();
	end = $('#endValue').val();
	if (start != '' && end != '') {
		$.get(
		    "eventapi/events",
		    {earliest : start, latest : end, file_key : "0"},
		    function(data) {
		    	var keys = [];
		    	for (var key in data) {
		    	  if (data.hasOwnProperty(key)) {
		    	    keys.push(key);
		    	  }
		    	}
		    	keys.sort(function (a,b) {		    		
		    		return moment(a,"DD-MMM-YY").diff(moment(b,"DD-MMM-YY"))
		    	})
		    	var items = [];
		    	$.each(keys, function(i,val) {
		    		items.push('<li><a>' + val + '</a></li>');
		    	});
		    	$('#datedropdown').empty().append( items.join('') ).parents(".dropdown").find('.btn-primary').text("No Date Chosen");
		    	   $("#datedropdown li a").click(function(){
	    		   		$('#eventdropdown').empty();
		    			  $('#ricTable').empty();
		    			  $(this).parents(".dropdown").find('.btn-primary').text($(this).text());
		    			  $(this).parents(".dropdown").find('.btn-primary').val($(this).text());	
		  		    		var vars = [];	    
		  		    		date = $(this).text();
				    		var ric_keys = [];
					    	for (var key in data[date]) {
					    	  if (data[date].hasOwnProperty(key)) {
					    	    ric_keys.push(key);
					    	  }			    	  
					    	}
					    	for (var j = 0; j < ric_keys.length; j++) {
					    		for (var key in data[date][ric_keys[j]]) {
							    	  if (data[date][ric_keys[j]].hasOwnProperty(key)) {
							    		  if (data[date][ric_keys[j]][key] > 0) {
									    	   if ($.inArray(key,vars) == -1) {
									    	    	vars.push(key);
									    	   }				    			  
							    		  }
							    	  }			    	  
					    		}
					    	}
					    	vars.sort();
					    	vars.push("None");
					    	items = [];
					    	   $.each(vars, function(i,val) {
					    	          items.push('<li><a>' + val + '</a></li>');
					    	   });
					    	   $('#eventdropdown').empty().append( items.join('') ).parents(".dropdown").find('.btn-primary').text("No Event Chosen");
					    	   $("#eventdropdown li a").click(function(){
					    			  $(this).parents(".dropdown").find('.btn-primary').text($(this).text());
					    			  $(this).parents(".dropdown").find('.btn-primary').val($(this).text());
					    			  $('#ricTable').empty();
					    			  // call api
					    			  var startTime = moment(start,"DD-MMM-YY");
					    			  var endTime = moment(end,"DD-MMM-YY");
					    			  //var timeWindow = endTime.diff(startTime,'days');
					    			  var timeWindow = 30;
					    			  if ($(this).text() == "None") {
				    					  var params = {upper_window : timeWindow,lower_window : -timeWindow, file_key : 0};
					    			  } else {
				    					  var params = {upper_window : timeWindow,lower_window : -timeWindow, file_key : 0};
				    					  params["upper_"+$(this).text().toLowerCase().replace(/ /g,"_")] = 1.5;
				    					  params["lower_"+$(this).text().toLowerCase().replace(/ /g,"_")] = 0.5;
					    			  }
					    			  $.get(
				    					  "eventapi",
				    					  params,
				    					  function (data) {
				    						  	apiResults = data;
				    					    	var rics = [];
				    					    	console.log(data);
				    				    	   	$.each(data["events"], function(i,val) {
				    				    	   		if (val["date"] == moment($('#datedropdown').parents(".dropdown").find('.btn-primary').text(),"DD-MMM-YY").format("DD/MM/YY")) {
					    				    	   		$.each(val["returns"], function(j,ric) {
												    	   if ($.inArray(j,rics) == -1) {
												    		   rics.push(j);
												    	   }
					    				    	   		});
				    				    	   		}
			    				    	   		});
				    					    	console.log(keys);
				    					    	console.log(rics);
				    					    	rics.sort();
			    					    	  	items = [];
			    					    	   	$.each(rics, function(i,val) {
			    					    		   items.push('<tr><td><div class="RICcheckbox"><label><input type="checkbox" value="'+ val +'"></label></div></td><td>'+ val +'</td></tr>');
			    				    	   		});
			    					    	   	$('#ricTable').empty().append( items.join('') );
			    					    	   	$('.RICcheckbox input:checkbox').on('change', function() { 
			    					    	   	    // From the other examples
			    					    	   	    if (this.checked) {
			    					    	   	    	var newData = {"key":$(this).val(),"values":[]};
			    					    	   	    	var cumRets;
			    					    	   	    	var Date = $('#datedropdown').parents(".dropdown").find('.btn-primary').text();
			    					    	   	    	Date = moment(Date,"DD-MMM-YY").format("DD/MM/YY");
			    					    	   	    	for (var i = 0; i < apiResults["events"].length; i++) {
			    					    	   	    		if (apiResults["events"][i]["date"] == Date) {			    					    	   	    			
			    					    	   	    			var event = apiResults["events"][i]["returns"];
			    									    		var ric_keys = [];
			    										    	for (var key in event) {
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
			    					    	   	    	for (var i = -timeWindow ; i <= timeWindow; i++) {
			    					    	   	    		newData["values"].splice(i+timeWindow,0,{"x":i,"y":cumRets[i+timeWindow]});
			    					    	   	    	}		
			    					    	   	    	var oldData = chartData.datum();
			    					    	   	    	oldData.push(newData);
			    					    	   	    	if (oldData.length > 1) {
			    					    	   	    		for (var i = 0; i < oldData.length; i++) {
			    					    	   	    			if (oldData[i]["key"] == "average") {
			    					    	   	    				oldData.splice(i,1);
			    					    	   	    			}
			    					    	   	    		}
			    					    	   	    		var average = [];
		    					    	   	    			for (var j = -timeWindow; j <= timeWindow; j++) {
			    					    	   	    			average.splice(j+timeWindow,0,0.0);
			    					    	   	    			for (var i = 0; i < oldData.length; i++) {
			    					    	   	    				average[j+timeWindow] += oldData[i]["values"][j+timeWindow]["y"];
			    					    	   	    			}
			    					    	   	    			average[j+timeWindow] /= oldData.length;
			    					    	   	    		}
		    					    	   	    			var aveData = {"key":"average","color":"red","values":[]};
		    					    	   	    			for (var i = -timeWindow; i <= timeWindow; i++) {
		    					    	   	    				aveData["values"].splice(i+timeWindow,0,{"x":i,"y":average[i+timeWindow]});
		    					    	   	    			}
		    					    	   	    			oldData.push(aveData);
			    					    	   	    	}			    					    	   	    	
				    					    	   	    chartData.datum(oldData).transition().duration(500).call(chart);
				    					    	   	    nv.utils.windowResize(chart.update);
			    					    	   	    } else {
			    					    	   	    	var oldData = chartData.datum();
			    					    	   	    	for (var i = 0; i < oldData.length; i++) {			    					    	   	    		
			    					    	   	    		if (oldData[i]["key"] == $(this).val()) {
			    					    	   	    			oldData.splice(i,1);
			    					    	   	    		}
			    					    	   	    	}
			    					    	   	    	console.log(oldData.length);
			    					    	   	    	if (oldData.length > 2) {
			    					    	   	    		for (var i = 0; i < oldData.length; i++) {
			    					    	   	    			if (oldData[i]["key"] == "average") {
			    					    	   	    				oldData.splice(i,1);
			    					    	   	    			}
			    					    	   	    		}
			    					    	   	    		var average = [];
		    					    	   	    			for (var j = -timeWindow; j <= timeWindow; j++) {
			    					    	   	    			average.splice(j+timeWindow,0,0.0);
			    					    	   	    			for (var i = 0; i < oldData.length; i++) {
			    					    	   	    				average[j+timeWindow] += oldData[i]["values"][j+timeWindow]["y"];
			    					    	   	    			}
			    					    	   	    			average[j+timeWindow] /= oldData.length;
			    					    	   	    		}
		    					    	   	    			var aveData = {"key":"average","color":"red","values":[]};
		    					    	   	    			for (var i = -timeWindow; i <= timeWindow; i++) {
		    					    	   	    				aveData["values"].splice(i+timeWindow,0,{"x":i,"y":average[i+timeWindow]});
		    					    	   	    			}
		    					    	   	    			oldData.push(aveData);
			    					    	   	    	} else if (oldData.length > 1) {
			    					    	   	    		console.log("trying to rem average");
			    					    	   	    		for (var i = 0; i < oldData.length; i++) {
			    					    	   	    			if (oldData[i]["key"] == "average") {
			    					    	   	    				console.log(oldData[i]["key"]);
			    					    	   	    				oldData.splice(i,1);
			    					    	   	    			}
			    					    	   	    		}
			    					    	   	    	}			    		
				    					    	   	    chartData.datum(oldData).transition().duration(500).call(chart);
			    					    	   	    	console.log(chartData.datum());
				    					    	   	    nv.utils.windowResize(chart.update);
			    					    	   	    }
			    					    	   	});
				    					  }
				    					  )
					    			});
		    	   });
		    });
	}
};

$('#startDate').datepicker({
    changeMonth: true,
    changeYear: true,    
    onSelect: function(date,inst) {
        $('#startValue').val(moment(date,"MM/DD/YYYY").format("DD-MMM-YY"));
        $('#endDate').datepicker("option","minDate",date)
        getEvents();
    },
}).datepicker("setDate",moment($('#startValue').val(),"DD-MMM-YY").format("MM/DD/YYYY")).hide();

$("#startPicker").mousedown(function() {
	dp = $('#startDate');
    if (dp.is(":visible")) {
    	dp.hide();
    } else {
    	dp.show();
    }    	
});

$('#endDate').datepicker({
    changeMonth: true,
    changeYear: true,
    onSelect: function(date,inst) {
        $('#endValue').val(moment(date,"MM/DD/YYYY").format("DD-MMM-YY"));  
        $('#startDate').datepicker("option","maxDate",date)
        getEvents();
    },
}).datepicker("setDate",moment($('#endValue').val(),"DD-MMM-YY").format("MM/DD/YYYY")).hide();

if ($('#endValue').val() != '') {
	$('#endDate').datepicker("option","defaultDate",moment($('#endValue').val()).format("mm/dd/yy"));
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
  chart = nv.models.cumulativeLineChart()
  	.x(function(d) {return d["x"]})
  	.y(function(d) {return d["y"]/100})
    .useInteractiveGuideline(true)
    ;

  chart.xAxis
    .tickFormat(function(d) {
      return moment($('#startValue').val(),"DD-MMM-YY").add(d,'days').format("DD-MMM-YY");
    });

  chart.yAxis.tickFormat(d3.format('.2%')).showMaxMin(false);;
            

  chartData = d3.select('#chart svg')
    .datum([]);
    chartData.transition().duration(500)
    .call(chart);

  nv.utils.windowResize(chart.update);

  return chart;
});