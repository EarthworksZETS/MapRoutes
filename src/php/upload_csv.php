<?php
//https://makitweb.com/how-to-upload-file-with-javascript-and-php/
//https://www.verot.net/php_class_upload.htm

$upload_success = "false";
//$filename = "";
/*if(isset($_FILES['csv_file']['name'])){
    // file name
    $file_extension = pathinfo($_FILES['csv_file']['name'], PATHINFO_EXTENSION);
    $file_extension = strtolower($file_extension);
    $filename = "data.".$file_extension;
    // Location
    $location = "../csv/".$filename;
    // $location .= $file_extension;
    // Valid extensions
    $valid_ext = array("csv");
    if(in_array($file_extension,$valid_ext)){
       // Upload file
       if(move_uploaded_file($_FILES['csv_file']['tmp_name'],$location)){
        $upload_success = "true";
        echo "1";
       } 
    }
 }

if($upload_success == "false"){
    echo "0";
    return;
}*/




$myfile = fopen("../csv/data.csv", "w") or die("Unable to open file!");
fwrite($myfile, $_POST["data"]);

fclose($myfile);

?>