(function () {
  'use strict';
  var debugLogCheckbox = document.getElementById('debug_log_checkbox');

  // check current debug state flag and change the checkbox accordingly
  debugLogCheckbox.checked = localStorage.debug_logging === 'yes';

  // attach a click event to the debug log preference checkbox
  var debugCheckboxClicked = function (e) {
    localStorage.debug_logging = e.target.checked ? 'yes' : 'no'; // eslint-disable-line camelcase
  };
  debugLogCheckbox.onclick = debugCheckboxClicked;

  var claireGuideCheckbox = document.getElementById('claire_guide');

  claireGuideCheckbox.checked = localStorage.hide_guide === 'yes';

  var claireGuideClicked = function (e) {
    localStorage.hide_guide = e.target.checked ? 'yes' : 'no'; // eslint-disable-line camelcase
  };

  claireGuideCheckbox.onclick = claireGuideClicked;
})();

