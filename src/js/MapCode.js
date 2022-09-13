


var listener_mouseup = undefined;
var listener_mousedown = undefined;
var listener_mousemove = undefined;
var selectBox = undefined;
var mouse_moved = false;
function enter_select_mode(){
    if(_app.mouse_mode == "default"){
        _app.mouse_mode = "select";
        document.getElementById("select_button").style.backgroundColor = "#FFCC00";
        map.set('draggable', false);

        listener_mousedown = map.addListener("mousedown", (mapsMouseEvent) => {
          
            _app.selectedPoints = [];
            _app.selectedItems = [];
            displayPoints();
            _app.applyScope();
            google.maps.event.removeListener(listener_mousemove);
            listener_mouseup = document.addEventListener("mouseup", mouse_up);
            mouse_start = mapsMouseEvent.latLng;
            mouse_moved = false;
            listener_mousemove = map.addListener("mousemove", (mapsMouseEvent) => {
                mouse_end = mapsMouseEvent.latLng;
                mouse_moved = true;
                if(selectBox != undefined){
                    selectBox.setMap(null);
                }
                highlightDots(mouse_start,mouse_end);
                var Coordinates = [
                    { lat: mouse_start.lat(), lng: mouse_start.lng()},
                    { lat: mouse_end.lat(), lng: mouse_start.lng() },
                    { lat: mouse_end.lat(), lng: mouse_end.lng() },
                    { lat: mouse_start.lat(), lng: mouse_end.lng()},
                  ];
                  selectBox = new google.maps.Polygon({
                    path: Coordinates,
                    geodesic: true,
                    strokeColor: "#000",
                    fillColor: "#EEE",
                    fillOpacity: 0.2,
                    strokeOpacity: 1.0,
                    strokeWeight: 1,
                    clickable:false
                  });
                  selectBox.setMap(map);
            });
            
        });



    }else if(_app.mouse_mode == "select"){
        _app.mouse_mode = "default";
        document.getElementById("select_button").style.backgroundColor = "#EEE";
        map.set('draggable', true);
        google.maps.event.removeListener(listener_mousemove);
        google.maps.event.removeListener(listener_mousedown);
    }
}


function mouse_up (){
    console.log("Mouse up");
    if(selectBox){
       selectBox.setMap(null);
   }
    if(mouse_moved){
    selectDots(mouse_start,mouse_end);
    }
   displayPoints();
   google.maps.event.removeListener(listener_mousemove);
   document.removeEventListener("mouseup",mouse_up);
   mouse_start = new google.maps.LatLng(45, -75);
   mouse_end = new google.maps.LatLng(45, -75);
   _app.applyScope();
}

let directionsService = undefined;
let directionsRenderer = undefined;
let map = undefined; 
let mouse_start = undefined;
let mouse_end = undefined;

let start_point = undefined;
let end_point = undefined;


var location_point = undefined; 

function initMap() {

	directionsService = new google.maps.DirectionsService();
	directionsRenderer = new google.maps.DirectionsRenderer();
	map = new google.maps.Map(document.getElementById("map"), {
	  zoom: 12,
	  center: { lat: 45.405821, lng: -75.717988 },
	  zoomControl: true,
	  mapTypeControl: true,
	  scaleControl: false,
	  streetViewControl: false,
	  rotateControl: false,
	  fullscreenControl: false,
	  clickableIcons:false,
      
	});//suppressBicyclingLayer:true,


    var rendererOptions = {
        map: map,
        suppressBicyclingLayer:true,
        suppressMarkers:true,
        suppressPolylines:true,
      }
      directionsRenderer = new google.maps.DirectionsRenderer(rendererOptions)


    mouse_start = new google.maps.LatLng(45, -75);
    mouse_end = new google.maps.LatLng(45, -75);


   

    var icon={
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        strokeWeight:1,
        strokeColor:"#0000FF",
        strokeOpacity:1,
        fillColor:"#0099EF",
        fillOpacity:.5,
    };
 
    location_point = new google.maps.Marker({
    position: {lat:49,lng:-129},
    map,
    icon
  });

  //drawMarker;

  setTimeout(initalize_spreadsheets,50);
};


function roundDegree(value){
    var unit = 100000;
    value = Number(value);
    value *= unit;
    value = Math.round(value);
    value /= unit;
    return value;
}
function checkSameLocation(itemA,itemB){
    var itemA_lat = roundDegree(itemA.lat);
    var itemA_lng = roundDegree(itemA.lng);
    var itemB_lat = roundDegree(itemB.lat);
    var itemB_lng = roundDegree(itemB.lng);
    if(itemA_lat == itemB_lat &&
        itemA_lng == itemB_lng){
       return true;
    }
    return false;
}
function checkSameLocationInArry(array,item){
    for(var i=0;i<array.length;i++){
        if(checkSameLocation(array[i],item)){
            console.log("DUPLICATE POINT FOUND")
            return true;
        }
    }
    return false;
}

var old_waypoint_order = [];
function getDirectons() {
	const waypts = [];
    old_waypoint_order = [];
	for (let i = 0; i < _app.rangeItems.length; i++) {
		var item = _app.rangeItems[i];
        if(item_selected(item)){
            if(!checkSameLocationInArry(old_waypoint_order,item)){
                old_waypoint_order.push(item);
                waypts.push({
                location: item.marker.position,
                stopover: true,
                });
            }
        }
	}


    var start = waypts[0].location;
    var end = waypts[waypts.length -1].location;
    waypts.splice(0,1);
    waypts.splice(-1,1);

    console.log(waypts.length + " way points");
	if(waypts.length > 23){
		alert("23 points maximum");
		return;
	}
    // suppressBicyclingLayer:true,
	directionsService
	  .route({
		origin:start,
		destination: end,
		waypoints: waypts,
		optimizeWaypoints: true,
		travelMode: google.maps.TravelMode.BICYCLING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
	  })
	  .then((response) => {
		directionsRenderer.setDirections(response);
		const route = response.routes[0];
        for(var i=0;i<route.waypoint_order.length;i++){
            route.waypoint_order[i]++;
        }
        reshuffle_array (route.waypoint_order);
        draw_redline();
		_app.total_distance = 0;
		var total_time = 0;		
		for(var i=0;i<route.legs.length;i++){
			_app.total_distance += route.legs[i].distance.value;
			total_time += route.legs[i].duration.value;
		}
		_app.total_distance /= 1000;
		_app.total_distance = Math.round(_app.total_distance*100)/100 ;

		_app.total_distance = _app.total_distance + " km";
		total_time /= 60;
		
		var hours = 0;
		while(total_time > 60){
			total_time -= 60;
			hours++;
		}
		total_time = Math.round(total_time*100)/100;
		if(hours ==0){
			_app.total_time = total_time + " minutes;";
		}else{
			_app.total_time = hours +"h and "+total_time + " minutes;";
		}
		_app.applyScope();
		return;
	  })
	  .catch((e) => console.log( status));
  }
  
  window.initMap = initMap;
  
  let redline = undefined;
  function draw_redline(){
    var Coordinates = [];
    for(var i=0;i<_app.rangeItems.length;i++){
        var marker = _app.rangeItems[i].marker;
        if(marker){
         Coordinates.push(marker.position);
        }
    }
    if(redline){
        redline.setMap(null);
    }
      
    redline = new google.maps.Polyline({
        path: Coordinates,
        geodesic: true,
        strokeColor: "#0099EF",
        strokeOpacity: .5,
        strokeWeight: 6,
        clickable:false
      });
      redline.setMap(map);
      
  }

  function getAllSelectedItemsWithSameLocation(item){
    var export_array = [];
    for(var i=0;i<_app.selectedItems.length;i++){
        var selected_item = _app.selectedItems[i];
        if(!checkSameItem(selected_item,item)){
            if(checkSameLocation(selected_item,item)){
                export_array.push(selected_item);
            }
        }
    }
    return export_array;
  }

function reshuffle_array(waypoint_order){
    var new_item_order = [];
    new_item_order.push(old_waypoint_order[0]);
    for(var i=0;i<waypoint_order.length;i++){
        // get the ITEM at the now shuffeled index of the original 
        var index = waypoint_order[i];
        var indexed_item = old_waypoint_order[index];
        new_item_order.push(indexed_item);
    }
    new_item_order.push(old_waypoint_order[old_waypoint_order.length-1]);

    for(var i=0;i<new_item_order.length;i++){
        var item = new_item_order[i];
        
        var same_location_items =  getAllSelectedItemsWithSameLocation(item);
        console.log("point "+i + " with " + same_location_items.length + " same locctions;")
        for(var ii=0;ii<same_location_items.length;ii++){
            new_item_order.splice(i,0,same_location_items[ii]);
            i += 1;
        }
    }


    var index = -1;
    for (let i = 0; i < _app.rangeItems.length; i++) {
        // take out all the items that are selected 
		var item = _app.rangeItems[i];
        if(item_selected(item)){
            if(index == -1){
                index = i;
            }
            _app.rangeItems.splice(i,1); 
            i--;
        }
    }
    for(var i=new_item_order.length-1;i>=0;i--){
        _app.rangeItems.splice(index,0,new_item_order[i])

    }

    
    _app.applyScope();
}

shift_array = function(value){
    return;
    _app.rangeItems.splice(0,1);
    _app.rangeItems.splice(-1,1);

// This needs some work
    if(value <0){
    for(var i=0;i<_app.selectedItems.length;i++){
       var item = _app.selectedItems[i];
       for(var ii=0;ii<_app.rangeItems.length;ii++){
        if(checkSameItem(_app.rangeItems[ii], item)){
           _app.rangeItems.splice(ii,1);
           move_to = ii+value;
           move_to = Math.max(1,move_to);
           move_to = Math.min(_app.rangeItems.length,move_to);
          _app.rangeItems.splice(move_to,0,item);
          ii += _app.rangeItems.length;
         }
       }
    }
} else  if(value >0){
    for(var i=_app.selectedItems.length-1;i>=0;i--){
        var item = _app.selectedItems[i];
        for(var ii=0;ii<_app.rangeItems.length;ii++){
         if(checkSameItem(_app.rangeItems[ii], item)){
            _app.rangeItems.splice(ii,1);
            move_to = ii+value;
            move_to = Math.max(1,move_to);
            move_to = Math.min(_app.rangeItems.length,move_to);
           _app.rangeItems.splice(move_to,0,item);
           ii += _app.rangeItems.length;
          }
        }
     }
}
    _app.rangeItems.splice(0,0,start_item);
    _app.rangeItems.push(end_item);
    draw_redline();
    _app.applyScope();
}

  function displayPoints(){
	clearAllMarkers();
	for(var i=0;i<_app.rangeItems.length;i++){
		var item = _app.rangeItems[i];
		if(item.lat != "" && item.lng != ""){
			place_point(item);
		}
	}
    draw_redline();
}


function place_point(item){
	const location = {lat:Number(item.lat),lng:Number(item.lng)};
	const marker = new google.maps.Marker({
		position: location,
		map,
  	});

    var state = getIconState(item);
    drawMarker(marker,state);
    marker.item = item;
    item.marker = marker;
	markers.push(marker);

     marker.addListener("click", () => {
         var selected = false;
		for(var i=0;i<_app.selectedItems.length;i++){
            if(checkSameItem(_app.selectedItems[i], marker.item)){
                selected = true;
            }
        }
        if(!selected){
            _app.selectedItems.push(marker.item);
            var state = getIconState(marker.item);
            drawMarker(marker,state);
        }else{
           if(_app.mouse_mode == "select-start"){
            move_to_top_of_selection(marker.item);
            var button = document.getElementById('start_stop_button');
			button.innerHTML = "<i class='fas fa-flag-checkered icon'></i> Choose Selected End Point"
			button.style.backgroundColor = "#FF3300";
			_app.mouse_mode = "select-end";
           }else if(_app.mouse_mode == "select-end"){
            move_to_bottom_of_selection(marker.item);
            var button = document.getElementById('start_stop_button');
			button.innerHTML = "<i class='fas fa-route icon'></i> Choose And Stop Points"
			button.style.backgroundColor = "";
			_app.mouse_mode = "default";
           }
            
           
        }
        draw_redline();
        _app.applyScope();
	});
	
}




function highlightDots(startPos,currentPos){
	startPos_lat =startPos.lat();
	startPos_lng =startPos.lng();
	currentPos_lat =currentPos.lat();
	currentPos_lng =currentPos.lng();

	var min_lat = Math.min(startPos_lat, currentPos_lat);
	var max_lat = Math.max(startPos_lat, currentPos_lat);
	var min_lng = Math.min(startPos_lng, currentPos_lng);
	var max_lng= Math.max(startPos_lng, currentPos_lng);
	for(var i=0;i<markers.length;i++){
        var state = getIconState(markers[i].item);
          // AND THEN RE DRAW IT 
		var marker_lat = markers[i].position.lat();
		var marker_lng = markers[i].position.lng();
		if(min_lat <= marker_lat && max_lat >= marker_lat 
		&& min_lng <= marker_lng && max_lng >= marker_lng ){
			state = "select";
		}
        drawMarker(markers[i],state);
	}
	_app.applyScope();
}

function selectDots(startPos,currentPos){
      _app.selectedItems = [];
        startPos_lat =startPos.lat();
        startPos_lng =startPos.lng();
        currentPos_lat =currentPos.lat();
        currentPos_lng =currentPos.lng();
        var min_lat = Math.min(startPos_lat, currentPos_lat);
        var max_lat = Math.max(startPos_lat, currentPos_lat);
        var min_lng = Math.min(startPos_lng, currentPos_lng);
        var max_lng= Math.max(startPos_lng, currentPos_lng);
        for(var i=0;i<markers.length;i++){
            var marker_lat = markers[i].position.lat();
            var marker_lng = markers[i].position.lng();
            if(min_lat <= marker_lat && max_lat >= marker_lat 
            && min_lng <= marker_lng && max_lng >= marker_lng ){
                _app.selectedItems.push(markers[i].item);
            }
        }
        _app.applyScope();
    }

    function getIconState(item){
        var state = "default";
    
    
        if(checkSameItem(start_item, item)){
            state = "start";
        }
    
        if(checkSameItem(end_item, item)){
            state = "end";
        }
    
        for(var i=0;i<_app.selectedItems.length;i++){
            if(checkSameItem(_app.selectedItems[i], item)){
                state = "select";
            }
        }
       /* for(var i=0;i<_app.submittedItems.length;i++){
            if(checkSameItem(_app.submittedItems[i], item)){
                if(state == 'select'){
                    state = "submitted-select";
                }else{
                    state = "submitted";
                }
            }
        }*/
        return state;
    }

function drawMarker(marker,state){
    var scale = 6;
    var strokeWeight = 4;
    var strokeColor="#000";
    var fillColor = "#AAA";
    var strokeOpacity = 0.4;


    if(state == "start"){
        scale = 7;
        strokeWeight = 2;
        fillColor = "#00CC00";
    }

    if(state == "end"){
        scale = 7;
        strokeWeight = 2;
        fillColor = "#FF0000";
    }

    if(state == "select"){
        scale = 7;
        strokeWeight = 3;
        fillColor = "#FFCC00";
    }
    

    var icon={
        path: google.maps.SymbolPath.CIRCLE,
        scale: scale,
        strokeWeight:strokeWeight,
        strokeColor:strokeColor,
        strokeOpacity:strokeOpacity,
        fillColor:fillColor,
        fillOpacity:1,
    };
  marker.setIcon(icon);

  if(state =="start" || state == "end"){
        marker.setZIndex(99999995);
  }
}


function clearAllMarkers(){
	for(var i=0;i<markers.length;i++){
		markers[i].setMap(null);
	}
	markers = [];
}


function closeAllInfoWindows(){
	for(var i=0;i<infoWindows.length;i++){
		infoWindows[i].close();
	}
}

/*



	const contentString =
  '<div id="content">' +
  '<div id="bodyContent">' +
  '<p><b>Name: </b>'+item.name+'</p><br>' + 
  '<p><b>Address: </b>'+item.address+'</p><br>' + 
  '<p><b>Phone Number: </b>'+item.phone_number+'</p><br>' + 
  '<p><b>Home Between 1 - 4: </b>'+item.available_to_receive+'</p><br>' + 
  '<p><i><b>Timestamp: </b>'+item.timestamp+'</i></p>' + 
  "</div>" +
  "</div>";
	const infowindow = new google.maps.InfoWindow({
 		content: contentString,
	});
	infoWindows.push(infowindow);



    /*marker.addListener("click", () => {
		closeAllInfoWindows();
		infowindow.open({
			anchor: marker,
			map,
			shouldFocus: false,
		});
	});*/


  
/*
    https://www.google.com/maps/dir/Tofino+Air+Lines+Ltd,+50+First+St,+Tofino,+BC+V0R+2Z0/GAS+N+GO,+Campbell+Street,+Tofino,+BC/South+Chesterman+Beach+Parking,+Tofino,+BC/Tonquin+Beach,+Tofino,+BC/Cox+Bay+Beach,+British+Columbia/@49.1275862,-125.9256093,13z/data=!3m1!4b1!4m32!4m31!1m5!1m1!1s0x5489972d43342189:0xbb1c045c63ce2ca1!2m2!1d-125.9095732!2d49.1541565!1m5!1m1!1s0x5489974ba865eab1:0xcba30ee8af4b6278!2m2!1d-125.8905275!2d49.142031!1m5!1m1!1s0x54899b46f8c9f5ab:0x1d159c62c6c2879a!2m2!1d-125.8832183!2d49.1131531!1m5!1m1!1s0x548990cefa833119:0x3d019617a5ff1999!2m2!1d-125.9146774!2d49.1447387!1m5!1m1!1s0x54899a3fa6269f51:0xee109a4c3d8ddbdf!2m2!1d-125.8744801!2d49.1010264!3e0


    https://www.google.com/maps/dir/Tofino+Air+Lines+Ltd,+50+First+St,+Tofino,+BC+V0R+2Z0/GAS+N+GO,+Campbell+Street,+Tofino,+BC/South+Chesterman+Beach+Parking,+Tofino,+BC/Tonquin+Beach,+Tofino,+BC/Cox+Bay+Beach,+British+Columbia



    https://www.google.com/maps/dir/52+Bayswater+Avenue,+Ottawa,+ON/127+Bayswater+Avenue,+Ottawa,+ON/324+Cambridge+Street+North,+Ottawa,+ON/99+First+Ave,+Ottawa,+ON+K1S+2G3/210+Somerset+St+W,+Ottawa,+ON/@45.4103167,-75.7202151,13.93z/data=!4m31!4m30!1m5!1m1!1s0x4cce043886c9ccfd:0x66d26e2f6cc62d1!2m2!1d-75.7205933!2d45.4059667!1m5!1m1!1s0x4cce0439d584a2a3:0xebc5205e7eab9847!2m2!1d-75.7184341!2d45.4034619!1m5!1m1!1s0x4cce0520a1c0b90f:0xc77d53ae22c37e61!2m2!1d-75.7045024!2d45.4063291!1m5!1m1!1s0x4cce05b945e9be99:0x2039af73e340e7dd!2m2!1d-75.6859904!2d45.4058442!1m5!1m1!1s0x4cce05a94e08cedd:0xfce2b79575c224ba!2m2!1d-75.6912452!2d45.4172772?utm_medium=s2email&shorturl=1

    https://www.google.com/maps/dir/52+Bayswater+Avenue,+Ottawa,+ON/127+Bayswater+Avenue,+Ottawa,+ON/324+Cambridge+Street+North,+Ottawa,+ON/99+First+Ave,+Ottawa,+ON+K1S+2G3/210+Somerset+St+W,+Ottawa,+ON


     https://www.google.com/maps/dir/
     52+Bayswater+Avenue,+Ottawa,+ON/
     127+Bayswater+Avenue,+Ottawa,+ON/
     324+Cambridge+Street+North,+Ottawa,+ON/
     99+First+Ave,+Ottawa,+ON+K1S+2G3/
     210+Somerset+St+W,+Ottawa,+ON/
    */