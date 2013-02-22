// get the current tab's ID and extract request info
// from the extension object
var queryInfo = {
    active: true,
    windowId: chrome.windows.WINDOW_ID_CURRENT
};
chrome.tabs.query(queryInfo, function(tabs) {
    var tab_id = tabs[0].id;
    // get the extension's window object
    var bg_window = chrome.extension.getBackgroundPage();
    var request_info = bg_window.tab_data[tab_id];

    if ('ip' in request_info) {
        $("#ip").text(request_info['ip']);
        var ip_type = (('ipv6' in request_info) && (request_info['ipv6'] === true))? "v6" : "v4";
        $("#ipAddress").addClass(ip_type);
    }

    // show the Ray ID
    if ('ray_id' in request_info) {
        $("#rayID").text(request_info.ray_id);
        $("#ray").show();
    }

    // show Railgun related info
    if ('railgun_meta_data' in request_info) {
        var railgun_meta_data = request_info['railgun_meta_data'];
        $("#railgunID").text(railgun_meta_data['id']);
        if (!railgun_meta_data['normal']) {
            $("#railgunCompression").text(railgun_meta_data['compression']);
            $("#railgunTime").text(railgun_meta_data['time']);
        }
        $("#railgun").show();
    }
});