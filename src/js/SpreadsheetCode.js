


function initalize_spreadsheets(){
    document.getElementById('csv_file').addEventListener('change', gotCSV, false);
	document.getElementById("date_start").value = "1955-11-07";
	document.getElementById("date_end").value = new Date().yyyymmdd();
	Papa.parse("src/csv/data.csv?nocache="+String(Math.round(Math.random()*100000000)), {
		download: true,
		complete: Spreadsheet_downloaded,
		error:function(){console.log("default data not found")}
	});
}

  function Spreadsheet_downloaded(results) {
	Spreadsheet_Data = [];
    _app.rangeItems = [];
	

	var Raw_Spreadsheet_Data = prepareCSV(results.data);
	var found_start_point = false;
    var found_end_point = false;
	// This Section merges OG spreadsheet format to code proper format
	for(var i=0;i<Raw_Spreadsheet_Data.length;i++){
		var row = Raw_Spreadsheet_Data[i];
        // This is the format we want!! 
		var new_row ={
			address:"",
		//	timestamp:"",
			uniqueID:makeid(),
			name:"",
			email:"",
			phone_number:"",
			available_to_receive:"",
			lat:"",
			lng:"",
            URL_address:"",
            special_data:"",
		}
		var spreadsheet_keys = Object.keys(row);
		var keys = Object.keys(new_row);
		for(var ii=0;ii<spreadsheet_keys.length;ii++){
			var key = spreadsheet_keys[ii].toLowerCase();
			/*if(key.indexOf(("timestamp").toLowerCase()) != -1
			|| key == "timestamp"){
				new_row.timestamp = row[key];
				new_row.date_real = new Date(new_row.timestamp);
			}*/
			if(key.indexOf(("what is your name".toLowerCase())) != -1
			|| key == "name"){
				new_row.name = row[key];
			}
			if(key.indexOf(("what is your address".toLowerCase())) != -1
			|| key == "address"){
				new_row.address = row[key];
			}
			if(key.indexOf(("what is your email address".toLowerCase())) != -1
			|| key == "email"){
				new_row.email = row[key];
			}
			if(key.indexOf(("what is your phone number".toLowerCase())) != -1
			|| key == "phone_number"){
				new_row.phone_number = row[key];
			}

			/*if(key.indexOf(("Will you be available to receive the meal kit delivery between".toLowerCase())) != -1
			|| key == "available_to_receive"){
				new_row.available_to_receive = row[key];
			}*/
			if(key == "lat"){
				new_row.lat = row[key];
			}
			if(key == "lng"){
				new_row.lng = row[key];
			}
            if(key == "url_address"){
				new_row.URL_address = row[key];
			}
            if(key == 'special_data'){
                new_row.special_data = row[key];
                if(new_row.special_data == "start point"){
                    found_start_point = true;
                }
                if(new_row.special_data == "end point"){
                    found_end_point = true;
                }
            }

		}

        /*if(new_row.timestamp == ""){
            new_row.date_real = new Date(new_row.timestamp);
            new_row.timestamp = new_row.date_real.yyyymmdd();
        }*/

		Spreadsheet_Data.push(new_row);

	}
	/*
	The proper format
	address 
	timestamp
	name
	email
	phone_number
	available_to_receive
	*/

	//calculateAndDisplayRoute(Spreadsheet_Data);
	//findLatLong();

	
    _app.rangeItems = [];
    for(var i=0;i<Spreadsheet_Data.length;i++){
		var item = Spreadsheet_Data[i];
       // if(checkBetweenDates(item.date_real)){
            _app.rangeItems.push(item);
		//}
    }


    if(!found_start_point){
        _app.rangeItems.splice(0,0,start_item);
    }
    if(!found_start_point){
        var len = _app.rangeItems.length;
        _app.rangeItems.splice(len,0,end_item);
    }

	displayPoints();
    
	_app.csv_file = results.data;

	_app.applyScope();
}


function checkBetweenDates(date){
	return true;
	var dateFrom = document.getElementById("date_start").value;
	var dateTo = document.getElementById("date_end").value;
	var dateCheck = date.yyyymmdd();

	//console.log(dateFrom + " - " + dateCheck + " - " + dateTo);

	dateFrom = dateFrom.replace(/-/gi, "");
	dateTo = dateTo.replace(/-/gi, "");
	dateCheck = dateCheck.replace(/-/gi, "");


	return dateCheck > dateFrom && dateCheck < dateTo;
}

function Spreadsheet_error(error){
	alert("Spreadsheet load error");
}


function prepareCSV(CSV_list){
	return_list = [];
	for(var i=1;i<CSV_list.length;i++){
		var product = new Object();
		var first_item = CSV_list[0];
		var current_item = CSV_list[i];
		if(i==1){
			/*for(var ii=0;ii<first_item.length;ii++){
				first_item[ii] = findAndReplace(first_item[ii]," ","");
				first_item[ii] = findAndReplace(first_item[ii],".","");
				first_item[ii] = findAndReplace(first_item[ii],"(","");
				first_item[ii] = findAndReplace(first_item[ii],")","");
				//newCSVItem(first_item[ii]);
			}*/
			//console.log(first_item);
		}
		if(current_item.length > 1){
			for(var ii=0;ii<current_item.length;ii++){
				var key = first_item[ii].toLowerCase();
				product[key] = current_item[ii];
			}
			if(product.id != ""){
				return_list.push(product);
			}else{
				//console.log("DONT ADD THIS ITEM: ");
				//console.log(product);
			}
		}
	}
	return return_list;
}

	


  function gotCSV(evt) {
    let files = evt.target.files; // FileList object
    // use the 1st file from the list
    let f = files[0];
    let reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
          //console.log(e.target.result );

		  Papa.parse(e.target.result , {
			complete: Spreadsheet_downloaded,
			error:Spreadsheet_error
		});

        };
      })(f);
      // Read in the image file as a data URL.
      reader.readAsText(f);
  }


  uploadFile = function(){
	  // Rever to : _app.save();
	  return;
	var data = Papa.unparse(angular.toJson(_app.rangeItems));//Spreadsheet_Data
//console.log("0-----")

	for(var i=0;i<data.length;i++){
		console.log(data[i])
		delete data[i].uniqueID;

		
	}
	console.log(data);

	$.ajax({
		type:'POST',
		url: "src/php/upload_csv.php",
		timeout: 7000, // sets timeout to 7 seconds
		data:{data:data},
		success:file_uploaded,
		error: address_error
	});

  }

/*uploadFile = function(){
	var files = document.getElementById("csv_file").files;
	_app.uploading = true;
	if(files.length > 0 ){
		var formData = new FormData();
		formData.append("csv_file", files[0]);
		//formData.append("id", _app.selected_est.id);
		var xhttp = new XMLHttpRequest();
		// Set POST method and ajax file path
		xhttp.open("POST", "src/php/upload_csv.php", true);
		// call on request changes state
		xhttp.onreadystatechange = function() {
		   if (this.readyState == 4 && this.status == 200) {
			 var response = this.responseText;
			 if(response == 1){
				alert("Data uploaded!");
				 clearInputFile(document.getElementById('csv_file'));
			 	_app.uploading = false;
				 _app.csv_file = undefined;
			}
			 _app.applyScope();
		   }
		};
  
		// Send request with data
		xhttp.send(formData);
		_app.applyScope();
	 }else{
		alert("Please select a file");
	 }



	 
}*/

function file_uploaded(data){
	alert( " File uploaded: "+data);
}

function clearInputFile(f){
	if(f.value){
		try{
			f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
		}catch(err){ }
		if(f.value){ //for IE5 ~ IE10
			var form = document.createElement('form'),
				parentNode = f.parentNode, ref = f.nextSibling;
			form.appendChild(f);
			form.reset();
			parentNode.insertBefore(f,ref);
		}
	}
}
 
  
