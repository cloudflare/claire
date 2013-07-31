// when asked tell the extension about the SPDY status of current page

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'check_spdy_status') {
        sendResponse({'spdy': window.chrome.loadTimes().wasFetchedViaSpdy});
    }
});

// when executed, notify the extension about the SPDY status
chrome.runtime.sendMessage({'spdy': window.chrome.loadTimes().wasFetchedViaSpdy}, function() {});