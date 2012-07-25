/**
    Claire
    Show an orange cloud in the omnibar if the current website is on CloudFlare
    otherwise show the grey cloud.
*/

// check if the cloudflare server header is present in response headers array
var has_cf_server_header = function(headers) {
    for (var i=0; i < headers.length; i++) {
        var header = headers[i];
        if (header.name.toUpperCase() === "SERVER") {
            if (header.value === "cloudflare-nginx") {
                return true;
            } else {
                return false;
            }
        }
    };
    return false;
};

// get the Railgun ID value from header
var get_railgun_id = function(headers) {
    for (var i=0; i < headers.length; i++) {
        var header = headers[i];
        if (header.name.toUpperCase() === "CF-RAILGUN-ID") {
            return header.value;
        }
    };
    return "";
};


// check if IP is IPv6
// see if the IP address string has a . in it, if not it's IPv6
var v6_ip = function(ip) {
    if (ip.indexOf(".") !== -1) {
        return false;
    } else {
        return true;
    }
}


// intercept the message passed by the content script and set the right icon

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == 'set_claire_icon') {
        sendResponse({});   // empty response to close the request (message passed by Content Script)

        // remove the page action if navigating to a different page in
        // the same tab until we know which one to show
        chrome.pageAction.hide(sender.tab.id);
        try {
            // make an AJAX request to get the server header
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(data) {
                // wait for the headers received event
                if (xhr.readyState == 2) {
                    // set the appropriate icon

                    cf_status = (xhr.getResponseHeader("Server") === "cloudflare-nginx")? "on" : "off";
                    var image_path_parts = [cf_status];
                    if (request.spdy) image_path_parts.push("spdy");

                    var image_path = "images/claire-3-" + image_path_parts.join("-") + ".png";

                    chrome.pageAction.setIcon({tabId: sender.tab.id, path: image_path});
                    chrome.pageAction.show(sender.tab.id);

                }
            };

            xhr.open('GET', "http://"+request.host, true);
            xhr.send();
        } catch(e) {
            console.log(e);
        }
    }
});

chrome.webRequest.onCompleted.addListener(function(details) {

    if (localStorage.debug_logging !== 'undefined' && localStorage.debug_logging === 'yes') {
        console.log(details, details.url, "CF - " + has_cf_server_header(details.responseHeaders), details.ip, "Railgun - ", get_railgun_id(details.responseHeaders));
    }

}, {'urls': ['<all_urls>'], 'types': ['main_frame']}, ['responseHeaders']);


// when the page action icon is clicked, open a tab and load cloudflare.com

chrome.pageAction.onClicked.addListener(function() {
    chrome.tabs.create({url: "https://www.cloudflare.com"});
});
