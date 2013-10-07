var hide_icon_checkbox = document.getElementById('hide_icon_checkbox');
var debug_log_checkbox = document.getElementById('debug_log_checkbox');

// check current debug state flag and change the checkbox accordingly
debug_log_checkbox.checked = getOptionValue(localStorage.debug_logging);

hide_icon_checkbox.checked = getOptionValue(localStorage.hide_icon);

// attach a click event to the debug log preference checkbox
var debug_checkbox_clicked = function(e) {
    localStorage.debug_logging = (e.target.checked)? 'yes' : 'no';
};

var hide_icon_clicked = function(e) {
    localStorage.hide_icon = (e.target.checked)? 'yes' : 'no';
};

debug_log_checkbox.onclick = debug_checkbox_clicked;
hide_icon_checkbox.onclick = hide_icon_clicked;

function getOptionValue(setting_value) {
	return setting_value === 'yes';
}