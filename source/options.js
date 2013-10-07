// list of checkbox id's
var options =
[
	"hide_icon",
	"debug_logging"
];

// go through each avaliable option
for (var i = 0; i < options.length; i++) {
	(function(option) {
		var element = document.getElementById(option);

		// set the value of the checkbox from localStorage
		element.checked = getOptionValue(option);

		// set the save function when the checkbox is changed
		element.onclick = function(e) {
			localStorage.setItem(option, (e.target.checked)? 'yes' : 'no');
		}
	})(options[i]);
};

// get a given options value from localStorage
function getOptionValue(option) {
	return localStorage.getItem(option) === 'yes';
}