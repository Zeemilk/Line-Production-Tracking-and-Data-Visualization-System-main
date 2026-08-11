// ================================================================
// 1.Setting
// ================================================================
$(document).ready(function () {
    // ========== UI Mode Switch ==========
    function setModeByCheckbox() {
        if ($('#modeSwitch').is(':checked')) {
            // โหมดอัพเดท
            $('#updateControls').removeClass('hide').addClass('show');
            $('#insertControls').removeClass('show').addClass('hide');
            $('#updateButtons').removeClass('hide').addClass('show');
            $('.row-keep').addClass('show-content');
            $('.CreateType').hide();
        } else {
            // โหมดแทรก
            $('#updateControls').removeClass('show').addClass('hide');
            $('#insertControls').removeClass('hide').addClass('show');
            $('#updateButtons').removeClass('show').addClass('hide');
            $('.row-keep').removeClass('show-content');
            $('.CreateType').show();
        }
    }
    $('#modeSwitch').on('change', setModeByCheckbox);
    setModeByCheckbox();
    // ========== Toggle Display Section ==========
    $('#toggleDisplayButton').on('click', function () {
        const $displaySection = $('#displaySection');
        const $displayContent = $('#displayContent');
        const img1 = $('<img>', {
            src: './assets/images/plus.png',
            alt: 'plus',
            style: 'width: 18px; height: 18px; vertical-align: middle;'})  
        const img2 = $('<img>', {
            src: './assets/images/minus.png',
            alt: 'minus',
            style: 'width: 18px; height: 18px; vertical-align: middle;'})  
        if ($displayContent.is(':visible')) {
            $displayContent.hide();
            $displaySection.css({
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                width: 'auto',
                minWidth: '0',
                maxWidth: 'none',
                padding: '0'
            });
            $(this).empty().append(img1);
        } else {
            $displayContent.show();
            $displaySection.css({
                background: '',
                border: '',
                boxShadow: '',
                width: '',
                minWidth: '',
                maxWidth: '',
                padding: ''
            });
            $(this).empty().append(img2);
        }
    });

    // ========== Update Display on Edit ==========
    $('#edit tbody').on('input change', 'input, select', function () {
        updateDisplay();
    });

    // ========== Edit Mode Toggle ==========
    updateSeparators();
    showOrHideEditSection()
    let isEditMode = false;
    $('#toggleEditBtn').on('click', function () {
        isEditMode = !isEditMode;
        $('#edit tbody input, #edit tbody select').prop('disabled', !isEditMode);
        $(this).text(isEditMode ? 'Save' : 'Edit');
        if (!isEditMode) updateDisplay();
    });

    $('#addRowBtn').hide();

    // ========== Toggle Edit Button Show/Hide ==========
    $('#toggleEditButton').on('click', function () {
        if ($(this).attr('onclick') === 'saveEdit()') {
            $('#addRowBtn').show();
        } else {
            $('#addRowBtn').hide();
        }
    });
    window.saveEdit = (function (orig) {
        return function () {
            $('#addRowBtn').hide();
            return orig.apply(this, arguments);
        };
    })(window.saveEdit);

    // ========== Product Type Filter Change ==========
    $('#productTypeFilter').change(function() {
        const selectedProduct = $(this).val();
        $.ajax({
            url: './function/planlineoption.php',
            type: 'GET',
            data: { producttype: selectedProduct },
            success: function(response) {
                const data = response;
                $('#lineFilter').html(data.lineOptions);
            }
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const csvFileInput = document.getElementById("csvFileInput");
    if (csvFileInput) {
        csvFileInput.addEventListener("change", handleFileUpload);
    }
});
// ================================================================
// 1.1.Empcode Cache System
// ================================================================
const empcodeCache = new Map();

// ฟังก์ชันลบ cache ของ empcode เฉพาะ
function removeFromCache(empcode) {
    empcodeCache.delete(empcode);
    console.log(`Removed empcode ${empcode} from cache`);
}

// ฟังก์ชันเพิ่ม cache status ใน console
function logCacheStatus() {
    const status = getCacheStatus();
    console.log(`Cache Status: ${status.size} entries`);
    console.log(`Cached empcodes:`, status.keys);
}

// ฟังก์ชันตรวจสอบ cache hit rate
function getCacheHitRate() {
    // ฟังก์ชันนี้จะทำงานร่วมกับ checkEmpcodeWithCache
    // เพื่อนับจำนวน cache hit และ miss
    return {
        hits: window.cacheHits || 0,
        misses: window.cacheMisses || 0,
        hitRate: window.cacheHits ? (window.cacheHits / (window.cacheHits + window.cacheMisses)) * 100 : 0
    };
}

// ฟังก์ชันรีเซ็ต cache statistics
function resetCacheStats() {
    window.cacheHits = 0;
    window.cacheMisses = 0;
    console.log('Cache statistics reset');
}

// เพิ่ม cache statistics tracking ใน checkEmpcodeWithCache
function checkEmpcodeWithCache(empcode) {
    // ตรวจสอบ cache ก่อน
    if (empcodeCache.has(empcode)) {
        window.cacheHits = (window.cacheHits || 0) + 1;
        console.log(`Cache hit for empcode: ${empcode}`);
        return Promise.resolve(empcodeCache.get(empcode));
    }
    
    // ถ้าไม่มีใน cache ให้เรียก API
    window.cacheMisses = (window.cacheMisses || 0) + 1;
    console.log(`Cache miss for empcode: ${empcode}, calling API...`);
    return fetch(`./function/Plan/Empcode_Checking.php?empcode=${empcode}`)
        .then(response => response.text())
        .then(text => {
            const trimmed = text.trim();
            const result = { empcode: empcode, name_eng: trimmed };
            
            // เก็บใน cache
            empcodeCache.set(empcode, result);
            console.log(`Cached empcode: ${empcode} = ${trimmed}`);
            
            return result;
        });
}

// ฟังก์ชันล้าง cache (ถ้าต้องการ)
function clearEmpcodeCache() {
    empcodeCache.clear();
    console.log('Empcode cache cleared');
}

// ฟังก์ชันดู cache status
function getCacheStatus() {
    return {
        size: empcodeCache.size,
        keys: Array.from(empcodeCache.keys())
    };
}

// ฟังก์ชันลบ cache ของ empcode เฉพาะ
function removeFromCache(empcode) {
    empcodeCache.delete(empcode);
    console.log(`Removed empcode ${empcode} from cache`);
}

console.log('Empcode cache system initialized');
// ================================================================
// 2.Utility
// ================================================================
function createInput(column, placeholder = "", readOnly = false) {
    const input = document.createElement("input");
    input.type = "text";
    input.name = column + "[]";
    input.placeholder = placeholder;
    if (readOnly) {
        input.value = new Date().toISOString().split('T')[0];
        input.readOnly = true;
    }
    return input;
}
function addArrowNavigation(input, tableBodyEdit) {
    input.addEventListener("keydown", function (event) {
        const currentCell = this.parentElement;
        const currentRow = currentCell.parentElement;
        const allInputsInRow = Array.from(currentRow.querySelectorAll("input, select"));
        const currentIndex = allInputsInRow.indexOf(this);

        const allRows = Array.from(tableBodyEdit.querySelectorAll("tr"));
        const currentRowIndex = allRows.indexOf(currentRow);

        // ตรวจสอบว่าเป็น input ชนิด text หรือไม่
        const isTextInput = this.tagName === 'INPUT' && this.type === 'text';

        if (event.key === "ArrowRight") {
            if (isTextInput && this.selectionEnd < this.value.length) {
                // ถ้าเป็น input text และเคอร์เซอร์ยังไม่ถึงท้ายข้อความ ให้เบราว์เซอร์จัดการเอง
                return;
            }
            // ถ้าถึงท้ายข้อความแล้ว หรือไม่ใช่ input text ให้เลื่อนไปยังช่องถัดไป
            if (currentIndex < allInputsInRow.length - 1) {
                allInputsInRow[currentIndex + 1].focus();
                event.preventDefault(); // ป้องกันการเลื่อนหน้าจอ
            }
        } else if (event.key === "ArrowLeft") {
            if (isTextInput && this.selectionStart > 0) {
                // ถ้าเป็น input text และเคอร์เซอร์ยังไม่ถึงต้นข้อความ ให้เบราว์เซอร์จัดการเอง
                return;
            }
            // ถ้าถึงต้นข้อความแล้ว หรือไม่ใช่ input text ให้เลื่อนไปยังช่องก่อนหน้า
            if (currentIndex > 0) {
                allInputsInRow[currentIndex - 1].focus();
                event.preventDefault(); // ป้องกันการเลื่อนหน้าจอ
            }
        } else if (event.key === "ArrowDown" && currentRowIndex < allRows.length - 1) {
            const nextRow = allRows[currentRowIndex + 1];
            const nextInput = nextRow.querySelectorAll("input, select")[currentIndex];
            if (nextInput) nextInput.focus();
            event.preventDefault();
        } else if (event.key === "ArrowUp" && currentRowIndex > 0) {
            const previousRow = allRows[currentRowIndex - 1];
            const previousInput = previousRow.querySelectorAll("input, select")[currentIndex];
            if (previousInput) previousInput.focus();
            event.preventDefault();
        }
    });
}
function parseDate(dateString) {
    // รองรับทั้ง DD/MM/YYYY, DD/MM/YY, DD-MM-YYYY, DD-MM-YY
    if (!dateString) return null;
    // แยกด้วย / หรือ -
    const parts = dateString.split(/[/\-]/);
    if (parts.length === 3) {
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        // ถ้า year เป็น 2 หลัก ให้แปลงเป็น 4 หลัก
        if (year < 100) {
            year += year >= 70 ? 1900 : 2000;
        }
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    return null;
}
function convertDate(dateString) {
    if (!dateString) return "";
    // Excel serial number (number only)
    if (!isNaN(dateString) && dateString.trim() !== "") {
        // Excel serial date to JS date
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const days = parseInt(dateString, 10);
        if (!isNaN(days)) {
            const date = new Date(excelEpoch.getTime() + days * 86400000);
            const day = String(date.getUTCDate()).padStart(2, "0");
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const year = date.getUTCFullYear();
            return `${day}/${month}/${year}`;
        }
    }
    // YYYY-MM-DD or YYYY/MM/DD
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(dateString)) {
        const [year, month, day] = dateString.split(/[-/]/);
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
    // เพิ่มรองรับ DD-MM-YY หรือ DD-MM-YYYY
    if (/^\d{1,2}-\d{1,2}-\d{2,4}$/.test(dateString)) {
        const [day, month, yearRaw] = dateString.split("-");
        let year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
    // DD/MM/YYYY
    const parts = dateString.split("/");
    if (parts.length === 3) {
        let day = parts[0];
        let month = parts[1];
        let year = parts[2];
        if (parseInt(month, 10) > 12) {
            let temp = day;
            day = month;
            month = temp;
        }
        day = day.padStart(2, "0");
        month = month.padStart(2, "0");
        year = year.length === 2 ? `20${year}` : year;
        return `${day}/${month}/${year}`;
    }
    return "";
}
function formatDecimalNumber(value) {
    const num = parseFloat(String(value).replace(/,/g, ""));
    // ปัดขึ้นเสมอ
    return isNaN(num) ? value : Math.ceil(num).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
// ================================================================
// 3.UI/DOM
// ================================================================
function updateDisplay() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
    const displayAll = document.getElementById("displayAll");
    if (!displayAll) return;
    displayAll.innerHTML = "";

    // สร้างโครงสร้างข้อมูลแบบ nested: grouped[monthYear][product_type][lineName]
    const grouped = {};

    rows.forEach(row => {
        // ข้าม td แรก (ลำดับ)
        const tds = Array.from(row.querySelectorAll("td")).slice(1);
        // HTML: [datetime, type, qty, line_name, product_type]
        if (tds.length < 5) return;
        const [dateTd, typeTd, qtyTd, lineNameTd, productTypeTd] = tds;
        const date = dateTd.querySelector('input, select')?.value || dateTd.dataset.value || dateTd.textContent.trim();
        const type = typeTd.querySelector('input, select')?.value || typeTd.dataset.value || typeTd.textContent.trim();
        const qtyRaw = qtyTd.querySelector('input, select')?.value || qtyTd.dataset.value || qtyTd.textContent.trim();
        const lineName = lineNameTd.querySelector('input, select')?.value || lineNameTd.dataset.value || lineNameTd.textContent.trim();
        const product_type = productTypeTd.querySelector('input, select')?.value || productTypeTd.dataset.value || productTypeTd.textContent.trim();

        const qty = parseFloat(String(qtyRaw).replace(/,/g, "")) || 0;
        const parts = String(date).split("/");
        if (parts.length !== 3) return;
        const month = parts[1].padStart(2, "0");
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        const monthYear = `${month}/${year}`;

        if (!grouped[monthYear]) grouped[monthYear] = {};
        if (!grouped[monthYear][product_type]) grouped[monthYear][product_type] = {};
        if (!grouped[monthYear][product_type][lineName]) grouped[monthYear][product_type][lineName] = { input: 0, output: 0 };

        if (type.toLowerCase() === "input") {
            grouped[monthYear][product_type][lineName].input += qty;
        } else {
            grouped[monthYear][product_type][lineName].output += qty;
        }
    });

    function buildTable(groupedData) {
        const table = document.createElement("table");
        table.className = "table table-bordered";
        table.style.width = "100%";
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Month/Year</th>
                    <th>Product</th>
                    <th>Line</th>
                    <th>Input</th>
                    <th>Output</th>
                </tr>
            </thead>
        `;
        const tbody = document.createElement("tbody");
        let totalInput = 0;
        let totalOutput = 0;

        // เรียง monthYear
        const monthYears = Object.keys(groupedData).sort((a, b) => {
            const [am, ay] = a.split("/");
            const [bm, by] = b.split("/");
            if (ay !== by) return parseInt(ay) - parseInt(by);
            return parseInt(am) - parseInt(bm);
        });

        monthYears.forEach(monthYear => {
            const productTypes = groupedData[monthYear];
            const productTypeKeys = Object.keys(productTypes).sort();

            // คำนวณ rowspan ของ monthYear
            let monthYearRowSpan = 0;
            productTypeKeys.forEach(product_type => {
                monthYearRowSpan += Object.keys(productTypes[product_type]).length;
            });

            let monthYearPrinted = false;
            productTypeKeys.forEach(product_type => {
                const lines = productTypes[product_type];
                const lineNames = Object.keys(lines).sort();
                let productTypePrinted = false;
                lineNames.forEach((lineName, idx) => {
                    const entry = lines[lineName];
                    const tr = document.createElement("tr");
                    if (!monthYearPrinted) {
                        tr.innerHTML += `<td rowspan="${monthYearRowSpan}">${monthYear}</td>`;
                        monthYearPrinted = true;
                    }
                    if (!productTypePrinted) {
                        tr.innerHTML += `<td rowspan="${lineNames.length}">${product_type}</td>`;
                        productTypePrinted = true;
                    }
                    tr.innerHTML += `
                        <td>${lineName}</td>
                        <td>${entry.input.toLocaleString()}</td>
                        <td>${entry.output.toLocaleString()}</td>
                    `;
                    tbody.appendChild(tr);
                    totalInput += entry.input;
                    totalOutput += entry.output;
                });
            });
        });

        // Total row
        const totalRow = document.createElement("tr");
        totalRow.style.fontWeight = "bold";
        totalRow.innerHTML = `
            <td colspan="3" style="text-align:right">Total</td>
            <td>${totalInput.toLocaleString()}</td>
            <td>${totalOutput.toLocaleString()}</td>
        `;
        tbody.appendChild(totalRow);
        table.appendChild(tbody);

        return table;
    }

    displayAll.style.textAlign = "left";
    displayAll.appendChild(buildTable(grouped));
}
function showClear() {
    const clearSection = document.getElementById("clearSection");
    const clearButton = document.querySelector("button[onclick='showClear()']");

    if (clearSection.classList.contains("hidden")) {
        clearSection.classList.remove("hidden");
        clearButton.classList.add("active");
        populateClearDropdowns();
    } else {
        clearSection.classList.add("hidden");
        clearButton.classList.remove("active");
    }
    updateSeparators(); // เรียกใช้เพื่อปรับปรุงการแสดงผลของ separators
}
function populateClearDropdowns() {
    const clearMonthSelect = document.getElementById("clearMonth");
    const clearYearSelect = document.getElementById("clearYear");

    clearMonthSelect.innerHTML = "";
    clearYearSelect.innerHTML = "";

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index + 1;
        option.textContent = month;
        clearMonthSelect.appendChild(option);
    });

    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        clearYearSelect.appendChild(option);
    }

    clearMonthSelect.value = new Date().getMonth() + 1;
    clearYearSelect.value = currentYear;
}
function updateSeparators() {
    const clearSection = document.getElementById("clearSection");
    const displaySection = document.getElementById("displaySection");
    const editSection = document.getElementById("editSection");
    const separatorMain = document.getElementById("separator");
    const separatorClearDisplay = document.getElementById("separator-clear-display");

    // ตรวจสอบว่ามี element อยู่จริงก่อนเข้าถึง classList
    if (clearSection && displaySection && separatorClearDisplay) {
        if (!clearSection.classList.contains("hidden") && !displaySection.classList.contains("hidden")) {
            separatorClearDisplay.classList.remove("hidden");
        } else {
            separatorClearDisplay.classList.add("hidden");
        }
    }

    if (displaySection && editSection && separatorMain) {
        if (!displaySection.classList.contains("hidden") && !editSection.classList.contains("hidden")) {
            separatorMain.classList.remove("hidden");
        } else {
            separatorMain.classList.add("hidden");
        }
    }
}
function addSeparator() {
    const separator = document.getElementById("separator");
    if (separator && separator.classList.contains("hidden")) {
        separator.classList.remove("hidden");
    }
}
function removeSeparator() {
    const separator = document.getElementById("separator");
    if (separator && !separator.classList.contains("hidden")) {
        separator.classList.add("hidden");
    }
}
function showOrHideEditSection() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const mainContent2 = document.getElementById("mainContent2");
    if (!mainContent2) return;
    if (tableBodyEdit && tableBodyEdit.children.length > 0) {
        mainContent2.style.display = "";
    } else {
        mainContent2.style.display = "none";
    }
}
function cellToText(td, column) {
    const input = td.querySelector('input, select');
    if (!input) return;
    let value = input.tagName === 'SELECT'
        ? (input.options[input.selectedIndex]?.text || input.value)
        : input.value;
    if (column === 'qty' && value) {
        value = formatDecimalNumber(value);
    }
    td.innerHTML = value;
    td.dataset.value = value;
    td.classList.add('inputConfig');
}
function cellToInput(td, column, value) {
    let el;
    if (column === 'create_type') {
        el = document.createElement('select');
        el.name = column + "[]";
        el.className = "inputConfig";
        ["0", "1"].forEach(val => {
            const option = document.createElement("option");
            option.value = val;
            option.textContent = val;
            el.appendChild(option);
        });
        el.value = value;
    } else if (column === 'type') {
        el = document.createElement('select');
        el.name = column + "[]";
        el.className = "inputConfig";
        ["Input", "Output", "Out"].forEach(val => {
            const option = document.createElement("option");
            option.value = val;
            option.textContent = val;
            el.appendChild(option);
        });
        el.value = value;
    } else {
        el = document.createElement('input');
        el.type = "text";
        el.name = column + "[]";
        el.className = "inputConfig";
        el.value = value;
    }
    td.innerHTML = '';
    td.appendChild(el);
    td.classList.add('inputConfig'); // เพิ่มบรรทัดนี้
}
// ================================================================
// 4.Validation
// ================================================================
function validateRows() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
    const errors = [];
    rows.forEach((row, idx) => {
        // ข้าม td แรก (ลำดับ)
        const tds = Array.from(row.querySelectorAll("td")).slice(1);
        if (tds.length < 5) return;
        const [dateTd, typeTd, qtyTd, lineNameTd, productTypeTd] = tds;
        const dateValue = dateTd.dataset.value !== undefined ? dateTd.dataset.value : dateTd.textContent.trim();
        const lineName = lineNameTd.dataset.value !== undefined ? lineNameTd.dataset.value : lineNameTd.textContent.trim();
        const productType = productTypeTd.dataset.value !== undefined ? productTypeTd.dataset.value : productTypeTd.textContent.trim();

        // ตรวจสอบ line name
        if (window.validLineNames && !window.validLineNames.includes(lineName.trim())) {
            errors.push(`แถวที่ ${idx + 1}: Line "${lineName}" ไม่ถูกต้อง`);
        }
        // ตรวจสอบ product type
        if (window.validProductTypes && !window.validProductTypes.includes(productType.trim())) {
            errors.push(`แถวที่ ${idx + 1}: Product Type "${productType}" ไม่ถูกต้อง`);
        }
        // ตรวจสอบเดือน
        if (dateValue) {
            const parts = dateValue.split("/");
            if (parts.length === 3) {
                const month = parseInt(parts[1], 10);
                if (isNaN(month) || month < 1 || month > 12) {
                    errors.push(`แถวที่ ${idx + 1}: เดือน "${parts[1]}" ไม่ถูกต้อง (ควรเป็น 1-12)`);
                }
            } else {
                errors.push(`แถวที่ ${idx + 1}: รูปแบบวันที่ไม่ถูกต้อง (ควรเป็น DD/MM/YYYY)`);
            }
        }
    });
    return errors;
}
// ================================================================
// 5.Main Action
// ================================================================
function handleInsert() {
    const errors = validateRows();
    if (errors.length > 0) {
        Swal.fire("พบข้อมูลไม่ถูกต้อง", errors.join('<br>'), "error");
        return;
    }

    // ตรวจสอบ line ก่อน
    const tableBodyEdit = document.querySelector("#edit tbody");
    const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
    const columns = window.globalColumns || [];
    
    let hasLineError = false;
    rows.forEach(row => {
        const tds = Array.from(row.querySelectorAll("td")).slice(1);
        const lineIdx = columns.indexOf('line_name');
        if (lineIdx !== -1) {
            const lineValue = tds[lineIdx]?.dataset.value !== undefined ? tds[lineIdx].dataset.value : tds[lineIdx]?.textContent.trim();
            if (!lineValue || lineValue === 'null' || lineValue === '') {
                hasLineError = true;
            }
        }
    });
    
    if (hasLineError) {
        Swal.fire("พบข้อผิดพลาด", "คอลัมน์ชื่อผิด ควรเปลี่ยนเป็น LINE_NAME", "error");
        return;
    }

    let hasyearError = false;
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    rows.forEach(row => {
        const tds = Array.from(row.querySelectorAll("td")).slice(1);
        const yearIdx = columns.indexOf('datetime');
        if (yearIdx !== -1) {
            const dateValue = tds[yearIdx]?.dataset.value !== undefined ? tds[yearIdx].dataset.value : tds[yearIdx]?.textContent.trim();
            if (!dateValue || dateValue === 'null' || dateValue === '') {
                hasyearError = true;
            } else {
                // ตรวจสอบรูปแบบ DD/MM/YYYY และแยกปีออกมา
                const dateMatch = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (dateMatch) {
                    const day = parseInt(dateMatch[1]);
                    const month = parseInt(dateMatch[2]);
                    const year = parseInt(dateMatch[3]);
                    
                    // ตรวจสอบว่าเป็นปีปัจจุบันหรือ +1 เท่านั้น
                    if (year !== currentYear && year !== nextYear) {
                        hasyearError = true;
                    }
                    
                    // ตรวจสอบความถูกต้องของวันและเดือน
                    if (day < 1 || day > 31 || month < 1 || month > 12) {
                        hasyearError = true;
                    }
                } else {
                    // ไม่ตรงรูปแบบ DD/MM/YYYY
                    hasyearError = true;
                }
            }
        }
    });

    if (hasyearError) {
        Swal.fire("พบข้อผิดพลาด", `คอลัมน์ปีต้องเป็นปีปัจจุบัน (${currentYear}) หรือปีถัดไป (${nextYear}) เท่านั้น`, "error");
        return;
    }

    // ขอให้ผู้ใช้กรอก empcode
    Swal.fire({
        title: "กรุณากรอกรหัสพนักงาน",
        input: "text",
        inputPlaceholder: '000000',
        inputAttributes: {
            maxlength: 6,
            inputmode: 'numeric',
            pattern: '[0-9]*',
            onkeypress: 'return event.charCode >= 48 && event.charCode <= 57'
        },
        showCancelButton: true,
        confirmButtonText: "บันทึกข้อมูล",
        cancelButtonText: "ยกเลิก",
        inputValidator: (value) => {
            if (!value) {
                return "กรุณากรอกรหัสพนักงาน";
            }
            if (!/^\d{6}$/.test(value)) {
                return "รหัสพนักงานต้องเป็นตัวเลข 6 หลัก";
            }
        },
        preConfirm: (empcode) => {
            return checkEmpcodeWithCache(empcode)
                .then(result => {
                    const trimmed = result.name_eng;
                    // ถ้าได้ชื่อพนักงาน (ไม่ใช่ error message) แสดงว่า valid
                    if (trimmed && 
                        trimmed !== 'employee not found' && 
                        trimmed !== 'query execution failed' && 
                        trimmed !== 'oracle connection failed' && 
                        trimmed !== 'no empcode provided' &&
                        !trimmed.includes('database error')) {
                        return result; // ส่งทั้ง empcode และชื่อ
                    } else {
                        throw new Error('กรุณาตรวจสอบรหัสพนักงาน');
                    }
                })
                .catch(error => {
                    Swal.showValidationMessage(error.message);
                });
        },
        didOpen: () => {
            const input = document.querySelector('.swal2-input');
            if (input) {
                input.addEventListener('keypress', function(e) {
                    // บังคับให้กรอกได้เฉพาะตัวเลข
                    if (e.charCode < 48 || e.charCode > 57) {
                        e.preventDefault();
                    }
                });
                input.addEventListener('input', function(e) {
                    // ลบตัวอักษรที่ไม่ใช่ตัวเลข
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    const paste = (e.clipboardData || window.clipboardData).getData('text');
                    const numbers = paste.replace(/[^0-9]/g, '');
                    if (numbers.length <= 5) {
                        this.value = numbers;
                    }
                });
            }
        }
    }).then((result) => {
        if (!result.isConfirmed || !result.value) return;

        const empcode = result.value.empcode;
        const name_eng = result.value.name_eng;

        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            html: `คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?<br><br>รหัสพนักงาน: ${empcode}<br>ชื่อ: ${name_eng}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่, บันทึกข้อมูล!",
            cancelButtonText: "ยกเลิก"
        }).then((confirmResult) => {
            if (!confirmResult.isConfirmed) return;

            const tableBodyEdit = document.querySelector("#edit tbody");
            const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
            const columns = window.globalColumns || [];

            showLoadingSwal();
            
            const data = rows.map(row => {
                const tds = Array.from(row.querySelectorAll("td")).slice(1);
                const rowData = {};
                tds.forEach((td, idx) => {
                    const column = columns[idx];
                    if (!column) return;
                    let value = td.dataset.value !== undefined ? td.dataset.value : td.textContent.trim();
                    
                    if (column === 'qty' && value) {
                        value = value.replace(/,/g, "");
                    }
                    rowData[column] = value;
                });
                rowData['create_type'] = row.dataset.createType || '0';
                rowData['empno'] = empcode;
                return rowData;
            });

            fetch("./function/Plan/insertPlan.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data,
                    create_type: document.getElementById('check')?.checked ? 1 : 0
                })
            })
            .then(response => response.text())
            .then(result => {
                hideLoadingSwal();
                let data;
                try {
                    data = typeof result === "string" ? JSON.parse(result) : result;
                } catch (e) {
                    Swal.fire("ไม่สำเร็จ", "เกิดข้อผิดพลาดในการแปลงข้อมูลตอบกลับ", "error");
                    return;
                }

                if (data.error) {
                    Swal.fire("ไม่สำเร็จ", data.error, "error");
                } else if (data.success) {
                    Swal.fire({icon: 'success', title: 'เสร็จสิ้น!', text: 'จัดการข้อมูลเป็นที่เรียบร้อย'});
                } else {
                    Swal.fire("ไม่สำเร็จ", "ไม่สามารถบันทึกข้อมูลได้", "error");
                }
                clearTable();
            })
            .catch(error => {
                hideLoadingSwal();
                Swal.fire("ไม่สำเร็จ", "เกิดปัญหาในการเพิ่มข้อมูลเข้าไปในฐานข้อมูล", "error");
            });
        });
    });
}
function updateData() {
    const errors = validateRows();
    if (errors.length > 0) {
        Swal.fire("พบข้อมูลไม่ถูกต้อง", errors.join('<br>'), "error");
        return;
    }

    // ขอให้ผู้ใช้กรอกรหัสพนักงานก่อนอัปเดท
    Swal.fire({
        title: "กรุณากรอกรหัสพนักงาน",
        input: "text",
        inputPlaceholder: '000000',
        inputAttributes: {
            maxlength: 6,
            inputmode: 'numeric',
            pattern: '[0-9]*',
            onkeypress: 'return event.charCode >= 48 && event.charCode <= 57'
        },
        showCancelButton: true,
        confirmButtonText: "อัพเดทข้อมูล",
        cancelButtonText: "ยกเลิก",
        inputValidator: (value) => {
            if (!value) {
                return "กรุณากรอกรหัสพนักงาน";
            }
            if (!/^\d{6}$/.test(value)) {
                return "รหัสพนักงานต้องเป็นตัวเลข 6 หลัก";
            }
        },
        preConfirm: (empcode) => {
            return checkEmpcodeWithCache(empcode)
                .then(result => {
                    const trimmed = result.name_eng;
                    if (trimmed && 
                        trimmed !== 'employee not found' && 
                        trimmed !== 'query execution failed' && 
                        trimmed !== 'oracle connection failed' && 
                        trimmed !== 'no empcode provided' &&
                        !trimmed.includes('database error')) {
                        return result;
                    } else {
                        throw new Error('กรุณาตรวจสอบรหัสพนักงาน');
                    }
                })
                .catch(error => {
                    Swal.showValidationMessage(error.message);
                });
        },
        didOpen: () => {
            const input = document.querySelector('.swal2-input');
            if (input) {
                input.addEventListener('keypress', function(e) {
                    if (e.charCode < 48 || e.charCode > 57) {
                        e.preventDefault();
                    }
                });
                input.addEventListener('input', function(e) {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    const paste = (e.clipboardData || window.clipboardData).getData('text');
                    const numbers = paste.replace(/[^0-9]/g, '');
                    if (numbers.length <= 5) {
                        this.value = numbers;
                    }
                });
            }
        }
    }).then((result) => {
        if (!result.isConfirmed || !result.value) return;

        const empcode = result.value.empcode;
        const name_eng = result.value.name_eng;

        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            html: `คุณต้องการอัพเดทข้อมูลนี้ใช่หรือไม่?<br><br>รหัสพนักงาน: ${empcode}<br>ชื่อ: ${name_eng}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่, อัพเดทข้อมูล!",
            cancelButtonText: "ยกเลิก"
        }).then((confirmResult) => {
            if (!confirmResult.isConfirmed) return;
            showLoadingSwal();

            const tableBodyEdit = document.querySelector("#edit tbody");
            const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
            const columns = window.globalColumns || [];

            const data = rows.map(row => {
                const tds = Array.from(row.querySelectorAll("td")).slice(1);
                const rowData = {};
                tds.forEach((td, idx) => {
                    const column = columns[idx];
                    let value = td.dataset.value !== undefined ? td.dataset.value : td.textContent.trim();
                    if (column === 'qty' && value) {
                        value = value.replace(/,/g, "");
                    }
                    rowData[column] = value;
                });
                rowData['create_type'] = row.dataset.createType;
                rowData['empno'] = empcode; // ใช้ empcode ที่ผู้ใช้กรอก
                return rowData;
            });

            fetch("./function/Plan/updatePlan.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data })
            })
            .then(response => response.json())
            .then(result => {
                hideLoadingSwal();
                if (result.success) {
                    Swal.fire({icon: 'success', title: 'เสร็จสิ้น!', text: 'จัดการข้อมูลเป็นที่เรียบร้อย'});
                } else {
                    Swal.fire("ไม่สำเร็จ", result.error || "ข้อมูลบางแถวไม่สามารถอัพเดทได้", "error");
                }
                clearTable();
            })
            .catch(error => {
                hideLoadingSwal();
                Swal.fire("ไม่สำเร็จ", "เกิดปัญหาขณะอัพเดทฐานข้อมูล", "error");
            });
        });
    });
}
function loadData() {
    const month = $('#monthFilter').val();
    const year = $('#yearFilter').val();
    const line = $('#lineFilter').val();
    const product_type = $('#productTypeFilter').val();
    const createType = $('#createTypeFilter').val();

    // ตรวจสอบว่าต้องเลือกฟิลด์ที่จำเป็นก่อน
    const missingFields = [];
    if (!month) missingFields.push("เดือน");
    if (!year) missingFields.push("ปี");
    if (!product_type) missingFields.push("Product");
    if (!createType) missingFields.push("Create Type");
    
    if (missingFields.length > 0) {
        Swal.fire("กรุณาเลือกข้อมูลที่จำเป็น", `โปรดเลือก ${missingFields.join(', ')} ก่อนค้นหาข้อมูล`, "warning");
        return;
    }

    // ไม่ต้องดึง empno จาก localStorage แล้ว ใช้ค่า default
    let empno = "";
    // try {
    //     const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    //     empno = userData.empcode || "";
    // } catch (e) {}
    empno = "SYSTEM"; // ใช้ค่า default แทน
    showLoadingSwal("กำลังโหลดข้อมูล...");
    $.ajax({
        url: 'function/Plan/loadDataPlan.php',
        method: 'POST',
        data: {
            month: month,
            year: year,
            line: line,
            product_type: product_type,
            create_type: createType,
            empno: empno
        },
        dataType: 'json',
        success: function(response) {
            hideLoadingSwal();
            const tableBodyEdit = document.querySelector("#edit tbody");
            tableBodyEdit.innerHTML = "";
            if (!response.success || !response.data || !response.data.length) {
                Swal.fire("ไม่มีข้อมูล", "ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา", "info");
                document.getElementById("displaySection").style.display = "none";
                showOrHideEditSection();
                return;
            }
            const validColumns = window.globalColumns || [];
            let rowNum = 1;
            
            // สร้าง array ของ empcode ที่ไม่ซ้ำ
            const uniqueEmpcodes = [...new Set(response.data.map(row => row.empno).filter(emp => emp && emp !== 'SYSTEM'))];
            
            // ดึงชื่อพนักงานจาก empcode ทั้งหมด
            const empcodeToName = {};
            const fetchPromises = uniqueEmpcodes.map(async empcode => {
                try {
                    const result = await checkEmpcodeWithCache(empcode);
                    const trimmed = result.name_eng.trim();
                    if (trimmed && 
                        trimmed !== 'employee not found' && 
                        trimmed !== 'query execution failed' && 
                        trimmed !== 'oracle connection failed' && 
                        trimmed !== 'no empcode provided' &&
                        !trimmed.includes('database error')) {
                        empcodeToName[empcode] = trimmed;
                    } else {
                        empcodeToName[empcode] = empcode; // ใช้ empcode แทนถ้าไม่พบชื่อ
                    }
                } catch (error) {
                    empcodeToName[empcode] = empcode; // ใช้ empcode แทนถ้าเกิด error
                }
            });
            
            // รอให้ดึงชื่อพนักงานเสร็จก่อน
            Promise.all(fetchPromises).then(() => {
                response.data.forEach(row => {
                    const newRow = document.createElement("tr");
                    newRow.dataset.createType = row.create_type; // <<== ใส่ตรงนี้

                    const numCell = document.createElement("td");
                    numCell.textContent = rowNum++;
                    newRow.appendChild(numCell);

                    validColumns.forEach((column) => {
                        if (column === 'empno') {
                            // แยก empcode และ name_eng เป็น 2 คอลัมน์
                            
                            // คอลัมน์ empcode
                            const empcodeCell = document.createElement("td");
                            empcodeCell.className = "inputConfig";
                            empcodeCell.textContent = row.empno || '';
                            empcodeCell.dataset.value = row.empno || '';
                            newRow.appendChild(empcodeCell);
                            
                            // คอลัมน์ name_eng
                            const nameCell = document.createElement("td");
                            nameCell.className = "inputConfig";
                            let nameValue = '';
                            if (row.empno && row.empno !== 'SYSTEM' && empcodeToName[row.empno]) {
                                nameValue = empcodeToName[row.empno];
                            } else if (row.empno === 'SYSTEM') {
                                nameValue = 'SYSTEM';
                            }
                            nameCell.textContent = nameValue;
                            nameCell.dataset.value = nameValue;
                            newRow.appendChild(nameCell);
                        } else {
                            const newCell = document.createElement("td");
                            newCell.className = "inputConfig";
                            let cellValue = row[column] ?? "";
                            
                            if (column === 'datetime') {
                                cellValue = convertDate(cellValue);
                            } else if (column === 'qty') {
                                cellValue = cellValue.replace(/[^0-9.]/g, "");
                                cellValue = formatDecimalNumber(cellValue);
                            }
                            
                            newCell.textContent = cellValue;
                            newCell.dataset.value = cellValue;
                            newRow.appendChild(newCell);
                        }
                    });

                    tableBodyEdit.appendChild(newRow);
                });
                
                // แสดงผลหลังจากโหลดข้อมูลเสร็จ
                document.getElementById("displaySection").style.display = "";
                
                // แสดงคอลัมน์ empcode และ name เมื่อโหลดข้อมูลจากฐานข้อมูล
                showEmpcodeNameColumns();
                
                updateDisplay(true); // ส่ง true เพื่อบอกว่าเป็น loadData

                const displayContent = document.getElementById('displayContent');
                if (displayContent) {
                    displayContent.classList.remove('collapsed');
                    $('#toggleDisplayButton').html('<img src="./assets/images/minus.png" alt="minus" style="width:18px;height:18px;vertical-align:middle;">');
                }
                showOrHideEditSection();
            });
        },
        error: function() {
            hideLoadingSwal();
            Swal.fire("error", "AJAX error", "error");
        }
    });
}
function clearTable() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    if (tableBodyEdit) {
        tableBodyEdit.innerHTML = "";
    }
    const csvFileInput = document.getElementById("csvFileInput");
    if (csvFileInput) {
        csvFileInput.value = ""; 
    }
    $('#monthFilter').val('');
    $('#yearFilter').val('');
    $('#lineFilter').val('');
    $('#productTypeFilter').val('');
    $('#createTypeFilter').val('');

    $('#edit tbody input, #edit tbody select').prop('disabled', true);
    const toggleEditButton = $('#toggleEditButton');
    const editImg = $('<img>', {
        src: './assets/images/edit.png',
        alt: 'edit',
        style: 'width: 18px; height: 18px; vertical-align: middle;'
    });
    toggleEditButton.empty().append(editImg).attr('onclick', 'edit()');

    updateDisplay(); 
    showOrHideEditSection();
}
function deleteData() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
    const columns = window.globalColumns || [];

    if (rows.length === 0) {
        Swal.fire("ไม่มีข้อมูล", "ไม่มีข้อมูลในตารางให้ลบ", "warning");
        return;
    }

    // ตรวจสอบเดือนที่จะลบ
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const currentYear = currentDate.getFullYear();
    
    let hasInvalidMonth = false;
    let invalidMonths = [];
    
    rows.forEach(row => {
        const tds = Array.from(row.querySelectorAll("td")).slice(1);
        const dateIdx = columns.indexOf('datetime');
        if (dateIdx !== -1) {
            const dateValue = tds[dateIdx]?.dataset.value !== undefined ? tds[dateIdx].dataset.value : tds[dateIdx]?.textContent.trim();
            if (dateValue) {
                // ตรวจสอบรูปแบบ DD/MM/YYYY และแยกเดือนออกมา
                const dateMatch = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (dateMatch) {
                    const day = parseInt(dateMatch[1]);
                    const month = parseInt(dateMatch[2]);
                    const year = parseInt(dateMatch[3]);
                    
                    // ตรวจสอบว่าเดือนที่จะลบน้อยกว่าเดือนปัจจุบันหรือไม่
                    if (year < currentYear || (year === currentYear && month < currentMonth)) {
                        hasInvalidMonth = true;
                        if (!invalidMonths.includes(`${month}/${year}`)) {
                            invalidMonths.push(`${month}/${year}`);
                        }
                    }
                }
            }
        }
    });

    // ถ้ามีเดือนที่ไม่สามารถลบได้ แสดงข้อความแจ้งเตือน
    if (hasInvalidMonth) {
        Swal.fire({
            title: "ไม่สามารถลบข้อมูลได้",
            text: `ไม่สามารถลบข้อมูลเดือน ${invalidMonths.join(', ')} ได้ เนื่องจากเป็นเดือนที่ผ่านมาแล้ว\n\nสามารถลบได้เฉพาะเดือน ${currentMonth}/${currentYear} ขึ้นไปเท่านั้น\n\nโปรดติดต่อ MT670 หากต้องการลบข้อมูลเดือนที่ผ่านมา`,
            icon: "error",
            confirmButtonText: "ตกลง"
        });
        return;
    }

    Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "ข้อมูลที่ตรงกับในตารางจะถูกลบทั้งหมด",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ใช่, ลบข้อมูล!",
        cancelButtonText: "ยกเลิก"
    }).then((result) => {
        if (!result.isConfirmed) return;
        showLoadingSwal();
        const data = rows.map(row => {
            const tds = Array.from(row.querySelectorAll("td")).slice(1);
            const rowData = {};
            tds.forEach((td, idx) => {
                const column = columns[idx];
                let value = td.dataset.value !== undefined ? td.dataset.value : td.textContent.trim();
                if (column === 'qty' && value) {
                    value = value.replace(/,/g, "");
                }
                rowData[column] = value;
            });
            rowData['create_type'] = row.dataset.createType || '0';
            return rowData;
        });

        fetch("./function/Plan/deleteDataPlan.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data })
            })
        .then(response => response.json())
        .then(result => {
            hideLoadingSwal();
            if (result.success) {
                Swal.fire({icon: 'success', title: 'เสร็จสิ้น!', text: 'ลบข้อมูลเรียบร้อยแล้ว'});
                clearTable();
            } else {
                Swal.fire("ไม่สำเร็จ", result.error || "ไม่สามารถลบข้อมูลได้", "error");
            }
        })
        .catch(error => {
            hideLoadingSwal();
            Swal.fire("ไม่สำเร็จ", "เกิดปัญหาขณะลบข้อมูล", "error");
        });
    });
}
function handleFileUpload(event) { 
    showLoadingSwal("กำลังอ่านไฟล์...");
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const fileName = file.name;
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const displayContent = document.getElementById('displayContent');
    const wasCollapsed = displayContent && displayContent.classList.contains('collapsed');

    // กำหนดคอลัมน์ที่ต้องการตามไฟล์ กก.csv
    const csvColumnMap = [
        { csv: "วันที่ (ว/ด/ป)", col: "datetime" },
        { csv: "ประเภท", col: "type" },
        { csv: "จำนวน", col: "qty" },
        { csv: "ไลน์", col: "line_name" },
        { csv: "ประเภทสินค้า", col: "product_type" }
    ];

    const headerMap = {};
    csvColumnMap.forEach(({ csv, col }) => {
        headerMap[csv.toLowerCase()] = col;
    });

    // ไม่ต้องดึง empcode จาก localStorage แล้ว ใช้ค่า default
    let empcode = "";
    // try {
    //     const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    //     empcode = userData.empcode || "";
    // } catch (e) {}
    empcode = "SYSTEM"; // ใช้ค่า default แทน

    reader.onload = function (e) {
        let rows = [];
        if (isExcel) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        } else { // CSV
            const content = e.target.result.trim();
            if (!content) return;
            rows = content.split("\n").map(row => row.split(","));
        }

        const tableBodyEdit = document.querySelector("#edit tbody");
        tableBodyEdit.innerHTML = ""; // Clear existing rows
        
        // ตรวจสอบไฟล์ว่าง
        if (!rows.length) {
            hideLoadingSwal();
            Swal.fire("ไฟล์ว่างเปล่า", "ไฟล์ที่อัปโหลดไม่มีข้อมูล กรุณาเลือกไฟล์ที่มีข้อมูล", "warning");
            document.getElementById("displaySection").style.display = "none";
            showOrHideEditSection();
            return;
        }
        
        // ตรวจสอบว่ามีแค่ header หรือไม่มีข้อมูลจริง
        if (rows.length === 1) {
            hideLoadingSwal();
            Swal.fire("ไฟล์ว่างเปล่า", "ไฟล์มีเฉพาะหัวตารางเท่านั้น ไม่มีข้อมูล กรุณาเลือกไฟล์ที่มีข้อมูล", "warning");
            document.getElementById("displaySection").style.display = "none";
            showOrHideEditSection();
            return;
        }

        // Map header ชื่อจริงในไฟล์กับชื่อ column ในระบบ
        const fileHeaders = rows[0].map(h => headerMap[h.trim().toLowerCase()] || h.trim().toLowerCase());
        // สำหรับการอัปโหลดไฟล์ ใช้เฉพาะคอลัมน์ที่จำเป็น (ไม่รวม empcode และ name)
        const uploadColumns = ['datetime', 'type', 'qty', 'line_name', 'product_type'];
        rows.shift(); // Remove header row
        
        // ตรวจสอบว่าหลังจากลบ header แล้วยังมีข้อมูลหรือไม่
        if (rows.length === 0) {
            hideLoadingSwal();
            Swal.fire("ไฟล์ว่างเปล่า", "ไฟล์มีเฉพาะหัวตารางเท่านั้น ไม่มีข้อมูล กรุณาเลือกไฟล์ที่มีข้อมูล", "warning");
            document.getElementById("displaySection").style.display = "none";
            showOrHideEditSection();
            return;
        }
        
        // ตรวจสอบว่ามีแถวที่มีข้อมูลจริงหรือไม่ (ไม่ใช่แถวว่างทั้งหมด)
        const hasValidData = rows.some(row => {
            return row.some(cell => cell && String(cell).trim() !== "");
        });
        
        if (!hasValidData) {
            hideLoadingSwal();
            Swal.fire("ไฟล์ว่างเปล่า", "ไฟล์ไม่มีข้อมูลที่ใช้งานได้ กรุณาเลือกไฟล์ที่มีข้อมูล", "warning");
            document.getElementById("displaySection").style.display = "none";
            showOrHideEditSection();
            return;
        }

        let rowNum = 1;
        rows.forEach(row => {
            // กรองแถวที่ว่างจริงๆ (ทุก cell ว่าง)
            if (row.every(cell => !cell || String(cell).trim() === "")) return;

            const newRow = document.createElement("tr");
            newRow.dataset.createType = document.getElementById('check')?.checked ? "1" : "0";
            const numCell = document.createElement("td");
            numCell.textContent = rowNum++;
            newRow.appendChild(numCell);

            uploadColumns.forEach((col) => {
                // หา index ของ header ในไฟล์ที่ตรงกับ col
                let fileIdx = fileHeaders.findIndex(h => h === col.toLowerCase());
                let cellValue = fileIdx !== -1 && row[fileIdx] !== undefined ? String(row[fileIdx]).trim() : "";
                if (col === 'datetime') {
                    cellValue = convertDate(cellValue);
                } else if (col === 'qty') {
                    // แปลง qty เป็น 0 ถ้าเป็น null หรือค่าว่าง
                    if (!cellValue || cellValue === 'null' || cellValue === '') {
                        cellValue = '0';
                    } else {
                        cellValue = cellValue.replace(/[^0-9.]/g, "");
                        cellValue = formatDecimalNumber(cellValue);
                    }
                }
                const newCell = document.createElement("td");
                newCell.className = "inputConfig";
                newCell.textContent = cellValue;
                newCell.dataset.value = cellValue;
                newRow.appendChild(newCell);
            });

            tableBodyEdit.appendChild(newRow);
        });
        
        hideLoadingSwal();

        // ซ่อนคอลัมน์ empcode และ name เมื่ออัปโหลดไฟล์
        hideEmpcodeNameColumns();

        document.getElementById("displaySection").style.display = "";
        updateDisplay();
        if (displayContent) {
            if (wasCollapsed) {
                displayContent.classList.add('collapsed');
                $('#toggleDisplayButton').html('<img src="./assets/images/plus.png" alt="plus" style="width:18px;height:18px;vertical-align:middle;">');
            } else {
                displayContent.classList.remove('collapsed');
                $('#toggleDisplayButton').html('<img src="./assets/images/minus.png" alt="minus" style="width:18px;height:18px;vertical-align:middle;">');
            }
        }
        showOrHideEditSection();
    };

    if (isExcel) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
}
function addRow() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const Columns = window.globalColumns || [];

    const newRowEdit = document.createElement("tr");
    newRowEdit.dataset.createType = document.getElementById('check')?.checked ? "1" : "0";
    
    const numCell = document.createElement("td");
    const rowNum = tableBodyEdit.children.length + 1;
    numCell.textContent = rowNum;
    newRowEdit.appendChild(numCell);

    Columns.forEach((column) => {
        const newCellEdit = document.createElement("td");
        // Always create inputs/selects for new rows
        if (column === 'create_type') {
            const select = document.createElement("select");
            select.name = column + "[]";
            select.className = "inputConfig";
        
            ["0", "1"].forEach(val => {
                const option = document.createElement("option");
                option.value = val;
                option.textContent = val;
                select.appendChild(option);
            });
            newCellEdit.appendChild(select);
        } else if (column === 'qty') {
            const input = createInput(column, "Enter quantity");
            input.className = "inputConfig";
            // input.disabled = true; 
            input.addEventListener("input", function () {
                input.value = input.value.replace(/[^0-9.]/g, "");
            });
            addArrowNavigation(input, tableBodyEdit);
            newCellEdit.appendChild(input);
        } else if (column === 'type') {
            const select = document.createElement("select");
            select.name = column + "[]";
            select.className = "inputConfig";
            // select.disabled = true; 
            ["Input", "Output", "Out"].forEach(optionValue => {
                const option = document.createElement("option");
                option.value = optionValue;
                option.textContent = optionValue;
                select.appendChild(option);
            });

            addArrowNavigation(select, tableBodyEdit);
            newCellEdit.appendChild(select);
        } else if (column === 'datetime') {
            const input = createInput(column, "DD/MM/YYYY");
            input.className = "inputConfig";
            // input.disabled = true; 
            addArrowNavigation(input, tableBodyEdit);
            newCellEdit.appendChild(input);
        } else if (column === 'empno') {
            // สร้าง input สำหรับ empcode
            const input = createInput('empcode', "Enter employee code");
            input.className = "inputConfig";
            input.addEventListener("input", function () {
                input.value = input.value.replace(/[^0-9]/g, "");
            });
            addArrowNavigation(input, tableBodyEdit);
            newCellEdit.appendChild(input);
            newRowEdit.appendChild(newCellEdit);
            
            // สร้างคอลัมน์ name_eng (ไม่แก้ไขได้)
            const nameCell = document.createElement("td");
            nameCell.className = "inputConfig";
            nameCell.textContent = "";
            nameCell.dataset.value = "";
            nameCell.style.backgroundColor = "#f8f9fa"; // สีเทาอ่อนแสดงว่าไม่แก้ไขได้
            newRowEdit.appendChild(nameCell);
            return; // ออกจาก loop เพื่อไม่ให้ append empcode cell อีกครั้ง
        } else {
            const input = createInput(column, `Enter ${column}`);
            input.className = "inputConfig";
            // input.disabled = true; 
            addArrowNavigation(input, tableBodyEdit);
            newCellEdit.appendChild(input);
        }

        newRowEdit.appendChild(newCellEdit);
    });

    tableBodyEdit.appendChild(newRowEdit);

    if ($('#displayContent').hasClass('collapsed')) {
        $('#displayContent').removeClass('collapsed');
        $('#toggleDisplayButton').html('<img src="./assets/images/minus.png" alt="minus" style="width:18px;height:18px;vertical-align:middle;">');
    }
    updateDisplay(); 
    updateSeparators(); 
    showOrHideEditSection();
}
function edit() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
    const columns = window.globalColumns || [];
    rows.forEach(row => {
        const tds = Array.from(row.querySelectorAll("td")).slice(1); // ข้ามลำดับ
        let columnIndex = 0; // ใช้ index แยกต่างหาก
        
        tds.forEach((td, tdIndex) => {
            if (!td.querySelector('input, select')) {
                const value = td.dataset.value || td.textContent.trim();
                const currentColumn = columns[columnIndex];
                
                if (currentColumn === 'datetime') {
                    const input = createInput('datetime', "DD/MM/YYYY");
                    input.value = value;
                    td.innerHTML = '';
                    td.appendChild(input);
                } else if (currentColumn === 'type') {
                    const select = document.createElement("select");
                    select.name = "type[]";
                    select.className = "inputConfig";
                    ["Input", "Output", "Out"].forEach(optionValue => {
                        const option = document.createElement("option");
                        option.value = optionValue;
                        option.textContent = optionValue;
                        select.appendChild(option);
                    });
                    select.value = value;
                    td.innerHTML = '';
                    td.appendChild(select);
                } else if (currentColumn === 'qty') {
                    const input = createInput('qty', "Enter quantity");
                    input.value = value;
                    input.addEventListener("input", function () {
                        input.value = input.value.replace(/[^0-9.]/g, "");
                    });
                    td.innerHTML = '';
                    td.appendChild(input);
                } else if (currentColumn === 'line_name') {
                    const input = createInput('line_name', "Enter line");
                    input.value = value;
                    td.innerHTML = '';
                    td.appendChild(input);
                } else if (currentColumn === 'product_type') {
                    const input = createInput('product_type', "Enter product");
                    input.value = value;
                    td.innerHTML = '';
                    td.appendChild(input);
                } else if (currentColumn === 'empno') {
                    // สำหรับ empcode (คอลัมน์แรก) - แก้ไขได้
                    const input = createInput('empcode', "Enter employee code");
                    input.value = value;
                    input.addEventListener("input", function () {
                        input.value = input.value.replace(/[^0-9]/g, "");
                    });
                    td.innerHTML = '';
                    td.appendChild(input);
                    // ข้ามคอลัมน์ name_eng (ไม่แก้ไขได้)
                    columnIndex++; // เพิ่ม index เพื่อข้ามคอลัมน์ name_eng
                    return; // ออกจาก loop นี้
                }
                td.classList.add('inputConfig');
            }
            columnIndex++; // เพิ่ม index สำหรับคอลัมน์ถัดไป
        });
        // ลบปุ่มลบแถวถ้ามี
        const delBtn = row.querySelector('.delete-row-btn');
        if (delBtn) {
            delBtn.parentElement.remove();
        }
    });

    const img = $('<img>', {
        src: './assets/images/save.png',
        alt: 'edit',
        style: 'width: 18px; height: 18px; vertical-align: middle;'});
    $('#toggleEditButton').empty().append(img).append(' Save').attr('onclick', 'saveEdit()');
}
function saveEdit() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
    const columns = window.globalColumns || [];

    // จำสถานะ collapsed
    const displayContent = document.getElementById('displayContent');
    const wasCollapsed = displayContent && displayContent.classList.contains('collapsed');

    rows.forEach(row => {
        // ลบคอลัมน์ปุ่มลบ (ถ้ามี)
        const delBtn = row.querySelector('.delete-row-btn');
        if (delBtn) {
            delBtn.parentElement.remove();
        }
        const tds = Array.from(row.querySelectorAll("td")).slice(1);
        let columnIndex = 0; // ใช้ index แยกต่างหาก
        
        tds.forEach((td, tdIndex) => {
            let value = "";
            const input = td.querySelector('input, select');
            const currentColumn = columns[columnIndex];
            
            if (input) {
                value = input.tagName === 'SELECT'
                    ? (input.options[input.selectedIndex]?.text || input.value)
                    : input.value;
            } else {
                value = td.dataset.value || td.textContent.trim();
            }
            
            if (currentColumn === 'qty' && value) {
                value = formatDecimalNumber(value);
            }
            
            // สำหรับ empno: เก็บค่า empcode และข้าม name_eng
            if (currentColumn === 'empno') {
                td.innerHTML = value;
                td.dataset.value = value;
                td.classList.add('inputConfig');
                columnIndex++; // ข้ามคอลัมน์ name_eng
                return; // ออกจาก loop นี้
            }
            
            td.innerHTML = value;
            td.dataset.value = value;
            td.classList.add('inputConfig');
            columnIndex++; // เพิ่ม index สำหรับคอลัมน์ถัดไป
        });
    });

    // ลบหัวตารางว่าง (ถ้ามี) - ปรับให้รองรับ 8 คอลัมน์ (No. + 7 คอลัมน์ข้อมูล)
    const thead = document.querySelector("#edit thead tr");
    if (thead && thead.children.length > 8) {
        thead.lastElementChild.remove();
    }

    const img = $('<img>', {
        src: './assets/images/edit.png',
        alt: 'edit',
        style: 'width: 18px; height: 18px; vertical-align: middle;'});
    $('#toggleEditButton').empty().append(img).append(' Edit').attr('onclick', 'edit()');
    updateDisplay();

    // คืนสถานะ collapsed เดิม
    if (displayContent) {
        if (wasCollapsed) {
            displayContent.classList.add('collapsed');
            $('#toggleDisplayButton').html('<img src="./assets/images/plus.png" alt="plus" style="width:18px;height:18px;vertical-align:middle;">');
        } else {
            displayContent.classList.remove('collapsed');
            $('#toggleDisplayButton').html('<img src="./assets/images/minus.png" alt="minus" style="width:18px;height:18px;vertical-align:middle;">');
        }
    }
}
// ================================================================
// 6.Loading
// ================================================================
function showLoadingSwal(text = "กำลังดำเนินการ...") {
    Swal.fire({
        title: text,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}
function hideLoadingSwal() {
    Swal.close();
}

// ฟังก์ชันซ่อนคอลัมน์ empcode และ name
function hideEmpcodeNameColumns() {
    const thead = document.querySelector("#edit thead tr");
    if (thead) {
        const empcodeHeader = thead.children[6]; // คอลัมน์ที่ 7 (empcode)
        const nameHeader = thead.children[7]; // คอลัมน์ที่ 8 (name)
        if (empcodeHeader) empcodeHeader.style.display = "none";
        if (nameHeader) nameHeader.style.display = "none";
    }
    
    const tableBodyEdit = document.querySelector("#edit tbody");
    const allRows = tableBodyEdit.querySelectorAll("tr");
    allRows.forEach(row => {
        const empcodeCell = row.children[6]; // คอลัมน์ที่ 7 (empcode)
        const nameCell = row.children[7]; // คอลัมน์ที่ 8 (name)
        if (empcodeCell) empcodeCell.style.display = "none";
        if (nameCell) nameCell.style.display = "none";
    });
}

// ฟังก์ชันแสดงคอลัมน์ empcode และ name
function showEmpcodeNameColumns() {
    const thead = document.querySelector("#edit thead tr");
    if (thead) {
        const empcodeHeader = thead.children[6]; // คอลัมน์ที่ 7 (empcode)
        const nameHeader = thead.children[7]; // คอลัมน์ที่ 8 (name)
        if (empcodeHeader) empcodeHeader.style.display = "";
        if (nameHeader) nameHeader.style.display = "";
    }
    
    const tableBodyEdit = document.querySelector("#edit tbody");
    const allRows = tableBodyEdit.querySelectorAll("tr");
    allRows.forEach(row => {
        const empcodeCell = row.children[6]; // คอลัมน์ที่ 7 (empcode)
        const nameCell = row.children[7]; // คอลัมน์ที่ 8 (name)
        if (empcodeCell) empcodeCell.style.display = "";
        if (nameCell) nameCell.style.display = "";
    });
}
