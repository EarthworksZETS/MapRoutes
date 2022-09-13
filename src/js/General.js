Date.prototype.yyyymmdd = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();

	mm = (mm>9 ? '' : '0') + mm;
	dd = (dd>9 ? '' : '0') + dd;

	return this.getFullYear() + "-"+mm+"-"+dd;
  };
  

  function makeid() {
	  var length = 5;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

function toggleMap(){
	var map_element = document.getElementById('map');
	var list_element = document.getElementById('list');
	if(_app.map_view == "expanded"){
		_app.map_view = "compressed";
		map_element.classList.remove('map-expanded');
		map_element.classList.add('map-compressed');
		list_element.classList.remove('list-compressed');
		list_element.classList.add('list-expanded');
	}else if(_app.map_view == "compressed"){
		_app.map_view = "expanded";
		map_element.classList.add('map-expanded');
		map_element.classList.remove('map-compressed');
		list_element.classList.add('list-compressed');
		list_element.classList.remove('list-expanded');
	}
	_app.applyScope();
}
