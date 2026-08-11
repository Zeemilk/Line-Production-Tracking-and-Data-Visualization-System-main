<?php
//wiplastmonth_options.php
require_once __DIR__ . '/assets/demo_config.php';

if (DEMO_MODE) {
    require_once __DIR__ . '/assets/mock_store.php';
    return MockStore::wipLastMonthOptions();
}

require_once __DIR__ . '/assets/oracle.php';
global $newdb;
$producttypeOptions = '';
if ($newdb) {
    $sql = "SELECT DISTINCT
                product_type
            FROM
                wip_last_month
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
    "producttypeOptions" => $producttypeOptions
];
?>
