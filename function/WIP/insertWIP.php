<?php

// เพิ่มการตรวจสอบ session และ role ก่อน
// include './session_check.php';

// ตั้ง header หลังจาก include session_check
header('Content-Type: application/json');

require_once __DIR__ . '/../assets/demo_config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    if (!$data || !isset($data['data'])) {
        echo json_encode(["success" => false, "error" => "Invalid input data."]);
        exit;
    }
    echo json_encode(MockStore::insertWip($data));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';

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

$data = json_decode(file_get_contents("php://input"), true);
error_log("RAW POST DATA: " . file_get_contents("php://input"));
error_log("DECODED DATA: " . json_encode($data));

if (!$data || !isset($data['data'])) {
    echo json_encode(["success" => false, "error" => "Invalid input data."]);
    exit;
}

$tableName = 'WIP_LAST_MONTH'; // Define your table name
$rowsToInsert = $data['data'];
$errorRows = [];
$successfulInserts = [];

foreach ($rowsToInsert as $index => $row) {
    $row = array_change_key_case($row, CASE_UPPER);
    $ColumnPut = [];
    $values = [];

    // ตรวจสอบและเตรียมข้อมูลแต่ละฟิลด์
    // 1. MONTH_YEAR (DATE)
    if (isset($row['MONTH_YEAR'])) {
        $parsedDate = parseDate($row['MONTH_YEAR']);
        if ($parsedDate) {
            $ColumnPut[] = '"MONTH_YEAR"';
            $values[] = "TO_DATE('" . addslashes($parsedDate) . "', 'YYYY-MM-DD')";
        } else {
            $errorRows[] = [
                "row_index" => $index,
                "data" => $row,
                "error" => "Invalid date format for 'MONTH_YEAR': '" . $row['MONTH_YEAR'] . "'."
            ];
            continue;
        }
    } else {
        $errorRows[] = [
            "row_index" => $index,
            "data" => $row,
            "error" => "'MONTH_YEAR' is required."
        ];
        continue;
    }

    // 2. PRODUCT_TYPE (varchar2)
    if (isset($row['PRODUCT_TYPE'])) {
        $ColumnPut[] = '"PRODUCT_TYPE"';
        $values[] = "'" . addslashes($row['PRODUCT_TYPE']) . "'";
    } else {
        $errorRows[] = [
            "row_index" => $index,
            "data" => $row,
            "error" => "'PRODUCT_TYPE' is required."
        ];
        continue;
    }

    // 3. WIP_QTY (varchar2)
    if (isset($row['WIP_QTY'])) {
        $ColumnPut[] = '"WIP_QTY"';
        $values[] = "'" . addslashes($row['WIP_QTY']) . "'";
    } else {
        $errorRows[] = [
            "row_index" => $index,
            "data" => $row,
            "error" => "'WIP_QTY' is required."
        ];
        continue;
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