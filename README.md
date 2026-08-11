# ระบบติดตามและจัดการผลการผลิต (Production Tracking and Management System)

## � สถานะปัจจุบัน
- ระบบนี้ถูกตั้งค่าเป็น **Demo Mode** โดยปริยาย
- ใช้ **Mock Data** โดยไม่ต้องติดตั้ง Oracle Database
- รองรับการ deploy แบบทันทีบน **Replit** ด้วยไฟล์ `.replit` และ `replit.nix`
- มีเอกสารสนับสนุนทั้ง `README_DEMO.md`, `REPLIT_DEPLOYMENT.md`, `SETUP_GUIDE.md`, `QUICKSTART.md`

## 🚀 Demo & Deployment

### 🔥 แนะนำที่สุด: Replit
1. ไปที่ https://replit.com/github/import
2. วาง GitHub URL ของโปรเจค
3. Click "Import" → "Run"
4. เปิดเว็บจาก URL ที่ได้
5. Login ด้วย `demo/demo`

### 💻 Local Run
```bash
git clone https://github.com/YOUR_USERNAME/Prod_OP_Monitor-Mgmt.git
cd Prod_OP_Monitor-Mgmt
php -S localhost:8000
```
จากนั้นเปิด:
```
http://localhost:8000/login.php
```

### Demo Credentials
- `demo` / `demo`
- `admin` / `admin`

## 📌 ฟีเจอร์หลัก
- ระบบ **Dashboard** แสดงผลการผลิตแบบ Real-time
- ระบบ **Login / Session** ด้วย Demo users
- ระบบ **Plan Management** (เพิ่ม / แก้ไข / ลบ / กรอง)
- ระบบ **WIP Management** (เพิ่ม / แก้ไข / ลบ / ดูสถานะ)
- หน้าจอ **Monitor** แบบ Single และ Multiple
- ใช้งานได้โดยไม่พึ่ง Oracle ในโหมด Demo

## 🧩 สถาปัตยกรรมปัจจุบัน

### โฟลเดอร์สำคัญ
- `function/assets/demo_config.php` - ตั้งค่า `DEMO_MODE = true`
- `function/assets/mock_store.php` - MockStore สำหรับข้อมูล demo
- `function/assets/demo_data/user_store.json` - เก็บข้อมูลที่แก้ไขได้
- `.replit`, `replit.nix` - คอนฟิก Replit

### เอกสารสำคัญ
- `README_DEMO.md` - คู่มือ Demo Mode
- `REPLIT_DEPLOYMENT.md` - คู่มือ deploy Replit
- `SETUP_GUIDE.md` - คู่มือติดตั้งและใช้งาน
- `QUICKSTART.md` - คำสั่งเร็วสำหรับใช้งาน
- `GITHUB_DEPLOYMENT.md` - คำแนะนำการอัปโหลด GitHub
- `IMPLEMENTATION_SUMMARY.md` - สรุปการแก้ไขทั้งหมด

## 🛠️ เทคโนโลยีที่ใช้
- PHP
- JavaScript
- HTML / CSS
- Bootstrap
- jQuery
- Chart.js
- DataTables
- SweetAlert2
- Mock Data (JSON)

## 📁 โครงสร้างไฟล์หลัก

```
Prod_OP_Monitor&Mgmt/
├── .replit
├── replit.nix
├── README.md
├── README_DEMO.md
├── REPLIT_DEPLOYMENT.md
├── REPLIT_READY.md
├── SETUP_GUIDE.md
├── QUICKSTART.md
├── GITHUB_DEPLOYMENT.md
├── IMPLEMENTATION_SUMMARY.md
├── .env.example
├── assets/
│   ├── css/
│   ├── js/
│   ├── Sidebar/
│   └── etc/
├── function/
│   ├── assets/
│   │   ├── demo_config.php
│   │   ├── mock_store.php
│   │   └── demo_data/
│   ├── Dashboard/
│   ├── Plan/
│   ├── WIP/
│   └── Login/
├── dashboard.php
├── login.php
├── Import.php
├── Monitor.php
├── Monitors.php
└── wiplastmonth.php
```

## 🚀 วิธีเริ่มต้นใช้งานอย่างรวดเร็ว

1. `php -S localhost:8000`
2. เปิด `http://localhost:8000/login.php`
3. Login ด้วย `demo/demo`
4. ทดลองหน้า Dashboard, Import, WIP, Monitor

## 📌 หมายเหตุ
- ข้อมูล demo จะถูกสร้างจาก `MockStore`
- ข้อมูลผู้ใช้ demo เก็บใน `function/assets/demo_data/user_store.json`
- หากต้องการใช้ Oracle จริง: เปลี่ยน `DEMO_MODE` เป็น `false` ใน `function/assets/demo_config.php`

## 🎯 ปัจจุบัน
- โปรเจคนี้เปิดใช้งานได้ทันทีด้วย demo mode
- รองรับ deployment บน Replit
- ไม่ต้องพึ่ง Oracle ในการสาธิต
- เอกสารครบสำหรับการใช้งานและการ deploy


#### 🎯 **ประเภทการแจ้งเตือน**

1. **showDataNotification** - แจ้งเตือนแบบพื้นฐาน
   ```javascript
   showDataNotification('Data loaded successfully!', 'success');
   ```

2. **showDataAlert** - แจ้งเตือนแบบ SweetAlert2
   ```javascript
   showDataAlert('Success', 'Data loaded successfully!', 'success');
   ```

3. **showDataToast** - แจ้งเตือนแบบ toast (แนะนำ)
   ```javascript
   showDataToast('Data loaded successfully!', 'success');
   ```

4. **showDataCounter** - แจ้งเตือนแบบ counter
   ```javascript
   showDataCounter('Data loaded successfully!', 'success');
   ```

5. **showDataStatus** - แจ้งเตือนแบบ status bar
   ```javascript
   showDataStatus('Data loaded successfully!', 'success');
   ```

#### 📊 **การใช้งานใน Dashboard**

##### 1. Monitor Data
```javascript
// เมื่อโหลดเสร็จ
showDataToast(`OG Successfully! (${data.OGData?.length || 0} records)`, 'success');
```

##### 2. WIP Data
```javascript
// เมื่อโหลดเสร็จ
showDataToast(`SubWIP Successfully! (${data.SubWIP?.length || 0} records)`, 'success');
```

##### 3. Status Data
```javascript
// เมื่อโหลดเสร็จ
showDataToast(`Machine Status Successfully! (${data.statusData?.length || 0} records)`, 'success');
```

##### 4. MC Record Data
```javascript
// เมื่อโหลดเสร็จ
showDataToast(`MC Record Successfully! (${data.mcRecordData?.length || 0} records)`, 'success');
```

### การแสดงผล

#### 🎨 **รูปแบบการแสดงผล**

1. **Toast Notification** (แนะนำ)
   - แสดงที่มุมขวาบน
   - มีไอคอนและเวลา
   - หมดอายุอัตโนมัติ 4 วินาที
   - มี animation สวยงาม
   - **แสดงต่อกันลงล่าง** ไม่ทับกัน
   - **เว้นระยะห่าง 100px** ระหว่างแต่ละ notification

2. **Counter Notification**
   - แสดงหลายอันพร้อมกัน
   - มีหมายเลขลำดับ
   - หมดอายุ 3 วินาที

#### 🔄 **การจัดการหลาย Notification**

- **แสดงต่อกันลงล่าง**: Notification จะแสดงต่อกันลงล่างแทนที่จะทับกัน
- **เว้นระยะห่าง 100px**: ระยะห่างที่เหมาะสมสำหรับ notification เมื่อโหลดเสร็จ
- **จำกัดจำนวนสูงสุด**: จำกัดไว้ที่ 5 notification พร้อมกัน
- **ลบอัตโนมัติ**: เมื่อเกิน 5 อัน จะลบ notification เก่าที่สุด
- **ปรับตำแหน่งอัตโนมัติ**: เมื่อ notification หายไป จะปรับตำแหน่งของที่เหลือ

#### 🎯 **สีและไอคอน**

- **Success**: สีเขียว (#4caf50) + ไอคอน ✅
- **Info**: สีน้ำเงิน (#2196f3) + ไอคอน 📊

### การติดตั้ง

#### 1. เพิ่มไฟล์ใน dashboard.php
```html
<script src="./assets/js/data_notification.js"></script>
```

#### 2. เรียกใช้ฟังก์ชัน
```javascript
// แจ้งเตือนเมื่อโหลดเสร็จ
showDataToast('Data loaded successfully!', 'success');
```

### ประโยชน์

#### 🚀 **ประสบการณ์ผู้ใช้**
- ทราบสถานะการโหลดข้อมูล
- แจ้งเตือนเมื่อโหลดเสร็จ
- แสดงจำนวนข้อมูลที่โหลดได้
- ไม่ต้องรอโดยไม่รู้สถานะ

#### 📈 **การติดตาม**
- ทราบว่าโหลดข้อมูลอะไรเสร็จแล้ว
- แสดงจำนวนข้อมูลที่ได้
- ทราบเวลาที่โหลดเสร็จ

#### 🎯 **ความเรียบง่าย**
- ไม่ต้องใช้ระบบ cache ที่ซับซ้อน
- ทำงานได้ทันที
- ไม่มีปัญหาเรื่องสิทธิ์ไฟล์

### การปรับแต่ง

#### 1. เปลี่ยนเวลาการแสดงผล
```javascript
// ใน data_notification.js
setTimeout(() => {
    // ซ่อน notification
}, 4000); // เปลี่ยนจาก 4000 เป็นเวลาที่ต้องการ
```

#### 2. เปลี่ยนสี
```javascript
background: ${type === 'success' ? '#4caf50' : '#2196f3'};
// เปลี่ยนสีตามต้องการ
```

#### 3. เปลี่ยนตำแหน่ง
```javascript
position: fixed;
top: 20px;
right: 20px;
// เปลี่ยนตำแหน่งตามต้องการ
```

### การทดสอบ

#### 1. ทดสอบการแสดงผล
- เปิด dashboard
- เลือก product type
- ดูการแสดง notification

#### 2. ทดสอบการทำงาน
- เปลี่ยน filter ต่างๆ
- ดูการแสดง notification ที่แตกต่างกัน

#### 3. ทดสอบการแสดงจำนวนข้อมูล
- ตรวจสอบว่าจำนวนข้อมูลถูกต้อง
- ดูการแสดงผลใน notification

### หมายเหตุ

- ระบบนี้ไม่ใช้ cache แต่แจ้งเตือนเมื่อดึงข้อมูลเสร็จ
- การแสดงผลจะขึ้นอยู่กับความเร็วของเครือข่าย
- สามารถปรับแต่งการแสดงผลได้ตามต้องการ
- ไม่มีผลกระทบต่อการทำงานของ dashboard

## 🔧 Session Management

### ภาพรวม
ระบบจัดการ Session สำหรับการ Authentication และการควบคุมการเข้าถึง

### ไฟล์หลัก
- **session_manager.js** - จัดการ Session บน Client-side
- **session_check.php** - ตรวจสอบสถานะ Session
- **create_session.php** - สร้าง Session
- **test_auth.php** - ทดสอบ Authentication

### การใช้งาน
```javascript
// ตรวจสอบสถานะ Session
checkSession();

// ออกจากระบบ
logout();

// อัปเดตปุ่ม Authentication
updateSidebarAuthBtn();
```

## 🔄 AJAX Helper Functions

### ภาพรวม
ระบบจัดการ AJAX Request แบบรวมศูนย์

### ไฟล์หลัก
- **ajax_wrapper.js** - ฟังก์ชัน AJAX Helper

### คุณสมบัติ
- **Automatic Session Check** - ตรวจสอบ Session อัตโนมัติ
- **Error Handling** - จัดการ Error แบบอัตโนมัติ
- **Loading Indicators** - แสดงสถานะ Loading
- **Session Timeout** - ตรวจจับเมื่อ Session หมดอายุ

## 📐 Sidebar Management

### ภาพรวม
ระบบจัดการ Sidebar แบบ Dynamic

### ไฟล์ Sidebar
- **sidebar-login.php** - Sidebar สำหรับหน้า Login
- **sidebar-main.php** - Sidebar สำหรับหน้าหลัก (Dashboard, Import, WIP)
- **sidebar-monitor.php** - Sidebar สำหรับหน้า Monitor

### คุณสมบัติ
- **Dynamic Loading** - โหลด Sidebar แบบ Dynamic
- **Active Menu** - แสดงเมนูที่ Active ตามหน้าปัจจุบัน
- **Authentication Status** - แสดงสถานะ Authentication
- **Responsive Design** - รองรับทุกขนาดหน้าจอ

## 📊 การจัดการข้อมูล

### รูปแบบไฟล์ที่รองรับ
- **CSV** - Comma Separated Values
- **Excel** - .xlsx และ .xls
- **PDF** - สำหรับรายงาน

### การนำเข้าข้อมูล
1. **เลือกไฟล์** ที่ต้องการนำเข้า
2. **ตรวจสอบข้อมูล** ก่อนบันทึก
3. **บันทึกข้อมูล** ลงฐานข้อมูล
4. **ยืนยันการบันทึก** ด้วยข้อความแจ้งเตือน

## 🚨 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Session หมดอายุ
```javascript
// ตรวจสอบสถานะ Session
checkSession();
// ถ้า Session หมดอายุจะ redirect ไปหน้า Login อัตโนมัติ
```

#### 2. ข้อมูลไม่แสดงผล
- ตรวจสอบการเชื่อมต่อฐานข้อมูล
- ตรวจสอบ Console ใน Browser สำหรับ Error
- ตรวจสอบ Network Tab ใน Developer Tools

#### 3. การ Import ข้อมูลไม่สำเร็จ
- ตรวจสอบรูปแบบไฟล์ที่ถูกต้อง (CSV/Excel)
- ตรวจสอบ encoding ของไฟล์ (ควรเป็น UTF-8)
- ตรวจสอบว่าไฟล์มี header ที่ถูกต้อง

#### 4. Monitor ไม่แสดงผล
- ตรวจสอบว่ามีข้อมูลในฐานข้อมูล
- ตรวจสอบการเชื่อมต่อ WebSocket (ถ้ามี)
- ลอง Refresh หน้าเว็บ

## 📝 หมายเหตุสำคัญ

### ระบบ Authentication
- ระบบใช้ Session-based Authentication
- Session จะหมดอายุอัตโนมัติหลังจาก timeout
- ควรมีการ Logout เมื่อเสร็จสิ้นการใช้งาน

### การเก็บข้อมูล
- **Database**: Oracle Database หรือ MySQL
- **Session Storage**: PHP Session
- **Client Storage**: Browser LocalStorage

### Security
- ไม่ควรเก็บ Password แบบ Plain Text
- ควรใช้ HTTPS สำหรับ Production
- ควรมีการ Backup ข้อมูลเป็นประจำ
- ควรมีการตรวจสอบ Log เป็นระยะ

### Performance
- ระบบ Dashboard ใช้ Polling เพื่ออัปเดตข้อมูล
- ควรตั้งค่า Interval ที่เหมาะสมเพื่อไม่ให้ Server ทำงานหนักเกินไป
- ใช้ Chart.js และ DataTables เพื่อประสิทธิภาพที่ดี

### การใช้งาน
- **สำรองข้อมูลเป็นประจำ** - สำรองข้อมูลทุกวันเพื่อป้องกันการสูญหายข้อมูล
- **อัปเดตระบบ** - ควรอัปเดตระบบเป็นระยะเพื่อความปลอดภัย
- **ฝึกอบรมผู้ใช้งาน** - ควรมีการฝึกอบรมผู้ใช้งานก่อนใช้งานจริง
- **เอกสารการใช้งาน** - มีคู่มือการใช้งานใน assets/etc/

## 📞 การติดต่อ

สำหรับปัญหาหรือคำถามเกี่ยวกับระบบ กรุณาติดต่อทีมพัฒนาเป็ดอาบน้ำในคลอง

## 📄 ลิขสิทธิ์
ระบบนี้พัฒนาสำหรับใช้งานภายในองค์กร กรุณาอย่านำไปใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาต

---

**เวอร์ชัน:** 1.0  
**วันที่อัปเดตล่าสุด:** 2025
**ผู้พัฒนา:** ทีมพัฒนาเป็ดอาบน้ำในคลอง
