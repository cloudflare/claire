// when asked tell the extension about the SPDY/HTTP2 status of current page

function determineConnectionInfo() {
  var loadTimes = chrome.loadTimes();
  return {
    spdy: loadTimes.wasFetchedViaSpdy,
    type: loadTimes.npnNegotiatedProtocol || loadTimes.connectionInfo
  };
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'check_connection_info') {
    sendResponse(determineConnectionInfo());
  }
});

// when executed, notify the extension about the connection info
chrome.runtime.sendMessage(determineConnectionInfo(), function () {
});
