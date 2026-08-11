<?php
// test_auth.php - ทดสอบระบบ authentication

// เพิ่มการตรวจสอบ session และ role ก่อน
// include './session_check.php';

// ตั้ง header หลังจาก include session_check
header('Content-Type: application/json');

// ตรวจสอบสิทธิ์ - User และ Admin สามารถเข้าถึงได้
// checkUserPermission('view');

// ส่งข้อมูลกลับ
echo json_encode([
    'success' => true,
    'message' => 'Authentication successful',
    'user_role' => 'user', // default role
    'user_data' => null
]);
?>
