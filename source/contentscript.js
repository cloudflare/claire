// determineConnectionInfo returns the protocol used to connect to the first hop
// for the first navigation event available.
function determineConnectionInfo() {
  if (performance && performance.getEntriesByType) {
    let entry = performance.getEntriesByType('navigation')[0];
    let proto = entry && entry.nextHopProtocol;

    return {
      type: proto
    };
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'check_connection_info') {
    sendResponse(determineConnectionInfo());
  }
});

// when executed, notify the extension about the connection info
chrome.runtime.sendMessage(determineConnectionInfo(), function () {
});
