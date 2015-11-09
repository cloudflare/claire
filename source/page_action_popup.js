(function () {
  'use strict';
  /* global $ */
  // get the current tab's ID and extract request info
  // from the extension object
  var queryInfo = {
    active: true,
    windowId: chrome.windows.WINDOW_ID_CURRENT
  };

  if (localStorage.hide_guide === 'yes') {
    $('#claireInfoImage').hide();
  }

  $('.copy-button').on('click', function (evt) {
    var $el = $(this);
    var copyId = $el.data('copyId');
    var $copyEl = $('#' + copyId);

    $copyEl.select();
    document.execCommand('copy');

    evt.preventDefault();
  });

  chrome.tabs.query(queryInfo, function (tabs) {
    var tabID = tabs[0].id;
    // get the extension's window object
    var extensionWindow = chrome.extension.getBackgroundPage();
    var request = extensionWindow.requests[tabID];

    $('#ip').val(request.getServerIP());

    $('#claireInfoImage img').attr('src', request.getPopupPath());

    // show the Ray ID & location
    if (request.servedByCloudFlare()) {
      $('#rayID').val(request.getRayID());
      $('#locationCode').text(request.getCloudFlareLocationCode());
      $('#locationName').text(request.getCloudFlareLocationName());
    } else {
      $('#ray').attr('hidden', true);
      $('#loc').attr('hidden', true);
    }

    // show Railgun related info
    if (request.servedByRailgun()) {
      var railgunMetaData = request.getRailgunMetaData();
      $('#railgunID').text(railgunMetaData.id);
      if (!railgunMetaData.normal) {
        $('#railgunCompression').text(railgunMetaData.compression);
        $('#railgunTime').text(railgunMetaData.time);
      }
    } else {
      $('#railgun').attr('hidden', true);
    }
  });
})();

