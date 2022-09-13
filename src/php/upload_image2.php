<?php
//https://makitweb.com/how-to-upload-file-with-javascript-and-php/
//https://www.verot.net/php_class_upload.htm

namespace Verot\Upload;
error_reporting(E_ALL);
include('src/class.upload.php');


function RandomString(){
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randstring = '';
    for ($i = 0; $i < 5; $i++) {
        $randstring .= $characters[rand(0, strlen($characters))];
    }
    return $randstring;
}

$upload_success = "false";
$filename = "";
if(isset($_FILES['user_image']['name'])){
    // file name
    $file_extension = pathinfo($_FILES['user_image']['name'], PATHINFO_EXTENSION);
    $file_extension = 'webp';//strtolower($file_extension);//;//
    $filename = RandomString().".".$file_extension;

    $_FILES['user_image']['name'] = $filename;

    
    ///public_html/scootn_aboot/change_establishment_info/php
    ///public_html/scootn_aboot/images/menu_images/uploads
    // Location
    $location =  "../../images/menu_images/uploads/";//"../../../images/menu_images/uploads/".
    // $location .= $file_extension;
    // Valid extensions
    $valid_ext = array("jpg","png","jpeg","gif",'webp');
    if(in_array($file_extension,$valid_ext)){
       // Upload file

       $handle = new Upload($_FILES['user_image']);
       $handle->image_resize          = true;
        $handle->image_ratio_x         = true;
        $handle->image_y               = 1500;
        //$handle->image_convert         = 'jpg';
        //$handle->jpeg_size             = 3072;
       // $handle->image_convert         = 'png';
       // $handle->png_compression       = 9;

       $handle->image_convert         = 'webp';
        $handle->webp_quality          = 100;
       $handle->process($location);
       if ($handle->uploaded) {
             $upload_success = "true";
       }

      /*
      Basic upload if(move_uploaded_file($_FILES['user_image']['tmp_name'],$location)){
        $upload_success = "true";
       }
       */
    }
 }

if($upload_success == "false"){
    echo "0";
    return;
}

$restaurant_data = file_get_contents('../../json/Restaurants.json');
$restaurant_data = json_decode($restaurant_data);
$target_restaurant = false;
foreach ($restaurant_data as $restaurant) {
	if($restaurant->id == $_POST['id']){
		$target_restaurant = $restaurant;
	}
}
if($target_restaurant == false){
	echo "Restaurant not found!";
	return;
}



array_push($target_restaurant->menu_images,"uploads/".$filename);


$data = json_encode($restaurant_data, JSON_PRETTY_PRINT);

// Write the contents to the file, 
// and the LOCK_EX flag to prevent anyone else writing to the file at the same time

if(file_put_contents("../../json/Restaurants.json", $data, LOCK_EX)){
    echo "Save Success.";
}else{
    echo "Save Failed.";
}




/*
$myfile = fopen("../json/Restaurants2.json", "w") or die("Unable to open file!");
$txt = $json;
fwrite($myfile, $txt);

fclose($myfile);
*/


?>