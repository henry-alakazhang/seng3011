var currNews = [];

function displayNews(news) {
    var items = []
    var checked = "";
    var newsItems = jQuery.parseJSON(savedNews);
    currNews = news;
    $.each(news, function(i, val) {
	if ($.inArray(val,newsItems)) {
	    checked = " checked";
	} else {
	    checked = "";
	}
        var tags = val.tags.split(",");
        if (val["body"] != null) {
            var s = val["body"]
            var n = s.indexOf('.', 250);
            var m = s.indexOf('。', 250);
            s = s.substring(0, n != -1 ? (n < 400 ? n + 1 : 350) : (m != -1 ? m + 1 : 350));
            s += m != -1 ? "。。" : (n != - 1 ? ".." : "...")
            var sentiment = val["sentiment"];
            var colour = "#FFFFFF"
        	var date = moment(val.timestamp, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").format("Do MMMM YYYY, h:mm:ss a");
            if (sentiment.status == "OK") {
                var colour = (sentiment.docSentiment.score < 0) ? "#FF99AA" : "#AAFF99"
            }
            items.push('<div class="row row-eq-height" style="background-color:' + colour + '"><div class="col-sm-2" style="padding-right:0;"><label style="display: flex;justify-content:center;align-items:center;height:100%">\
        	    <input type="checkbox" value="save'+i+'" onclick="handleClick(this);"'+checked+'></label></div><div class="col-sm-9" style="padding-left:0;padding-right:0;">')
            items.push('<a role="button" data-toggle="collapse" data-target="#body' + i + '" \
             style="background-color:' + colour + '" id="article' + i + '" class="list-group-item"> \
             <h4 class="list-group-item-heading">' + escapeHtml(val["title"]) + '</h4>');
            items.push('<p class="collapse list-group-item-text" id="body' + i + '">' + escapeHtml(s) + '</p>');
        } else {
            items.push('<div class="row row-eq-height"><div class="col-sm-2" style="padding-right:0;"><label style="display: flex;justify-content:center;align-items:center;height:100%;">\
        	    <input type="checkbox" value="save'+i+'" onclick="handleClick(this);"'+checked+'></label></div><div class="col-sm-9" style="padding-left:0;padding-right:0;">')
            items.push('<a role="button" data-toggle="collapse" data-target="#body' + i + '" \
             id="article' + i + '" class="list-group-item"> \
             <h4 class="list-group-item-heading">' + escapeHtml(val["title"]) + '</h4>');
            items.push('<p class="collapse list-group-item-text" id="body' + i + '"> No Body Available </p>');
        }
        items.push('<span class="glyphicon glyphicon-floppy-disk"></span></span> <small>' + date + '</small>')
        $.each(tags, function (i,tag) {
           if (tag.startsWith('R:')) {
            items.push(' <span class="label label-default">' + tag.slice(2) + '</span>')               
           } else {
               return true;
           }
        });
        items.push('</a></div></div>')
    });
    return items.join('');
}

function handleClick(cb) {
    var id = cb.value.replace(/^save/,"");
    var news = currNews[id];
    var obj = {title:news.title,body:news.body,date:news.timestamp,tags:news.tags,sentiment:JSON.stringify(news.sentiment)};
    console.log(cb);
    if (cb.checked) {
	obj.update = "add";
    } else {
	obj.update = "delete";	
    }
    saveNews(obj);
  }

/* expects news of format:
{
    title: string
    body: string
    date: string
    tags: string
    sentiment: string
}
*/
function saveNews(article) {
    $.post(
        "portfolio/news",
        article
    )
}