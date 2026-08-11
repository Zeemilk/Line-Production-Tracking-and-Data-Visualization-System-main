<?php
//create_session.php - สร้าง PHP Session หลังจาก Login สำเร็จ
//ไฟล์นี้รับข้อมูลผู้ใช้จาก JavaScript หลังจาก authentication สำเร็จ
//แล้วสร้าง PHP session เพื่อจัดการสิทธิ์การเข้าถึงและข้อมูลผู้ใช้
// กำหนด Content-Type เป็น JSON เพื่อส่งข้อมูลกลับไปยัง JavaScript
header('Content-Type: application/json');

//รับข้อมูลจาก POST request
//ข้อมูลจะถูกส่งมาในรูปแบบ JSON จาก JavaScript
$input = json_decode(file_get_contents("php://input"), true);

// ตรวจสอบความถูกต้องของข้อมูลที่รับมา
if (!$input || !isset($input['username'])) {
    // กรณีข้อมูลไม่ถูกต้องหรือไม่มี username
    echo json_encode([
        "success" => false,
        "error" => "Invalid input data"
    ]);
    exit;
}

//เริ่มต้น PHP Session
//สร้าง session ID และเริ่มต้นการจัดการ session
session_start();

//แปลง role เป็นตัวพิมพ์เล็กเพื่อความสม่ำเสมอ
//ใช้ค่า default เป็น 'user' ถ้าไม่มี role
$userRole = strtolower($input['role'] ?? 'user');

//สร้างข้อมูล session สำหรับผู้ใช้
//เก็บข้อมูลสำคัญไว้ใน $_SESSION เพื่อใช้ในแอปพลิเคชัน
$_SESSION['user_id'] = $input['user_id'] ?? uniqid(); // ID ผู้ใช้ หรือสร้างใหม่ถ้าไม่มี
$_SESSION['username'] = $input['username']; // ชื่อผู้ใช้
$_SESSION['user_role'] = $userRole; // สิทธิ์ผู้ใช้ (admin, user, etc.)
$_SESSION['user_data'] = $input['user_data'] ?? []; // ข้อมูลผู้ใช้ทั้งหมด
$_SESSION['last_activity'] = time(); // เวลาที่เข้าสู่ระบบล่าสุด

//ส่ง response กลับไปยัง JavaScript
//แจ้งผลการสร้าง session และข้อมูลที่เกี่ยวข้อง
echo json_encode([
    "success" => true, // สถานะสำเร็จ
    "message" => "Session created successfully", // ข้อความยืนยัน
    "user_role" => $_SESSION['user_role'], // สิทธิ์ที่แปลงแล้ว
    "original_role" => $input['role'] ?? 'user' // สิทธิ์เดิมที่ได้รับมา
]);
?>
