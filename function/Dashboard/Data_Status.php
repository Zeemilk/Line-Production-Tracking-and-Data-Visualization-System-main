<?php
require_once __DIR__ . '/../assets/demo_config.php';

$productType = $_POST['productType'] ?? '';

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    header('Content-Type: application/json');
    echo json_encode(MockStore::dataStatus($productType));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';

function getStatusData($producttype){
    $query = '';
    if ($producttype === 'typeA'){
        $query = "SELECT * FROM machine_status WHERE product_type = 'Type A'";
    } elseif ($producttype === 'typeB'){
        $query = "SELECT * FROM machine_status WHERE product_type = 'Type B'";
    } elseif ($producttype === 'typeC'){
        $query = "SELECT * FROM machine_status WHERE product_type = 'Type C'";
    } elseif ($producttype === 'typeD'){
        $query = "SELECT * FROM machine_status WHERE product_type = 'Type D'";
    } elseif ($producttype === 'typeE'){
        $query = "SELECT * FROM machine_status WHERE product_type = 'Type E'";
    } 

    return [
        'query' => $query
    ];
};

//Machine Status
$DataStatus = getStatusData($productType);
$queryStatus = $DataStatus['query'] ?? '';
$statusSQL = "$queryStatus";

$parseStatus = oci_parse($newdb, $statusSQL);

oci_execute($parseStatus);
$statusData = [];
while ($row = oci_fetch_assoc($parseStatus)) {
    $statusData[] = $row;
}


echo json_encode([
    'statusData' => $statusData,
    'sqlStatus' => $statusSQL
]);