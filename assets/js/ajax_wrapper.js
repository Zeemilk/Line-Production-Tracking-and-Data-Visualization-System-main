// ajax_wrapper.js - Wrapper สำหรับ AJAX calls ที่มี session check

// ฟังก์ชันเริ่มต้นระบบเมื่อ jQuery พร้อม
function initializeAjaxWrapper() {
    if (typeof $ === 'undefined') {
        console.warn('jQuery not loaded yet, retrying in 100ms...');
        setTimeout(initializeAjaxWrapper, 100);
        return;
    }
    
    console.log('Ajax Wrapper initialized successfully');
    
    // กำหนดฟังก์ชัน secureAjax เมื่อ jQuery พร้อม
    window.secureAjax = function(options) {
        const defaultOptions = {
            dataType: 'json',
            error: function(xhr, status, error) {
                console.error('AJAX Error:', error);
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        // เพิ่ม JWT token และ userData เข้าไปในข้อมูลอัตโนมัติ
        const jwttoken = localStorage.getItem('jwttoken');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (finalOptions.data) {
            if (typeof finalOptions.data === 'object') {
                finalOptions.data.jwttoken = jwttoken;
                finalOptions.data.userData = userData;
            } else if (typeof finalOptions.data === 'string') {
                try {
                    const dataObj = JSON.parse(finalOptions.data);
                    dataObj.jwttoken = jwttoken;
                    dataObj.userData = userData;
                    finalOptions.data = JSON.stringify(dataObj);
                } catch (e) {
                    // ถ้าแปลงไม่ได้ ให้เพิ่มเป็น query parameter
                    finalOptions.url += (finalOptions.url.includes('?') ? '&' : '?') + 
                        'jwttoken=' + encodeURIComponent(jwttoken) + 
                        '&userData=' + encodeURIComponent(JSON.stringify(userData));
                }
            }
        } else {
            // ถ้าไม่มี data ให้เพิ่มเป็น query parameter
            finalOptions.url += (finalOptions.url.includes('?') ? '&' : '?') + 
                'jwttoken=' + encodeURIComponent(jwttoken) + 
                '&userData=' + encodeURIComponent(JSON.stringify(userData));
        }

        // เพิ่ม Authorization header
        if (jwttoken) {
            finalOptions.headers = finalOptions.headers || {};
            finalOptions.headers['Authorization'] = 'Bearer ' + jwttoken;
        }

        // เพิ่ม success wrapper
        const originalSuccess = finalOptions.success;
        finalOptions.success = function(response) {
            if (typeof handleSessionError === 'function' && handleSessionError(response)) return;
            if (originalSuccess) originalSuccess(response);
        };

        return $.ajax(finalOptions);
    };
}

// เริ่มต้นระบบเมื่อไฟล์โหลดเสร็จ
if (document.readyState === 'loading') {
    // ไฟล์ยังโหลดไม่เสร็จ รอ DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeAjaxWrapper);
} else {
    // ไฟล์โหลดเสร็จแล้ว เริ่มต้นทันที
    initializeAjaxWrapper();
}

// ใช้แทน $.ajax
// ตัวอย่าง: secureAjax({ url: 'function/[Plan]loadDataPlan.php', ... })
