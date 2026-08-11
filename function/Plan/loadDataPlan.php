<?php
//[Plan]loadDataPlan.php

// เพิ่มการตรวจสอบ session และ role ก่อน
// include './session_check.php';

// ตั้ง header หลังจาก include session_check
header('Content-Type: application/json');

require_once __DIR__ . '/../assets/demo_config.php';

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    echo json_encode(MockStore::loadPlan($_POST));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';

$tableName = 'production_plan';

$month = $_POST['month'] ?? '';
$year = $_POST['year'] ?? '';
$line = $_POST['line'] ?? '';
$createType = $_POST['create_type'] ?? '';
$productType = $_POST['product_type'] ?? '';

$where = [];
$params = [];

if ($month !== '') {
    $where[] = "TO_CHAR(datetime, 'MM') = :month";
    $params[':month'] = $month;
}
if ($year !== '') {
    $where[] = "TO_CHAR(datetime, 'YYYY') = :year";
    $params[':year'] = $year;
}
if ($line !== '') {
    $where[] = "line_name = :line";
    $params[':line'] = $line;
}
if ($createType !== '') {
    $where[] = "create_type = :create_type";
    $params[':create_type'] = $createType;
}
if ($productType !== '') {
    $where[] = "product_type = :product_type";
    $params[':product_type'] = $productType;
}

$sql = "SELECT create_type, TO_CHAR(datetime, 'DD/MM/YYYY') as datetime, qty, type, line_name, product_type, empno FROM $tableName";
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