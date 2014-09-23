// get the current tab's ID and extract request info
// from the extension object
var queryInfo = {
    active: true,
    windowId: chrome.windows.WINDOW_ID_CURRENT
};

if (localStorage.hide_guide === 'yes') {
	$('#claireInfoImage').hide();
}
chrome.tabs.query(queryInfo, function(tabs) {
    var tabID = tabs[0].id;
    // get the extension's window object
    var extensionWindow = chrome.extension.getBackgroundPage();
    var request = extensionWindow.requests[tabID];

    $("#ip").text(request.getServerIP());

    var ipType = (request.isv6IP())? "v6" : "v4";
    $("#ipAddress").addClass(ipType);

    // show the Ray ID & location
	if (request.servedByCloudFlare()) {
	    $("#rayID").text(request.getRayID());
        $("#locationCode").text(request.getCloudFlareLocationCode());
		$("#locationName").text(request.getCloudFlareLocationName());
	    $("#ray").show();
	}

    // show Railgun related info
    if (request.servedByRailgun()) {
        var railgunMetaData = request.getRailgunMetaData();
        $("#railgunID").text(railgunMetaData['id']);
        if (!railgunMetaData['normal']) {
            $("#railgunCompression").text(railgunMetaData['compression']);
            $("#railgunTime").text(railgunMetaData['time']);
        }
        $("#railgun").show();
    }

});
