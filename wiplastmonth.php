<?php
$options = include './function/wiplastmonth_options.php';
$producttypeOptions = $options['producttypeOptions'] ?? '';
$currentPage = basename($_SERVER['PHP_SELF']);
// Debug: Remove this line after testing
// echo "<!-- DEBUG: producttypeOptions = " . htmlspecialchars($producttypeOptions) . " -->";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <link rel="icon" type="image/png" href="assets/images/responsive-design.png">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="./assets/css/style.css">
    <link rel="stylesheet" href="./assets/css/sweetalert2.min.css">
    <link href="./assets/css/bootstrap.css" rel="stylesheet">
    <link href="./assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="./assets/css/index.css" rel="stylesheet">
    <script src="./assets/js/session_manager.js"></script>
    <script src="./assets/js/ajax_wrapper.js"></script>
    <title>WIP last month Maintenance</title>
</head>
<body>
    
    <div id="SidebarContainer"></div>

    <script>
        // ตรวจสอบ token ก่อนโหลด sidebar
        const token = localStorage.getItem('jwttoken');
        const loginTime = localStorage.getItem('loginTime');
        const isValidToken = token && loginTime && (Date.now() - parseInt(loginTime) < 3600000);
        
        if (isValidToken) {
            fetch('./assets/Sidebar/sidebar-main.php?currentPage=' + encodeURIComponent('<?php echo $currentPage; ?>'))
            .then(r => r.text())
            .then(html => {
                document.getElementById('SidebarContainer').innerHTML = html;
                if (typeof updateSidebarAuthBtn === 'function') updateSidebarAuthBtn();
                if (typeof updateSidebarMenuByLogin === 'function') updateSidebarMenuByLogin();
                if (typeof setupLogoutButton === 'function') setupLogoutButton();
            });
        } else {
            // ถ้าไม่มี token หรือหมดอายุ ให้ redirect ไปหน้า login
            localStorage.removeItem('jwttoken');
            localStorage.removeItem('username');
            localStorage.removeItem('userData');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('userRole');
            window.location.href = "login.php";
        }
    </script>

        <div id="mainContent" class="mt-4">
    <div class="top-row-flex">
        <div class="left-section-wrapper"> <div id="filterSection" title="สลับระหว่างโหมดเพิ่มข้อมูลและแก้ไขข้อมูล">
                <label for="modeSwitch" class="switch" aria-label="Toggle Filter">
                    <input type="checkbox" id="modeSwitch"/>
                    <span>เพิ่มข้อมูล</span>
                    <span>แก้ไขข้อมูล</span>
                </label>
        </div>

            <div class="controls-container">
                <div id="updateControls" class="controls-row row g-3 align-items-end mt-1">
                    <div class="form-group col-auto" title="เลือกเดือนที่ต้องการค้นหา">
                        <label for="monthFilter">เดือน:</label>
                        <select class="form-control" id="monthFilter">
                            <option value="">ทั้งหมด</option>
                            <?php for ($m = 1; $m <= 12; $m++) { $month_val = str_pad($m, 2, '0', STR_PAD_LEFT); echo '<option value="' . $month_val . '">' . $month_val . '</option>';} ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือกปีที่ต้องการค้นหา">
                        <label for="yearFilter">ปี:</label>
                        <select class="form-control" id="yearFilter">
                            <option value="">ทั้งหมด</option>
                            <?php $currentYear = (int)date('Y'); for ($y = 0; $y < 6; $y++) { $year_val = (string)($currentYear - $y); echo '<option value="' . $year_val . '">' . $year_val . '</option>';} ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือก Product Type ที่ต้องการค้นหา">
                        <label for="productTypeFilter">Product:</label>
                        <select class="form-control" id="productTypeFilter">
                            <option value="">ทั้งหมด</option>
                            <?php echo $producttypeOptions; ?>
                        </select>
                    </div>
                </div>

                <div id="insertControls" class="controls-row show mt-4">
                    <div title="บันทึกข้อมูลที่ต้องการ">
                        <button class="btn btn-success noselect" onclick="handleInsert()">
                            <span class="text">บันทึกข้อมูล</span>
                            <span class="icon"><img src="./assets/images/save.png" alt="insert" style="width:18px;height:18px;vertical-align:middle;"></span>
                        </button>
                    </div>
                    <div title="เคลียร์ข้อมูลในตาราง">
                        <button class="btn btn-primary noselect" onclick="clearTable()">
                            <span class="text">เคลียร์</span>
                            <span class="icon"><img src="./assets/images/refresh.png" alt="Refresh" style="width:15px;height:15px;vertical-align:middle;"></span>
                        </button>
                    </div>
                </div>

                <div id="updateButtons" class="controls-row hide ">
                    <div title="โหลดข้อมูลจากฐานข้อมูล">
                        <button class="btn btn-info noselect" onclick="loadData()">
                            <span class="text">ค้นหาข้อมูล</span>
                            <span class="icon"><img src="./assets/images/load.png" alt="load" style="width:18px;height:18px;vertical-align:middle;"></span>
                        </button>
                    </div>
                    <div title="บันทึกข้อมูลที่ต้องการ">
                        <button class="btn btn-warning noselect" onclick="updateData()">
                            <span class="text">บันทึกข้อมูล</span>
                            <span class="icon"><img src="./assets/images/save.png" alt="update" style="width:18px;height:18px;vertical-align:middle;"></span>
                        </button>
                    </div>
                    <div title="เคลียร์ข้อมูลในตาราง">
                        <button class="btn btn-primary noselect" onclick="clearTable()">
                            <span class="text">เคลียร์</span>
                            <span class="icon"><img src="./assets/images/refresh.png" alt="Refresh" style="width:18px;height:18px;vertical-align:middle;"></span>
                        </button>
                    </div>
                    <div title="ลบข้อมูลที่ต้องการในฐานข้อมูล">
                        <button class="btn btn-danger noselect" onclick="deleteData()">
                            <span class="text">ลบข้อมูล</span>
                            <span class="icon"><img src="./assets/images/cross.png" alt="Clear" style="width:15px;height:15px;vertical-align:middle;"></span>
                        </button>
                    </div>
                </div>
            </div> </div> <div id="wikihow" class="mt-4">
            <div>
                <h2>วิธีการใช้งาน</h2>
                <p>1. เลือกโหมดการทำงานที่ต้องการ</p>
                <p>2. ใช้ปุ่มสีฟ้าเพื่อนำเข้าข้อมูลที่ต้องการ</p>
                <p>3. ตรวจสอบและแก้ไขข้อมูล</p>
                <p>4. ใช้ปุ่มสีเขียวหรือเหลืองเพื่อนำเข้าข้อมูล</p>
                <p>
                    <a href="./assets/etc/wiplastmonth.pdf" target="_blank" class="btn btn-primary btn-sm" title="เปิดคู่มือการใช้งาน">
                        คู่มือการใช้งาน
                    </a>
                </p>
            </div>
        </div>
    </div> 

    <div id="mainContent2" class="mt-4">
        <div id="editSection" title="ใส่ WIP last month ที่ต้องการ">
            <table id="edit" class="table table-bordered table-hover ">
                <thead>
                    <tr>
                        <th>ลำดับ</th>
                        <th>เดือนปี</th>
                        <th>Product</th>
                        <th>QTY</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
    <script src="function\Login\sidebar-auth-btn.js"></script>
    <!-- <script src="./function/[Login]Check_Login.js"></script> -->
    <script>
        window.validProductTypes = <?php echo json_encode(array_map(function($opt){
            return strip_tags($opt);
        }, explode('</option>', $producttypeOptions))); ?>;
    </script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="./assets/js/bootstrap.min.js"></script>
    <script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script> 
    <script src="./function/js/wiplastmonth.js"></script>
    <script src="./assets/js/sweetalert2.all.min.js"></script>
</body>
</html>