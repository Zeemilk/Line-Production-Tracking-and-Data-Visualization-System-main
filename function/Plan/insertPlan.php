<?php
//[Plan]insertPlan.php

// เพิ่มการตรวจสอบ session และ role ก่อน
// include './session_check.php';

// ตั้ง header หลังจาก include session_check
header('Content-Type: application/json');

require_once __DIR__ . '/../assets/demo_config.php';

$input = json_decode(file_get_contents("php://input"), true);

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    if (!$input || !isset($input['data'])) {
        echo json_encode(["success" => false, "error" => "Invalid input data."]);
        exit;
    }
    echo json_encode(MockStore::insertPlan($input));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';
$options = include __DIR__ . '/../planlineoption.php';
$lineOptions = $options['lineOptions'];
$producttypeOptions = $options['producttypeOptions'];

if (!$newdb) {
    error_log("Oracle connection failed");
    echo json_encode(["success" => false, "error" => "Oracle connection failed"]);
    exit;
}

function parseDate($dateString)
{
    $parts = explode("/", $dateString);
    if (count($parts) === 3) {
        $day = intval($parts[0]);
        $month = intval($parts[1]);
        $year = intval($parts[2]);

        if ($year < 100) {
            $year += 2000;
        }

        if (checkdate($month, $day, $year)) {
            return sprintf('%04d-%02d-%02d', $year, $month, $day);
        }
    }
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateString)) {
        return $dateString;
    }
    return null;
}

$input = json_decode(file_get_contents("php://input"), true);
error_log("RAW POST DATA: " . file_get_contents("php://input"));
error_log("DECODED DATA: " . json_encode($input));

if (!$input || !isset($input['data'])) {
    echo json_encode(["success" => false, "error" => "Invalid input data."]);
    exit;
}

$tableName = 'production_plan';
$rowsToInsert = $input['data'];
$errorRows = [];
$successfulInserts = [];

preg_match_all('/<option value="([^"]+)">/', $producttypeOptions, $matchesProductType);
$validProductTypes = $matchesProductType[1];

// รับค่า create_type จาก POST (หรือจะ default ก็ได้)
$create_type = isset($input['create_type']) ? intval($input['create_type']) : 0;

foreach ($rowsToInsert as $index => $row) {
    // Validate line_name and product_type
    $line_name = $row['line_name'] ?? null;
    $product_type = $row['product_type'] ?? null;

    $ColumnPut = [];
    $values = [];

    foreach ($row as $key => $value) {
        if ($key === 'upload_date') continue;
        $ColumnPut[] = $key;
        if ($key === 'datetime') {
            $parsedDate = parseDate($value);
            if ($parsedDate) {
                $values[] = "TO_DATE('" . addslashes($parsedDate) . "', 'YYYY-MM-DD')";
            } else {
                $errorRows[] = [
                    "row_index" => $index,
                    "data" => $row,
                    "error" => "Invalid date format for '$key': '$value'."
                ];
                continue 2;
            }
        } else {
            $escapedValue = addslashes($value);
            $values[] = "'$escapedValue'";
        }
    }
    // เพิ่ม upload_date เป็นวันปัจจุบัน
    $ColumnPut[] = 'upload_date';
    $values[] = "SYSDATE";

    // ใช้ค่า create_type จาก checkbox แทนค่าจาก row
    if (in_array('create_type', $ColumnPut)) {
        // หา index ของ create_type และแทนที่ค่า
        $createTypeIndex = array_search('create_type', $ColumnPut);
        $values[$createTypeIndex] = $create_type;
    } else {
        // ถ้าไม่มี create_type ใน row ให้เพิ่มเข้าไป
        $ColumnPut[] = 'create_type';
        $values[] = $create_type;
    }

    $columnsString = implode(", ", $ColumnPut);
    $valuesString = implode(", ", $values);

    $query = "INSERT INTO $tableName ($columnsString) VALUES ($valuesString)";
    error_log("SQL Insert Query: " . $query);

    $stmt = oci_parse($newdb, $query);

    $result = oci_execute($stmt);

    if ($result) {
        $successfulInserts[] = $row;
    } else {
        $e = oci_error($stmt);
        $errorRows[] = [
            "row_index" => $index,
            "data" => $row,
            "error" => "Database insert failed: " . $e['message']
        ];
        error_log("OCI Execute Error: " . $e['message']);
    }
    oci_free_statement($stmt);
}

// // ก่อน insert ให้ update ก่อน
// if ($create_type === 1) {
//     foreach ($rowsToInsert as $index => $row) {
//         $datetime = isset($row['datetime']) ? parseDate($row['datetime']) : null;
//         $type = isset($row['type']) ? addslashes($row['type']) : null;
//         $line = isset($row['line_name']) ? addslashes($row['line_name']) : null;
//         $product = isset($row['product_type']) ? addslashes($row['product_type']) : null;
//         $qty = isset($row['qty']) ? addslashes($row['qty']) : null;

//         if ($datetime && $type && $line && $product && $qty !== null) {
//             $updateSql = "UPDATE $tableName SET create_type = 1, qty = '$qty'
//                 WHERE datetime = TO_DATE('$datetime', 'YYYY-MM-DD')
//                 AND type = '$type'
//                 AND line_name = '$line'
//                 AND product_type = '$product'
//                 AND create_type = 0";
//             $updateStmt = oci_parse($mt600db, $updateSql);
//             oci_execute($updateStmt);
//             oci_free_statement($updateStmt);
//         }
//     }
// }

if (!oci_commit($newdb)) {
    $error = oci_error($newdb);
    error_log("OCI Commit Error: " . $error['message']);
}

if (empty($errorRows)) {
    echo json_encode([
        "success" => true,
        "message" => "All data inserted successfully.",
        "inserted_count" => count($successfulInserts)
    ]);
} else {
    echo json_encode([
        "success" => count($successfulInserts) > 0, // Partially successful if some inserts worked
        "message" => "Some data could not be inserted.",
        "inserted_count" => count($successfulInserts),
        "failed_count" => count($errorRows),
        "error_rows" => $errorRows
    ]);
}
?>