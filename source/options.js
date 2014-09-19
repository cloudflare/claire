var debug_log_checkbox = document.getElementById('debug_log_checkbox');

// check current debug state flag and change the checkbox accordingly
debug_log_checkbox.checked = (localStorage.debug_logging === 'yes') ? true : false;

// attach a click event to the debug log preference checkbox
var debug_checkbox_clicked = function(e) {
    localStorage.debug_logging = (e.target.checked) ? 'yes' : 'no';
};
debug_log_checkbox.onclick = debug_checkbox_clicked;