<?php
// check_login.php - ตรวจสอบ username และ password

header('Content-Type: application/json');

require_once __DIR__ . '/../assets/demo_config.php';
require_once __DIR__ . '/../assets/mock_store.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['username']) || !isset($input['password'])) {
    echo json_encode([
        "success" => false,
        "error" => "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
    ]);
    exit;
}

$username = trim($input['username']);
$password = trim($input['password']);

if (empty($username) || empty($password)) {
    echo json_encode([
        "success" => false,
        "error" => "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
    ]);
    exit;
}

if (DEMO_MODE) {
    $result = MockStore::login($username, $password);
    if ($result['success']) {
        session_start();
        $_SESSION['user_id'] = $result['username'];
        $_SESSION['username'] = $result['username'];
        $_SESSION['user_role'] = $result['role'];
        $_SESSION['user_data'] = $result['userData'];
        $_SESSION['last_activity'] = time();
    }
    echo json_encode($result);
    exit;
}

require_once __DIR__ . '/../assets/oracle.php';

if (!$newdb) {
    echo json_encode([
        "success" => false,
        "error" => "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"
    ]);
    exit;
}

try {
    $sql = "SELECT EMPLOYEE_CODE, PASSWORD, NAME_ENG 
            FROM Employees 
            WHERE EMPLOYEE_CODE = :username";
    
    $stmt = oci_parse($newdb, $sql);
    
    if (!$stmt) {
        $error = oci_error($newdb);
        echo json_encode([
            "success" => false,
            "error" => "เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL: " . $error['message']
        ]);
        exit;
    }
    
    oci_bind_by_name($stmt, ':username', $username);
    
    if (oci_execute($stmt)) {
        $result = oci_fetch_assoc($stmt);
        
        if ($result) {
            $dbPassword = $result['PASSWORD'] ?? '';
            
            if ($dbPassword === $password) {
                $userData = [
                    'username' => $result['EMPLOYEE_CODE'] ?? $username,
                    'name_eng' => $result['NAME_ENG'] ?? '',
                    'employee_code' => $result['EMPLOYEE_CODE'] ?? $username
                ];
                
                session_start();
                $_SESSION['user_id'] = $result['EMPLOYEE_CODE'] ?? $username;
                $_SESSION['username'] = $result['EMPLOYEE_CODE'] ?? $username;
                $_SESSION['user_role'] = 'user';
                $_SESSION['user_data'] = $userData;
                $_SESSION['last_activity'] = time();
                
                $jwttoken = base64_encode(json_encode([
                    'username' => $userData['username'],
                    'loginTime' => time(),
                    'exp' => time() + 3600
                ]));
                
                echo json_encode([
                    "success" => true,
                    "jwttoken" => $jwttoken,
                    "username" => $userData['username'],
                    "name_eng" => $userData['name_eng'],
                    "role" => "user",
                    "userData" => $userData
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "error" => "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
                ]);
            }
        } else {
            echo json_encode([
                "success" => false,
                "error" => "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
            ]);
        }
    } else {
        $error = oci_error($stmt);
        echo json_encode([
            "success" => false,
            "error" => "เกิดข้อผิดพลาดในการค้นหาข้อมูล: " . $error['message']
        ]);
    }
    
    oci_free_statement($stmt);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "เกิดข้อผิดพลาด: " . $e->getMessage()
    ]);
}
?>
