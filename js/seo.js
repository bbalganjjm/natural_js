// SEO
if(location.href.indexOf("index.html") < 0) {
    if(location.href.indexOf(".html") > -1) {
        var href = location.href;
        var host = href.substring(0, href.indexOf("/html/"));
        var contentUrl = href.substring(href.indexOf("/html/") + 1);
        var docId = contentUrl.substring(contentUrl.lastIndexOf("/") + 1, contentUrl.lastIndexOf(".html"));
        var title = document.getElementsByTagName("h1")[0].innerText;
        if(document.getElementsByTagName("h1")[1]) {
            title = document.getElementsByTagName("h1")[1].innerText;
        }
        if(!title) {
            title = docId;
        }
        var docNm = title;
        var hash = docId + "$" + docNm + "$" + contentUrl;
        hash = btoa(encodeURIComponent(hash));

        location.href = host + "/index.html#" + hash;
    }
}