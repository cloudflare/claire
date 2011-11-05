// Fetch the current page asynchronously and check the Server header
// if it matches, send a show page action message

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function(data) {
    if (xhr.readyState == 4) {
        chrome.extension.sendRequest(
            {on_cf: (xhr.getResponseHeader("Server") === "cloudflare-nginx")}, 
            function(response) {}
        );
    }
}

var url = window.location.href;
xhr.open('HEAD', url, true);
xhr.send();