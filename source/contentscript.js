// tell the extension about the domain

chrome.extension.sendRequest(
    {
        'action': 'set_claire_icon',
        'host': window.location.host,
        'protocol': window.location.protocol,
        'spdy': window.chrome.loadTimes().wasFetchedViaSpdy
    },
    function(response) {}
);