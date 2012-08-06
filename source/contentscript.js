// when asked tell the extension about the SPDY status of current page

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'check_spdy_status') {
        sendResponse({'spdy': window.chrome.loadTimes().wasFetchedViaSpdy});
    }
});