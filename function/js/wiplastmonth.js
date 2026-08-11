// ================================================================
// 1.Setting
// ================================================================
document.addEventListener("DOMContentLoaded", function () {
    const csvFileInput = document.getElementById("csvFileInput");
    if (csvFileInput) {
        csvFileInput.addEventListener("change", handleFileUpload);
    }
});
$(document).ready(function () {
    function setModeByCheckbox() {
        if ($('#modeSwitch').is(':checked')) {
            // โหมดอัพเดท
            $('#updateControls').removeClass('hide').addClass('show');
            $('#insertControls').removeClass('show').addClass('hide');
            $('#updateButtons').removeClass('hide').addClass('show');
            // Show .row-keep when in "อัพเดท" mode
            $('.row-keep').addClass('show-content');
        } else {
            // โหมดแทรก
            $('#updateControls').removeClass('show').addClass('hide');
            $('#insertControls').removeClass('hide').addClass('show');
            $('#updateButtons').removeClass('show').addClass('hide');
            // Hide .row-keep when in "แทรก" mode
            $('.row-keep').removeClass('show-content');
        }
    }
    $('#modeSwitch').on('change', setModeByCheckbox);
    setModeByCheckbox();
    updateSeparators();
    
    
    let isEditMode = false;
    $('#toggleEditBtn').on('click', function () {
        isEditMode = !isEditMode;
        $('#edit tbody input, #edit tbody select').prop('disabled', !isEditMode);
    });
    createInitialRows();
});
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
    const parts = dateString.split("/");
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    return null;
}
function convertDate(dateString) {
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
    return isNaN(num) ? value : num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}
function updateRowNumbers() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    Array.from(tableBodyEdit.children).forEach((tr, idx) => {
        const numCell = tr.querySelector("td:first-child");
        if (numCell) numCell.textContent = idx + 1;
    });
}
function focusMonthYearInput() {
    setTimeout(() => {
        const monthYearInput = document.querySelector("#edit tbody tr:first-child td:nth-child(2) input");
        if (monthYearInput) monthYearInput.focus();
    }, 100); // เพิ่ม delay เพื่อให้ DOM สร้าง input เสร็จ
}
// ================================================================
// 3.UI/DOM
// ================================================================
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
    const editSection = document.getElementById("editSection");
    const separatorMain = document.getElementById("separator");
    const separatorClearDisplay = document.getElementById("separator-clear-display");
    // ตรวจสอบว่ามี element อยู่จริงก่อนเข้าถึง classList
    if (clearSection  && separatorClearDisplay) {
        if (!clearSection.classList.contains("hidden")) {
            separatorClearDisplay.classList.remove("hidden");
        } else {
            separatorClearDisplay.classList.add("hidden");
        }
    }

    if (editSection && separatorMain) {
        if (!editSection.classList.contains("hidden")) {
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
function cellToInput(cell, column, value) {
    if (column === 'month_year' || column === 'MONTH_YEAR') {
        const input = document.createElement("input");
        input.type = "text";
        input.value = value;
        input.placeholder = "MM/YYYY";
        input.pattern = "\\d{2}/\\d{4}";
        input.maxLength = 7;
        input.addEventListener("input", function () {
            let v = input.value.replace(/[^\d]/g, "");
            if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2,6);
            input.value = v;
        });
        cell.appendChild(input);
    } else if (column === 'product_type' || column === 'PRODUCT_TYPE') {
        // สร้าง dropdown
        const select = document.createElement("select");
        // เพิ่ม option ว่าง
        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "เลือก Product";
        emptyOption.disabled = true;
        emptyOption.selected = true;
        select.appendChild(emptyOption);

        // ใช้ window.validProductTypes ที่ได้จาก PHP
        if (window.validProductTypes) {
            window.validProductTypes.forEach(opt => {
                if (!opt.trim()) return;
                const option = document.createElement("option");
                option.value = opt.trim();
                option.textContent = opt.trim();
                if (opt.trim() === value) {
                    option.selected = true;
                    emptyOption.selected = false; // <<== เพิ่มบรรทัดนี้
                }
                select.appendChild(option);
            });
        }
        cell.appendChild(select);
    } else {
        const input = document.createElement("input");
        input.type = "text";
        input.value = value;
        cell.appendChild(input);
    }
}
function syncRowInputs() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const rows = tableBodyEdit.querySelectorAll("tr");
    if (rows.length < 2) return;

    // WIP Last Month = index 1, Product = index 2 (ข้ามลำดับ)
    const row1Inputs = rows[0].querySelectorAll('input, select');
    const row2Inputs = rows[1].querySelectorAll('input, select');

    // sync WIP Last Month (index 0)
    row1Inputs[0].addEventListener('input', function() {
        row2Inputs[0].value = this.value;
        // trigger input event ถ้าต้องการให้ event อื่นทำงานด้วย
        row2Inputs[0].dispatchEvent(new Event('input'));
    });

    // sync Product (index 1)
    row1Inputs[1].addEventListener('input', function() {
        row2Inputs[1].value = this.value;
        row2Inputs[1].dispatchEvent(new Event('input'));
    });
}
function createInitialRows(productTypeValue = "") {
    const tableBodyEdit = document.querySelector("#edit tbody");
    tableBodyEdit.innerHTML = "";
    const columns = ['month_year', 'product_type', 'wip_qty'];
    const newRow = document.createElement("tr");
    const numCell = document.createElement("td");
    numCell.textContent = 1;
    newRow.appendChild(numCell);
    columns.forEach((column) => {
        const newCell = document.createElement("td");
        newCell.className = "inputConfig";
        if (column === 'product_type') {
            cellToInput(newCell, column, productTypeValue);
        } else {
            cellToInput(newCell, column, "");
        }
        newRow.appendChild(newCell);
    });
    tableBodyEdit.appendChild(newRow);
    updateRowNumbers();

    // เพิ่มระบบ Enter เพื่อเรียก handleInsert หรือ updateData ตามโหมด
    const inputs = tableBodyEdit.querySelectorAll("input, select");
    inputs.forEach(input => {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                if ($('#modeSwitch').is(':checked')) {
                    updateData();
                } else {
                    handleInsert();
                }
            }
        });
    });
}
// ================================================================
// 4.Vallidate
// ================================================================
function validateRows() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
    const errors = [];
    rows.forEach((row, idx) => {
        const tds = Array.from(row.querySelectorAll("td")).slice(1); // Skip sequence number
        const values = tds.map(td => {
            const input = td.querySelector('input, select');
            return input ? input.value.trim() : td.textContent.trim();
        });
        const productType = values[1];
        const dateValue = values[0];

        // ตรวจสอบ product type
        if (!productType || productType === "") {
            errors.push(`กรุณาเลือก Product`);
        } else if (window.validProductTypes && !window.validProductTypes.includes(productType)) {
            errors.push(`Product Type "${productType}" ไม่ถูกต้อง`);
        }
        // ตรวจสอบ MM/YYYY
        if (dateValue) {
            if (!/^\d{2}\/\d{4}$/.test(dateValue)) {
                errors.push(`รูปแบบเดือน/ปีไม่ถูกต้อง (ควรเป็น MM/YYYY)`);
            } else {
                const [mm, yyyy] = dateValue.split("/");
                const month = parseInt(mm, 10);
                if (isNaN(month) || month < 1 || month > 12) {
                    errors.push(`เดือน "${mm}" ไม่ถูกต้อง (ควรเป็น 01-12)`);
                }
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
    Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ใช่, บันทึกข้อมูล!",
        cancelButtonText: "ยกเลิก"
    }).then((result) => {
        if (!result.isConfirmed) return;

        showLoadingSwal();

        const tableBodyEdit = document.querySelector("#edit tbody");
        const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
        const columns = ['MONTH_YEAR', 'PRODUCT_TYPE', 'WIP_QTY'];

        const data = rows.map(row => {
            const tds = Array.from(row.querySelectorAll("td")).slice(1);
            const rowData = {};
            tds.forEach((td, idx) => {
                const column = columns[idx];
                if (!column) return;
                let value = '';
                const input = td.querySelector('input, select');
                if (input) {
                    value = input.value;
                } else {
                    value = td.textContent.trim();
                }
                if (column === 'MONTH_YEAR' && value.match(/^\d{2}\/\d{4}$/)) {
                    value = "01/" + value;
                }
                if (column === 'WIP_QTY' && value) {
                    value = value.replace(/,/g, "");
                }
                rowData[column] = value;
            });
            return rowData;
        });
        fetch("./function/WIP/insertWIP.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data })
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
                const productInput = document.querySelector("#edit tbody tr:first-child td:nth-child(3) select");
                const productTypeValue = productInput ? productInput.value : "";
                Swal.fire({
                    icon: 'success',
                    title: 'เสร็จสิ้น!',
                    text: 'จัดการข้อมูลเป็นที่เรียบร้อย'
                }).then(() => {
                    createInitialRows(productTypeValue);
                    setTimeout(focusMonthYearInput, 150);
                });
            } else {
                Swal.fire("ไม่สำเร็จ", "ไม่สามารถบันทึกข้อมูลได้", "error");
            }
        })
        .catch(error => {
            hideLoadingSwal();
            Swal.fire("ไม่สำเร็จ", "เกิดปัญหาในการเพิ่มข้อมูลเข้าไปในฐานข้อมูล", "error");
        });
    });
}
function updateData() {
    const errors = validateRows();
    if (errors.length > 0) {
        Swal.fire("พบข้อมูลไม่ถูกต้อง", errors.join('<br>'), "error");
        return;
    }

    Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "ข้อมูลที่ตรงกับในตารางจะถูกอัพเดททั้งหมด",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ใช่, อัพเดทข้อมูล!",
        cancelButtonText: "ยกเลิก"
    }).then((result) => {
        if (!result.isConfirmed) return;

        showLoadingSwal();

        const tableBodyEdit = document.querySelector("#edit tbody");
        const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
        const columns = ['MONTH_YEAR', 'PRODUCT_TYPE', 'WIP_QTY'];

        const data = rows.map(row => {
            const tds = Array.from(row.querySelectorAll("td")).slice(1);
            const rowData = {};
            tds.forEach((td, idx) => {
                const column = columns[idx];
                let value = '';
                const input = td.querySelector('input, select');
                if (input) {
                    value = input.value;
                } else {
                    value = td.textContent.trim();
                }
                if (column === 'MONTH_YEAR' && value.match(/^\d{2}\/\d{4}$/)) {
                    value = "01/" + value;
                }
                if (column === 'WIP_QTY' && value) {
                    value = value.replace(/,/g, "");
                }
                rowData[column] = value;
            });
            return rowData;
        });

        fetch("./function/WIP/updateWIP.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data })
        })
        .then(response => response.json())
        .then(result => {
            hideLoadingSwal();
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'เสร็จสิ้น!',
                    text: 'จัดการข้อมูลเป็นที่เรียบร้อย'
                }).then(() => {
                    createInitialRows();
                    setTimeout(focusMonthYearInput, 150);
                });
            } else {
                Swal.fire("ไม่สำเร็จ", result.error || "ข้อมูลบางแถวไม่สามารถอัพเดทได้", "error");
            }
        })
        .catch(error => {
            hideLoadingSwal();
            Swal.fire("ไม่สำเร็จ", "เกิดปัญหาขณะอัพเดทฐานข้อมูล", "error");
        });
    });
}
function loadData() {
    const month = $('#monthFilter').val();
    const year = $('#yearFilter').val();
    const productType = $('#productTypeFilter').val(); 

    showLoadingSwal("กำลังโหลดข้อมูล...");
    $.ajax({
        url: 'function/WIP/loadDataWIP.php',
        method: 'POST',
        data: {
            month: month,
            year: year,
            product_type: productType,
        },
        dataType: 'json',
        success: function(response) {
            hideLoadingSwal();
            const tableBodyEdit = document.querySelector("#edit tbody");
            tableBodyEdit.innerHTML = "";
            const validColumns = ['month_year', 'product_type', 'wip_qty'];
            window.globalColumns = validColumns;
            let rowNum = 1;

            if (!response.success || !Array.isArray(response.data) || response.data.length === 0) {
                createInitialRows();
                return;
            }

            response.data.forEach(row => {
                const newRow = document.createElement("tr");
                const numCell = document.createElement("td");
                numCell.textContent = rowNum++;
                newRow.appendChild(numCell);
                validColumns.forEach((column) => {
                    const newCell = document.createElement("td");
                    newCell.className = "inputConfig";
                    let value = row[column] ?? row[column.toUpperCase()] ?? "";
                    cellToInput(newCell, column, value);
                    newRow.appendChild(newCell);
                });
                tableBodyEdit.appendChild(newRow);
            });
            updateRowNumbers();
            $('#edit tbody tr').each(function () {
                $(this).find('input, select').each(function (i) {
                    if (i !== 2) {
                        $(this).prop('disabled', true);
                    } else {
                        $(this).prop('disabled', false);
                    }
                });
            });
        },
        error: function() {
            hideLoadingSwal();
            Swal.fire("ไม่สำเร็จ", "เกิดข้อผิดพลาดขณะโหลดข้อมูล", "error");
        }
    });
}
function deleteData() {
    const tableBodyEdit = document.querySelector("#edit tbody");
    const rows = Array.from(tableBodyEdit.querySelectorAll("tr"));
    const columns = ['MONTH_YEAR', 'PRODUCT_TYPE', 'WIP_QTY'];

    if (rows.length === 0) {
        Swal.fire("ไม่มีข้อมูล", "ไม่มีข้อมูลในตารางให้ลบ", "warning");
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
                let value = '';
                const input = td.querySelector('input, select');
                if (input) {
                    value = input.value;
                } else {
                    value = td.textContent.trim();
                }
                if (column === 'MONTH_YEAR' && value.match(/^\d{2}\/\d{4}$/)) {
                    value = "01/" + value;
                }
                rowData[column] = value;
            });
            return rowData;
        });

        fetch("./function/WIP/deleteWIP.php", {
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
    $('#productTypeFilter').val('');
    $('#edit tbody input, #edit tbody select').prop('disabled', true);
    createInitialRows();
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