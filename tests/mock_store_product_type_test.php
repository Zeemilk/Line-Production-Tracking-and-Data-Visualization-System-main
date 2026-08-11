<?php
require_once __DIR__ . '/../function/assets/mock_store.php';

$cases = ['typeB', 'Type B'];
$failures = [];

foreach ($cases as $productType) {
    $data = MockStore::dataMonitors(['productType' => $productType, 'dateFilter' => 'yesterday']);
    $planRows = $data['PlanData'] ?? [];
    $hasRows = count($planRows) > 0;
    $sampleType = $planRows[0]['PRODUCT_TYPE'] ?? '';

    if (!$hasRows || $sampleType !== 'Type B') {
        $failures[] = "$productType -> hasRows=$hasRows sampleType=$sampleType";
    }
}

if ($failures) {
    echo "FAIL\n" . implode("\n", $failures) . "\n";
    exit(1);
}

echo "Product type demo data generation works\n";
