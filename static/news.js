function displayNews(news) {
    var items = []
    $.each(news, function(i, val) {
        var tags = val.tags.split(",");
        if (val["body"] != null) {
            var s = val["body"]
            var n = s.indexOf('.', 200);
            var m = s.indexOf('。', 200);
            s = s.substring(0, n != -1 ? n < 300 ? n + 1 : 250 : m != -1 ? m + 1 : 250);
            var sentiment = val["sentiment"];
            var colour = "#FFFFFF"
            if (sentiment.status == "OK") {
                var colour = (sentiment.docSentiment.score < 0) ? "#FF99AA" : "#AAFF99"
            }
            items.push('<a role="button" data-toggle="collapse" data-target="#body' + i + '" \
             style="background-color:' + colour + '" id="article' + i + '" class="list-group-item"> \
             <h4 class="list-group-item-heading">' + escapeHtml(val["title"]) + '</h4>');
            items.push('<p class="collapse list-group-item-text" id="body' + i + '">' + escapeHtml(s) + '</p>');
        } else {

            items.push('<a role="button" data-toggle="collapse" data-target="#body' + i + '" \
             id="article' + i + '" class="list-group-item"> \
             <h4 class="list-group-item-heading">' + escapeHtml(val["title"]) + '</h4>');
            items.push('<p class="collapse list-group-item-text" id="body' + i + '"> No Body Available </p>');
        }
        items.push('<small>' + val['timestamp'] + '</small>')
        $.each(tags, function (i,tag) {
           if (tag.startsWith('R:')) {
            items.push(' <span class="label label-default">' + tag.slice(2) + '</span>')               
           } else {
               return true;
           }
        });
        items.push('</a>');
    });
    return items.join('');
}

/* expects news of format:
{
    title: string
    body: string
    date: string
    tags: string
}
*/
function saveNews(article) {
    $.post(
        "portfolio/news",
        article
    )
}