<?php

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
    echo json_encode(MockStore::updateWip($data['data']));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';

if (!$newdb) {
    error_log("Oracle connection failed");
    echo json_encode(["success" => false, "error" => "Oracle connection failed"]);
    exit;
}

function convertDateToDB($date) {
    // รับ DD/MM/YYYY หรือ MM/YYYY คืน YYYY-MM-01
    $parts = explode('/', $date);
    if(count($parts) === 3) {
        // DD/MM/YYYY -> YYYY-MM-01
        return $parts[2] . '-' . $parts[1] . '-01';
    } elseif(count($parts) === 2) {
        // MM/YYYY -> YYYY-MM-01
        return $parts[1] . '-' . $parts[0] . '-01';
    }
    return $date;
}

function updateWIP_LAST_MONTH($newdb, $rows){
    
    $successCount = 0;
    $errorRows = [];
    $debugInfo = [];

    foreach ($rows as $row) {
        $row = array_change_key_case($row, CASE_UPPER);
        if (
            !isset($row['MONTH_YEAR'], $row['PRODUCT_TYPE'], $row['WIP_QTY'])
        ) {
            $errorRows[] = $row;
            $debugInfo[] = ["row" => $row, "status" => "skipped", "reason" => "missing_keys"];
            continue;
        }
        $month_year = convertDateToDB($row['MONTH_YEAR']);
        $product_type = $row['PRODUCT_TYPE'];
        $wip_qty = $row['WIP_QTY'];

        $sql = "UPDATE WIP_LAST_MONTH
        SET \"WIP_QTY\" = '$wip_qty'
        WHERE \"MONTH_YEAR\" = TO_DATE('$month_year', 'YYYY-MM-DD')
        AND \"PRODUCT_TYPE\" = '$product_type'";
        $stid = oci_parse($newdb, $sql);

        if (!$stid) {
            $error = oci_error($newdb);
            $debugInfo[] = ["row" => $row, "status" => "parse_failed", "error" => $error['message']];
            $errorRows[] = $row;
            continue;
        }
    error_log("SQL: $sql");
    error_log("MONTH_YEAR: $month_year,  E: $product_type, WIP_QTY: $wip_qty");
        $executeResult = oci_execute($stid, OCI_NO_AUTO_COMMIT);

        if ($executeResult) {
            $successCount++;
            $debugInfo[] = ["row" => $row, "status" => "success", "rows_updated" => oci_num_rows($stid)];
        } else {
            $error = oci_error($stid);
            $errorRows[] = $row;
            $debugInfo[] = ["row" => $row, "status" => "failed", "error" => $error['message']];
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
        "debugInfo" => $debugInfo
    ];
}
// รับข้อมูลจาก JS
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['data']) || !is_array($data['data'])) {
    echo json_encode(["success" => false, "error" => "No data provided"]);
    exit;
}
$result = updateWIP_LAST_MONTH($newdb, $data['data']);
echo json_encode($result);
