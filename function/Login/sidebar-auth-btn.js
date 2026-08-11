document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('sidebarAuthBtn');
    if (!btn) return;
    const token = localStorage.getItem('jwttoken');
    if (token) {
        btn.textContent = 'Logout';
        btn.classList.add('logout-btn');
        btn.classList.remove('login-btn');
        btn.onclick = function() {
            localStorage.removeItem('jwttoken');
            localStorage.removeItem('username');
            localStorage.removeItem('userData');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('userRole');
            document.dispatchEvent(new Event('user-auth-changed'));
            window.location.href = "login.php";
        };
    } else {
        btn.textContent = 'Login';
        btn.classList.remove('logout-btn');
        btn.classList.add('login-btn');
        btn.onclick = function() {
            window.location.href = "login.php";
        };
    }
});

function updateSidebarAuthBtn() {
    const btn = document.getElementById('sidebarAuthBtn');
    if (!btn) return;

    const token = localStorage.getItem('jwttoken');

    if (token) {
        // LOGIN อยู่
        btn.textContent = 'Logout';
        btn.classList.add('logout-btn');
        btn.classList.remove('login-btn');

        btn.onclick = () => {
            localStorage.clear();
            document.dispatchEvent(new Event('user-auth-changed'));
            window.location.href = 'login.php';
        };
    } else {
        // ยังไม่ LOGIN
        btn.textContent = 'Login';
        btn.classList.add('login-btn');
        btn.classList.remove('logout-btn');

        btn.onclick = () => {
            window.location.href = 'login.php';
        };
    }
}

document.addEventListener('DOMContentLoaded', updateSidebarAuthBtn);
document.addEventListener('user-auth-changed', updateSidebarAuthBtn);


function updateSidebarMenuByLogin() {
    const token = localStorage.getItem('jwttoken');
    const loginTime = localStorage.getItem('loginTime');
    
    // ตรวจสอบความถูกต้องของ Token (1 ชั่วโมง)
    const isValidToken = token && loginTime && (Date.now() - parseInt(loginTime) < 3600000);
    
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (!sidebarMenu) return;
    const menuItems = sidebarMenu.querySelectorAll('li');
    
    if (isValidToken) {
        // กรณี Token ปกติ: แสดงเมนู
        if (menuItems.length >= 3) {
            menuItems[1].style.display = '';
            menuItems[2].style.display = '';
        }
    } else {
        // กรณี Token หมดอายุ หรือไม่มี Token
        if (menuItems.length >= 3) {
            menuItems[1].style.display = 'none';
            menuItems[2].style.display = 'none';
        }

        // ตรวจสอบหน้าที่ "ยกเว้น" ไม่ให้ Redirect
        const currentPath = window.location.pathname.toLowerCase();
        const isExcludedPage = currentPath.includes('dashboard.php') || 
                               currentPath.includes('monitor.php') || 
                               currentPath.includes('login.php');

        // ถ้าไม่ใช่หน้ายกเว้น ให้เตะไปหน้า Login
        if (!isExcludedPage) {
            localStorage.clear(); // ล้างข้อมูลทั้งหมดเพื่อความปลอดภัย
            window.location.href = "login.php";
        }
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("Sidebar");
    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-250px";
        sidebar.classList.remove("active"); 
    } else {
        sidebar.style.left = "0px";
        sidebar.classList.add("active");
    }
}

// เรียกตอนโหลดหน้า และเมื่อมี event เปลี่ยนแปลง auth
document.addEventListener('DOMContentLoaded', updateSidebarAuthBtn);
document.addEventListener('user-auth-changed', updateSidebarAuthBtn);
document.addEventListener('DOMContentLoaded', updateSidebarMenuByLogin);
document.addEventListener('user-auth-changed', updateSidebarMenuByLogin);