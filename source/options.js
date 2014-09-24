(function() {
	'use strict';
	var debug_log_checkbox = document.getElementById( 'debug_log_checkbox' );

	// check current debug state flag and change the checkbox accordingly
	debug_log_checkbox.checked = ( localStorage.debug_logging === 'yes' ) ? true : false;

	// attach a click event to the debug log preference checkbox
	var debug_checkbox_clicked = function( e ) {
		localStorage.debug_logging = ( e.target.checked ) ? 'yes' : 'no';
	};
	debug_log_checkbox.onclick = debug_checkbox_clicked;

	var claire_guide_checkbox = document.getElementById( 'claire_guide' );

	claire_guide_checkbox.checked = ( localStorage.hide_guide === 'yes' ) ? true : false;

	var claire_guide_clicked = function( e ) {
		localStorage.hide_guide = ( e.target.checked ) ? 'yes' : 'no';
	};

	claire_guide_checkbox.onclick = claire_guide_clicked;
}());

