<?php
/**
 * Demo mode — no Oracle required.
 * Set DEMO_MODE to false and configure oracle.php to use a real database.
 */
define('DEMO_MODE', true);

define('DEMO_USERS', [
    'demo'  => ['password' => 'demo',  'name_eng' => 'Demo User',  'role' => 'user'],
    'admin' => ['password' => 'admin', 'name_eng' => 'Admin User', 'role' => 'admin'],
]);

define('DEMO_EMPLOYEES', [
    'E001' => 'John Smith',
    'E002' => 'Jane Doe',
    'E003' => 'Bob Wilson',
    'SYSTEM' => 'System',
]);
