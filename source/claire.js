/**
    CloudFlare Diagnostics
    Show an orange cloud in the omnibar if the current website is on CloudFlare
    otherwise show the grey cloud.
*/


// intercept the message passed by the content script and set the right icon


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    
    // set the appropriate icon
    
    if (request.on_cf) {
        chrome.pageAction.setIcon({tabId: sender.tab.id, path: "images/orange_cloud.png"});
        chrome.pageAction.show(sender.tab.id);
    } else {
        chrome.pageAction.setIcon({tabId: sender.tab.id, path: "images/grey_cloud.png"});
        chrome.pageAction.show(sender.tab.id);
    }
    
    sendResponse({});   // null response to close the request
    
});

// when the page action icon is clicked, open a tab and load cloudflare.com

chrome.pageAction.onClicked.addListener(function() {
    chrome.tabs.create({url: "https://www.cloudflare.com"});
});

