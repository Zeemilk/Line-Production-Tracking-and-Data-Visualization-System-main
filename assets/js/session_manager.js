// session_manager.js - จัดการ session error และ permission

// ฟังก์ชันจัดการ session error
function handleSessionError(response) {
    if (response.success === false && response.error && response.error.includes('Session expired')) {
        Swal.fire({
            title: 'Session หมดอายุ',
            text: 'กรุณาเข้าสู่ระบบใหม่',
            icon: 'warning',
            confirmButtonText: 'ตกลง'
        }).then((result) => {
            // ลบข้อมูล localStorage
            localStorage.removeItem('jwttoken');
            localStorage.removeItem('username');
            localStorage.removeItem('userData');
            localStorage.removeItem('loginTime');
            
            // redirect ไปหน้า login
            window.location.href = response.redirect || 'login.php';
        });
        return true;
    }
    
    // ตรวจสอบ permission error
    if (response.success === false && response.error && response.error.includes('permission')) {
        Swal.fire({
            title: 'ไม่มีสิทธิ์',
            text: response.error,
            icon: 'error',
            confirmButtonText: 'ตกลง'
        });
        return true;
    }
    
    return false;
}

// ฟังก์ชันส่งข้อมูลไปยัง API พร้อม JWT token และ userData
function sendRequestWithAuth(url, data, method = 'POST') {
    const jwttoken = localStorage.getItem('jwttoken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // เพิ่ม JWT token และ userData เข้าไปในข้อมูล
    const requestData = {
        ...data,
        jwttoken: jwttoken,
        userData: userData
    };
    
    return $.ajax({
        url: url,
        method: method,
        data: method === 'GET' ? requestData : JSON.stringify(requestData),
        contentType: method === 'GET' ? 'application/x-www-form-urlencoded' : 'application/json',
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + jwttoken
        },
        success: function(response) {
            if (handleSessionError(response)) return;
            // จัดการ response ตามปกติ
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
        }
    });
}

// ฟังก์ชันลบข้อมูล Plan
function deletePlan(planId) {
    const jwttoken = localStorage.getItem('jwttoken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบข้อมูลนี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: 'function/[Plan]deleteDataPlan.php',
                method: 'POST',
                data: JSON.stringify({
                    data: planId,
                    jwttoken: jwttoken,
                    userData: userData
                }),
                contentType: 'application/json',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + jwttoken
                },
                success: function(response) {
                    if (handleSessionError(response)) return;
                    
                    if (response.success) {
                        Swal.fire('สำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
                        // รีเฟรชตาราง
                        if (typeof loadPlanData === 'function') {
                            loadPlanData();
                        }
                    } else {
                        Swal.fire('ผิดพลาด', response.error || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
                    }
                },
                error: function(xhr, status, error) {
                    Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
                }
            });
        }
    });
}

// ฟังก์ชันลบข้อมูล WIP
function deleteWIP(wipId) {
    const jwttoken = localStorage.getItem('jwttoken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบข้อมูลนี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: 'function/[WIP]deleteWIP.php',
                method: 'POST',
                data: JSON.stringify({
                    data: wipId,
                    jwttoken: jwttoken,
                    userData: userData
                }),
                contentType: 'application/json',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + jwttoken
                },
                success: function(response) {
                    if (handleSessionError(response)) return;
                    
                    if (response.success) {
                        Swal.fire('สำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
                        // รีเฟรชตาราง
                        if (typeof loadWIPData === 'function') {
                            loadWIPData();
                        }
                    } else {
                        Swal.fire('ผิดพลาด', response.error || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
                    }
                },
                error: function(xhr, status, error) {
                    Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
                }
            });
        }
    });
}

// ฟังก์ชันตรวจสอบสิทธิ์ตาม Role (แปลงเป็นตัวเล็ก)
function checkUserRole() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return (userData.role || 'user').toLowerCase();
}

// ฟังก์ชันซ่อน/แสดงปุ่มตาม Role
function updateUIByRole() {
    const userRole = checkUserRole();
    
    // ตรวจสอบว่า jQuery พร้อมใช้งานหรือไม่
    if (typeof $ === 'undefined') {
        console.warn('jQuery not loaded yet, retrying in 100ms...');
        setTimeout(updateUIByRole, 100);
        return;
    }
    
    // ซ่อนปุ่มลบข้อมูลสำหรับ User (ถ้าต้องการ)
    if (userRole === 'user') {
        $('.admin-only').hide();
    } else if (userRole === 'admin') {
        $('.admin-only').show();
    }
}

// ฟังก์ชันเริ่มต้นระบบเมื่อ jQuery พร้อม
function initializeSessionManager() {
    if (typeof $ === 'undefined') {
        console.warn('jQuery not loaded yet, retrying in 100ms...');
        setTimeout(initializeSessionManager, 100);
        return;
    }
    
    console.log('Session Manager initialized successfully');
    
    // เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
    $(document).ready(function() {
        updateUIByRole();
    });
}

// ฟังก์ชันเริ่มต้นระบบเมื่อไฟล์โหลดเสร็จ
if (document.readyState === 'loading') {
    // ไฟล์ยังโหลดไม่เสร็จ รอ DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeSessionManager);
} else {
    // ไฟล์โหลดเสร็จแล้ว เริ่มต้นทันที
    initializeSessionManager();
}
