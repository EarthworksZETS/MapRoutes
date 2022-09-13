
function findLatLong(){
	if(working_index >= _app.rangeItems.length){
        // Did all the points.
		displayPoints();
		return;
	}
var item = _app.rangeItems[working_index];

/*if(!checkBetweenDates(item.date_real)){
    // Out of date
    working_index ++;
	findLatLong();
    return;
}*/
	if(item.lat != "" && item.lng != ""){
		working_index ++;
		var percent_complete = Math.round((working_index/_app.rangeItems.length)*100);
		//console.log(percent_complete +"% Complete Geocoding")
		//place_point(item);
		findLatLong();
		return;
	}
/*	for(var i =0;i<Spreadsheet_Data.length;i++){
		var spot = Spreadsheet_Data[i];
		console.log(spot.address);
	} */
	
	var address = _app.rangeItems[working_index].address + ", Ottawa, Ontario";

    //console.log("lookup address: "+ address);

	request_url = encodeURIComponent(address);
	request_url = "https://maps.googleapis.com/maps/api/geocode/json?address="+request_url;
	request_url += "&key=AIzaSyBCG3mWkgXwguk1D0qnYvuFvxcGOqoiFY8";


	$.ajax({
		type:'GET',
		url: request_url,
		timeout: 7000, // sets timeout to 7 seconds
		data:{},
		success:got_address,
		error: address_error
	});


}

function got_address(data){
	var location = data.results[0].geometry.location;

    var item = _app.rangeItems[working_index];
    item.URL_address = short_address(data.results[0].address_components);
    console.log(item.URL_address)
    //_app.rangeItems.push(item);
    // Push to _app.rangeItems?
	item.lat = location.lat;
	item.lng = location.lng;
	place_point(item);
	_app.applyScope();
	working_index ++;
	findLatLong();
}


function address_error(){
    working_index ++;
	findLatLong();

}

function short_address(address_components){
    var street_number = "";
    var street_name = "";
    var unit = "";
    var locality = "";
    var administrative_area_level_1 = "";
    for(var i=0;i<address_components.length;i++){
        for(var ii=0;ii<address_components[i]['types'].length;ii++){
            if(address_components[i]['types'][ii] == "street_number"){
                street_number = address_components[i].short_name;
                ii += address_components[i]['types'].length;
            }

            if(address_components[i]['types'][ii] == "route"){
                street_name = address_components[i].short_name;
                ii += address_components[i]['types'].length;
            }

            if(address_components[i]['types'][ii] == "subpremise"){
                unit = "#"+ address_components[i].short_name;
                ii += address_components[i]['types'].length;
            }

            if(address_components[i]['types'][ii] == "locality"){
                locality = address_components[i].short_name;
                ii += address_components[i]['types'].length;
            }
            if(address_components[i]['types'][ii] == "administrative_area_level_1"){
                administrative_area_level_1 = address_components[i].short_name;
                ii += address_components[i]['types'].length;
            }
        }
    }
    var return_value = "";
    if(street_number!= ""){
        if(return_value != ""){
            return_value += "+";
        }
        return_value += street_number;
    }
    if(street_name!= ""){
        if(return_value != ""){
            return_value += "+";
        }
        return_value += street_name;
    }
    if(locality!= ""){
        if(return_value != ""){
            return_value += ",+";
        }
        return_value += locality;
    }
    if(administrative_area_level_1!= ""){
        if(return_value != ""){
            return_value += ",+";
        }
        return_value += administrative_area_level_1+"/";
    }
    return_value = return_value.replace(/\s+/g, '+');
    return return_value;
}

distanceCalculation = function($point1_lat, $point1_long, $point2_lat, $point2_long) {
    var $unit = 'km';
    // Calculate the distance in degrees
    var $degrees = rad2deg(Math.acos((Math.sin(deg2rad($point1_lat))*Math.sin(deg2rad($point2_lat))) + (Math.cos(deg2rad($point1_lat))*Math.cos(deg2rad($point2_lat))*Math.cos(deg2rad($point1_long-$point2_long)))));
 
    // Convert the distance in degrees to the chosen unit (kilometres, miles or nautical miles)
    switch($unit) {
        case 'km':
            $distance = $degrees * 111.13384; 
            // 1 degree = 111.13384 km, based on the average diameter of the Earth (12,735 km)
            break;
        case 'mi':
            $distance = $degrees * 69.05482; 
            // 1 degree = 69.05482 miles, based on the average diameter of the Earth (7,913.1 miles)
            break;
        case 'nmi':
            $distance =  $degrees * 59.97662; 
            // 1 degree = 59.97662 nautic miles, based on the average diameter of the Earth (6,876.3 nautical miles)
    }
    return Math.round($distance*100)/100;
}



function deg2rad(degrees){
  var pi = Math.PI;
  return degrees * (pi/180);
}

function rad2deg(angle) {
//  discuss at: http://phpjs.org/functions/rad2deg/
// original by: Enrique Gonzalez
// improved by: Brett Zamir (http://brett-zamir.me)
//   example 1: rad2deg(3.141592653589793);
//   returns 1: 180

return angle * 57.29577951308232; // angle / Math.PI * 180
}