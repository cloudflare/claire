(function() {
	'use strict';
	/* global $ */
	// get the current tab's ID and extract request info
	// from the extension object
	var queryInfo = {
		active : true,
		windowId : chrome.windows.WINDOW_ID_CURRENT
	};

	if ( localStorage.hide_guide === 'yes' ) {
		document.getElementById( 'claireInfoImage' ).classList.add( 'hidden' );
	}

	chrome.tabs.query( queryInfo, function( tabs ) {
		var tabID = tabs[0].id;
		// get the extension's window object
		var extensionWindow = chrome.extension.getBackgroundPage();
		var request = extensionWindow.requests[tabID];

		document.getElementById( 'ip' ).textContent = request.getServerIP();

		// show the Ray ID & location
		if ( request.servedByCloudFlare() ) {
			document.getElementById( 'rayID' ).textContent = request.getRayID();
			document.getElementById( 'locationCode' ).textContent = request.getCloudFlareLocationCode();
			document.getElementById( 'locationName' ).textContent = request.getCloudFlareLocationName();
			document.getElementById( 'ray' ).classList.remove( 'hidden' );
			document.getElementById( 'loc' ).classList.remove( 'hidden' );
		}

		// show Railgun related info
		if ( request.servedByRailgun() ) {
			var railgunMetaData = request.getRailgunMetaData();
			document.getElementById( 'railgunID' ).textContent = railgunMetaData.id;
			if ( !railgunMetaData.normal ) {
				document.getElementById( 'railgunCompression' ).textContent = railgunMetaData.compression;
				document.getElementById( 'railgunTime' ).textContent = railgunMetaData.time;
			}
			document.getElementById( 'railgun' ).classList.remove( 'hidden' );
		}
	});
}());
