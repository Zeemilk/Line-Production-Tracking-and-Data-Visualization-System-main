// ================================================================
// 1.Authentication - ENABLED
// ================================================================
function loginChecking() {
    // รับค่าจาก input fields
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    
    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (username === "" || password === "") {
        Swal.fire("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน", "", "warning");
        return
    }
    
    console.log("Attempting login for:", username);
    
    // ส่งข้อมูลไปตรวจสอบกับฐานข้อมูล Oracle ผ่าน PHP
    fetch("function/Login/check_login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            // ถ้าได้รับ JWT token แสดงว่าการเข้าสู่ระบบสำเร็จ
            if (data.success && data.jwttoken) {
                // เก็บข้อมูลผู้ใช้ใน localStorage เพื่อใช้ในแอปพลิเคชัน
                localStorage.setItem('jwttoken', data.jwttoken); // Token สำหรับการยืนยันตัวตน
                localStorage.setItem('username', data.username); // ชื่อผู้ใช้
                localStorage.setItem('userData', JSON.stringify(data.userData || data)); // ข้อมูลผู้ใช้ทั้งหมด
                localStorage.setItem('loginTime', Date.now()); // เวลาที่เข้าสู่ระบบ
                
                // ตรวจสอบและเก็บ role (แปลงเป็นตัวเล็กเพื่อความสม่ำเสมอ)
                const userRole = (data.role || 'user').toLowerCase();
                localStorage.setItem('userRole', userRole);
                
                // สร้าง session ใน PHP เพื่อจัดการสิทธิ์การเข้าถึง
                createPHPSession(data.userData || data, userRole);
                
                // แสดงข้อความยินดีและซ่อน login box
                const displayName = data.name_eng || data.username;
                Swal.fire("เข้าสู่ระบบสำเร็จ", `ยินดีต้อนรับ ${displayName}`, "success").then(() => {
                    if (document.getElementById('loginBox')) {
                        document.getElementById('loginBox').style.display = 'none';
                    }
                    // โหลด sidebar หลังจาก login สำเร็จ
                    fetch('./assets/Sidebar/sidebar-login.php')
                    .then(r => r.text())
                    .then(html => {
                        document.getElementById('SidebarContainer').innerHTML = html;
                        if (typeof updateSidebarAuthBtn === 'function') updateSidebarAuthBtn();
                        if (typeof updateSidebarMenuByLogin === 'function') updateSidebarMenuByLogin();
                        if (typeof setupLogoutButton === 'function') setupLogoutButton();
                    });
                    // ส่ง event เพื่อให้ปุ่ม sidebar-auth-btn อัปเดตสถานะ
                    document.dispatchEvent(new Event('user-auth-changed'));
                    // Redirect ไปหน้า dashboard หรือหน้าหลัก
                    window.location.href = "dashboard.php";
                });
            } else {
                // กรณีข้อมูลไม่ถูกต้อง
                const errorMessage = data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
                Swal.fire(errorMessage, "", "error");
            }
        })
        .catch(error => {
            // กรณีเกิดข้อผิดพลาดในการเชื่อมต่อหรือประมวลผล
            console.error("Error:", error);
            Swal.fire("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", "", "error");
        });
}
function createPHPSession(userData, userRole) {
    // ส่งข้อมูลไปยัง PHP script เพื่อสร้าง session
    // หมายเหตุ: Session ถูกสร้างใน check_login.php แล้ว แต่ถ้าต้องการอัปเดตเพิ่มเติมสามารถเรียกใช้ได้
    fetch('function/create_session.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userData.employee_code || userData.user_id || userData.id, // ID ผู้ใช้
            username: userData.username || userData.employee_code, // ชื่อผู้ใช้
            role: userRole, // สิทธิ์ที่แปลงแล้ว
            user_data: userData // ข้อมูลผู้ใช้ทั้งหมด
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // กรณีสร้าง session สำเร็จ
            console.log('PHP Session created successfully');
            console.log('User role:', data.user_role);
            console.log('Original role:', data.original_role);
        } else {
            // กรณีสร้าง session ไม่สำเร็จ
            console.error('Failed to create PHP Session:', data.error);
        }
    })
    .catch(error => {
        // กรณีเกิดข้อผิดพลาดในการเชื่อมต่อ
        console.error('Error creating PHP Session:', error);
    });
}   