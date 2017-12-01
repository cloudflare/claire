'use strict';
var airports = require('./airports');

  // the Request object, contains information about a request
var Request = function (details) {
  this.details = details;
  this.headersRaw = details.responseHeaders;

    // headers will be stored as name: value pairs (all names will be upper case)
  this.headers = {};

    // this status is available in the context of the page, requires message passing
    // from the extension to the page
  this.hasConnectionInfo = false;
  this.connectionType = null;

  this.preProcessHeaders();
};

  // convert the headers array into an object and upcase all names
  // (warning! will preserve only last of multiple headers with same name)
Request.prototype.preProcessHeaders = function () {
  this.headersRaw.forEach(function (header) {
    this.headers[header.name.toUpperCase()] = header.value;
  }, this);

  if ('CF-RAILGUN' in this.headers) {
    this.processRailgunHeader();
  }
};

Request.prototype.processRailgunHeader = function () {
  var railgunHeader = this.headers['CF-RAILGUN'];

  this.railgunMetaData = {};

  if (typeof railgunHeader !== 'string') {
    return this.railgunMetaData;
  }

    // Railgun header can be in one of two formats
    // one of them will have the string "normal"
  var railgunNormal = railgunHeader.indexOf('normal') !== -1;

  var parts = railgunHeader.split(' ');

  var flagsBitset = 0;

  this.railgunMetaData.normal = railgunNormal;
  this.railgunMetaData.id = parts[0];
  if (railgunNormal) {
    flagsBitset = parseInt(parts[1], 10);
    this.railgunMetaData.version = parts[3];
  } else {
    this.railgunMetaData.compression = (100 - parts[1]) + '%';
    this.railgunMetaData.time = parts[2] + 'sec';
    flagsBitset = parseInt(parts[3], 10);
    this.railgunMetaData.version = parts[4];
  }

    // decode the flags bitest
  var railgunFlags = {
    FLAG_DOMAIN_MAP_USED: {
      position: 0x01,
      message: 'map.file used to change IP'
    },
    FLAG_DEFAULT_IP_USED: {
      position: 0x02,
      message: 'map.file default IP used'
    },
    FLAG_HOST_CHANGE: {
      position: 0x04,
      message: 'Host name change'
    },
    FLAG_REUSED_CONNECTION: {
      position: 0x08,
      message: 'Existing connection reused'
    },
    FLAG_HAD_DICTIONARY: {
      position: 0x10,
      message: 'Railgun sender sent dictionary'
    },
    FLAG_WAS_CACHED: {
      position: 0x20,
      message: 'Dictionary found in memcache'
    },
    FLAG_RESTART_CONNECTION: {
      position: 0x40,
      message: 'Restarted broken origin connection'
    }
  };

  var messages = [];

  for (var flagKey in railgunFlags) {
    if (Object.prototype.hasOwnProperty.call(railgunFlags, flagKey)) {
      var flag = railgunFlags[flagKey];
      if ((flagsBitset & flag.position) !== 0) {
        messages.push(flag.message);
      }
    }
  }

  this.railgunMetaData.flags = flagsBitset;
  this.railgunMetaData.messages = messages;
};

Request.prototype.queryConnectionInfoAndSetIcon = function () {
  var tabID = this.details.tabId;
  if (this.hasConnectionInfo) {
    this.setPageActionIconAndPopup();
  } else {
    var csMessageData = {
      action: 'check_connection_info'
    };
    var csMessageCallback = function (csMsgResponse) {
      // stop and return if we don't get a response, happens with background tabs,
      // or if the next hop information is unavailable.
      if (typeof csMsgResponse === 'undefined') {
        return;
      }

      var request = window.requests[tabID];
      request.setConnectionInfo(csMsgResponse);
      request.setPageActionIconAndPopup();
    };

    try {
      chrome.tabs.sendMessage(this.details.tabId, csMessageData, csMessageCallback);
    } catch (err) {
      console.log('caught exception when sending message to content script');
      console.log(chrome.extension.lastError());
      console.log(err);
    }
  }
};

  // check if the server header matches 'cloudflare-nginx'
Request.prototype.servedByCloudFlare = function () {
  return ('SERVER' in this.headers) && (/^cloudflare/i.test(this.headers.SERVER));
};

Request.prototype.servedByRailgun = function () {
  return 'CF-RAILGUN' in this.headers;
};

Request.prototype.servedOverH2 = function () {
  return this.connectionType === 'h2';
};

Request.prototype.ServedFromBrowserCache = function () {
  return this.details.fromCache;
};

  // RAY ID header format: CF-RAY:f694c6892660106-DFW
Request.prototype.getRayID = function () {
  let ray = this.headers['CF-RAY'];

  if (ray) {
    return ray.split('-')[0];
  }

  return;
};

Request.prototype.getCloudFlareLocationCode = function () {
  let ray = this.headers['CF-RAY'];

  if (ray) {
    return ray.split('-')[1];
  }

  return;
};

Request.prototype.getCloudFlareLocationData = function () {
  var locationCode = this.getCloudFlareLocationCode();
  return airports[locationCode];
};

Request.prototype.getCloudFlareLocationName = function () {
  var airportData = this.getCloudFlareLocationData();
  if (airportData) {
    return airportData.city + ', ' + airportData.country;
  }

  return this.getCloudFlareLocationCode();
};

Request.prototype.getCloudFlareTrace = function () {
  var traceURL = new URL(this.details.url);
  traceURL.pathname = '/cdn-cgi/trace';
  return traceURL.toString();
};

Request.prototype.getTabID = function () {
  return this.details.tabId;
};

Request.prototype.getRequestURL = function () {
  return this.details.url;
};

Request.prototype.getRailgunMetaData = function () {
  return this.railgunMetaData;
};

Request.prototype.getServerIP = function () {
  return this.details.ip ? this.details.ip : '';
};

Request.prototype.isv6IP = function () {
  return this.getServerIP().indexOf(':') !== -1;
};

  // figure out what the page action should be based on the
  // features we detected in this request
Request.prototype.getPageActionPath = function () {
  return this.getImagePath('images/claire-3-');
};

Request.prototype.getPopupPath = function () {
  return this.getImagePath('images/claire-3-popup-');
};

Request.prototype.getImagePath = function (basePath) {
  var iconPathParts = [];

  if (this.servedByCloudFlare()) {
    iconPathParts.push('on');
  } else {
    iconPathParts.push('off');
  }

  if (this.servedOverH2()) {
    iconPathParts.push('h2');
  }

  if (this.isv6IP()) {
    iconPathParts.push('ipv6');
  }

  if (this.servedByRailgun()) {
    iconPathParts.push('rg');
  }

  return basePath + iconPathParts.join('-');
};

Request.prototype.setConnectionInfo = function (connectionInfo) {
  this.hasConnectionInfo = true;
  this.connectionType = connectionInfo.type;
};

Request.prototype.setPageActionIconAndPopup = function () {
  var iconPath = this.getPageActionPath();
  var tabID = this.details.tabId;
  chrome.pageAction.setIcon({
    tabId: this.details.tabId,
    path: {
      19: iconPath + '.png',
      38: iconPath + '@2x.png'
    }
  }, function () {
    try {
      chrome.pageAction.setPopup({
        tabId: tabID,
        popup: 'page-action-popup.html'
      });
      chrome.pageAction.show(tabID);
    } catch (err) {
      console.log('Exception on page action show for tab with ID: ', tabID, err);
    }
  });
};

Request.prototype.logToConsole = function () {
  if (localStorage.getItem('debug_logging') !== 'yes') {
    return;
  }

  console.log('\n');
  console.log(this.details.url, this.details.ip, 'CF - ' + this.servedByCloudFlare());
  console.log('Request - ', this.details);
  if (this.servedByCloudFlare()) {
    console.log('Ray ID - ', this.getRayID());
  }
  if (this.servedByRailgun()) {
    var railgunMetaData = this.getRailgunMetaData();
    console.log('Railgun - ', railgunMetaData.id, railgunMetaData.messages.join('; '));
  }
};

module.exports = Request;
