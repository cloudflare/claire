// tell the extension about the domain

chrome.extension.sendRequest(
    {
        'host': window.location.host,
        'action': 'set_claire_icon'
    },
    function(response) {}
);