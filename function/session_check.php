<?php
// session_check.php - ตรวจสอบ session และ role จาก userData

// รับข้อมูลจาก POST หรือ GET
$input = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
} else {
    $input = $_GET;
}

// ตรวจสอบว่ามี userData หรือไม่
$userData = null;
$userRole = 'user'; // default role

if ($input && isset($input['userData'])) {
    $userData = $input['userData'];
    $userRole = $userData['role'] ?? 'user';
} else {
    // ถ้าไม่มี userData ให้ตรวจสอบจาก session หรือ JWT token
    session_start();
    
    if (isset($_SESSION['user_role'])) {
        $userRole = $_SESSION['user_role'];
    } elseif (isset($_SESSION['username'])) {
        // ถ้ามี username ใน session ให้เป็น user
        $userRole = 'user';
    } else {
        // ถ้าไม่มี session ให้ตรวจสอบ JWT token จาก header หรือ cookie
        $headers = getallheaders();
        $hasAuth = false;
        
        // ตรวจสอบ Authorization header
        if (isset($headers['Authorization'])) {
            $auth_header = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
                $hasAuth = true;
            }
        }
        
        // ตรวจสอบ JWT token จาก cookie
        if (!$hasAuth && isset($_COOKIE['jwttoken'])) {
            $hasAuth = true;
        }
        
        // ตรวจสอบ JWT token จาก POST data
        if (!$hasAuth && $input && isset($input['jwttoken'])) {
            $hasAuth = true;
        }
        
        // ตรวจสอบ JWT token จาก GET parameter
        if (!$hasAuth && isset($_GET['jwttoken'])) {
            $hasAuth = true;
        }
        
        if ($hasAuth) {
            // มี JWT token ให้ผ่าน (ไม่ต้องตรวจสอบ role)
            $userRole = 'user';
        } else {
            // ไม่มี authentication ให้ส่ง error
            header('Content-Type: application/json');
            echo json_encode([
                "success" => false, 
                "error" => "Authentication required. Please login again.",
                "redirect" => "login.php"
            ]);
            exit;
        }
    }
}

// แปลง role เป็นตัวเล็กเพื่อตรวจสอบ
$userRoleLower = strtolower($userRole);

// ตรวจสอบว่า role ถูกต้องหรือไม่ (รองรับทั้งตัวใหญ่และตัวเล็ก)
if (!in_array($userRoleLower, ['user', 'admin'])) {
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false, 
        "error" => "Invalid user role: $userRole (converted to: $userRoleLower)",
        "redirect" => "login.php"
    ]);
    exit;
}

// ใช้ role ที่แปลงแล้วสำหรับการตรวจสอบสิทธิ์
$userRole = $userRoleLower;

// ตรวจสอบสิทธิ์การเข้าถึงตาม Role
function checkUserPermission($required_role = null) {
    global $userRole;
    
    // ถ้าไม่ระบุ role ที่ต้องการ ให้ผ่าน (User ทั่วไป)
    if (!$required_role) {
        return true;
    }
    
    // Admin สามารถเข้าถึงได้ทุกอย่าง
    if ($userRole === 'admin') {
        return true;
    }
    
    // User สามารถเข้าถึงได้เฉพาะฟังก์ชันพื้นฐาน
    if ($userRole === 'user') {
        if (in_array($required_role, ['view', 'user', 'basic'])) {
            return true;
        }
    }
    
    // ถ้าไม่ตรงเงื่อนไขใดๆ
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false, 
        "error" => "Insufficient permissions. Required role: $required_role, User role: $userRole",
        "redirect" => "dashboard.php"
    ]);
    exit;
}

// ฟังก์ชันตรวจสอบสิทธิ์เฉพาะสำหรับการลบข้อมูล
function checkDeletePermission() {
    global $userRole;
    
    // User และ Admin สามารถลบข้อมูลได้
    if (in_array($userRole, ['admin', 'user'])) {
        return true;
    }
    
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false, 
        "error" => "Delete permission denied. User or Admin role required.",
        "redirect" => "dashboard.php"
    ]);
    exit;
}

// ฟังก์ชันตรวจสอบสิทธิ์ Admin เฉพาะ
function checkAdminPermission() {
    global $userRole;
    
    if ($userRole !== 'admin') {
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false, 
            "error" => "Admin permission required. Current role: $userRole",
            "redirect" => "dashboard.php"
        ]);
        exit;
    }
    
    return true;
}

// ส่งข้อมูล role กลับไปให้ฟังก์ชันอื่นใช้
$GLOBALS['CURRENT_USER_ROLE'] = $userRole;
$GLOBALS['CURRENT_USER_DATA'] = $userData;
?>
