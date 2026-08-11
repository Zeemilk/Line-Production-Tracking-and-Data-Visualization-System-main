<?php
//[Plan]updatePlan.php

// เพิ่มการตรวจสอบ session และ role ก่อน
// include './session_check.php';

// ตั้ง header หลังจาก include session_check
header('Content-Type: application/json');

require_once __DIR__ . '/../assets/demo_config.php';

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['data']) || !is_array($data['data'])) {
        echo json_encode(["success" => false, "error" => "No data provided"]);
        exit;
    }
    echo json_encode(MockStore::updatePlan($data['data']));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';

$tableName = 'production_plan';

if (!$newdb) {
    error_log("Oracle connection failed");
    echo json_encode(["success" => false, "error" => "Oracle connection failed"]);
    exit;
}

function updateUltraRealProductionPlan($newdb, $rows){
    global $tableName;
    $successCount = 0;
    $errorRows = [];
    $debugInfo = [];

    foreach ($rows as $row) {
        if (
            !isset($row['create_type'], $row['datetime'], $row['line_name'], $row['type'], $row['qty'], $row['product_type'], $row['empno'])
        ) {
            $errorRows[] = $row;
            $debugInfo[] = ["row" => $row, "status" => "skipped", "reason" => "missing_keys"];
            continue;
        }
        $qty = $row['qty'];
        $create_type = $row['create_type'];
        $datetime = $row['datetime'];
        $line_name = $row['line_name'];
        $type = $row['type'];
        $product_type = $row['product_type'];
        $empno = $row['empno'];

        // เพิ่ม empno ในการอัพเดท
        $sql = "UPDATE $tableName
                SET qty = '$qty',
                    empno = '$empno',
                    upload_date = SYSDATE
                WHERE create_type = '$create_type'
                  AND TO_CHAR(datetime, 'DD/MM/YYYY') = '$datetime'
                  AND line_name = '$line_name'
                  AND type = '$type'
                  AND product_type = '$product_type'";

        $stid = oci_parse($newdb, $sql);

        // Check if statement parsing failed
        if (!$stid) {
            $error = oci_error($newdb);
            $debugInfo[] = ["row" => $row, "status" => "parse_failed", "error" => $error['message']]; // Added for debugging
            $errorRows[] = $row;
            continue;
        }

        $executeResult = oci_execute($stid, OCI_NO_AUTO_COMMIT);

        if ($executeResult) {
            $successCount++;
            $debugInfo[] = ["row" => $row, "status" => "success", "rows_updated" => oci_num_rows($stid)]; // Added for debugging
        } else {
            $error = oci_error($stid); // Get error from statement handle
            $errorRows[] = $row;
            $debugInfo[] = ["row" => $row, "status" => "failed", "error" => $error['message']]; // Added for debugging
        }
        oci_free_statement($stid);
    }

    if ($successCount > 0) {
        oci_commit($newdb);
    } else {
        oci_rollback($newdb);
    }

    return [
        "success" => $successCount > 0,
        "updated" => $successCount,
        "failed" => count($errorRows),
        "errorRows" => $errorRows,
        "query" => $sql, 
        "debugInfo" => $debugInfo 
    ];
}
// รับข้อมูลจาก JS
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['data']) || !is_array($data['data'])) {
    echo json_encode(["success" => false, "error" => "No data provided"]);
    exit;
}
$result = updateUltraRealProductionPlan($newdb, $data['data']);
echo json_encode($result);
