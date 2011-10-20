/**
    CloudFlare Diagnostics
    Show an orange cloud in the omnibar if the current website is on CloudFlare
    otherwise show the grey cloud.
*/



// on request complete inspect the server header

// if the cloudflare-nginx header is found, pass message to bg page

chrome.tabs.onCreated.addListener(function(tab) {
    chrome.experimental.webRequest.onCompleted.addListener(function(details) {
        var on_cf = false;
        var response_headers = details.responseHeaders;
        details.responseHeaders.forEach(function(header) {
            if (header.name == "Server" && header.value == "cloudflare-nginx") {
                on_cf = true;
                console.log("on CF");
            }
        });
        
        if (on_cf) {
            chrome.pageAction.setIcon({tabId: tab.id, path: "images/orange_cloud.png"});
            chrome.pageAction.show(tab.id);
            console.log("set on CF icon");
        } else {
            chrome.pageAction.setIcon({tabId: tab.id, path: "images/grey_cloud.png"});
            chrome.pageAction.show(tab.id);
            console.log("set grey icon");
        }
        
    }, {types: ["main_frame"]}, ["responseHeaders"]);
});

