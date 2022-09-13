/*
 Created by Bradley McGinn. 
 2017-2022
 brad.mcginn@gmail.com 


 */

var app = angular.module('App', []);
var _app; 
var Spreadsheet_Data = [];

var working_index = 0;


var infoWindows = [];
var markers = [];


  var watchID = undefined;


var start_item ={
	address:"52 Bayswater",
//	timestamp:"1/6/2000 0:0:0",
	uniqueID:makeid(),
	name:"Start Here",
	email:"",
	phone_number:"",
	available_to_receive:"",
	lat:"",
	lng:"",
	special_data:"start point"
}

var end_item ={
	address:"1082 Somerset St. West",
	//timestamp:"1/6/2002 0:0:0",
	uniqueID:makeid(),
	name:"Finish Here",
	email:"",
	phone_number:"",
	available_to_receive:"",
	lat:"",
	lng:"",
	special_data:"end point"
}


app.controller('App',function($scope){
	_app = this;// Global refrence;
	_app.scope = $scope;
	_app.csv_file = undefined;
	
	_app.uploading = false;

	_app.totalItems = function(){
		return markers.length;
	}
	_app.date_start = "";
	_app.date_end = "";
	_app.map_view = "compressed";
	_app.toolbar_view = "compressed";
	_app.mouse_mode = "default";
	_app.set_start_stop_points = "";
	_app.total_distance = 0;
	_app.total_time = 0;
	_app.selectedPoints = [];
	_app.submittedPoints = [];
	_app.submittedItems = [];
	_app.selectedItems = [];
	_app.rangeItems = [];
	_app.watching_location = false;

	_app.enter_select_mode = function(){
		enter_select_mode();
	}
	_app.geocode = function(){
		working_index =0
		findLatLong();
	}


	_app.changeDates = function(){
		_app.rangeItems = [];
		for(var i=0;i<Spreadsheet_Data.length;i++){
			var item = Spreadsheet_Data[i];
			if(checkBetweenDates(item.date_real)){
				_app.rangeItems.push(item);
			}
		}
		_app.rangeItems.splice(0,0,start_item);
		_app.rangeItems.push(end_item);
		displayPoints();
	}
	_app.selectAll = function(){
		_app.selectedItems = [];
		for(var i=0;i<markers.length;i++){
			_app.selectedItems.push(markers[i].item);
		}
		displayPoints();
	}

	
	_app.selectNone = function(){
		_app.selectedItems = [];
		displayPoints();
	}
	_app.flip_slected = function(){
		
	}
	_app.removeSelected = function(){
		for(var i=0;i<_app.rangeItems.length;i++){
			var item = _app.rangeItems[i];
			if(item_selected(item)){
				_app.rangeItems.splice(i,1);
				i--;
			}
		}
		_app.selectedItems = [];
		displayPoints();
	}
	
	_app.select_item = function(item){
		if(!item_selected(item)){
			_app.selectedItems.push(item);
		}else{
			for(var i=0;i<_app.selectedItems.length;i++){
				if(checkSameItem(item,_app.selectedItems[i])){
					_app.selectedItems.splice(i,1);
				}
			}
		}
		displayPoints();
	}
	_app.flipAll = function(){

		_app.rangeItems.reverse();


	}
	_app.item_background = function(item){

		if(item.lat == "" && item.lng == ""){
			return "item-background-no-location";
		}

		if(item.close){
			return "item-background-close";
		}

		for(var i=0;i<_app.selectedItems.length;i++){
			if(checkSameItem(item,_app.selectedItems[i])){
				return "item-background-selected";
			}
		}
		
	}
	_app.applyScope = function(){
		if(!_app.scope.$$phase) {
			_app.scope.$apply();
		}
	}

	_app.save = function(){
		var export_array = [];
		for(var i=0;i<_app.rangeItems.length;i++){
			var item =  _app.rangeItems[i];
			var newItem = {
				address:item.address,
				//uniqueID:item.uniqueID,
				name:item.name,
				email:item.email,
				phone_number:item.phone_number,
				available_to_receive:item.available_to_receive,
				lat:item.lat,
				lng:item.lng,
				URL_address:item.URL_address,
				special_data:item.special_data
			}
			export_array.push(newItem);
		}
		var data = Papa.unparse(export_array);
		$.ajax({
			type:'POST',
			url: "src/php/upload_csv.php",
			timeout: 7000, // sets timeout to 7 seconds
			data:{data:data},
			success:file_uploaded,
			error: address_error
		});
	}
	_app.download = function(){
		var rand = Math.round(Math.random*10000);
		window.open("src/csv/data.csv?nocache="+rand,"_blank");
	}
	_app.toggle_location = function(){
		_app.watching_location = !_app.watching_location;
		var locaton_button = document.getElementById("locaton_button");
		if(_app.watching_location){
			locaton_button.style.backgroundColor = "#0099EF";

			if (navigator.geolocation) {
				watchID = navigator.geolocation.watchPosition(showPosition);
			  } else {
				alert("Geolocation is not supported by this browser.");
			  }


		}else{
			locaton_button.style.backgroundColor = "";
			console.log(watchID)
			navigator.geolocation.clearWatch(watchID);
		}
	}

	
	_app.toogleTools = function(){
		var list_element = document.getElementById('list');
		var toolbar_element = document.getElementById('toolbar');
		list_element.classList.remove('list-toolbar-compressed');
		list_element.classList.remove('list-toolbar-compressed');
		
		if(_app.toolbar_view == "compressed"){
			_app.toolbar_view = "expanded";
		
		}else if(_app.toolbar_view == "expanded"){
			_app.toolbar_view = "compressed";
			list_element.style["paddingTop"] = '40px';
		}
		
		setTimeout(function(){
			list_element.style["paddingTop"] = toolbar_element.offsetHeight + 'px';
		},50);

	};

	_app.set_start_stop_points = function(){
		if(_app.mouse_mode == "select"){
			_app.mouse_mode = "default";
			document.getElementById("select_button").style.backgroundColor = "#EEE";
			map.set('draggable', true);
			google.maps.event.removeListener(listener_mousemove);
			google.maps.event.removeListener(listener_mousedown);
		}
		if(_app.mouse_mode == "default"){
			var button = document.getElementById('start_stop_button');
			button.innerHTML = "<i class='far fa-flag icon'></i> Choose Selected Start Point"
			button.style.backgroundColor = "#00FF33";
			_app.mouse_mode = "select-start";
		}else if(_app.mouse_mode == "select-start"){
			var button = document.getElementById('start_stop_button');
			button.innerHTML = "<i class='fas fa-flag-checkered icon'></i> Choose Selected End Point"
			button.style.backgroundColor = "#FF3300";
			_app.mouse_mode = "select-end";
		}else if(_app.mouse_mode == "select-end"){
			var button = document.getElementById('start_stop_button');
			button.innerHTML = "<i class='fas fa-route icon'></i> Choose And Stop Points"
			button.style.backgroundColor = "";
			_app.mouse_mode = "default";
		}
		
	}


	_app.item_selected = function(item){
		return item_selected(item);
	}

	_app.clear_address = function(item){
		item.lat = ""
		item.lng = "";
		item.URL_address = "";
	}

	_app.get_directions_from_here = function(index){
		var url = "https://www.google.com/maps/dir/";
		for(var i=index;i<_app.rangeItems.length;i++){
			url += _app.rangeItems[i].URL_address;
		}
		window.open(url,'_blank');
	}
	_app.get_directions_to_here = function(index){
		var url = "https://www.google.com/maps/place/";
		url += _app.rangeItems[index].URL_address;

		window.open(url,'_blank');
	}


	_app.moveSelectionUp = function(){
		var lowest_index = getLowestSelectedIndexInRange();
		var cut_items = [];
		for(var i=0;i<_app.rangeItems.length;i++){
			for(var ii=0;ii<_app.selectedItems.length;ii++){
				if(checkSameItem(_app.rangeItems[i], _app.selectedItems[ii])){
					cut_items.push(_app.rangeItems[i]);
					_app.rangeItems.splice(i,1);
					i--;
					ii+=_app.selectedItems.length;
					
				}
			}
		}
		console.log(lowest_index)
		if(lowest_index != 0){
		//	cut_items.reverse();
		}

		lowest_index--;
		
		
		lowest_index = Math.max(0,lowest_index);
		
		for(var ii=0;ii<cut_items.length;ii++){
			_app.rangeItems.splice(lowest_index+ii,0,cut_items[ii]);

		}
		draw_redline();
	}

	_app.moveSelectionDown = function(){
		var highest_index = getHighestSelectedIndexInRange();
		var cut_items = [];
		for(var i=0;i<_app.rangeItems.length;i++){
			for(var ii=0;ii<_app.selectedItems.length;ii++){
				if(checkSameItem(_app.rangeItems[i], _app.selectedItems[ii])){
					cut_items.push(_app.rangeItems[i]);
					_app.rangeItems.splice(i,1);
					i--;
					ii+=_app.selectedItems.length;
					
				}
			}
		}
		highest_index++;
		highest_index -= (cut_items.length-1);
		highest_index = Math.min(highest_index,_app.rangeItems.length);
		cut_items.reverse();
		
		for(var ii=0;ii<cut_items.length;ii++){
			_app.rangeItems.splice(highest_index,0,cut_items[ii]);

		}
		draw_redline();
	}
});



function getHighestSelectedIndexInRange(){
    var vlaue = 0;
    for(var i=0;i<_app.rangeItems.length;i++){
        for(var ii=0;ii<_app.selectedItems.length;ii++){
            if(checkSameItem(_app.rangeItems[i], _app.selectedItems[ii])
            &&!checkSameItem(_app.rangeItems[i], end_item)){
                vlaue = Math.max(i,vlaue);
            }
        }
    }
return vlaue;
}
function getLowestSelectedIndexInRange(){
    var vlaue = 100000;
    for(var i=0;i<_app.rangeItems.length;i++){
        for(var ii=0;ii<_app.selectedItems.length;ii++){
            if(checkSameItem(_app.rangeItems[i], _app.selectedItems[ii])
            &&!checkSameItem(_app.rangeItems[i], start_item)){
                vlaue = Math.min(i,vlaue);
            }
        }
    }
return vlaue;
}


function move_to_bottom_of_selection(item){
	for(var i=0;i<_app.rangeItems.length;i++){
		if(checkSameItem(_app.rangeItems[i], item)){
			var lowest_selected_index = getLowestSelectedIndexInRange();
			_app.rangeItems.splice(i,1);
			_app.rangeItems.splice(lowest_selected_index,0,item);
			i += _app.rangeItems.length;
		}
	}
}
function move_to_top_of_selection(item){
	for(var i=0;i<_app.rangeItems.length;i++){
		if(checkSameItem(_app.rangeItems[i], item)){
			var highest_selected_index = getHighestSelectedIndexInRange();
			_app.rangeItems.splice(i,1);
			_app.rangeItems.splice(highest_selected_index,0,item);
			i += _app.rangeItems.length;
		}
	}
}


item_selected = function(item){
	for(var i=0;i<_app.selectedItems.length;i++){
		if(checkSameItem(item,_app.selectedItems[i])){
			return true;
		}
	}
	return false;
}


function checkSameItem(itemA,itemB){
	var itemA_hash = itemA.uniqueID + itemA.address;
	var itemB_hash = itemB.uniqueID + itemB.address;
	if(itemA_hash == itemB_hash){
		return true;
	}
	return false;
}



document.addEventListener('keyup', (e) => {
	e.preventDefault();
	if(e.key == 'ArrowUp'){
		shift_array(-1);
	}
	if(e.key == 'ArrowDown'){
		shift_array(1);
	}
  });
///


function showPosition(position) {
	console.log("Latitude: " + position.coords.latitude +
	"\nLongitude: " + position.coords.longitude)
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;

	//lat = 45.3778055;
	//lng = -75.7324146;
	location_point.setPosition({lat:lat,lng:lng})
	location_point.position.lng = position.coords.longitude;
	map.setCenter({lat:lat,lng:lng})

	for(var i = 0;i<_app.rangeItems.length;i++){
		var dist = distanceCalculation(lat,lng, _app.rangeItems[i].lat,_app.rangeItems[i].lng)
		if(dist < .25){
			_app.rangeItems[i].close = true;
		}else{
			_app.rangeItems[i].close = false;
		}
	}
	_app.applyScope();
  }