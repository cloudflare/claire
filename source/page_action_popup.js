// get the current tab's ID and extract request info
// from the extension object
var queryInfo = {
    active: true,
    windowId: chrome.windows.WINDOW_ID_CURRENT
};
chrome.tabs.query(queryInfo, function(tabs) {
    var tabID = tabs[0].id;
    // get the extension's window object
    var extensionWindow = chrome.extension.getBackgroundPage();
    var request = extensionWindow.requests[tabID];

    $("#ip").text(request.getServerIP());

    var ipType = (request.isv6IP())? "v6" : "v4";
    $("#ipAddress").addClass(ipType);

	// load the maps script and call addMap
	var loadGoogleMap = function() {
		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=addMap';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(ga, s);
	};

	// will be called after maps script loads
	window.addMap = function() {
		window.google.maps.visualRefresh = true;
		var locationData = request.getCloudFlareLocationData();
		var gLatLong = new google.maps.LatLng(locationData['latitude'],
							locationData['longitude']);
		// set map options
		var mapOptions = {
			zoom: 4,
			mapTypeControl: false,
			streetViewControl: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: gLatLong
		};
		// create map
		window.map = new google.maps.Map(
				document.getElementById('map'),
				mapOptions
			);
		var marker = new google.maps.Marker({
			map: map,
			position: gLatLong,
			title: locationData['city'],
			animation: google.maps.Animation.BOUNCE,
			icon: chrome.extension.getURL('images/orange-cloud-48.png')
		});

		// stop bounce animation on marker after 3 seconds
		setTimeout(function() {marker.setAnimation(null)}, 2000);

		var infoWindowContent = '<div><p>Served from <b>'+ request.getCloudFlareLocationName() +'</b><br><a href="https://www.cloudflare.com/network-map" target="_blank">CloudFlare Network Map</a></p></div>'

		var infowindow = new google.maps.InfoWindow({
			content: infoWindowContent
		});

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map, marker);
		});
	};

    // show the Ray ID & location
	if (request.servedByCloudFlare()) {
	    $("#rayID").text(request.getRayID());
        $("#locationCode").text(request.getCloudFlareLocationCode());
		$("#locationName").text(request.getCloudFlareLocationName());
	    $("#ray").show();
		loadGoogleMap();
	} else {
	    $("#map").hide();
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