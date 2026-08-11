<?php
    $Columns = ['datetime', 'type', 'qty', 'line_name', 'product_type','empno'];
    $ColumnPut = ['datetime', 'type', 'qty', 'line_name', 'product_type','empno'];
    $options = include './function/planlineoption.php';
    $lineOptions = $options['lineOptions'];
    $producttypeOptions = $options['producttypeOptions'];
    $lineProductMapping = $options['lineProductMapping'];
    $currentPage = basename($_SERVER['PHP_SELF']);
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
    <link href="./assets/css/import.css" rel="stylesheet">
    <script src="./assets/js/session_manager.js"></script>
    <script src="./assets/js/ajax_wrapper.js"></script>
    <title>Plan Maintenance</title>
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
        <div class="left-section-wrapper"> <div id="filterSection">
                <label for="modeSwitch" class="switch" aria-label="Toggle Filter" title="สลับระหว่างโหมดเพิ่มข้อมูลและแก้ไขข้อมูล">
                    <input type="checkbox" id="modeSwitch"/>
                    <span>เพิ่มข้อมูล</span>
                    <span>แก้ไขข้อมูล</span>
                </label>
        </div>

            <div class="controls-container">
                <div id="updateControls" class="controls-row row g-3 align-items-end mt-1" style="display: none;">
                    <div class="form-group col-auto" title="เลือกเดือนที่ต้องการค้นหา">
                        <label for="monthFilter">*เดือน:</label>
                        <select class="form-control" id="monthFilter">
                            <option value="" disabled selected>เลือก</option>
                            <?php for ($m = 1; $m <= 12; $m++) { $month_val = str_pad($m, 2, '0', STR_PAD_LEFT); echo '<option value="' . $month_val . '">' . $month_val . '</option>';} ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือกปีที่ต้องการค้นหา">
                        <label for="yearFilter">*ปี:</label>
                        <select class="form-control" id="yearFilter">
                            <option value="" disabled selected>เลือก</option>
                            <?php $currentYear = (int)date('Y'); for ($y = -1; $y < 6; $y++) { $year_val = (string)($currentYear - $y); echo '<option value="' . $year_val . '">' . $year_val . '</option>';} ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือก Product Type ที่ต้องการค้นหา">
                        <label for="productTypeFilter">*Product Type:</label>
                        <select class="form-control" id="productTypeFilter">
                            <option value="" disabled selected>เลือก</option>
                            <?php echo $producttypeOptions; ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือก Line ที่ต้องการค้นหา">
                        <label for="lineFilter">Line:</label>
                        <select class="form-control" id="lineFilter">
                            <option value="">ทั้งหมด</option>
                            <?php echo $lineOptions; ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือก Create Type ที่ต้องการค้นหา">
                        <label for="createTypeFilter">*Create Type:</label>
                        <select class="form-control" id="createTypeFilter">
                            <option value="" disabled selected>เลือก</option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                        </select>
                    </div>
                </div>

                <div id="insertControls" class="controls-row show mt-4">
                    <div title="เลือกไฟล์ที่ต้องการนำเข้า">
                        <input type="file" id="csvFileInput" accept=".csv, .xlsx" style="display: none;">
                        <button class="btn btn-info noselect" onclick="document.getElementById('csvFileInput').click();">
                            <span class="text">เลือกไฟล์</span>
                            <span class="icon"><img src="./assets/images/search.png" alt="browse" style="width:18px;height:18px;vertical-align:middle;"></span>
                        </button>
                    </div>
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

                <div id="updateButtons" class="controls-row hide mt-4" style="display: none;">
                    <div title="โหลดข้อมูลจากฐานข้อมูล">
                        <button class="btn btn-info noselect" onclick="loadData()">
                            <span class="text">โหลดข้อมูล</span>
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
                <p>4. ใช้ปุ่มสีเขียวหรือเหลืองเพื่อบันทึกข้อมูล</p>
                <p>
                    <a href="./assets/etc/Plan maintenance user manual1.pdf" target="_blank" class="btn btn-primary btn-sm" title="เปิดคู่มือการใช้งาน">
                        คู่มือการใช้งาน
                    </a>
                    <a href="./assets/etc/TemplatePlan.xlsx" download="Template.xlsx" class="btn btn-success btn-sm" title="ดาวน์โหลด Template">
                        Template(XLSX)
                    </a>
                </p>
            </div>
        </div>
    </div>

    <div id="mainContent2" class="mt-4">
        <div class="CreateType" title="สลับระหว่าง CreateType 0 และ 1">
            <h3>CreateType<br>
            0
            <div class="CreateTypecheck">
                <input id="check" type="checkbox">
                <label for="check"></label>
            </div>
            1
            </h3>
        </div>
        <div id="displaySection" title="แสดงสรุปข้อมูล">  
            <div style="display: flex; gap: 24px;">
                <div style="flex: 1">
                    <div id="displayAll"></div>
                </div>
            </div>
        </div>

        <button class="btn btn-primary mb-2" id="toggleEditButton" onclick="edit()"><img src="./assets/images/edit.png" style="width:18px;height:18px;"> Edit</button>
        <div id="editSection" title="ตารางแสดงข้อมูลทั้งหมด">
            <table id="edit" class="table table-bordered table-hover ">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>DD/MM/YYYY</th>
                        <th>Type</th>
                        <th>QTY</th>
                        <th>Line</th>
                        <th>Product</th>
                        <th>Empcode</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <button class="btn btn-success btn-add-row" id="addRowBtn" onclick="addRow()"><img src="./assets/images/plus.png" style="width:18px;height:18px;"></button>
        </div>
    </div>
    <script>
        // สร้าง columns array ที่รองรับการแยก empno เป็น 2 คอลัมน์
        window.globalColumns = <?php echo json_encode(array_values($Columns)); ?>;
        // สร้าง display columns สำหรับตาราง (8 คอลัมน์)
        window.displayColumns = ['datetime', 'type', 'qty', 'line_name', 'product_type', 'empno', 'name_eng'];
        window.validLineNames = <?php echo json_encode(array_values(array_filter(array_map(function($opt){
            return trim(strip_tags($opt));
        }, explode('</option>', $lineOptions)), function($v){ return $v !== ""; }))); ?>;
        window.validProductTypes = <?php echo json_encode(array_values(array_filter(array_map(function($opt){
            return trim(strip_tags($opt));
        }, explode('</option>', $producttypeOptions)), function($v){ return $v !== ""; }))); ?>;
    </script>
    <script src="function\Login\sidebar-auth-btn.js"></script>
    <!-- <script src="./function/[Login]Check_Login.js"></script> -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="./assets/js/bootstrap.min.js"></script>
    <script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script> 
    <script src="./function/js/import.js"></script>
    <script src="./assets/js/sweetalert2.all.min.js"></script>
</body>
</html>
<?php
    $Columns = ['datetime', 'type', 'qty', 'line_name', 'product_type','empno'];
    $ColumnPut = ['datetime', 'type', 'qty', 'line_name', 'product_type','empno'];
    $options = include './function/planlineoption.php';
    $lineOptions = $options['lineOptions'];
    $producttypeOptions = $options['producttypeOptions'];
    $lineProductMapping = $options['lineProductMapping'];
    $currentPage = basename($_SERVER['PHP_SELF']);
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
    <link href="./assets/css/import.css" rel="stylesheet">
    <script src="./assets/js/session_manager.js"></script>
    <script src="./assets/js/ajax_wrapper.js"></script>
    <title>Plan Maintenance</title>
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
        <div class="left-section-wrapper"> <div id="filterSection">
                <label for="modeSwitch" class="switch" aria-label="Toggle Filter" title="สลับระหว่างโหมดเพิ่มข้อมูลและแก้ไขข้อมูล">
                    <input type="checkbox" id="modeSwitch"/>
                    <span>เพิ่มข้อมูล</span>
                    <span>แก้ไขข้อมูล</span>
                </label>
        </div>

            <div class="controls-container">
                <div id="updateControls" class="controls-row row g-3 align-items-end mt-1" style="display: none;">
                    <div class="form-group col-auto" title="เลือกเดือนที่ต้องการค้นหา">
                        <label for="monthFilter">*เดือน:</label>
                        <select class="form-control" id="monthFilter">
                            <option value="" disabled selected>เลือก</option>
                            <?php for ($m = 1; $m <= 12; $m++) { $month_val = str_pad($m, 2, '0', STR_PAD_LEFT); echo '<option value="' . $month_val . '">' . $month_val . '</option>';} ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือกปีที่ต้องการค้นหา">
                        <label for="yearFilter">*ปี:</label>
                        <select class="form-control" id="yearFilter">
                            <option value="" disabled selected>เลือก</option>
                            <?php $currentYear = (int)date('Y'); for ($y = -1; $y < 6; $y++) { $year_val = (string)($currentYear - $y); echo '<option value="' . $year_val . '">' . $year_val . '</option>';} ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือก Product Type ที่ต้องการค้นหา">
                        <label for="productTypeFilter">*Product Type:</label>
                        <select class="form-control" id="productTypeFilter">
                            <option value="" disabled selected>เลือก</option>
                            <?php echo $producttypeOptions; ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือก Line ที่ต้องการค้นหา">
                        <label for="lineFilter">Line:</label>
                        <select class="form-control" id="lineFilter">
                            <option value="">ทั้งหมด</option>
                            <?php echo $lineOptions; ?>
                        </select>
                    </div>
                    <div class="form-group col-auto" title="เลือก Create Type ที่ต้องการค้นหา">
                        <label for="createTypeFilter">*Create Type:</label>
                        <select class="form-control" id="createTypeFilter">
                            <option value="" disabled selected>เลือก</option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                        </select>
                    </div>
                </div>

                <div id="insertControls" class="controls-row show mt-4">
                    <div title="เลือกไฟล์ที่ต้องการนำเข้า">
                        <input type="file" id="csvFileInput" accept=".csv, .xlsx" style="display: none;">
                        <button class="btn btn-info noselect" onclick="document.getElementById('csvFileInput').click();">
                            <span class="text">เลือกไฟล์</span>
                            <span class="icon"><img src="./assets/images/search.png" alt="browse" style="width:18px;height:18px;vertical-align:middle;"></span>
                        </button>
                    </div>
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

                <div id="updateButtons" class="controls-row hide mt-4" style="display: none;">
                    <div title="โหลดข้อมูลจากฐานข้อมูล">
                        <button class="btn btn-info noselect" onclick="loadData()">
                            <span class="text">โหลดข้อมูล</span>
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
                <p>4. ใช้ปุ่มสีเขียวหรือเหลืองเพื่อบันทึกข้อมูล</p>
                <p>
                    <a href="./assets/etc/Plan maintenance user manual1.pdf" target="_blank" class="btn btn-primary btn-sm" title="เปิดคู่มือการใช้งาน">
                        คู่มือการใช้งาน
                    </a>
                    <a href="./assets/etc/TemplatePlan.xlsx" download="Template.xlsx" class="btn btn-success btn-sm" title="ดาวน์โหลด Template">
                        Template(XLSX)
                    </a>
                </p>
            </div>
        </div>
    </div> 

    <div id="mainContent2" class="mt-4">
        <div class="CreateType" title="สลับระหว่าง CreateType 0 และ 1">
            <h3>CreateType<br>
            0
            <div class="CreateTypecheck">
                <input id="check" type="checkbox">
                <label for="check"></label>
            </div>
            1
            </h3>
        </div>
        <div id="displaySection" title="แสดงสรุปข้อมูล">  
            <div style="display: flex; gap: 24px;">
                <div style="flex: 1">
                    <div id="displayAll"></div>
                </div>
            </div>
        </div>

        <button class="btn btn-primary mb-2" id="toggleEditButton" onclick="edit()"><img src="./assets/images/edit.png" style="width:18px;height:18px;"> Edit</button>
        <div id="editSection" title="ตารางแสดงข้อมูลทั้งหมด">
            <table id="edit" class="table table-bordered table-hover ">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>DD/MM/YYYY</th>
                        <th>Type</th>
                        <th>QTY</th>
                        <th>Line</th>
                        <th>Product</th>
                        <th>Empcode</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <button class="btn btn-success btn-add-row" id="addRowBtn" onclick="addRow()"><img src="./assets/images/plus.png" style="width:18px;height:18px;"></button>
        </div>
    </div>
    <script>
        // สร้าง columns array ที่รองรับการแยก empno เป็น 2 คอลัมน์
        window.globalColumns = <?php echo json_encode(array_values($Columns)); ?>;
        // สร้าง display columns สำหรับตาราง (8 คอลัมน์)
        window.displayColumns = ['datetime', 'type', 'qty', 'line_name', 'product_type', 'empno', 'name_eng'];
        window.validLineNames = <?php echo json_encode(array_values(array_filter(array_map(function($opt){
            return trim(strip_tags($opt));
        }, explode('</option>', $lineOptions)), function($v){ return $v !== ""; }))); ?>;
        window.validProductTypes = <?php echo json_encode(array_values(array_filter(array_map(function($opt){
            return trim(strip_tags($opt));
        }, explode('</option>', $producttypeOptions)), function($v){ return $v !== ""; }))); ?>;
    </script>
    <script src="function\Login\sidebar-auth-btn.js"></script>
    <!-- <script src="./function/[Login]Check_Login.js"></script> -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="./assets/js/bootstrap.min.js"></script>
    <script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script> 
    <script src="./function/js/import.js"></script>
    <script src="./assets/js/sweetalert2.all.min.js"></script>
</body>
</html>