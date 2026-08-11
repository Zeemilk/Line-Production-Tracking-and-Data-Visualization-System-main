// ฟังก์ชันสำหรับตั้งค่า logout button
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.dataset.listenerAdded) {
        logoutBtn.dataset.listenerAdded = 'true';
        logoutBtn.addEventListener('click', function() {
            // ลบข้อมูลทั้งหมดจาก localStorage
            localStorage.removeItem('jwttoken');
            localStorage.removeItem('username');
            localStorage.removeItem('userData');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('userRole');
            
            // ส่ง event เพื่ออัปเดต sidebar
            document.dispatchEvent(new Event('user-auth-changed'));
            
            // Redirect ไปหน้า login
            window.location.href = "login.php";
        });
    }
}

// ตั้งค่าเมื่อ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', setupLogoutButton);

// ตั้งค่าเมื่อ sidebar ถูกโหลดแบบ dynamic (ใช้ MutationObserver)
const observer = new MutationObserver(function(mutations) {
    setupLogoutButton();
});

// เริ่มสังเกตการณ์การเปลี่ยนแปลงใน DOM
if (document.body) {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}