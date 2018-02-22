'use strict';
// get the current tab's ID and extract request info
// from the extension object
var queryInfo = {
  active: true,
  windowId: chrome.windows.WINDOW_ID_CURRENT
};

if (localStorage.hide_guide === 'yes') {
  document.getElementById('claireInfoImage').classList.add('hidden');
}

document.addEventListener('click', function (evt) {
  var $el = evt.target;

  if ($el.matches('.copy-button')) {
    var copyId = $el.dataset.copyId;
    var $copyEl = document.getElementById(copyId);

    $copyEl.select();
    document.execCommand('copy');

    evt.preventDefault();
    evt.stopImmediatePropagation();
  }
});

chrome.tabs.query(queryInfo, function (tabs) {
  var tabID = tabs[0].id;
  // get the extension's window object
  var extensionWindow = chrome.extension.getBackgroundPage();
  var request = extensionWindow.requests[tabID];

  document.getElementById('ip').value = request.getServerIP();
  document.querySelector('#claireInfoImage img').src = request.getPopupPath() + '.png';

  // show the Ray ID & location
  if (request.servedByCloudFlare()) {
    document.getElementById('rayID').value = request.getRayID();
    document.getElementById('locationCode').textContent = request.getCloudFlareLocationCode();
    document.getElementById('locationName').textContent = request.getCloudFlareLocationName();
    document.getElementById('traceURL').href = request.getCloudFlareTrace();
  } else {
    document.getElementById('ray').classList.add('hidden');
    document.getElementById('loc').classList.add('hidden');
    document.getElementById('actions').classList.add('hidden');
  }

  // show Railgun related info
  if (request.servedByRailgun()) {
    var railgunMetaData = request.getRailgunMetaData();
    document.getElementById('railgunID').textContent = railgunMetaData.id;
    if (!railgunMetaData.normal) {
      document.getElementById('railgunCompression').textContent = railgunMetaData.compression;
      document.getElementById('railgunTime').textContent = railgunMetaData.time;
    }
  } else {
    document.getElementById('railgun').classList.add('hidden');
  }
});

if (require.main === module) {
  var style; // eslint-disable-line no-unused-vars
  style = require('purecss/build/pure-min.css');
  style = require('purecss/build/grids-responsive-min.css');
  style = require('octicons/build/font/octicons.min.css');
  style = require('./style.css');
}
