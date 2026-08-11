<?php
require_once __DIR__ . '/../assets/demo_config.php';

$productType = $_POST['productType'] ?? '';

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    header('Content-Type: application/json');
    echo json_encode(MockStore::dataMCRecord($_POST));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';
$dateFilter = $_POST['dateFilter'] ?? '';
$dayInput = $_POST['dayInput'] ?? '';
$monthFilter = $_POST['monthFilter'] ?? '';
$yearFilter = $_POST['yearFilter'] ?? '';

function getMachineLossTimeData($producttype, $dateFilter = '', $dayInput = '', $monthFilter = '', $yearFilter = ''){
    $query = '';
    $params = [];

    $query = "SELECT datetime , datetimefin , facno , line_name , losscode , loss_name , mc_name , mc_trouble , mc_type , namereq , process , product_type , remark , section , timereq , time , timefin ,
        CASE 
            WHEN timefin IS NOT NULL AND time IS NOT NULL THEN 
                ROUND((TO_DATE(timefin, 'HH24:MI:SS') - TO_DATE(time, 'HH24:MI:SS')) * 24 * 60)
            ELSE 
                0
        END AS TIMEMIN FROM mcs_record";

    if ($producttype === 'typeA'){
        $query .= " WHERE product_type = 'Type A'";
    } elseif ($producttype === 'typeB'){
        $query .= " WHERE product_type = 'Type B'";
    } elseif ($producttype === 'typeC'){
        $query .= " WHERE product_type = 'Type C'";
    } elseif ($producttype === 'typeD'){
        $query .= " WHERE product_type = 'Type D'";
    } elseif ($producttype === 'typeE'){
        $query .= " WHERE product_type = 'Type E'";
    }

    if ($dateFilter === 'yesterday') {
        $params[':dayFilter'] = date('d-m-Y', strtotime('-1 day'));
        $query .= " AND TO_CHAR(datetime, 'MM-YYYY') = TO_CHAR(TO_DATE(:dayFilter, 'DD-MM-YYYY'), 'MM-YYYY')";
    } elseif ($dateFilter === 'today') {
        $params[':dayFilter'] = date('d-m-Y');
        $query .= " AND TO_CHAR(datetime, 'DD-MM-YYYY') = :dayFilter";
    } elseif ($dateFilter === 'day' && $dayInput) {
        // แปลงจาก DD/MM/YY หรือ DD/MM/YYYY เป็น DD-MM-YYYY
        if (preg_match('/(\d{2})\/(\d{2})\/(\d{4})/', $dayInput, $matches)) {
            // รูปแบบ DD/MM/YYYY
            $params[':dayFilter'] = $matches[1] . '-' . $matches[2] . '-' . $matches[3];
        } elseif (preg_match('/(\d{2})\/(\d{2})\/(\d{2})/', $dayInput, $matches)) {
            // รูปแบบ DD/MM/YY
            $fullYear = ($matches[3] >= 20) ? "20" . $matches[3] : "20" . $matches[3];
            $params[':dayFilter'] = $matches[1] . '-' . $matches[2] . '-' . $fullYear;
        } else {
            // หากรูปแบบไม่ตรง ให้ใช้แบบเดิม
            $params[':dayFilter'] = $dayInput;
        }
        $query .= " AND TO_CHAR(datetime, 'MM-YYYY') = TO_CHAR(TO_DATE(:dayFilter, 'DD-MM-YYYY'), 'MM-YYYY')";
    } elseif ($dateFilter === 'month') {
        if (!$monthFilter && $dayInput) $monthFilter = substr($dayInput, 0, 7);
        // แปลงจาก YYYY-MM เป็น MM-YYYY สำหรับการเปรียบเทียบ
        if (preg_match('/(\d{4})-(\d{2})/', $monthFilter, $matches)) {
            $params[':monthFilter'] = $matches[2] . "-" . $matches[1];
            $query .= " AND TO_CHAR(datetime, 'MM-YYYY') = :monthFilter";
        } else {
            $params[':monthFilter'] = $monthFilter;
            $query .= " AND TO_CHAR(datetime, 'MM-YYYY') = :monthFilter";
        }
    } elseif ($dateFilter === 'year' && $yearFilter) {
        if (preg_match('/^(\d{4})(F[12])$/i', $yearFilter, $m)) {
            $year = (int)$m[1];
            $period = strtoupper($m[2]);
            if ($period === 'F1') {
                $query .= " AND (EXTRACT(YEAR FROM datetime) = $year AND EXTRACT(MONTH FROM datetime) BETWEEN 4 AND 9)";
            } else {
                $query .= " AND ((EXTRACT(YEAR FROM datetime) = $year AND EXTRACT(MONTH FROM datetime) BETWEEN 10 AND 12)
                               OR (EXTRACT(YEAR FROM datetime) = ($year + 1) AND EXTRACT(MONTH FROM datetime) BETWEEN 1 AND 3))";
            }
        } else {
            $query .= " AND EXTRACT(YEAR FROM datetime) = :year";
            $params[':year'] = (int)$yearFilter;
        }
    }

    $query = str_replace(["\r", "\n"], ' ', $query);
    return [
        'query' => $query,
        'params' => $params
    ];
};

$DatamcRecord = getMachineLossTimeData($productType, $dateFilter, $dayInput, $monthFilter, $yearFilter);
$querymcRecord = $DatamcRecord['query'] ?? '';
$params = $DatamcRecord['params'] ?? [];

// แทนที่ตัวแปรใน query ด้วยค่าจริง
$mcRecordSQL = $querymcRecord;
if (!empty($params)) {
    foreach ($params as $key => $value) {
        $mcRecordSQL = str_replace($key, "'$value'", $mcRecordSQL);
    }
}

$parsemcRecord = oci_parse($newdb, $querymcRecord);

if (!empty($params)) {
    foreach ($params as $key => $value) {
        oci_bind_by_name($parsemcRecord, $key, $value);
    }
}

oci_execute($parsemcRecord);
$mcRecordData = [];
while ($row = oci_fetch_assoc($parsemcRecord)) {
    $mcRecordData[] = $row;
}


echo json_encode([
    'mcRecordData' => $mcRecordData,
    'sqlmcRecord' => $mcRecordSQL
]);