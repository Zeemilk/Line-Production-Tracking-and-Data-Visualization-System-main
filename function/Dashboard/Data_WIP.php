<?php
require_once __DIR__ . '/../assets/demo_config.php';

$productType = $_GET['productType'] ?? '';

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    header('Content-Type: application/json');
    echo json_encode(MockStore::dataWIP($productType));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';
$dateFilter = $_GET['dateFilter'] ?? 'yesterday';
$dayInput = $_GET['dayInput'] ?? '';
$monthFilter = $_GET['monthFilter'] ?? '';
$yearFilter = $_GET['yearFilter'] ?? '';

function WhereSubWIP($productType) {
    $where = '';

    if ($productType === 'typeA') {
        $where = "SELECT * FROM wip WHERE product_type = 'Type A'";
    } elseif ($productType === 'typeB'){
        $where = "SELECT * FROM wip WHERE product_type = 'Type B'";
    } elseif ($productType === 'typeC'){
        $where = "SELECT * FROM wip WHERE product_type = 'Type C'";
    } elseif ($productType === 'typeD'){
        $where = "SELECT * FROM wip WHERE product_type = 'Type D'";
    } elseif ($productType === 'typeE'){
        $where = "SELECT * FROM wip WHERE product_type = 'Type E'";
    }
    
    return $where;
}

// SubWIP
$whereResultSubWIP = WhereSubWIP($productType);
$whereSqlSubWIP = '';

$sqlSubWIP = $whereResultSubWIP;

$parse = oci_parse($newdb, $sqlSubWIP);
oci_execute($parse);

$SubWIP = [];
while ($row = oci_fetch_assoc($parse)) {
    $SubWIP[] = $row;
}

header('Content-Type: application/json');
echo json_encode([
    'SubWIP' => $SubWIP,
    'MCS' => $MCS,
    'sqlSubWIP' => str_replace(["\r\n", "\n", "\r"], '', $sqlSubWIP),
]);