/**
    Claire
    Show an orange cloud in the omnibar if the current website is on CloudFlare
    otherwise show the grey cloud.
*/

// iterate over response headers and see if the page passed through CloudFlare
// and if Railgun was used on the backend
var get_cf_info_from_headers = function(headers) {
    var cf_status = {
        'cloudflare': false,
        'railgun': false
    };

    for (var i=0; i < headers.length; i++) {
        var header = headers[i];
        // if server header has cloudflare-nginx
        if (header.name.toUpperCase() === "SERVER") {
            if (header.value === "cloudflare-nginx") {
                cf_status.cloudflare = true;
                continue;
            } else {
                cf_status.cloudflare = false;
                cf_status.railgun = false;
                return cf_status;
            }
        }
        // if railgun ID header is present
        if (header.name.toUpperCase() === "CF-RAILGUN") {
            cf_status.cloudflare = true;
            cf_status.railgun = true;
            cf_status.railgun_id = header.value;
            return cf_status;
        }
    };
    return cf_status;
};

// check if IP address is IPv6
// see if the IP address string has a : in it
var v6_ip = function(ip) {
    return (ip.indexOf(":") !== -1)? true : false;
}

// listen to web requests on completed event
chrome.webRequest.onCompleted.addListener(function(details) {

    var tab_id = details.tabId;

    var cf_info = get_cf_info_from_headers(details.responseHeaders);

    // logging - controlled by a flag, toggle available in the extension's options page
    if (typeof localStorage.debug_logging !== 'undefined' && localStorage.debug_logging === 'yes') {
        console.log(details, details.url, "CF - " + cf_info.cloudflare, details.ip, "Railgun - ", cf_info.railgun_id);
    }

    try {
        // send a message to content script and ask about SPDY status
        var cs_message_data = {'action': 'check_spdy_status'};
        var cs_message_callback = function(cs_msg_response) {

            // stop and return if we don't get a response, happens with hidden/background tabs
            if (typeof cs_msg_response === 'undefined') return;

            var cf_status = cf_info.cloudflare? "on" : "off";
            var image_parts = [cf_status];
            if (cs_msg_response.spdy) image_parts.push("spdy");
            if (v6_ip(details.ip)) image_parts.push("ipv6");
            if(cf_info.railgun) image_parts.push("rg");

            var image_path = "images/claire-3-" + image_parts.join("-") + ".png";

            chrome.pageAction.setIcon({tabId: tab_id, path: image_path});
            chrome.pageAction.setPopup({'tabId': tab_id, 'popup': "page_action_popup.html"});
            chrome.pageAction.show(tab_id);

        };
        chrome.tabs.sendMessage(tab_id, cs_message_data, cs_message_callback);
    } catch(e) {
        console.log("Exception", e);
    }

}, {'urls': ['http://*/*', 'https://*/*'], 'types': ['main_frame']}, ['responseHeaders']);
