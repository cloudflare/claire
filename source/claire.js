/**
    Claire
    Show an orange cloud in the omnibar if the current website is on CloudFlare
    otherwise show the grey cloud.
*/


// intercept the message passed by the content script and set the right icon

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
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
                    if (xhr.getResponseHeader("Server") === "cloudflare-nginx") {
                        var has_spdy_str = (request.spdy)? "_spdy" : "";
                        var orange_cloud_path = "images/orange_cloud" + has_spdy_str + ".png";
                        chrome.pageAction.setIcon({tabId: sender.tab.id, path: orange_cloud_path});
                        chrome.pageAction.show(sender.tab.id);
                    } else {
                        chrome.pageAction.setIcon({tabId: sender.tab.id, path: "images/grey_cloud.png"});
                        chrome.pageAction.show(sender.tab.id);
                    }
                }
            };

            xhr.open('HEAD', "http://"+request.host, true);
            xhr.send();
        } catch(e) {
            console.log(e);
        }
    }
});



// when the page action icon is clicked, open a tab and load cloudflare.com

chrome.pageAction.onClicked.addListener(function() {
    chrome.tabs.create({url: "https://www.cloudflare.com"});
});
