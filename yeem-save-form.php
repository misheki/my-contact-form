<?php

//get the submitted data and decode it
$form_data = json_decode(file_get_contents('php://input'));

foreach ($form_data as $key => $value) {
    $field[$value->name] = $value->value;
}

//here's the formID
$formID = $field['formID'];

//and here's the form fields (converted back into json)
$formFields = json_encode($field['formFields']);

$txtFile = "tmp/form1.txt";

$fp = fopen($txtFile, 'w');
fwrite($fp, $formFields);
fclose($fp);



//now just save it to your database.
echo json_encode('Success');