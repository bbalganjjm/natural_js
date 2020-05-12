// SEO
if(location.href.indexOf("index.html") < 0) {
    if(location.href.indexOf(".html") > -1) {
        var href = location.href;
        var host = href.substring(0, href.indexOf("/html/"));
        var contentUrl = href.substring(href.indexOf("/html/") + 1);
        var docId = contentUrl.substring(contentUrl.lastIndexOf("/") + 1, contentUrl.lastIndexOf(".html"));
        var docNm;
        if(document.getElementsByTagName("h1")[1]) {
            docNm = document.getElementsByTagName("h1")[1].innerText;
        } else if(document.getElementsByTagName("h1")[0]) {
            docNm = document.getElementsByTagName("h1")[0].innerText;
        } else {
            docNm = docId;
        }
        var hash = docId + "$" + docNm + "$" + contentUrl;
        hash = btoa(encodeURIComponent(hash));

        location.href = host + "/index.html#" + hash;
    }
}