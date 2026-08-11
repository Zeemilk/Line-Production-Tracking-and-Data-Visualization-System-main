// Data Notification System for Dashboard
// แจ้งเตือนเมื่อดึงข้อมูลเสร็จ

// ฟังก์ชันสำหรับแสดง notification
function showDataNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.id = 'data-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    const icon = type === 'success' ? '✅' : '📊';
    notification.innerHTML = `
        <span style="font-size: 16px;">${icon}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // แสดง notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // ซ่อน notification หลังจาก 3 วินาที
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ฟังก์ชันสำหรับแสดง notification แบบ SweetAlert2
function showDataAlert(title, message, type = 'success') {
    Swal.fire({
        title: title,
        text: message,
        icon: type,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
}

// ฟังก์ชันสำหรับแสดง notification แบบ toast
function showDataToast(message, type = 'success') {
    // นับจำนวน toast ที่มีอยู่
    const existingToasts = document.querySelectorAll('.data-toast');
    const totalNotifications = existingToasts.length;
    
    // จำกัดจำนวน notification สูงสุด 5 อัน
    if (totalNotifications >= 5) {
        // ลบ notification เก่าที่สุด
        removeOldestNotification();
        // คำนวณตำแหน่งใหม่หลังจากลบ
        const newTotalNotifications = existingToasts.length;
        totalNotifications = newTotalNotifications;
    }
    
    const toast = document.createElement('div');
    toast.className = 'data-toast';
    toast.style.cssText = `
        position: fixed;
        top: ${20 + (totalNotifications * 100)}px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: ${10000 - totalNotifications};
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 350px;
        word-wrap: break-word;
        display: flex;
        align-items: center;
        gap: 12px;
        border-left: 4px solid ${type === 'success' ? '#2e7d32' : '#1976d2'};
    `;
    
    const icon = type === 'success' ? '🎯' : '📈';
    const time = new Date().toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">${icon}</span>
            <div>
                <div style="font-weight: bold; margin-bottom: 2px;">${message}</div>
                <div style="font-size: 11px; opacity: 0.8;">${time}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // แสดง toast
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // ซ่อน toast หลังจาก 4 วินาที
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
                // ปรับตำแหน่งของ notification ที่เหลือ
                adjustAllNotificationPositions();
            }
        }, 400);
    }, 4000);
}

// ฟังก์ชันสำหรับแสดง notification แบบ counter
let notificationCounter = 0;
function showDataCounter(message, type = 'success') {
    notificationCounter++;
    const counter = document.createElement('div');
    counter.id = `data-counter-${notificationCounter}`;
    counter.style.cssText = `
        position: fixed;
        top: ${20 + (notificationCounter - 1) * 80}px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: ${10000 - notificationCounter};
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    const icon = type === 'success' ? '✅' : '📊';
    counter.innerHTML = `
        <span style="font-size: 16px;">${icon}</span>
        <span>${message}</span>
        <span style="font-size: 12px; opacity: 0.8; margin-left: auto;">#${notificationCounter}</span>
    `;
    
    document.body.appendChild(counter);
    
    // แสดง counter
    setTimeout(() => {
        counter.style.opacity = '1';
        counter.style.transform = 'translateX(0)';
    }, 100);
    
    // ซ่อน counter หลังจาก 3 วินาที
    setTimeout(() => {
        counter.style.opacity = '0';
        counter.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (counter.parentNode) {
                counter.parentNode.removeChild(counter);
            }
        }, 300);
    }, 3000);
}

// ฟังก์ชันสำหรับแสดง notification แบบ status bar
function showDataStatus(message, type = 'success') {
    const statusBar = document.createElement('div');
    statusBar.id = 'data-status-bar';
    statusBar.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateY(100%);
        transition: all 0.3s ease;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    `;
    
    const icon = type === 'success' ? '✅' : '📊';
    statusBar.innerHTML = `
        <span style="font-size: 16px;">${icon}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(statusBar);
    
    // แสดง status bar
    setTimeout(() => {
        statusBar.style.opacity = '1';
        statusBar.style.transform = 'translateY(0)';
    }, 100);
    
    // ซ่อน status bar หลังจาก 3 วินาที
    setTimeout(() => {
        statusBar.style.opacity = '0';
        statusBar.style.transform = 'translateY(100%)';
        setTimeout(() => {
            if (statusBar.parentNode) {
                statusBar.parentNode.removeChild(statusBar);
            }
        }, 300);
    }, 3000);
}

// ฟังก์ชันสำหรับปรับตำแหน่งของ toast ที่เหลือ
function adjustToastPositions() {
    const existingToasts = document.querySelectorAll('.data-toast');
    existingToasts.forEach((toast, index) => {
        toast.style.top = `${20 + (index * 80)}px`;
        toast.style.zIndex = `${10000 - index}`;
    });
}

// ฟังก์ชันสำหรับปรับตำแหน่งของ notification ทั้งหมด
function adjustAllNotificationPositions() {
    const existingToasts = document.querySelectorAll('.data-toast');
    
    // ปรับตำแหน่ง toast
    existingToasts.forEach((toast, index) => {
        toast.style.top = `${20 + (index * 100)}px`;
        toast.style.zIndex = `${10000 - index}`;
    });
}

// ฟังก์ชันสำหรับลบ notification เก่าที่สุด
function removeOldestNotification() {
    const existingToasts = document.querySelectorAll('.data-toast');
    
    // ลบ toast เก่าที่สุด
    if (existingToasts.length > 0) {
        existingToasts[0].remove();
    }
}

// Export functions สำหรับใช้ในไฟล์อื่น
window.showDataNotification = showDataNotification;
window.showDataAlert = showDataAlert;
window.showDataToast = showDataToast;
window.showDataCounter = showDataCounter;
window.showDataStatus = showDataStatus;