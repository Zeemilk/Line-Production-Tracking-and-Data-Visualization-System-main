<?php
//planlineoption.php
require_once __DIR__ . '/assets/demo_config.php';

if (DEMO_MODE) {
    require_once __DIR__ . '/assets/mock_store.php';
    return MockStore::lineOptions();
}

require_once __DIR__ . '/assets/oracle.php';
global $newdb;
$lineOptions = '';
$producttypeOptions = '';
if ($newdb) {
    $sql = "SELECT DISTINCT
                line_name
            FROM
                production_plan
            ORDER BY
                line_name";
    $stid = oci_parse($newdb, $sql);
    oci_execute($stid);
    while ($row = oci_fetch_assoc($stid)) {
        $line = htmlspecialchars($row['LINE_NAME']);
        $lineOptions .= "<option value=\"$line\">$line</option>";
    }
    oci_free_statement($stid);
}

if ($newdb) {
    $sql = "SELECT DISTINCT
                product_type
            FROM
                production_plan
            ORDER BY
                product_type";
    $stid = oci_parse($newdb, $sql);
    oci_execute($stid);
    while ($row = oci_fetch_assoc($stid)) {
        $producttype = htmlspecialchars($row['PRODUCT_TYPE']);
        $producttypeOptions .= "<option value=\"$producttype\">$producttype</option>";
    }
    oci_free_statement($stid);
}
return [
    "lineOptions" => $lineOptions,
    "producttypeOptions" => $producttypeOptions
];
?>
