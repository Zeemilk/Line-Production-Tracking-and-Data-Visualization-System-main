<?php
require_once __DIR__ . '/demo_config.php';

$newdb = null;

if (!DEMO_MODE) {
    /**
     * Oracle Connection Configuration
     * ==========================================
     * For production use, replace these credentials with your Oracle database settings.
     * It's recommended to use environment variables instead of hardcoding credentials.
     * 
     * Example using environment variables:
     *   $username = getenv('DB_USERNAME') ?: 'your_username';
     *   $password = getenv('DB_PASSWORD') ?: 'your_password';
     *   $database = getenv('DB_CONNECTION_STRING') ?: 'localhost:1521/XE';
     */
    
    // TODO: Configure your Oracle database credentials here
    $username = 'c##TestUser';      // Change this to your username
    $password = '123456';            // Change this to your password
    $database = 'localhost:1521/XE'; // Change this to your connection string
    
    $newdb = @oci_connect($username, $password, $database, 'AL32UTF8');
    
    if (!$newdb) {
        $error = oci_error();
        error_log("Oracle Connection Error: " . $error['message']);
        // In production, you might want to handle this differently
        // For now, returning null will cause graceful fallback
    }
}
