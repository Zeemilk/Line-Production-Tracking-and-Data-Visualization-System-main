<?php
//[Plan]Empcode_Checking.php

require_once __DIR__ . '/../assets/demo_config.php';

$empcode = $_GET['empcode'] ?? '';

if (empty($empcode)) {
    echo "no empcode provided";
    exit;
}

if (DEMO_MODE) {
    require_once __DIR__ . '/../assets/mock_store.php';
    echo MockStore::empcodeCheck($empcode);
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';

try {
    // ใช้ oci_parse และ oci_execute แทน PDO
    $sql = "SELECT NAME_ENG FROM employees WHERE employee_code = :empcode";
    $stmt = oci_parse($newdb, $sql);
    oci_bind_by_name($stmt, ':empcode', $empcode);
    
    if (oci_execute($stmt)) {
        $result = oci_fetch_assoc($stmt);
        
        if ($result) {
            echo $result['NAME_ENG']; 
        } else {
            echo "employee not found"; 
        }
    } else {
        echo "query execution failed";
    }
    
    oci_free_statement($stmt);
} catch (Exception $e) {
    echo "database error: " . $e->getMessage(); 
}