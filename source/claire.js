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
        var header_name = header.name.toUpperCase();
        // if server header has cloudflare-nginx
        if (header_name === "SERVER") {
            if (header.value === "cloudflare-nginx") {
                cf_status.cloudflare = true;
                continue;
            } else {
                cf_status.cloudflare = false;
                cf_status.railgun = false;
                return cf_status;
            }
        }
        // if CF-RAY header is present, get the RAY ID
        if (header_name === "CF-RAY") {
            cf_status['ray_id'] = header.value;
        }
        // if railgun ID header is present
        if (header_name === "CF-RAILGUN") {
            cf_status.cloudflare = true;
            cf_status.railgun = true;
            cf_status.railgun_header = header.value;
            cf_status.railgun_meta_data = process_railgun_header(header.value);
        }
    }
    return cf_status;
};

// check if IP address is IPv6
// see if the IP address string has a : in it
var v6_ip = function(ip) {
    return (ip.indexOf(":") !== -1)? true : false;
};

// extract info from the Railgun header
// sample - f1cb3b9f7d 0.02 0.008966 30
// Railgun ID, compression, time to generate response, bit set (see code)
var process_railgun_header = function(header) {
    var info = {};
    if (!(typeof header === "string")) {
        return info;
    }
    var parts = header.split(" ");
    info['id'] = parts[0];
    info['compression'] = (100 - parts[1]) + "%";
    info['time'] = parts[2] + "sec";

    // decode the flags bitest
    var flags_bitset = parseInt(parts[3], 10);

    var railgun_flags = {
        FLAG_DOMAIN_MAP_USED: {
            position: 0x01,
            message: "map.file used to change IP"
        },
        FLAG_DEFAULT_IP_USED: {
            position: 0x02,
            message: "map.file default IP used"
        },
        FLAG_HOST_CHANGE: {
            position: 0x04,
            message: "Host name change"
        },
        FLAG_REUSED_CONNECTION: {
            position: 0x08,
            message: "Existing connection reused"
        },
        FLAG_HAD_DICTIONARY: {
            position: 0x10,
            message: "Railgun sender sent dictionary"
        },
        FLAG_WAS_CACHED: {
            position: 0x20,
            message: "Dictionary found in memcache"
        },
        FLAG_RESTART_CONNECTION: {
            position: 0x40,
            message: "Restarted broken origin connection"
        }
    }

    var messages = [];

    for(var flag_key in railgun_flags) {
        var flag = railgun_flags[flag_key];
        if ((flags_bitset & flag.position) !== 0) {
            messages.push(flag.message);
        }
    }

    info['flags'] = flags_bitset;
    info['messages'] = messages;

    return info;
};

// store CloudFlare related request info in an object keyed by tab ID
// for use in other places (for example - page action popup)
var tab_data = {};

// clear tab data when tabs are destroyed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) { delete tab_data[tabId] });

// listen to web requests on completed event
chrome.webRequest.onCompleted.addListener(function(details) {

    var tab_id = details.tabId;

    var cf_info = get_cf_info_from_headers(details.responseHeaders);

    // store for use in other contexts
    tab_data[tab_id] = cf_info;
    tab_data[tab_id]['ip'] = details.ip;
    tab_data[tab_id]['ipv6'] = v6_ip(details.ip);

    // logging - controlled by a flag, toggle available in the extension's options page
    if (typeof localStorage.debug_logging !== 'undefined' && localStorage.debug_logging === 'yes') {
        console.log(details.url, details.ip, "CF - " + cf_info.cloudflare);
        console.log("Request - ", details);
        if (cf_info.cloudflare) {
            console.log("CloudFlare - ", cf_info.ray_id, cf_info);
        }
        if (cf_info.railgun) {
            console.log("Railgun - ", cf_info.railgun_meta_data['id'], cf_info.railgun_meta_data.messages.join("; "));
        }
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
