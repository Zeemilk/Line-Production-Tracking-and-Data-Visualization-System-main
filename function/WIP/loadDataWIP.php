<?php

// เพิ่มการตรวจสอบ session และ role ก่อน
// include './session_check.php';

// ตั้ง header หลังจาก include session_check
header('Content-Type: application/json');

require_once __DIR__ . '/../assets/demo_config.php';

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    echo json_encode(MockStore::loadWipLastMonth($_POST));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';

$month = $_POST['month'] ?? '';
$year = $_POST['year'] ?? '';
$productType = $_POST['product_type'] ?? '';
$type = $_POST['type'] ?? '';

$where = [];
$params = [];

if ($month !== '') {
    $where[] = "TO_CHAR(\"MONTH_YEAR\", 'MM') = :month";
    $params[':month'] = $month;
}
if ($year !== '') {
    $where[] = "TO_CHAR(\"MONTH_YEAR\", 'YYYY') = :year";
    $params[':year'] = $year;
}
if ($productType !== ''){
    $where[] = "\"PRODUCT_TYPE\" = :product_type";
    $params[':product_type'] = $productType;
}

$sql = "SELECT TO_CHAR(\"MONTH_YEAR\", 'MM/YYYY') AS MONTH_YEAR, \"PRODUCT_TYPE\" AS PRODUCT_TYPE, \"WIP_QTY\" AS WIP_QTY FROM WIP_LAST_MONTH";
if ($where) {
    $sql .= " WHERE " . implode(' AND ', $where);
}

$stid = oci_parse($newdb, $sql);
foreach ($params as $key => $val) {
    oci_bind_by_name($stid, $key, $params[$key]);
}
oci_execute($stid);

$data = [];
while ($row = oci_fetch_assoc($stid)) {
    // แปลง key เป็นตัวพิมพ์เล็ก
    $rowLower = [];
    foreach ($row as $k => $v) {
        $rowLower[strtolower($k)] = $v;
    }
    $data[] = $rowLower;
}
oci_free_statement($stid);

echo json_encode(['success' => true, 'data' => $data]);
?>