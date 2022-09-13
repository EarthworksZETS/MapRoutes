<?php


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
$image_to_be_deleted = strval($target_restaurant->menu_images[$_POST['index']]);

array_splice($target_restaurant->menu_images, $_POST['index'], 1);

// delete $_POST['index'];
// from $




$data = json_encode($restaurant_data, JSON_PRETTY_PRINT);

// Write the contents to the file, 
// and the LOCK_EX flag to prevent anyone else writing to the file at the same time

if(file_put_contents("../../json/Restaurants.json", $data, LOCK_EX)){
    echo $image_to_be_deleted." Removed";
}else{
    echo "Save Failed.";
}


if(unlink("../../images/menu_images/".$image_to_be_deleted)) {
    // file was successfully deleted
  } else {
    // there was a problem deleting the file
  }




?>