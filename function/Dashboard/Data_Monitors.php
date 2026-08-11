<?php
require_once __DIR__ . '/../assets/demo_config.php';

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    header('Content-Type: application/json');
    echo json_encode(MockStore::dataMonitors($_POST));
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';

// รับค่าจาก POST
$productType = $_POST['productType'] ?? '';
$dateFilter = $_POST['dateFilter'] ?? 'yesterday';
$dayInput = $_POST['dayInput'] ?? '';
$monthFilter = $_POST['monthFilter'] ?? '';
$yearFilter = $_POST['yearFilter'] ?? '';

function getOG($productType, $dateFilter = 'yesterday', $dayInput = '', $monthFilter = '', $yearFilter = ''){
    $params = [];
    $sql = [];

    $sql[] = "SELECT * FROM production_completed_lot WHERE 1=1";
            

    if ($productType === 'typeA'){
        $sql[] .= " AND product_type = 'Type A'";
    } elseif ($productType === 'typeB'){
        $sql[] .= " AND product_type = 'Type B'";
    } elseif ($productType === 'typeC'){
        $sql[] .= " AND product_type = 'Type C'";
    } elseif ($productType === 'typeD'){
        $sql[] .= " AND product_type = 'Type D'";
    } elseif ($productType === 'typeE'){
        $sql[] .= " AND product_type = 'Type E'";
    } 
    
    if ($dateFilter === 'yesterday'){
        $sql[] .= " AND to_date(completion_prass_date, 'YYYY-MM-DD') BETWEEN TRUNC(SYSDATE - 1, 'MM') AND TRUNC(SYSDATE - 1)";
    } elseif ($dateFilter === 'today'){
        $sql[] .= " AND to_date(completion_prass_date, 'YYYY-MM-DD') BETWEEN TRUNC(SYSDATE, 'MM') AND TRUNC(SYSDATE)";
    } elseif ($dateFilter === 'day'){
        $sql[] .= " AND to_date(completion_prass_date, 'YYYY-MM-DD') BETWEEN TRUNC(TO_DATE(:dayInput, 'YYYY-MM-DD'), 'MM') AND TO_DATE(:dayInput, 'YYYY-MM-DD')";
        $params[':dayInput'] = $dayInput;
    } elseif ($dateFilter === 'month'){
        $sql[] .= " AND TO_CHAR(completion_prass_date, 'YYYY-MM') = :monthFilter";
        $params[':monthFilter'] = $monthFilter;
    } elseif ($dateFilter === 'year'){
        if($yearFilter){
            if (preg_match('/^(\d{4})(F[12])$/i', $yearFilter, $m)){
                $year = (int)$m[1];
                $period = strtoupper($m[2]);
                if ($period === 'F1'){
                    $sql[] .= " AND (EXTRACT(YEAR FROM completion_prass_date) = $year AND EXTRACT(MONTH FROM completion_prass_date) BETWEEN 4 AND 9)";
                } else {
                    $sql[] .= " AND ((EXTRACT(YEAR FROM completion_prass_date) = $year AND EXTRACT(MONTH FROM completion_prass_date) BETWEEN 10 AND 12) OR (EXTRACT(YEAR FROM completion_prass_date) = ($year + 1) AND EXTRACT(MONTH FROM completion_prass_date) BETWEEN 1 AND 3))";
                }
            }
        }
    }



    $sql[] .= " ORDER BY completion_prass_date , partname , lotno";


    $sql = str_replace(["\r", "\n"], ' ', $sql);

    return [
        'query' => implode(' ', $sql), 
        'params' => $params
    ];
}
function getPlan($productType, $dateFilter = 'yesterday', $dayInput = '', $monthFilter = '', $yearFilter = ''){
    $params = [];
    $sql = "SELECT * FROM production_plan
            WHERE 1=1 ";

    if ($productType === 'typeA '){
        $sql .= " AND product_type = 'Type A'";
    } elseif ($productType === 'typeB'){
        $sql .= " AND product_type = 'Type B'";
    } elseif ($productType === 'typeC'){
        $sql .= " AND product_type = 'Type C'";
    } elseif ($productType === 'typeD'){
        $sql .= " AND product_type = 'Type D'";
    } elseif ($productType === 'typeE'){
        $sql .= " AND product_type = 'Type E'";
    }

    if ($dateFilter === 'yesterday') {
        $sql .= " AND TO_CHAR(datetime, 'YYYY-MM') = TO_CHAR(TO_DATE(SYSDATE-1), 'YYYY-MM')";
    } elseif ($dateFilter === 'today') {
        $sql .= " AND TO_CHAR(datetime, 'YYYY-MM') = TO_CHAR(TO_DATE(SYSDATE), 'YYYY-MM')";
    } elseif ($dateFilter === 'day') {
        $sql .= " AND TO_CHAR(datetime, 'YYYY-MM') = TO_CHAR(TO_DATE(:dayInput, 'YYYY-MM-DD'), 'YYYY-MM')";
        $params[':dayInput'] = $dayInput;
    } elseif ($dateFilter === 'month'){
        $sql .= " AND TO_CHAR(datetime, 'YYYY-MM') = :monthFilter";
        $params[':monthFilter'] = $monthFilter;
    } elseif ($dateFilter === 'year'){
        if($yearFilter){
            if (preg_match('/^(\d{4})(F[12])$/i', $yearFilter, $m)){
                $year = (int)$m[1];
                $period = strtoupper($m[2]);
                if ($period === 'F1'){
                    $sql .= " AND (EXTRACT(YEAR FROM datetime) = $year AND EXTRACT(MONTH FROM datetime) BETWEEN 4 AND 9)";
                } else {
                    $sql .= " AND ((EXTRACT(YEAR FROM datetime) = $year AND EXTRACT(MONTH FROM datetime) BETWEEN 10 AND 12) OR (EXTRACT(YEAR FROM datetime) = ($year + 1) AND EXTRACT(MONTH FROM datetime) BETWEEN 1 AND 3))";
                }
            }
        }
    }

    $sql .= " ORDER BY datetime , type , line_name";
    $sql = str_replace(["\r", "\n"], ' ', $sql);

    return [
        'query' => $sql, 
        'params' => $params
    ];
}
function getWIP($productType, $dateFilter = 'yesterday', $dayInput = '', $monthFilter = '', $yearFilter = '') {
    $params = [];
    $sql = "SELECT SUM(wip_qty) AS SUMQTY FROM wip_last_month WHERE 1=1 ";

    if ($productType === 'typeA') {
        $sql .= " AND product_type = 'Type A'";
    } elseif ($productType === 'typeB'){
        $sql .= " AND product_type = 'Type B'";
    } elseif ($productType === 'typeC'){
        $sql .= " AND product_type = 'Type C'";
    } elseif ($productType === 'typeD'){
        $sql .= " AND product_type = 'Type D'";
    } elseif ($productType === 'typeE'){
        $sql .= " AND product_type = 'Type E'";
    }

    if ($dateFilter === 'yesterday') {
        $monthYear = date('Y-m', strtotime('-1 day'));
        $sql .= " AND TO_CHAR(month_year, 'YYYY-MM') = :monthYear";
        $params[':monthYear'] = $monthYear;
    } elseif ($dateFilter === 'today') {
        $monthYear = date('Y-m', strtotime('today'));
        $sql .= " AND TO_CHAR(month_year, 'YYYY-MM') = :monthYear";
        $params[':monthYear'] = $monthYear;
    } elseif ($dateFilter === 'day') {
        if ($dayInput) {
            $theDate = DateTime::createFromFormat('Y-m-d', $dayInput);
            if (!$theDate) $theDate = DateTime::createFromFormat('d/m/Y', $dayInput);
            if ($theDate) {
                $monthYear = $theDate->format('Y-m');
                $sql .= " AND TO_CHAR(month_year, 'YYYY-MM') = :monthYear";
                $params[':monthYear'] = $monthYear;
            }
        }
    } elseif ($dateFilter === 'month') {
        $sql .= " AND TO_CHAR(month_year, 'YYYY-MM') = :monthFilter";
        $params[':monthFilter'] = $monthFilter;
    } elseif ($dateFilter === 'year') {
        if ($yearFilter) {
            if (preg_match('/^(\d{4})(F[12])$/i', $yearFilter, $m)) {
                $year = (int)$m[1];
                $period = strtoupper($m[2]);
                if ($period === 'F1') {
                    $sql .= " AND (EXTRACT(YEAR FROM month_year) = $year AND EXTRACT(MONTH FROM month_year) BETWEEN 4 AND 9)";
                } else {
                    $sql .= " AND ((EXTRACT(YEAR FROM month_year) = $year AND EXTRACT(MONTH FROM month_year) BETWEEN 10 AND 12) OR (EXTRACT(YEAR FROM month_year) = ($year + 1) AND EXTRACT(MONTH FROM month_year) BETWEEN 1 AND 3))";
                }
            }
        }
    }
    $sql = str_replace(["\r", "\n"], ' ', $sql);

    return [
        'query' => $sql, 
        'params' => $params
    ];
}
function getInput($productType, $dateFilter = 'yesterday', $dayInput = '', $monthFilter = '', $yearFilter = ''){
    $sql = [];
    $params = [];
    $table = '';

    if ($productType === 'typeA') {
        $sql[] = "SELECT * FROM production_input WHERE product_type = 'Type A'";
    } elseif ($productType === 'typeB'){
        $sql[] = "SELECT * FROM production_input WHERE product_type = 'Type B'";
    } elseif ($productType === 'typeC'){
        $sql[] = "SELECT * FROM production_input WHERE product_type = 'Type C'";
    } elseif ($productType === 'typeD'){
        $sql[] = "SELECT * FROM production_input WHERE product_type = 'Type D'";
    } elseif ($productType === 'typeE'){
        $sql[] = "SELECT * FROM production_input WHERE product_type = 'Type E'";
    }


    if ($dateFilter === 'yesterday') {
        $sql[] .= " AND to_date(completion_prass_date) BETWEEN TRUNC(SYSDATE - 1, 'MM') AND TRUNC(SYSDATE - 1)";
    } elseif ($dateFilter === 'today') {
        $sql[] .= " AND to_date(completion_prass_date) BETWEEN TRUNC(SYSDATE, 'MM') AND TRUNC(SYSDATE)";
    } elseif ($dateFilter === 'day' && $dayInput) {
        $theDate = DateTime::createFromFormat('Y-m-d', $dayInput);
        if (!$theDate) $theDate = DateTime::createFromFormat('d/m/Y', $dayInput);
        if ($theDate) {
            $params[':dayInput'] = $theDate->format('Y-m-d');
            $sql[] .= " AND completion_prass_date BETWEEN TRUNC(TO_DATE(:dayInput, 'YYYY-MM-DD'), 'MM') AND TO_DATE(:dayInput, 'YYYY-MM-DD')";
        }
    } elseif ($dateFilter === 'month' && $monthFilter) {
        $sql[] .= " AND TO_CHAR(completion_prass_date, 'YYYY-MM') = :monthFilter";
        $params[':monthFilter'] = $monthFilter;
    } elseif ($dateFilter === 'year' && $yearFilter) {
        if (preg_match('/^(\d{4})(F[12])$/i', $yearFilter, $m)) {
            $year = (int)$m[1];
            $period = strtoupper($m[2]);
            if ($period === 'F1') {
                $sql[] .= " AND (EXTRACT(YEAR FROM completion_prass_date) = $year AND EXTRACT(MONTH FROM completion_prass_date) BETWEEN 4 AND 9)";
            } else {
                $sql[] .= " AND (
                    (EXTRACT(YEAR FROM completion_prass_date) = $year AND EXTRACT(MONTH FROM completion_prass_date) BETWEEN 10 AND 12)
                    OR
                    (EXTRACT(YEAR FROM completion_prass_date) = ($year + 1) AND EXTRACT(MONTH FROM completion_prass_date) BETWEEN 1 AND 3))";
            }
        }
    }

    $sql[] .= " ORDER BY completion_prass_date, lotno";


    $sql = str_replace(["\r", "\n"], ' ', $sql);

    return [
        'query' => implode(' ', $sql), 
        'params' => $params
    ];
}

if (!$productType){
    exit(json_encode([
        'error' => 'Product type is required.'
    ]));
}

// --- ดึงข้อมูล Plan ---
$queryPlan = getPlan($productType, $dateFilter, $dayInput, $monthFilter, $yearFilter);
$sqlPlan = $queryPlan['query'] ?? '';
$paramsPlan = $queryPlan['params'] ?? [];

$stidPlan = oci_parse($newdb, $sqlPlan);
foreach ($paramsPlan as $key => $value) {
    oci_bind_by_name($stidPlan, $key, $paramsPlan[$key]);
}
oci_execute($stidPlan);
$PlanData = [];
while ($row = oci_fetch_assoc($stidPlan)) {
    $PlanData[] = $row;
}

// --- ดึงข้อมูล OG ---
$queryOG = getOG($productType, $dateFilter, $dayInput, $monthFilter, $yearFilter);
$sqlOG = $queryOG['query'] ?? '';
$paramsOG = $queryOG['params'] ?? [];

$stidOG = oci_parse($newdb, $sqlOG);
foreach ($paramsOG as $key => $value) {
    oci_bind_by_name($stidOG, $key, $paramsOG[$key]);
}
oci_execute($stidOG);
$OGData = [];
while ($row = oci_fetch_assoc($stidOG)) {
    $OGData[] = $row;
}

// --- ดึงข้อมูล WIP ---
$queryWIP = getWIP($productType, $dateFilter, $dayInput, $monthFilter, $yearFilter);
$sqlWIP = $queryWIP['query'] ?? '';
$paramsWIP = $queryWIP['params'] ?? [];

// แทนค่าพารามิเตอร์ใน SQL สำหรับ WIP ก่อน query
foreach ($paramsWIP as $key => $value) {
    $sqlWIP = str_replace($key, "'$value'", $sqlWIP);
}

$stidWIP = oci_parse($newdb, $sqlWIP);
// ไม่ต้อง bind params แล้ว เพราะแทนค่าไปแล้ว
oci_execute($stidWIP);
$WIPData = 0;
while ($row = oci_fetch_assoc($stidWIP)) {
    $WIPData += intval($row['SUMQTY'] ?? 0);
}

// --- ดึงข้อมูล Input ---
$queryInput = getInput($productType, $dateFilter, $dayInput, $monthFilter, $yearFilter);
$sqlInput = $queryInput['query'] ?? '';
$paramsInput = $queryInput['params'] ?? [];
$table = $queryInput['table'] ?? '';
$stidInput = oci_parse($newdb, $sqlInput);
foreach ($paramsInput as $key => $value) {
    oci_bind_by_name($stidInput, $key, $paramsInput[$key]);
}
oci_execute($stidInput);
$InputData = [];
while ($row = oci_fetch_assoc($stidInput)) {
    $InputData[] = $row;
}


// --- รวมผลลัพธ์ ---
echo json_encode([
    'PlanData' => $PlanData,
    'OGData' => $OGData,
    'sqlPlan' => $sqlPlan,
    'sqlOG' => $sqlOG,
    'WIPData' => $WIPData,
    'sqlWIP' => $sqlWIP,
    'InputData' => $InputData,
    'sqlInput' => $sqlInput,
    'serverTime' => date('H:i:s'),
]);