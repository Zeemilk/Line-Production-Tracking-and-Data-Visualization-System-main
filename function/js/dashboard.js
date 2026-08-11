// ================================================================
// 1.Setting
// ================================================================
function ShowSection(index) {
    // ซ่อนทุก section
    document.querySelectorAll('.mainContentDashboard').forEach(el => el.style.display = 'none');
    // โชว์เฉพาะ section ที่เลือก
    const sections = document.querySelectorAll('.mainContentDashboard');
    if (sections[index]) {
        sections[index].style.display = '';

        // Adjust DataTables columns ใน section ที่เพิ่งโชว์
        $(sections[index]).find('table.display').each(function() {
            if ($.fn.DataTable.isDataTable(this)) {
                $(this).DataTable().columns.adjust();
            }
        });
    }

    // --- เพิ่มส่วนนี้: แสดง tab-filter ตาม radio ที่เลือก ---
    const tabNames = [
        'monitor',
        'InputDetail',
        'WIPDetails',
        'OutputDetail',
        'StatusMachine',
        'MachineLoss',
        'SummaryDetails'
    ];
    document.querySelectorAll('.tab-filter').forEach(el => el.classList.remove('active'));
    if (tabNames[index]) {
        document.querySelectorAll(`.tab-filter[data-tab="${tabNames[index]}"]`).forEach(el => el.classList.add('active'));
    }
    // โชว์ div id="navbar-tab-filters" เสมอ
    document.querySelectorAll('#navbar-tab-filters').forEach(el => el.style.display = '');
}
function SetupSection() {
    const radios = document.querySelectorAll('.radio-inputs input[type="radio"]');
    radios.forEach((radio, idx) => {
        radio.addEventListener('change', function() {
            if (this.checked) ShowSection(idx);
        });
    });
    // --- แก้ไขตรงนี้: โชว์ section ตาม radio ที่ checked จริง ไม่บังคับ section 0 ---
    const checkedIdx = Array.from(radios).findIndex(r => r.checked);
    if (checkedIdx >= 0) {
        ShowSection(checkedIdx);
    }
}
function UpdateNavbar() {
    const productType = document.getElementById('productTypeFilter')?.value;
    const navbar = document.getElementById('main-navbar');
    if (productType) {
        // กลับไปเป็น hover ถึงจะกาง
        navbar.style.transform = '';
        navbar.style.transition = '';
    } else {
        // กางออกตลอด
        navbar.style.transform = 'translateY(0%)';
        navbar.style.transition = 'none';
    }
}
// ตัวแปรสำหรับตรวจสอบว่าได้เรียก ResizeCharts() แล้วหรือยัง
let chartsResized = false;

function ResizeCharts() {
    // ถ้าเรียกไปแล้วให้ return ออกไป
    if (chartsResized) {
        return;
    }
    
    const chartIds = [
        'SummaryInputCircle', 'SummaryOutputCircle',
        'SummaryPlanChartInput', 'SummaryPlanChartOutput',
        'SummaryPartChartInput', 'SummaryPartChartOutput'
    ];
    
    chartIds.forEach(id => {
        const chart = window[id] || window.InputPlanDonutChart || window.OutputPlanDonutChart;
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });
    
    // Force chart update for better responsiveness
    setTimeout(() => {
        chartIds.forEach(id => {
            const chart = window[id] || window.InputPlanDonutChart || window.OutputPlanDonutChart;
            if (chart && typeof chart.update === 'function') {
                chart.update('none');
            }
        });
    }, 50);
    
    // ตั้งค่า flag ว่าเรียกไปแล้ว
    chartsResized = true;
}
function AdjustTableHeight() {
    const viewportHeight = window.innerHeight;
    const chartHeight = 45; // 45vh สำหรับ charts
    const margins = 15; // margins และ padding (vh)
    const maxTableHeight = viewportHeight * ((100 - chartHeight - margins) / 100);
    
    // หา DataTables scroll body
    const inputTableBody = document.querySelector('#SummaryDetailTableInput_wrapper .dataTables_scrollBody');
    const outputTableBody = document.querySelector('#SummaryDetailTableOutput_wrapper .dataTables_scrollBody');
    
    if (inputTableBody) {
        inputTableBody.style.maxHeight = maxTableHeight + 'px';
        inputTableBody.style.overflowY = 'auto';
    }
    
    if (outputTableBody) {
        outputTableBody.style.maxHeight = maxTableHeight + 'px';
        outputTableBody.style.overflowY = 'auto';
    }
    
    // ปรับขนาด charts หลังจากปรับตาราง
    setTimeout(() => {
        ResizeCharts();
    }, 100);
}
$(document).ready(function () {
    UpdateNavbar();
    document.getElementById('productTypeFilter')?.addEventListener('change', UpdateNavbar);
    
    // Add resize event listener for responsive charts
    window.addEventListener('resize', function() {
        // Resize all charts in InputDetail and OutputDetail sections
        const chartIds = [
            'SummaryInputCircle', 'SummaryOutputCircle',
            'SummaryPlanChartInput', 'SummaryPlanChartOutput',
            'SummaryPartChartInput', 'SummaryPartChartOutput'
        ];
        
        chartIds.forEach(id => {
            const chart = window[id] || window.InputPlanDonutChart || window.OutputPlanDonutChart;
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    });
    $("#dayInput").datepicker({
        dateFormat: "dd/mm/yy",
        onSelect: function() {
        UpdateMonitor()
        // โหลดข้อมูลทั้งหมดแบบ async และรอให้เสร็จก่อนเรียก renderAllInOutByCheckbox
        Promise.all([
            new Promise(resolve => {
                Monitor_Data();
                setTimeout(resolve, 500);
            }),
            new Promise(resolve => {
                WIP_Data();
                setTimeout(resolve, 500);
            }),
            new Promise(resolve => {
                Status_Data();
                setTimeout(resolve, 500);
            }),
            new Promise(resolve => {
                MCRecord_Data();
                setTimeout(resolve, 500);
            })
        ]).then(() => {
            setTimeout(() => {
                RenderData_Input();
                RenderData_Output();
            }, 200);
        });
        }
    });
    $('#partFilter').select2({
        width: '100%',
        placeholder: "Choose Part",
    });
    $('#lotFilter').select2({
        width: '100%',
        placeholder: "Choose lot",
    });
    $('#processFilter').select2({
        width: '100%',
        placeholder: "Choose process",

    });
    $('.radio-inputs').hide();
    $('.mainContentDashboard').hide();

    $('#dateFilter').on('change', function() {
        if (this.value === 'yesterday') {
            // โหลดข้อมูลทั้งหมดแบบ async และรอให้เสร็จก่อนเรียก RenderData_Input และ RenderData_Output
            Promise.all([
                new Promise(resolve => {
                    Monitor_Data();
                    setTimeout(resolve, 500);
                }),
                new Promise(resolve => {
                    WIP_Data();
                    setTimeout(resolve, 500);
                }),
                new Promise(resolve => {
                    Status_Data();
                    setTimeout(resolve, 500);
                }),
                new Promise(resolve => {
                    MCRecord_Data();
                    setTimeout(resolve, 500);
                })
            ]).then(() => {
                setTimeout(() => {
                    RenderData_Input();
                    RenderData_Output();
                }, 200);
            });
        }
    });

    $('#monthFilter').on('change', function() {
        if (this.value) {
            // โหลดข้อมูลทั้งหมดแบบ async และรอให้เสร็จก่อนเรียก RenderData_Input และ RenderData_Output
            Promise.all([
                new Promise(resolve => {
                    Monitor_Data();
                    setTimeout(resolve, 500);
                }),
                new Promise(resolve => {
                    WIP_Data();
                    setTimeout(resolve, 500);
                }),
                new Promise(resolve => {
                    Status_Data();
                    setTimeout(resolve, 500);
                }),
                new Promise(resolve => {
                    MCRecord_Data();
                    setTimeout(resolve, 500);
                })
            ]).then(() => {
                setTimeout(() => {
                    RenderData_Input();
                    RenderData_Output();
                }, 200);
            });
        }
    });

    $('#yearFilter').on('change', function() {
        if (this.value) {
            // โหลดข้อมูลทั้งหมดแบบ async และรอให้เสร็จก่อนเรียก RenderData_Input และ RenderData_Output
            Promise.all([
                new Promise(resolve => {
                    Monitor_Data();
                    setTimeout(resolve, 500);
                }),
                new Promise(resolve => {
                    WIP_Data();
                    setTimeout(resolve, 500);
                }),
                new Promise(resolve => {
                    Status_Data();
                    setTimeout(resolve, 500);
                }),
                new Promise(resolve => {
                    MCRecord_Data();
                    setTimeout(resolve, 500);
                })
            ]).then(() => {
                setTimeout(() => {
                    RenderData_Input();
                    RenderData_Output();
                }, 200);
            });
        }
    });
    
    $('#productTypeFilter').on('change', function() {
    UpdateMonitor();
    const productType = $('#productTypeFilter').val();
    // เงื่อนไขแสดง Special-text
    let fullText = '';
    if (productType === 'MAOPN' || productType === 'MAOPNOS3' || productType === 'MAOPN&OS3') {
        fullText = 'Acc Input not count resort and test <br>Acc Output not count renew resort and test';
    } else if (productType === 'PIRSSR' || productType === 'PIRSSROS3' || productType === 'PIRSSR&OS3') {
        fullText = 'Acc Output not count resort';
    } else if (productType === 'CASE') {
        fullText = 'Acc Output not count renew repair and test';
    } else if (productType === 'DENSO24CY') {
        fullText = 'Acc Input not count repair and test <br>Acc Output not count renew repair and test';
    } else if (productType === 'AFSRT') {
        fullText = 'Acc Input not count test <br>Acc Output not count test';
    } else {
        fullText = 'Acc Input not count repair and test <br>Acc Output not count repair and test';
    }
    $('#Special-text-content').html('<h5>' + fullText + '</h5>');
    $('#Special-text').show();
    $('#Special-text-toggle').show().html('&#x25BC;');
    
    // เงื่อนไขแสดง MAOPN Special
    if (['MAOPN', 'MAOPNOS3', 'MAOPN&OS3'].includes(productType)) {
        $('#A1AccOutputCard').show();
        $('#A2AccOutputCard').show();
        $('#A3AccOutputCard').show();
    } else {
        $('#A1AccOutputCard').hide();
        $('#A2AccOutputCard').hide();
        $('#A3AccOutputCard').hide();
    }
    // เงื่อนไขแสดง DENSO24CY Special
    if (productType === 'DENSO24CY') {
        $('#1AAccOutputCard').show();
        $('#2AAccOutputCard').show();
        $('#3AAccOutputCard').show();
        $('#4AAccOutputCard').show();
    } else {
        $('#1AAccOutputCard').hide();
        $('#2AAccOutputCard').hide();
        $('#3AAccOutputCard').hide();
        $('#4AAccOutputCard').hide();
    }

    if (this.id === 'productTypeFilter') {
        updateLineFilterOptions();
    }

    Promise.all([
        Monitor_Data(),
        WIP_Data(),
        Status_Data(),
        MCRecord_Data()
    ]).then(() => {
        updateLineFilterOptions();
        setTimeout(() => {
            RenderData_Input();
            RenderData_Output();
        }, 200);
    });
    if (productType) {
            $('.radio-inputs').show();
            SetupSection();
        } else {
            $('.radio-inputs').hide();
            $('.mainContentDashboard').hide();
    }
    });

    let collapsed = true; 
    $('#Special-text-content').hide();

    $('#Special-text-toggle').on('click', function() {
        collapsed = !collapsed;
        if (collapsed) {
            $('#Special-text-content').hide();
            $(this).html('&#x25BC;');
        } else {
            $('#Special-text-content').show();
            $(this).html('&#x25B2;');
        }
    });

    $('#lineTypeFilter').on('change', function() {
        RenderData_OG();
    });

    $('#checkWIP').on('change', function() {
        RenderData_WIP();
    });
    $('#checkInOut').on('change', function() {
        RenderData_Input();
        RenderData_Output();
    });
    $('#partFilter, #lotFilter, #processFilter, #lineTypeFilterWIP, #statusFilter').on('change', function() {
        RenderData_WIP();
    });
    $('#typelotFilter').on('change', function() {
        RenderData_Input();
        RenderData_Output();
    });
    $('#lineTypeFilterMLT, #LossCodeFilter').on('change', function() {
        RenderData_MCRecord()
    });
    UpdateMonitor()
    if ($('#productTypeFilter').val()) {
        $('.radio-inputs').show();
        SetupSection();
    } else {
        $('.radio-inputs').hide();
        $('.mainContentDashboard').hide();
    }
});
document.addEventListener("DOMContentLoaded", function () {
        const dayFilterContainer = document.getElementById('dayFilterContainer');
        const monthFilterContainer = document.getElementById('monthFilterContainer');
        const yearFilterContainer = document.getElementById('yearFilterContainer');
        const dateFilter = document.getElementById('dateFilter');
        const dayInput = document.getElementById('dayInput');
        const monthFilter = document.getElementById('monthFilter');
        const yearFilter = document.getElementById('yearFilter');
        handleDateFilterChange();
    
    function handleDateFilterChange() {
            const selectedValue = dateFilter.value;
            // Hide all containers initially
            dayFilterContainer.style.display = 'none';
            monthFilterContainer.style.display = 'none';
            yearFilterContainer.style.display = 'none';
    
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
    
            switch (selectedValue) {
                case 'yesterday':
                    dayFilterContainer.style.display = 'block';
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    // set เป็น dd/mm/yyyy
                    const dd = String(yesterday.getDate()).padStart(2, '0');
                    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
                    const yyyy = yesterday.getFullYear();
                    dayInput.value = `${dd}/${mm}/${yyyy}`;
                    dayInput.readOnly = true;
                    break;
                case 'day':
                    dayFilterContainer.style.display = 'block';
                    dayInput.value = '';
                    dayInput.readOnly = false;
                    dayInput.focus();
                    $("#dayInput").datepicker({
                        dateFormat: "dd/mm/yy",
                        onSelect: function() {
                                
                        }
                    });
                    break;
                case 'month':
                    monthFilterContainer.style.display = 'block';
                    populateMonthFilter();
                    break;
                case 'year':
                    yearFilterContainer.style.display = 'block';
                    populateYearFilter();
                    break;
                default:
                    break;
            }
            if (selectedValue !== 'day' && selectedValue !== 'month' && selectedValue !== 'year') {
                
            }

        }
    
        function populateMonthFilter() {
            monthFilter.innerHTML = ''; // Clear previous options
            const today = new Date();
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Choose Month';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            monthFilter.appendChild(defaultOption);
    
            for (let i = 0; i < 6; i++) { // 6 months including current month
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthName = d.toLocaleString('en-EN', { month: 'long' }); // Thai month name
                const year = d.getFullYear() + 543; // Buddhist calendar year (B.E.)
    
                const option = document.createElement('option');
                option.value = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                option.textContent = `${monthName} ${year}`;
                monthFilter.appendChild(option);
            }
        }
    
        function populateYearFilter() {
            yearFilter.innerHTML = ''; // ลบเนื้อหาทั้งหมด
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Choose Year';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            yearFilter.appendChild(defaultOption);

            let periods = [];
            // กำหนดช่วงเวลา F1 และ F2
            if (currentMonth >= 4 && currentMonth <= 9) { // Apr-Sep is F1
                periods.push({ year: currentYear, type: 'F1' });
                periods.push({ year: currentYear - 1, type: 'F2' });
            } else { // Oct-Mar is F2
                periods.push({ year: currentMonth >= 1 && currentMonth <= 3 ? currentYear - 1 : currentYear, type: 'F2' });
                periods.push({ year: currentMonth >= 1 && currentMonth <= 3 ? currentYear - 1 : currentYear, type: 'F1' });
            }

            periods.forEach(p => {
                const yearSuffix = (p.year % 100).toString().padStart(2, '0');
                const option = document.createElement('option');
                option.value = `${p.year}${p.type}`;
                option.textContent = `${yearSuffix}${p.type}`;
                yearFilter.appendChild(option);
            });

            const moreOption = document.createElement('option');
            moreOption.value = 'more';
            moreOption.textContent = 'More';
            yearFilter.appendChild(moreOption);
        }
    
        window.handleMonthChange = function() {
            console.log("Selected Month:", monthFilter.value);
        }
     
        window.handleYearChange = function() {
            const selectedYearOption = yearFilter.value;

            if (selectedYearOption === 'more') {
                // ลบตัวเลือก 'More' ออกไป
                const moreOptionElement = yearFilter.querySelector("option[value='more']");
                if (moreOptionElement) {
                    moreOptionElement.remove();
                }

                const today = new Date();
                let oldestYearInSelect = today.getFullYear(); // เริ่มต้นปีปัจจุบัน

                const existingYears = new Set();
                for (let i = 0; i < yearFilter.options.length; i++) {
                    const optionValue = yearFilter.options[i].value;
                    const match = optionValue.match(/^(\d{4})[Ff][12]$/); // ตรวจสอบ F1 หรือ F2
                    if (match) {
                        existingYears.add(parseInt(match[1]));
                    }
                }

                if (existingYears.size > 0) {
                    oldestYearInSelect = Math.min(...Array.from(existingYears));
                }

                const startYearForMore = oldestYearInSelect - 1;

                // Generate options for the previous 5 years (from startYearForMore backwards)
                // For each year, add both F1 and F2 periods
                for (let i = 0; i < 5; i++) {
                    const year = startYearForMore - i;
                    const yearSuffix = (year % 100).toString().padStart(2, '0');

                    // เพิ่มช่วง F1 (เมษายน-กันยายน)
                    const optionF1 = document.createElement('option');
                    optionF1.value = `${year}F1`;
                    optionF1.textContent = `${yearSuffix}F1`;
                    yearFilter.appendChild(optionF1);

                    // เพิ่มช่วง F2 (ตุลาคม-ธันวาคม ของปีนั้น และมกราคม-มีนาคม ของปีถัดไป)
                    const optionF2 = document.createElement('option');
                    optionF2.value = `${year}F2`;
                    optionF2.textContent = `${yearSuffix}F2`;
                    yearFilter.appendChild(optionF2);
                }

                // เพิ่มตัวเลือก "Reduce" เพื่อย้อนกลับไปแสดงเฉพาะ 2 ตัวเลือกหลัก
                const reduceOption = document.createElement('option');
                reduceOption.value = 'reduce';
                reduceOption.textContent = 'Reduce';
                yearFilter.appendChild(reduceOption);

            } else if (selectedYearOption === 'reduce') {
                // หากเลือก "Reduce" ให้กลับไปแสดงแค่ 2 ตัวเลือกหลัก
                populateYearFilter();
            } else {
                console.log("Selected specific Year/Period:", selectedYearOption);
                // เพิ่ม logic สำหรับกรองตามปี/ช่วงที่เลือกที่นี่
            }
        }
        window.handleDateFilterChange = handleDateFilterChange;
        window.handleMonthChange = handleMonthChange;
        window.handleYearChange = handleYearChange; // Make handleYearChange globally accessible
});
window.addEventListener('resize', AdjustTableHeight);
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(AdjustTableHeight, 500);
});
// ================================================================
// 2.Filter
// ================================================================ 
function UpdateMonitor() {
    const productType = $('#productTypeFilter').val();
    if (!productType) {
        document.querySelectorAll('.mainContentDashboard').forEach(el => el.style.display = 'none');
        return;
    }
}
function FilterPlanRow( rows, { line, dateFilter, dayInput, monthFilter, yearFilter }, preferType = '1', fallbackType = '0', isAcc = false) {
    const tryFilter = (type) => rows.filter(row => {
        let ok = true;

        if (line && line !== 'all') {
            ok = ok && (row.LINE_NAME === line);
        }

        const d = new Date(row.DATETIME || row.datetime);

        if (isAcc && (dateFilter === 'yesterday' || dateFilter === 'day') && dayInput) {
            // กรองวันที่ 1 ถึง dayInput
            let inputDate;
            if (dayInput.includes('/')) {
                const parts = dayInput.split('/');
                inputDate = new Date(parts[2], parts[1] - 1, parts[0]);
            } else if (dayInput.includes('-')) {
                const parts = dayInput.split('-');
                inputDate = new Date(parts[0], parts[1] - 1, parts[2]);
            }
            const startDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
            ok = ok && (d >= startDate && d <= inputDate);
        } else if (dateFilter === 'yesterday') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            ok = ok && (
                d.getFullYear() === yesterday.getFullYear() &&
                d.getMonth() === yesterday.getMonth() &&
                d.getDate() === yesterday.getDate()
            );
        } else if (dateFilter === 'day' && dayInput) {
            let inputDate;
            if (dayInput.includes('/')) {
                const parts = dayInput.split('/');
                inputDate = new Date(parts[2], parts[1] - 1, parts[0]);
            } else if (dayInput.includes('-')) {
                const parts = dayInput.split('-');
                inputDate = new Date(parts[0], parts[1] - 1, parts[2]);
            }
            ok = ok && (
                d.getFullYear() === inputDate.getFullYear() &&
                d.getMonth() === inputDate.getMonth() &&
                d.getDate() === inputDate.getDate()
            );
        } else if (dateFilter === 'month' && monthFilter) {
            const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            ok = ok && (monthStr === monthFilter);
        } else if (dateFilter === 'year' && yearFilter) {
            const m = yearFilter.match(/^(\d{4})(F[12])$/i);
            if (m) {
                const year = parseInt(m[1]);
                const period = m[2].toUpperCase();
                if (period === 'F1') {
                    ok = ok && (d.getFullYear() === year && d.getMonth() + 1 >= 4 && d.getMonth() + 1 <= 9);
                } else {
                    ok = ok && (
                        (d.getFullYear() === year && d.getMonth() + 1 >= 10 && d.getMonth() + 1 <= 12) ||
                        (d.getFullYear() === year + 1 && d.getMonth() + 1 >= 1 && d.getMonth() + 1 <= 3)
                    );
                }
            }
        }

        ok = ok && (String(row.CREATE_TYPE || row.create_type) === type);
        return ok;
    });

    let result = tryFilter(preferType);
    if (result.length === 0) result = tryFilter(fallbackType);
    return result;
}
function Update_WIP_Filter(SubWIP) {
    const unique = (arr, key) => [...new Set(arr.map(row => row[key]).filter(v => v != null && v !== ''))];
    const makeOptions = (list) => ['<option value="all">All</option>']
        .concat(list.map(v => `<option value="${v}">${v}</option>`)).join('');

    // เก็บค่าที่เลือกไว้ก่อน
    const partVal = $('#partFilter').val();
    const lotVal = $('#lotFilter').val();
    const processVal = $('#processFilter').val();
    const statusVal = $('#statusFilter').val();

    $('#partFilter').html(makeOptions(unique(SubWIP, 'PARTNAME')));
    $('#lotFilter').html(makeOptions(unique(SubWIP, 'LOTNO')));
    $('#processFilter').html(makeOptions(unique(SubWIP, 'WIP_PROCESS_NAME')));
    $('#statusFilter').html(makeOptions(unique(SubWIP, 'LOT_STATUS')));

    // set กลับค่าที่เลือกไว้ ถ้ายังมีใน options
    if ($('#partFilter option[value="' + partVal + '"]').length) $('#partFilter').val(partVal);
    else $('#partFilter').val('all');
    if ($('#lotFilter option[value="' + lotVal + '"]').length) $('#lotFilter').val(lotVal);
    else $('#lotFilter').val('all');
    if ($('#processFilter option[value="' + processVal + '"]').length) $('#processFilter').val(processVal);
    else $('#processFilter').val('all');
    if ($('#statusFilter option[value="' + statusVal + '"]').length) $('#statusFilter').val(statusVal);
    else $('#statusFilter').val('all');

    // trigger change เพื่อให้ select2 อัปเดต UI
    $('#partFilter').trigger('change');
    $('#lotFilter').trigger('change');
    $('#processFilter').trigger('change');
    $('#statusFilter').trigger('change');
}
function Update_MCRecord_Filter(data) {
    const unique = (arr, key) => [...new Set(arr.map(row => row[key]).filter(v => v != null && v !== ''))];
    const makeOptions = (list) => ['<option value="all">All</option>']
        .concat(list.map(v => `<option value="${v}">${v}</option>`)).join('');

    const lineList = unique(data, 'LINE').sort();
    const lossCodeList = unique(data, 'LOSSCODE').sort();

    $('#lineTypeFilterMLT').html(makeOptions(lineList));
    $('#LossCodeFilter').html(makeOptions(lossCodeList));
}
// ================================================================
// 3.Data
// ================================================================ 
function Monitor_Data() {
    const productType = $('#productTypeFilter').val();
    const dateFilter = $('#dateFilter').val();
    let dayInput = $('#dayInput').val();
    const monthFilter = $('#monthFilter').val();
    const yearFilter = $('#yearFilter').val();

    window.allOGRows = [];
    window.allPlanRows = [];
    window.Wip = 0;

    if (dateFilter === 'day' && dayInput) {
        const parts = dayInput.split('/');
        if (parts.length === 3) {
            let year = parts[2];
            if (year.length === 2) {
                year = '20' + year;
            }
            dayInput = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }

    const formData = new FormData();
    formData.append('productType', productType);
    formData.append('dateFilter', dateFilter);
    formData.append('dayInput', dayInput);
    formData.append('monthFilter', monthFilter);
    formData.append('yearFilter', yearFilter);
    Monitor({});

    return fetch('./function/Dashboard/Data_Monitors.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        window.allOGRows = data.OGData || [];
        window.allPlanRows = data.PlanData || [];
        window.Wip = data.WIPData || 0;
        window.allInputRows = data.InputData || [];

        let createType = '';
        if (Array.isArray(data.PlanData) && data.PlanData.length > 0) {
            createType = data.PlanData[0].CREATE_TYPE;
        }
        document.getElementById('CreateTypePlan-text').textContent = createType ? `CreateType: ${createType}` : '';
        console.log(data);

        showDataToast(`OG Successfully! (${data.OGData?.length || 0} records)`, 'success');
        updateLineFilterOptions();
        RenderData_OG();
        RenderData_Output();
        return data;
    })
    .catch(err => {
        console.error('Monitor_Data error:', err);
        throw err;
    });
}
function WIP_Data() {
    const productType = $('#productTypeFilter').val();
    if (!window.allWipRows || window.lastWipProductType !== productType) {
        return fetch('./function/Dashboard/Data_WIP.php?productType=' + encodeURIComponent(productType))
            .then(res => res.json())
            .then((data) => {
                window.allWipRows = data.SubWIP || [];
                window.lastWipProductType = productType;

                Update_WIP_Filter(window.allWipRows);
                RenderData_WIP();
                RenderData_Input();

                showDataToast(`SubWIP Successfully! (${data.SubWIP?.length || 0} records)`, 'success');
                console.log(data);
                return data;
            })
            .catch(err => {
                console.error('WIP_Data error:', err);
                throw err;
            });
    }

    RenderData_WIP();
    RenderData_Input();
    return Promise.resolve();
}
function Status_Data() {
    const productType = $('#productTypeFilter').val();

    const dateFilter = $('#dateFilter').val();
    let dayInput = $('#dayInput').val();

    if (dateFilter === 'day' && dayInput) {
        const parts = dayInput.split('/');
        if (parts.length === 3) {
            let year = parts[2];
            if (year.length === 2) {
                year = '20' + year;
            }
            dayInput = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }

    if (!productType) {
        return Promise.resolve();
    }

    const formData = new FormData();
    formData.append('productType', productType);

    return fetch('./function/Dashboard/Data_Status.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then((data) => {
        console.log(data);
        window.allStatusRows = data.statusData || [];
        Status_Process(data.statusData);
        Line_Process(data.statusData);
        BM_Process(data.statusData);

        showDataToast(`Machine Status Successfully! (${data.statusData?.length || 0} records)`, 'success');
        RenderData_Status();
        return data;
    })
    .catch(err => {
        console.error('Status_Data error:', err);
        throw err;
    });
}
function MCRecord_Data() {
    const productType = $('#productTypeFilter').val();
    const dateFilter = $('#dateFilter').val();
    let dayInput = $('#dayInput').val();
    const monthFilter = $('#monthFilter').val();
    const yearFilter = $('#yearFilter').val();

    const formData = new FormData();
    formData.append('productType', productType);
    formData.append('dateFilter', dateFilter);
    formData.append('dayInput', dayInput);
    formData.append('monthFilter', monthFilter);
    formData.append('yearFilter', yearFilter);

    return fetch('./function/Dashboard/Data_MCRecord.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        window.mcRecordData = data.mcRecordData || [];

        const lineMLT = $('#lineTypeFilterMLT').val();
        const lossCode = $('#LossCodeFilter').val();

        let filtered = data.mcRecordData || [];
        if (lineMLT && lineMLT !== 'all') {
            filtered = filtered.filter(row => (row.LINE || '') === lineMLT);
        }
        if (lossCode && lossCode !== 'all') {
            filtered = filtered.filter(row => (row.LOSSCODE || '') === lossCode);
        }

        showDataToast(`MC Record Successfully! (${data.mcRecordData?.length || 0} records)`, 'success');

        Update_MCRecord_Filter(filtered);
        RenderData_MCRecord();
        return data;
    })
    .catch(err => {
        console.error('MCRecord_Data error:', err);
        throw err;
    });
}
// ================================================================
// 4.Render
// ================================================================ 
// ฟังก์ชันสำหรับดึง line options จากข้อมูล OG
function getLineOptionsFromOG() {
    const ogRows = window.allOGRows || [];
    if (ogRows.length === 0) {
        return [];
    }
    // ดึง LINE_NAME ที่ไม่ซ้ำกันและเรียงลำดับ
    const uniqueLines = [...new Set(ogRows
        .map(row => row.LINE_NAME || row.line_name)
        .filter(line => line != null && line !== '' && line !== undefined)
    )].sort();
    return uniqueLines;
}

// ฟังก์ชันสำหรับอัปเดต line filter dropdown
function updateLineFilterOptions() {
    const lineOptions = getLineOptionsFromOG();
    const currentLineValue = $('#lineTypeFilter').val();
    const currentWipLineValue = $('#lineTypeFilterWIP').val();
    const hasValidCurrentLine = currentLineValue && currentLineValue !== 'all' && lineOptions.includes(currentLineValue);
    const hasValidCurrentWipLine = currentWipLineValue && currentWipLineValue !== 'all' && lineOptions.includes(currentWipLineValue);

    let options = '<option value="all">All</option>';
    if (lineOptions.length > 0) {
        options += lineOptions
            .map(line => `<option value="${line}">${line}</option>`)
            .join('');
    }

    $('#lineTypeFilter').html(options);
    $('#lineTypeFilterWIP').html(options);

    if (hasValidCurrentLine) {
        $('#lineTypeFilter').val(currentLineValue);
    } else {
        $('#lineTypeFilter').val('all');
    }

    if (hasValidCurrentWipLine) {
        $('#lineTypeFilterWIP').val(currentWipLineValue);
    } else {
        $('#lineTypeFilterWIP').val('all');
    }
}

function RenderData_OG() {
    let DailyFilteredOG = window.allOGRows || [];
    let AccFilteredOG = window.allOGRows || [];
    let DailyFilteredPlan = window.allPlanRows || [];
    let AccFilteredPlan = window.allPlanRows || [];
    let AccFilteredPlanChart = [] ;
    let DailyFilteredInput = window.allInputRows || [];
    let AccFilteredInput = window.allInputRows || [];

    const line = $('#lineTypeFilter').val();
    const dateFilter = $('#dateFilter').val();
    let dayInput = $('#dayInput').val();
    const monthFilter = $('#monthFilter').val();
    const yearFilter = $('#yearFilter').val();
    const productType = $('#productTypeFilter').val();

    // Helper function to get the correct completion date field based on product type
    function getCompletionDateInput(row) {
        if (productType === 'PIRSSR' || productType === 'PIRSSROS3' || productType === 'PIRSSR&OS3' || productType === 'CASE' || productType === 'AFVE') {
            return row.COMPLETION_PRASS_DATE1 || row.completion_prass_date1;
        }
        return row.COMPLETION_PRASS_DATE || row.completion_prass_date;
    }

    function getCompletionDateOutput(row) {
        if (productType === 'CASE') {
            return row.COMPLETION_PRASS_DATE1 || row.completion_prass_date1;
        }
        return row.COMPLETION_PRASS_DATE || row.completion_prass_date;
    }
    
    DailyFilteredOG = DailyFilteredOG.filter(row => {
        let ok = true;
        // กรองตาม line
        if (line && line !== 'all') {
            ok = ok && (row.LINE_NAME === line);
        }
        // กรองตาม dateFilter
        if (dateFilter === 'yesterday') {
            // กรองเฉพาะ completion_prass_date เป็นเมื่อวาน
            const today = new Date();
            today.setHours(0,0,0,0);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const d = new Date(getCompletionDateOutput(row));
            ok = ok && (
                d.getFullYear() === yesterday.getFullYear() &&
                d.getMonth() === yesterday.getMonth() &&
                d.getDate() === yesterday.getDate()
            );
        } else if (dateFilter === 'day' && dayInput) {
            // dayInput เป็น dd/mm/yyyy หรือ yyyy-mm-dd
            let d = new Date(getCompletionDateOutput(row));
            let inputDate;
            if (dayInput.includes('/')) {
                const parts = dayInput.split('/');
                inputDate = new Date(parts[2], parts[1] - 1, parts[0]);
            } else if (dayInput.includes('-')) {
                const parts = dayInput.split('-');
                inputDate = new Date(parts[0], parts[1] - 1, parts[2]);
            }
            ok = ok && (
                d.getFullYear() === inputDate.getFullYear() &&
                d.getMonth() === inputDate.getMonth() &&
                d.getDate() === inputDate.getDate()
            );
        } else if (dateFilter === 'month' && monthFilter) {
            // monthFilter เป็น yyyy-mm
            const d = new Date(getCompletionDateOutput(row));
            const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            ok = ok && (monthStr === monthFilter);
        } else if (dateFilter === 'year' && yearFilter) {
            // yearFilter เช่น 2025F1 หรือ 2025F2
            const m = yearFilter.match(/^(\d{4})(F[12])$/i);
            if (m) {
                const year = parseInt(m[1]);
                const period = m[2].toUpperCase();
                const d = new Date(getCompletionDateOutput(row));
                if (period === 'F1') {
                    ok = ok && (d.getFullYear() === year && d.getMonth() + 1 >= 4 && d.getMonth() + 1 <= 9);
                } else {
                    ok = ok && (
                        (d.getFullYear() === year && d.getMonth() + 1 >= 10 && d.getMonth() + 1 <= 12) ||
                        (d.getFullYear() === year + 1 && d.getMonth() + 1 >= 1 && d.getMonth() + 1 <= 3)
                    );
                }
            }
        }
        return ok;
    });
    AccFilteredOG = AccFilteredOG.filter(row => {
        let ok = true;
        // กรองตาม line
        if (line && line !== 'all') {
            ok = ok && (row.LINE_NAME === line);
        }
        return ok;
    });

    DailyFilteredPlan = FilterPlanRow(DailyFilteredPlan, {
        line,
        dateFilter,
        dayInput,
        monthFilter,
        yearFilter
    });

    AccFilteredPlanChart = FilterPlanRow(AccFilteredPlan, {
        line,
        dateFilter: null, 
        dayInput: null,
        monthFilter: null,
        yearFilter: null
    });

    AccFilteredPlan = FilterPlanRow(AccFilteredPlan, {
        line,
        dateFilter,
        dayInput,
        monthFilter,
        yearFilter
    }, '1', '0', true);

    DailyFilteredInput = DailyFilteredInput.filter(row => {
        let ok = true;
        // กรองตาม line
        if (line && line !== 'all') {
            ok = ok && (row.LINE_NAME === line);
        }
        // กรองตาม dateFilter
        if (dateFilter === 'yesterday') {
            // กรองเฉพาะ completion_prass_date เป็นเมื่อวาน
            const today = new Date();
            today.setHours(0,0,0,0);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const d = new Date(getCompletionDateInput(row));
            ok = ok && (
                d.getFullYear() === yesterday.getFullYear() &&
                d.getMonth() === yesterday.getMonth() &&
                d.getDate() === yesterday.getDate()
            );
        } else if (dateFilter === 'day' && dayInput) {
            // dayInput เป็น dd/mm/yyyy หรือ yyyy-mm-dd
            let d = new Date(getCompletionDateInput(row));
            let inputDate;
            if (dayInput.includes('/')) {
                const parts = dayInput.split('/');
                inputDate = new Date(parts[2], parts[1] - 1, parts[0]);
            } else if (dayInput.includes('-')) {
                const parts = dayInput.split('-');
                inputDate = new Date(parts[0], parts[1] - 1, parts[2]);
            }
            ok = ok && (
                d.getFullYear() === inputDate.getFullYear() &&
                d.getMonth() === inputDate.getMonth() &&
                d.getDate() === inputDate.getDate()
            );
        } else if (dateFilter === 'month' && monthFilter) {
            // monthFilter เป็น yyyy-mm
            const d = new Date(getCompletionDateInput(row));
            const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            ok = ok && (monthStr === monthFilter);
        } else if (dateFilter === 'year' && yearFilter) {
            // yearFilter เช่น 2025F1 หรือ 2025F2
            const m = yearFilter.match(/^(\d{4})(F[12])$/i);
            if (m) {
                const year = parseInt(m[1]);
                const period = m[2].toUpperCase();
                const d = new Date(getCompletionDateInput(row));
                if (period === 'F1') {
                    ok = ok && (d.getFullYear() === year && d.getMonth() + 1 >= 4 && d.getMonth() + 1 <= 9);
                } else {
                    ok = ok && (
                        (d.getFullYear() === year && d.getMonth() + 1 >= 10 && d.getMonth() + 1 <= 12) ||
                        (d.getFullYear() === year + 1 && d.getMonth() + 1 >= 1 && d.getMonth() + 1 <= 3)
                    );
                }
            }
        }
        return ok;
    });

    AccFilteredInput = AccFilteredInput.filter(row => {
        let ok = true;
        // กรองตาม line
        if (line && line !== 'all') {
            ok = ok && (row.LINE_NAME === line);
        }
        return ok;
    });

    if (productType === 'MAOPN' || productType === 'MAOPNOS3' || productType === 'MAOPN&OS3') {
        DailyFilteredOG = DailyFilteredOG.filter(row => {
            return !['renew','resort', 'test'].includes(row.TYPELOT);
        });
        DailyFilteredInput = DailyFilteredInput.filter(row => {
            return !['resort', 'test'].includes(row.TYPELOT);
        });
        AccFilteredOG = AccFilteredOG.filter(row => {
            return !['renew','resort', 'test'].includes(row.TYPELOT);
        });
        AccFilteredInput = AccFilteredInput.filter(row => {
            return !['resort', 'test'].includes(row.TYPELOT);
        });
    } else if (productType === 'PIRSSR' || productType === 'PIRSSROS3' || productType === 'PIRSSR&OS3') {
        DailyFilteredOG = DailyFilteredOG.filter(row => {
            return !['resort'].includes(row.TYPELOT);
        });
        AccFilteredOG = AccFilteredOG.filter(row => {
            return !['resort'].includes(row.TYPELOT);
        });
    } else if (productType === 'CASE') {
        DailyFilteredOG = DailyFilteredOG.filter(row => {
            return !['renew', 'repair', 'test'].includes(row.TYPELOT);
        });
        AccFilteredOG = AccFilteredOG.filter(row => {
            return !['renew', 'repair', 'test'].includes(row.TYPELOT);
        });
    } else if (productType === 'DENSO24CY') {
        DailyFilteredOG = DailyFilteredOG.filter(row => {
            return !['renew', 'repair', 'test'].includes(row.TYPELOT);
        });
        AccFilteredOG = AccFilteredOG.filter(row => {
            return !['renew', 'repair', 'test'].includes(row.TYPELOT);
        });
    } else if (productType === 'AFSRT') {
        DailyFilteredOG = DailyFilteredOG.filter(row => {
            return !['test'].includes(row.TYPELOT);
        });
        DailyFilteredInput = DailyFilteredInput.filter(row => {
            return !['test'].includes(row.TYPELOT);
        });
        AccFilteredOG = AccFilteredOG.filter(row => {
            return !['test'].includes(row.TYPELOT);
        });
        AccFilteredInput = AccFilteredInput.filter(row => {
            return !['test'].includes(row.TYPELOT);
        });
    } else {
        DailyFilteredOG = DailyFilteredOG.filter(row => {
            return !['repair', 'test'].includes(row.TYPELOT);
        });
        DailyFilteredInput = DailyFilteredInput.filter(row => {
            return !['repair', 'test'].includes(row.TYPELOT);
        });
        AccFilteredOG = AccFilteredOG.filter(row => {
            return !['repair', 'test'].includes(row.TYPELOT);
        });
        AccFilteredInput = AccFilteredInput.filter(row => {
            return !['repair', 'test'].includes(row.TYPELOT);
        });
    }
        
    const DailyOutput = Cal_Monitor(DailyFilteredOG, 'output',true, false);
    const PlanDailyOutput = Cal_Monitor(DailyFilteredPlan, 'output',true, true);
    const AccOutput = Cal_Monitor(AccFilteredOG, 'output',false, false);
    const AccPlanOutput = Cal_Monitor(AccFilteredPlan, 'output',false, true);
    const DailyInput = Cal_Monitor(DailyFilteredInput, 'input',true, false);
    const PlanDailyInput = Cal_Monitor(DailyFilteredPlan, 'input',true, true);
    const AccInput = Cal_Monitor(AccFilteredInput, 'input',false, false);
    const AccPlanInput = Cal_Monitor(AccFilteredPlan, 'input',false, true);

    // รวมผลลัพธ์
    const result = {
        dailyOutput: DailyOutput.dailyOutput || 0,
        plandailyOutput: PlanDailyOutput.plandailyOutput || 0,
        accOutput: AccOutput.accOutput || 0,
        planaccOutput: AccPlanOutput.accPlanOutput || 0,
        dailyInput: DailyInput.dailyInput || 0,
        plandailyInput: PlanDailyInput.plandailyInput || 0,
        accInput: AccInput.accInput || 0,
        planaccInput: AccPlanInput.accPlanInput || 0,
    };

    if (['MAOPN', 'MAOPNOS3', 'MAOPN&OS3'].includes(productType)) {
        ['A1', 'A2', 'A3'].forEach(ln => {
            const accOG = AccFilteredOG.filter(row => row.LINE_NAME === ln);

            const accPlan = AccFilteredPlan.filter(row => row.LINE_NAME === ln);

            const accOut = Cal_Monitor(accOG, 'output', false, false).accOutput || 0;
            const planAccOut = Cal_Monitor(accPlan, 'output', false, true).accPlanOutput || 0;

            result[`${ln}AccOutput`] = accOut;
            result[`plan${ln}AccOutput`] = planAccOut;
        });
    }

    if (['DENSO24CY'].includes(productType)) {
        ['1A','2A','3A','4A'].forEach(ln => {
            const accOG = AccFilteredOG.filter(row => row.LINE_NAME === ln);
            const accPlan = AccFilteredPlan.filter(row => row.LINE_NAME === ln);

            const accOut = Cal_Monitor(accOG, 'output', false, false).accOutput || 0;
            const planAccOut = Cal_Monitor(accPlan, 'output', false, true).accPlanOutput || 0;

            result[`${ln}AccOutput`] = accOut;
            result[`plan${ln}AccOutput`] = planAccOut;
        });
    }
    
    Monitor(result);
    Summary(result);

    const DailyFilteredPlanInput = DailyFilteredPlan.filter(row => (row.TYPE || row.type) === 'Input');
    const DailyFilteredPlanOutput = DailyFilteredPlan.filter(row => (row.TYPE || row.type) === 'Output');
    const AccFilteredPlanInput = AccFilteredPlanChart.filter(row => (row.TYPE || row.type) === 'Input');
    const AccFilteredPlanOutput = AccFilteredPlanChart.filter(row => (row.TYPE || row.type) === 'Output');
    
    Monitor_Chart(DailyFilteredInput, DailyFilteredPlanInput, 'input', true, dayInput);
    Monitor_Chart(AccFilteredInput, AccFilteredPlanInput, 'input', false, dayInput);
    Monitor_Chart(DailyFilteredOG, DailyFilteredPlanOutput, 'output', true, dayInput);
    Monitor_Chart(AccFilteredOG, AccFilteredPlanOutput, 'output', false, dayInput);

    Summary_Chart(DailyFilteredInput, DailyFilteredPlanInput, 'input', true, dayInput);
    Summary_Chart(AccFilteredInput, AccFilteredPlanInput, 'input', false, dayInput);
    Summary_Chart(DailyFilteredOG, DailyFilteredPlanOutput, 'output', true, dayInput);
    Summary_Chart(AccFilteredOG, AccFilteredPlanOutput, 'output', false, dayInput);
}
function RenderData_WIP() {
    let filteredRows = window.allWipRows.filter(row => (row.WIP_PROCESS_NAME || row.wip_process_name) !== 'Input');

    const part = $('#partFilter').val();
    const lot = $('#lotFilter').val();
    const process = $('#processFilter').val();
    const line = $('#lineTypeFilterWIP').val();
    const status = $('#statusFilter').val();
    const dateFilter = $('#dateFilter').val();
    let dayInput = $('#dayInput').val();
    const monthFilter = $('#monthFilter').val();
    const yearFilter = $('#yearFilter').val();

    filteredRows = filteredRows.filter(row => {
        let ok = true;
        if (part && part !== 'all') ok = ok && (row.PARTNAME === part);
        if (lot && lot !== 'all') ok = ok && (row.LOTNO === lot);
        if (process && process !== 'all') ok = ok && (row.WIP_PROCESS_NAME === process);
        if (line && line !== 'all') ok = ok && (row.LINE_NAME === line);
        if (status && status !== 'all') ok = ok && (row.LOT_STATUS === status);
        
        // กรอง PARTNAME ไม่เอา IML-0686 และ IML-0688
        ok = ok && !['IML-0686', 'IML-0688'].includes(row.PARTNAME);
        
        // กรองตาม dateFilter สำหรับ WIP_DATE - คอมเมนต์ออกเพื่อแสดงข้อมูลทั้งหมด
    
        // if (dateFilter === 'yesterday') {
        //     // แก้ไข: กรองเดือนของเมื่อวานและเดือนก่อนหน้า
        //     const today = new Date();
        //     today.setHours(0,0,0,0);
        //     const yesterday = new Date(today);
        //     yesterday.setDate(today.getDate() - 1);
            
        //     const yesterdayMonth = yesterday.getMonth();
        //     const yesterdayYear = yesterday.getFullYear();
            
        //     // เดือนก่อนหน้า
        //     const prevMonth = yesterdayMonth === 0 ? 11 : yesterdayMonth - 1;
        //     const prevMonthYear = yesterdayMonth === 0 ? yesterdayYear - 1 : yesterdayYear;
            
        //     const d = new Date(row.WIP_DATE || row.wip_date);
        //     ok = ok && (
        //         // เดือนของเมื่อวาน
        //         (d.getFullYear() === yesterdayYear && d.getMonth() === yesterdayMonth) ||
        //         // เดือนก่อนหน้า
        //         (d.getFullYear() === prevMonthYear && d.getMonth() === prevMonth)
        //     );
        // } else if (dateFilter === 'day' && dayInput) {
        //     // แก้ไข: กรองเดือนของวันที่เลือกและเดือนก่อนหน้า
        //     let inputDate;
        //     if (dayInput.includes('/')) {
        //         const parts = dayInput.split('/');
        //         inputDate = new Date(parts[2], parts[1] - 1, parts[0]);
        //     } else if (dayInput.includes('-')) {
        //         const parts = dayInput.split('-');
        //         inputDate = new Date(parts[0], parts[1] - 1, parts[2]);
        //     }
            
        //     const selectedMonth = inputDate.getMonth();
        //     const selectedYear = inputDate.getFullYear();
            
        //     // เดือนก่อนหน้า
        //     const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
        //     const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
            
        //     const d = new Date(row.WIP_DATE || row.wip_date);
        //     ok = ok && (
        //         // เดือนของวันที่เลือก
        //         (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) ||
        //         // เดือนก่อนหน้า
        //         (d.getFullYear() === prevMonthYear && d.getMonth() === prevMonth)
        //     );
        // } else if (dateFilter === 'month' && monthFilter) {
        //     // แก้ไข: กรองเดือนที่เลือกและเดือนที่แล้ว
        //     const d = new Date(row.WIP_DATE || row.wip_date);
        //     const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            
        //     // คำนวณเดือนที่แล้ว
        //     const selectedDate = new Date(monthFilter + '-01');
        //     const lastMonthDate = new Date(selectedDate);
        //     lastMonthDate.setMonth(selectedDate.getMonth() - 1);
        //     const lastMonthStr = `${lastMonthDate.getFullYear()}-${(lastMonthDate.getMonth() + 1).toString().padStart(2, '0')}`;
            
        //     // ตรวจสอบว่าเป็นเดือนที่เลือกหรือเดือนที่แล้ว
        //     ok = ok && (monthStr === monthFilter || monthStr === lastMonthStr);
        // } else if (dateFilter === 'year' && yearFilter) {
        //     // yearFilter เช่น 2025F1 หรือ 2025F2
        //     const m = yearFilter.match(/^(\d{4})(F[12])$/i);
        //     if (m) {
        //         const year = parseInt(m[1]);
        //         const period = m[2].toUpperCase();
        //         const d = new Date(row.WIP_DATE || row.wip_date);
        //         if (period === 'F1') {
        //             ok = ok && (d.getFullYear() === year && d.getMonth() + 1 >= 4 && d.getMonth() + 1 <= 9);
        //         } else {
        //             ok = ok && (
        //                 (d.getFullYear() === year && d.getMonth() + 1 >= 10 && d.getMonth() + 1 <= 12) ||
        //                 (d.getFullYear() === year + 1 && d.getMonth() + 1 >= 1 && d.getMonth() + 1 <= 3)
        //             );
        //         }
        //     }
        // }
    
        
        return ok;
    });

    WIP_Circle(filteredRows);
    WIP_Table(filteredRows);
    WIP_Line(filteredRows);
    WIP_Process(filteredRows);
}
function RenderData_Input() {
    // ตรวจสอบว่าข้อมูล Input พร้อมหรือไม่
    if (!window.allWipRows) {
        // รอข้อมูลพร้อมก่อน
        setTimeout(RenderData_Input, 100);
        return;
    }

    // Input
    let inputRows = (window.allWipRows || []).filter(row => (row.WIP_PROCESS_NAME || row.wip_process_name) === 'Input');
    
    const typelot = $('#typelotFilter').val();
    const dateFilter = $('#dateFilter').val();
    let dayInput = $('#dayInput').val();
    const monthFilter = $('#monthFilter').val();
    const yearFilter = $('#yearFilter').val();
    
    if (typelot && typelot !== 'all') {
        inputRows = inputRows.filter(row =>
            (row.TYPELOT || '').replace(/\s+/g, '').toLowerCase() === typelot.replace(/\s+/g, '').toLowerCase()
        );
    }
    
    // กรองตาม dateFilter สำหรับ WIP_DATE
    inputRows = inputRows.filter(row => {
        let ok = true;
        
        // กรองตาม dateFilter สำหรับ WIP_DATE
        if (dateFilter === 'yesterday') {
            // แก้ไข: กรองเดือนของเมื่อวานและเดือนก่อนหน้า
            const today = new Date();
            today.setHours(0,0,0,0);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            
            const yesterdayMonth = yesterday.getMonth();
            const yesterdayYear = yesterday.getFullYear();
            
            // เดือนก่อนหน้า
            const prevMonth = yesterdayMonth === 0 ? 11 : yesterdayMonth - 1;
            const prevMonthYear = yesterdayMonth === 0 ? yesterdayYear - 1 : yesterdayYear;
            
            const d = new Date(row.WIP_DATE || row.wip_date);
            ok = ok && (
                // เดือนของเมื่อวาน
                (d.getFullYear() === yesterdayYear && d.getMonth() === yesterdayMonth) ||
                // เดือนก่อนหน้า
                (d.getFullYear() === prevMonthYear && d.getMonth() === prevMonth)
            );
        } else if (dateFilter === 'day' && dayInput) {
            // แก้ไข: กรองเดือนของวันที่เลือกและเดือนก่อนหน้า
            let inputDate;
            if (dayInput.includes('/')) {
                const parts = dayInput.split('/');
                inputDate = new Date(parts[2], parts[1] - 1, parts[0]);
            } else if (dayInput.includes('-')) {
                const parts = dayInput.split('-');
                inputDate = new Date(parts[0], parts[1] - 1, parts[2]);
            }
            
            const selectedMonth = inputDate.getMonth();
            const selectedYear = inputDate.getFullYear();
            
            // เดือนก่อนหน้า
            const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
            const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
            
            const d = new Date(row.WIP_DATE || row.wip_date);
            ok = ok && (
                // เดือนของวันที่เลือก
                (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) ||
                // เดือนก่อนหน้า
                (d.getFullYear() === prevMonthYear && d.getMonth() === prevMonth)
            );
        } else if (dateFilter === 'month' && monthFilter) {
            // แก้ไข: กรองเดือนที่เลือกและเดือนที่แล้ว
            const d = new Date(row.WIP_DATE || row.wip_date);
            const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            
            // คำนวณเดือนที่แล้ว
            const selectedDate = new Date(monthFilter + '-01');
            const lastMonthDate = new Date(selectedDate);
            lastMonthDate.setMonth(selectedDate.getMonth() - 1);
            const lastMonthStr = `${lastMonthDate.getFullYear()}-${(lastMonthDate.getMonth() + 1).toString().padStart(2, '0')}`;
            
            // ตรวจสอบว่าเป็นเดือนที่เลือกหรือเดือนที่แล้ว
            ok = ok && (monthStr === monthFilter || monthStr === lastMonthStr);
        } else if (dateFilter === 'year' && yearFilter) {
            // yearFilter เช่น 2025F1 หรือ 2025F2
            const m = yearFilter.match(/^(\d{4})(F[12])$/i);
            if (m) {
                const year = parseInt(m[1]);
                const period = m[2].toUpperCase();
                const d = new Date(row.WIP_DATE || row.wip_date);
                if (period === 'F1') {
                    ok = ok && (d.getFullYear() === year && d.getMonth() + 1 >= 4 && d.getMonth() + 1 <= 9);
                } else {
                    ok = ok && (
                        (d.getFullYear() === year && d.getMonth() + 1 >= 10 && d.getMonth() + 1 <= 12) ||
                        (d.getFullYear() === year + 1 && d.getMonth() + 1 >= 1 && d.getMonth() + 1 <= 3)
                    );
                }
            }
        }
        
        return ok;
    });
    
    Input_Plan_Circle(inputRows, 'SummaryInputCircle');
    Input_Part(inputRows, 'SummaryPartChartInput');
    Input_Date(inputRows, 'SummaryPlanChartInput');
    Input_Table(inputRows, 'SummaryDetailTableInput');
}
function RenderData_Output() {
    // ตรวจสอบว่าข้อมูล Output พร้อมหรือไม่
    if (!window.allOGRows) {
        // รอข้อมูลพร้อมก่อน
        setTimeout(RenderData_Output, 100);
        return;
    }

    // Output - กรองเฉพาะ COMPLETION_PRASS_DATE = dayInput
    let outputRows = window.allOGRows || [];
    
    const outputDateFilter = $('#dateFilter').val();
    let outputDayInput = $('#dayInput').val();
    
    // กรองตามวันที่สำหรับ Output เท่านั้น
    if (outputDateFilter === 'day' && outputDayInput) {
        // แปลง dayInput เป็นรูปแบบที่เปรียบเทียบได้
        let inputDate;
        if (outputDayInput.includes('/')) {
            const parts = outputDayInput.split('/');
            inputDate = new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (outputDayInput.includes('-')) {
            const parts = outputDayInput.split('-');
            inputDate = new Date(parts[0], parts[1] - 1, parts[2]);
        }
        
        if (inputDate) {
            outputRows = outputRows.filter(row => {
                const completionDate = new Date(row.COMPLETION_PRASS_DATE || row.completion_prass_date);
                return completionDate.getFullYear() === inputDate.getFullYear() &&
                       completionDate.getMonth() === inputDate.getMonth() &&
                       completionDate.getDate() === inputDate.getDate();
            });
        }
    } else if (outputDateFilter === 'yesterday') {
        // กรองเฉพาะ completion_prass_date เป็นเมื่อวาน
        const today = new Date();
        today.setHours(0,0,0,0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        outputRows = outputRows.filter(row => {
            const completionDate = new Date(row.COMPLETION_PRASS_DATE || row.completion_prass_date);
            return completionDate.getFullYear() === yesterday.getFullYear() &&
                   completionDate.getMonth() === yesterday.getMonth() &&
                   completionDate.getDate() === yesterday.getDate();
        });
    }
    
    const typelot = $('#typelotFilter').val();
    if (typelot && typelot !== 'all') {
        outputRows = outputRows.filter(row =>
            (row.TYPELOT || '').replace(/\s+/g, '').toLowerCase() === typelot.replace(/\s+/g, '').toLowerCase()
        );
    }
    
    const productType = $('#productTypeFilter').val();
    if (['PIRSSR', 'PIRSSROS3', 'PIRSSR&OS3'].includes(productType)) {
        outputRows = outputRows.filter(row => (row.TYPE || row.type) === 'Output');
    }

    Output_Typelot_Circle(outputRows, 'SummaryOutputCircle');
    Output_Part(outputRows, 'SummaryPartChartOutput');
    Output_Line(outputRows, 'SummaryPlanChartOutput');
    Output_Table(outputRows, 'SummaryDetailTableOutput');
    
    // Resize charts after rendering
    setTimeout(() => {
        ResizeCharts();
    }, 100);
    
    // Adjust table height after rendering
    setTimeout(() => {
        AdjustTableHeight();
    }, 200);
}
function RenderData_Status() {
    // ใช้ข้อมูลดิบ statusData
    const allRows = window.allStatusRows || [];
    
    // ส่งข้อมูลให้กราฟสถานะเครื่อง
    Status_Process(allRows);
    Line_Process(allRows);
    BM_Process(allRows);
}
function RenderData_MCRecord() {
    // ใช้ข้อมูลดิบ mcRecordData
    const allRows = window.mcRecordData || [];
    const dateFilter = $('#dateFilter').val();
    let dayInput = $('#dayInput').val();
    const lineMLT = $('#lineTypeFilterMLT').val();
    const lossCode = $('#LossCodeFilter').val();

    // กรองเฉพาะสำหรับกราฟ loss time (DowntimeCircle, MCLossTime, LineLossTime, ProcessLossTime)
    let filteredRows = allRows;

    // เงื่อนไขกรองวันที่
    if (dateFilter === 'yesterday') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        filteredRows = filteredRows.filter(row => {
            const d = new Date(row.DATETIME);
            return d.getFullYear() === yesterday.getFullYear() &&
                d.getMonth() === yesterday.getMonth() &&
                d.getDate() === yesterday.getDate();
        });
    } else if (dateFilter === 'day' && dayInput) {
        let inputDate;
        if (dayInput.includes('/')) {
            const parts = dayInput.split('/');
            inputDate = new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (dayInput.includes('-')) {
            const parts = dayInput.split('-');
            inputDate = new Date(parts[0], parts[1] - 1, parts[2]);
        }
        filteredRows = filteredRows.filter(row => {
            const d = new Date(row.DATETIME);
            return d.getFullYear() === inputDate.getFullYear() &&
                d.getMonth() === inputDate.getMonth() &&
                d.getDate() === inputDate.getDate();
        });
    }
    // กรอง line/lossCode เฉพาะสำหรับกราฟ
    if (lineMLT && lineMLT !== 'all') {
        filteredRows = filteredRows.filter(row => (row.LINE_NAME === lineMLT));
    }
    if (lossCode && lossCode !== 'all') {
        filteredRows = filteredRows.filter(row => (row.LOSS_CODE === lossCode || row.LOSSCODE === lossCode));
    }

    // ส่ง filteredRows (ที่กรองวัน/line/loss) ให้เฉพาะกราฟ
    DownTime_Circle(filteredRows);
    MC_LossTime(filteredRows);
    Line_LossTime(filteredRows);
    Process_LossTime(filteredRows);

    // ตารางควรใช้ข้อมูลดิบทั้งเดือน (ไม่กรองวัน)
    Line_Daily_DownTime_Table(allRows);
    MCRecord_Table(allRows);
}
// ================================================================
// 5.Build
// ================================================================ 
// 5.1 Monitor
function Cal_Monitor(data, type = 'output', daily = true, plan = false){
    result = {};
    if(daily) {
        if (!plan) {
            if(type === 'output') {
                const dailyOutput = (data || []).reduce((sum, row) => sum + (parseInt(row.WIP_QTY || row.QTY) || 0), 0);
                result.dailyOutput = dailyOutput;
            } else {
                const dailyInput = (data || []).reduce((sum, row) => sum + (parseInt(row.WIP_QTY || row.QTY) || 0), 0);
                result.dailyInput = dailyInput;
            }
        } else {
            if(type === 'output') {
                const filtered = (data || []).filter(row => String(row.TYPE || row.type) === 'Output');
                const plandailyOutput = filtered.reduce((sum, row) => sum + (parseInt(row.QTY) || 0), 0);
                result.plandailyOutput = plandailyOutput;
            } else {
                const filtered = (data || []).filter(row => String(row.TYPE || row.type) === 'Input');
                const plandailyInput = filtered.reduce((sum, row) => sum + (parseInt(row.QTY) || 0), 0);
                result.plandailyInput = plandailyInput;
            }
        }
    } else {
        if (!plan) {
            if(type === 'output') {
                const accOutput = (data || []).reduce((sum, row) => sum + (parseInt(row.WIP_QTY) || 0), 0);
                result.accOutput = accOutput;
            } else {
                const accInput = (data || []).reduce((sum, row) => sum + (parseInt(row.WIP_QTY) || 0), 0);
                result.accInput = accInput;
            }
        } else {
            if(type === 'output') {
                const filtered = (data || []).filter(row => String(row.TYPE || row.type) === 'Output');
                const accPlanOutput = filtered.reduce((sum, row) => sum + (parseInt(row.QTY) || 0), 0);
                result.accPlanOutput = accPlanOutput;
            } else {
                const filtered = (data || []).filter(row => String(row.TYPE || row.type) === 'Input');
                const accPlanInput = filtered.reduce((sum, row) => sum + (parseInt(row.QTY) || 0), 0);
                result.accPlanInput = accPlanInput;
            }
        }
    }
    
    return result;
}
function Monitor(data){
    const items = [
        { key: 'dailyOutput', planKey: 'plandailyOutput' },
        { key: 'accOutput', planKey: 'planaccOutput' },
        { key: 'A1AccOutput', planKey: 'planA1AccOutput' },
        { key: 'A2AccOutput', planKey: 'planA2AccOutput' },
        { key: 'A3AccOutput', planKey: 'planA3AccOutput' },
        { key: 'dailyInput', planKey: 'plandailyInput' },
        { key: 'accInput', planKey: 'planaccInput' },
        { key: '1AAccOutput', planKey: 'plan1AAccOutput' },
        { key: '2AAccOutput', planKey: 'plan2AAccOutput' },
        { key: '3AAccOutput', planKey: 'plan3AAccOutput' },
        { key: '4AAccOutput', planKey: 'plan4AAccOutput' }
    ];
    items.forEach(item => {
        // หา element ของ value, plan, percent, difference
        const valueElem = document.getElementById(item.key);
        const planElem = document.getElementById(item.planKey);
        const percentElem = document.getElementById(item.key + 'percent');
        const diffElem = document.getElementById(item.key + 'difference');

        // ถ้า element มีอยู่ ให้แสดง spinner ก่อน
        if (valueElem) {
            valueElem.innerHTML = `<span class="spinner-border spinner-border-sm text-primary" role="status" style="vertical-align:middle;"></span>`;
        }
        if (planElem) {
            planElem.innerHTML = `<span class="spinner-border spinner-border-sm text-primary" role="status" style="vertical-align:middle;"></span>`;
        }
        if (percentElem) {
            percentElem.innerHTML = `<span class="spinner-border spinner-border-sm text-primary" role="status" style="vertical-align:middle;"></span>`;
        }
        if (diffElem) {
            diffElem.innerHTML = `<span class="spinner-border spinner-border-sm text-primary" role="status" style="vertical-align:middle;"></span>`;
        }
    });

    // รอ 100ms แล้วค่อย render ข้อมูลจริง (simulate loading effect)
    setTimeout(() => {
        items.forEach(item => {
            if (item.key in data && item.planKey in data) {
                let value = Number(data[item.key]) || 0;
                const plan = Number(data[item.planKey]) || 0;

                if (item.key === 'accOutput' && window.Wip) {
                    value += window.Wip;
                }

                let percent = plan > 0 ? (value / plan) * 100 : 0;
                let diff = value - plan;
                
                // แก้ไขการแสดงผล difference ให้ใช้ toLocaleString() อย่างถูกต้อง
                let diffText;
                if (diff >= 0) {
                    diffText = '+' + diff.toLocaleString();
                } else {
                    diffText = diff.toLocaleString();
                }

                const percentElem = document.getElementById(item.key + 'percent');
                const diffElem = document.getElementById(item.key + 'difference');
                if (percentElem) percentElem.textContent = percent.toFixed(0) + '%';
                if (diffElem) {
                    diffElem.textContent = diffText;
                    diffElem.style.color = diff >= 0 ? '#2e7d32' : '#d32f2f';
                }

                const elem = document.getElementById(item.key);
                if (elem) {
                    const isPositive = diff >= 0;
                    const color = isPositive ? '#2e7d32' : '#d32f2f';
                    const imgTag = isPositive
                        ? `<svg width="22" height="22" style="vertical-align:middle;margin-left:6px;">
                            <polyline points="5,12 10,17 17,6" fill="none" stroke="black" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="5,12 10,17 17,6" fill="none" stroke="lightgreen" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`
                        : `<svg width="22" height="22" style="vertical-align:middle;margin-left:6px;">
                            <line x1="11" y1="5" x2="11" y2="12" stroke="black" stroke-width="5" stroke-linecap="round"/>
                            <line x1="11" y1="5" x2="11" y2="12" stroke="red" stroke-width="3" stroke-linecap="round"/>
                            <circle cx="11" cy="18" r="2" fill="red" stroke="black" stroke-width="2"/>
                        </svg>`;
                    elem.innerHTML = `<span style="color:${color}">${value.toLocaleString()}${imgTag}</span>`;
                }

                const planElem = document.getElementById(item.planKey);
                if (planElem) {
                    planElem.textContent = 'Plan: ' + plan.toLocaleString();
                }
            }
        });
    }, 100);
}
function Monitor_Chart(resultRows, planRows, type, daily, dayInput) {
    dayInput = Convert_Date(dayInput);

    let chartId = '';
    let chartTitle = '';
    if (type === 'input') {
        chartId = daily ? 'dailyInputChart' : 'accInputChart';
        chartTitle = daily ? 'Daily Input' : 'Accumulate Input';
    } else {
        chartId = daily ? 'dailyOutputChart' : 'accOutputChart';
        chartTitle = daily ? 'Daily Output' : 'Accumulate Output';
    }

    let labels = [];
    let planData = [];
    let resultData = [];
    let percentData = [];

    if (daily) {
        let label = dayInput;
        let plan = 0, result = 0;

        plan = (planRows || []).reduce((sum, row) => {
            let d = Convert_Date(row.DATETIME || row.datetime || '');
            return d === dayInput ? sum + (parseInt(row.QTY) || 0) : sum;
        }, 0);

        result = (resultRows || []).reduce((sum, row) => {
            // ใช้ COMPLETION_PRASS_DATE1 สำหรับ CASE
            let completionDate = '';
            if ($('#productTypeFilter').val() === 'CASE') {
                completionDate = row.COMPLETION_PRASS_DATE1 || row.completion_prass_date1 || '';
            } else {
                completionDate = row.COMPLETION_PRASS_DATE || row.completion_prass_date || '';
            }
            let d = Convert_Date(completionDate);
            return d === dayInput ? sum + (parseInt(row.WIP_QTY) || 0) : sum;
        }, 0);

        labels = [ShortMonth(label)];
        planData = [plan];
        resultData = [result];
        percentData = [plan > 0 ? (result / plan * 100).toFixed(0) : 0];
    } else {
        // สำหรับ accumulate ใช้ monthFilter แทน dayInput
        let year, month;
        const monthFilter = $('#monthFilter').val();
        
        if (monthFilter && monthFilter.includes('-')) {
            // monthFilter เป็น yyyy-mm
            [year, month] = monthFilter.split('-').map(Number);
        } else {
            // fallback ใช้ dayInput
            year = parseInt(dayInput.slice(0, 4), 10);
            month = parseInt(dayInput.slice(5, 7), 10);
        }
        
        let start = new Date(year, month - 1, 1);
        let end = new Date(year, month, 0);

        let days = [];
        let d = new Date(start);
        while (d <= end) {
            let yyyy = d.getFullYear();
            let mm = (d.getMonth() + 1).toString().padStart(2, '0');
            let dd = d.getDate().toString().padStart(2, '0');
            days.push(`${yyyy}-${mm}-${dd}`);
            d.setDate(d.getDate() + 1);
        }
        let cumPlan = 0, cumResult = 0;
        days.forEach(dateStr => {
            let plan = (planRows || []).reduce((sum, row) => {
                let d = Convert_Date(row.DATETIME || row.datetime || '');
                return d === dateStr ? sum + (parseInt(row.QTY) || 0) : sum;
            }, 0);
            cumPlan += plan;

            let result = (resultRows || []).reduce((sum, row) => {
                // ใช้ COMPLETION_PRASS_DATE1 สำหรับ CASE
                let completionDate = '';
                if ($('#productTypeFilter').val() === 'CASE') {
                    completionDate = row.COMPLETION_PRASS_DATE1 || row.completion_prass_date1 || '';
                } else {
                    completionDate = row.COMPLETION_PRASS_DATE || row.completion_prass_date || '';
                }
                let d = Convert_Date(completionDate);
                return d === dateStr ? sum + (parseInt(row.WIP_QTY) || 0) : sum;
            }, 0);
            cumResult += result;

            labels.push(ShortMonth(dateStr));
            planData.push(cumPlan);
            resultData.push(cumResult);
            percentData.push(cumPlan > 0 ? (cumResult / cumPlan * 100).toFixed(0) : 0);
        });
    }

    const ctx = document.getElementById(chartId).getContext('2d');
    if (window[chartId] && typeof window[chartId].destroy === 'function') window[chartId].destroy();

    let datasets;
    if (!daily && type === 'input') {
        // acc input: datalabels เฉพาะ Plan
        datasets = [
            {
                label: '%',
                data: percentData,
                type: 'line',
                yAxisID: 'yPercent',
                borderColor: '#E49B0F ',
                backgroundColor: 'rgba(255,152,0,0.15)',
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: '#E49B0F ',
                order: 0,
                datalabels: {
                    offset: 8,
                    align: 'bottom',
                    anchor: 'end',
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#E49B0F ',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value, context) {
                        return value + '%';
                    }
                }
            },
            {
                label: 'Plan',
                data: planData,
                backgroundColor: '#ADD8E6',
                datalabels: {
                    display: true,
                    anchor: 'start',
                    align: 'bottom',
                    offset: 3,
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#ADD8E6',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value, context) {
                        return FormatKUnit(value, 'monitor');
                    }
                }
            },
            {
                label: 'Result',
                data: resultData,
                backgroundColor: '#7FB77E',
                datalabels: {
                    display: false
                }
            },
        ];
    } else if (!daily && type === 'output') {
        // acc output: datalabels เฉพาะ Result
        datasets = [
            {
                label: '%',
                data: percentData,
                type: 'line',
                yAxisID: 'yPercent',
                borderColor: '#E49B0F ',
                backgroundColor: 'rgba(255,152,0,0.15)',
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: '#E49B0F ',
                order: 0,
                datalabels: {
                    offset: 8,
                    align: 'bottom',
                    anchor: 'end',
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#E49B0F ',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value, context) {
                        return value + '%';
                    }
                }
            },
            {
                label: 'Plan',
                data: planData,
                backgroundColor: '#ADD8E6',
                datalabels: {
                    display: true,
                    anchor: 'start',
                    align: 'bottom',
                    offset: 3,
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#ADD8E6',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value, context) {
                        return FormatKUnit(value, 'monitor');
                    }
                }
            },
            {
                label: 'Result',
                data: resultData,
                backgroundColor: '#7FB77E',
                datalabels: {
                    display: false
                }
            }
        ];
    } else {
        datasets = daily ? [
            {
                label: '%',
                data: percentData,
                type: 'line',
                yAxisID: 'yPercent',
                borderColor: '#E49B0F ',
                backgroundColor: 'rgba(255,152,0,0.15)',
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: '#E49B0F ',
                order: 0,
                datalabels: {
                    offset: 8,
                    align: 'bottom',
                    anchor: 'end',
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#E49B0F ',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value, context) {
                        return value + '%';
                    }
                }
            },
            {
                label: 'Plan',
                data: planData,
                backgroundColor: '#ADD8E6',
                order: 1,
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 1,
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#ADD8E6',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value) { 
                        return FormatKUnit(value, 'monitor'); 
                    }
                }
            },
            {
                label: 'Result',
                data: resultData,
                backgroundColor: '#7FB77E',
                order: 2,
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 1,
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#7FB77E',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value) { 
                        return FormatKUnit(value, 'monitor'); 
                    }
                }
            }
        ] : [
            {
                label: '%',
                data: percentData,
                type: 'line',
                yAxisID: 'yPercent',
                borderColor: '#E49B0F ',
                backgroundColor: 'rgba(255,152,0,0.15)',
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: '#E49B0F ',
                order: 0,
                datalabels: {
                    offset: 8,
                    align: 'bottom',
                    anchor: 'end',
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#E49B0F ',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value, context) {
                        return value + '%';
                    }
                }
            },
            {
                label: 'Plan',
                data: planData,
                backgroundColor: '#ADD8E6',
                order: 1,
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 1,
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#ADD8E6',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value) { 
                        return FormatKUnit(value, 'monitor'); 
                    }
                }
            },
            {
                label: 'Result',
                data: resultData,
                backgroundColor: '#7FB77E',
                order: 2,
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 1,
                    color: '#000',
                    font: { weight: 'bold', size: 9 },
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: '#7FB77E',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 3,
                    clip: false,
                    formatter: function(value) { 
                        return FormatKUnit(value, 'monitor'); 
                    }
                }
            }
        ];
    }

    const maxY = Math.max(...planData, ...resultData);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;
    
    // คำนวณ max ของ percentage เพื่อตั้งค่าแกน Y ด้านขวา
    const maxPercent = Math.max(...percentData.map(p => parseFloat(p) || 0));
    const yPercentMax = maxPercent > 0 ? Math.ceil(maxPercent * 1.1) : 100; // เพิ่ม 10% เพื่อให้มีพื้นที่ว่าง

    window[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            aspectRatio: daily ? 1.5 : 4,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: chartTitle },
                datalabels: {},
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                            
                            // ถ้าเป็น dataset ของ '%' ให้แสดงเป็น % แทนที่จะเป็น K
                            if (label === '%') {
                                return `${label}: ${value}%`;
                            } else {
                                // แสดงค่าจริงแทน K ใน tooltip
                                return `${label}: ${value.toLocaleString()}`;
                            }
                        }
                    }
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeInOutQuart'
            },
            scales: daily ? {
                x: {
                    ticks: {
                        color: '#000000'
                    }
                },
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'QTY' },
                    max: yMax,
                    ticks: {
                        callback: function(value) {
                            return FormatKUnit(value, 'monitor');
                        }
                    }
                },
                yPercent: {
                    position: 'right',
                    beginAtZero: false,
                    min: -50,
                    max: yPercentMax,
                    title: { display: true, text: '%' },
                    grid: { drawOnChartArea: false },
                    ticks: {
                        callback: function(value) {
                            if (value < 0) {
                                return ''; // ไม่แสดงค่าติดลบ
                            }
                            return value + '%';
                        }
                    }
                }
            } : {
                x: {
                    ticks: {
                        color: '#000000',
                        padding: 15
                    }
                },
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'QTY' },
                    max: yMax, // เพิ่ม max
                    ticks: {
                        callback: function(value) {
                            return FormatKUnit(value, 'monitor');
                        }
                    }
                },
                yPercent: {
                    position: 'right',
                    beginAtZero: false,
                    min: -50,
                    max: yPercentMax,
                    title: { display: true, text: '%' },
                    grid: { drawOnChartArea: false },
                    ticks: {
                        callback: function(value) {
                            if (value < 0) {
                                return ''; // ไม่แสดงค่าติดลบ
                            }
                            return value + '%';
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
// 5.2 WIP
function WIP_Circle(data) {
    // ใช้ WIPData จาก Monitor_Data แทนการคำนวณจาก allWipRows
    const lastMonthQty = window.Wip ? (parseInt(window.Wip) || 0) : 0;

    const WIP_lastmonth = document.getElementById('WIP_lastmonth');
    WIP_lastmonth.innerHTML = `
        <div id="WIP_lastmonth" style="margin-left:10px; font-size:20px;">WIP last month: ${lastMonthQty.toLocaleString()}</div>
    `;
    
    // คำนวณ sumWIP1 (WIP ปัจจุบัน)
    const currentWipQty = data.reduce((sum, row) => sum + (parseInt(row.WIP_QTY) || 0), 0);
    
    // totalwip = last_month_qty + sumWIP1
    const totalWip = lastMonthQty + currentWipQty;
    
    const group = {};
    data.forEach(row => {
        const status = row.LOT_STATUS || 'UNKNOWN';
        group[status] = (group[status] || 0) + (parseInt(row.WIP_QTY) || 0);
    });

    const keys = Object.keys(group).sort((a, b) => group[a] - group[b]);
    const total = totalWip; // ใช้ totalWip แทนการคำนวณเดิม
    const labels = keys;
    const values = keys.map(label => group[label]);
    const bgColors = keys.map((label, index) => {
        if (label === 'Normal' || label === 'normal' || label === 'Release' || label === 'release') return '#4CAF50'; // สีเขียว
        // สีโทนที่ทำให้รู้สึกไม่ปลอดภัย - ใช้ index แทน random
        const unsafeColors = ['#FF5722', '#9C27B0', '#E91E63', '#673AB7', '#F44336', '#3F51B5'];
        return unsafeColors[index % unsafeColors.length];
    });
    
    // ตัวแปรสำหรับสลับ datalabels
    let showOddLabels = true;
    let currentChart = null;
    
    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: function(chart) {
            const {ctx, chartArea} = chart;
            const centerX = chartArea.left + (chartArea.right - chartArea.left) / 2;
            const centerY = chartArea.top + (chartArea.bottom - chartArea.top) / 2;
            
            ctx.save();
            ctx.font = 'bold 22px Arial';
            ctx.fillStyle = '#444';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                total.toLocaleString(),
                centerX,
                centerY - 10
            );
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(
                'QTY',
                centerX,
                centerY + 10
            );
            ctx.restore();
        }
    };

    const ctx = document.getElementById('donutchart').getContext('2d');
    if (window.wipDonutChart) window.wipDonutChart.destroy();
    
    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // เปลี่ยนเป็น true
            aspectRatio: 1, // เพิ่ม aspectRatio เป็น 1
            plugins: {
                legend: { display: false }, 
                title: { 
                    display: true, 
                    text: 'WIP by status',
                    padding: { bottom: 20 }
                },
                datalabels: {
                    display: function(context) {
                        const dataIndex = context.dataIndex;
                        const value = context.dataset.data[dataIndex];
                        const percent = total > 0 ? (value / total) * 100 : 0;
                        const label = context.chart.data.labels[dataIndex];
                        
                        // ถ้าค่าต่ำกว่า 1% ไม่แสดง datalabel
                        if (percent < 1) {
                            return false;
                        }
                        
                        // Normal, normal, Release, release แสดงตลอดเวลา
                        if (label === 'Normal' || label === 'normal' || label === 'Release' || label === 'release') {
                            return true;
                        }
                        
                        // สลับคู่-คี่: คู่แสดง, คี่ซ่อน หรือ คี่แสดง, คู่ซ่อน (สำหรับ status อื่นๆ)
                        const shouldShow = showOddLabels ? (dataIndex % 2 === 0) : (dataIndex % 2 === 1);
                        return shouldShow;
                    },
                    anchor: 'end',
                    align: 'outside',
                    offset: 8,
                    clamp: true,
                    clip: false,
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(223, 223, 223, 1)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value, context) {
                        const label = context.chart.data.labels[context.dataIndex];
                        const percent = total > 0 ? (value / total) * 100 : 0;
                        const quantityK = (value / 1000).toFixed(1);
                        return `${label}\n${quantityK}K (${percent.toFixed(0)}%)`;
                    }
                }
            },
            layout: { padding: { top: 28, right: 8, bottom: 24, left: 8 } }
        },
        plugins: [centerTextPlugin, ChartDataLabels]
    });
    
    window.wipDonutChart = currentChart;
    
    // ตั้งเวลาให้สลับ datalabels ทุก 3 วินาที
    if (window.wipDonutLabelInterval) {
        clearInterval(window.wipDonutLabelInterval);
    }
    window.wipDonutLabelInterval = setInterval(() => {
        if (currentChart && !currentChart.destroyed) {
            showOddLabels = !showOddLabels;
            try {
                currentChart.update('none'); // อัปเดต chart โดยไม่ animate
            } catch (error) {
                console.log('Error updating wipDonutChart:', error);
            }
        }
    }, 3000);
}
function WIP_Line(data) {
    const group = {};
    data.forEach(row => {
        const line = row.LINE_NAME || 'UNKNOWN';
        group[line] = (group[line] || 0) + (parseInt(row.WIP_QTY) || 0);
    });

    const sorted = Object.entries(group).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([line]) => line);
    const values = sorted.map(([_, qty]) => qty);

    // เพิ่มตรงนี้
    const maxY = Math.max(...values);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;

    const ctx = document.getElementById('wipLineChart').getContext('2d');
    if (window.wipLineChart && typeof window.wipLineChart.destroy === 'function') {
        window.wipLineChart.destroy();
    }

    window.wipLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'WIP',
                data: values,
                backgroundColor: labels.map((_, i) => Color(i))
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'WIP by line',
                    padding: { bottom: 30 }
                },
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(200,200,200,0.4)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        return FormatKUnit(value, 'dashboard');
                    }
                }
            },
            layout: { padding: { top: 40 } },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: '#000000'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        callback: function(value) {
                            return FormatKUnit(value, 'dashboard');
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function WIP_Process(data) {
    let processOrder = [];
 
    // สร้าง group ตาม process พร้อม SEQ_NO
    const group = {};
    const processSeqMap = {};
    
    data.forEach(row => {
        const process = row.WIP_PROCESS_NAME || 'UNKNOWN';
        const seqNo = parseInt(row.SEQ_NO);
        
        if (!group[process]) {
            group[process] = 0;
            processSeqMap[process] = seqNo;
        }
        group[process] += (parseInt(row.WIP_QTY) || 0);
    });

    // เรียงตาม SEQ_NO
    const sortedProcesses = Object.keys(group).sort((a, b) => {
        const seqA = processSeqMap[a] || 999;
        const seqB = processSeqMap[b] || 999;
        return seqA - seqB;
    });

    const labels = processOrder.length > 0 ? processOrder : sortedProcesses;
    const values = labels.map(process => group[process] || 0);
    const bgColors = labels.map((_, i) => Color(i));

    // เพิ่มตรงนี้
    const maxY = Math.max(...values);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;

    const ctx = document.getElementById('wipProcessChart').getContext('2d');
    if (window.wipProcessChart && typeof window.wipProcessChart.destroy === 'function') {
        window.wipProcessChart.destroy();
    }
    window.wipProcessChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Total View WIP' },
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(200,200,200,0.4)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        if (typeof value === 'number') {
                            return FormatKUnit(value, 'dashboard');
                        }
                        return value;
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#000000'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: yMax, // <<--- เพิ่มตรงนี้
                    ticks: {
                        callback: function(value) {
                            return FormatKUnit(value, 'dashboard');
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels],
    });
}
function WIP_Table(data) {
    const tbody = document.getElementById('wipDetailsBody');
    const totalQtyElem = document.getElementById('wipDetailsTotalQty');
    if (!tbody) return;
    
    // ทำลาย DataTable เก่าก่อน
    if ($.fn.DataTable.isDataTable('#wipDetailsTable')) {
        $('#wipDetailsTable').DataTable().destroy();
    }
    
    tbody.innerHTML = '';
    let totalQty = 0;

    // ฟังก์ชันสำหรับแปลงรูปแบบวันที่
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // รองรับ YYYY/MM/DD format โดยตรง
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3 && parts[0].length === 4) {
                // YYYY/MM/DD format
                const [year, month, day] = parts;
                const monthNames = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
                const monthIndex = parseInt(month, 10) - 1;
                const monthAbbr = monthNames[monthIndex] || month;
                return `${day} ${monthAbbr} ${year}`;
            }
        }
        // แปลงเป็น ISO format ก่อน แล้วใช้ ShortMonthWithYear
        const isoDate = Convert_Date(dateStr);
        return ShortMonthWithYear(isoDate);
    };

    // Sort data by WIP_DATE before creating table rows (to match the filtering)
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.WIP_DATE || a.wip_date || '');
        const dateB = new Date(b.WIP_DATE || b.wip_date || '');
        return dateA - dateB; // Sort in ascending order (oldest to newest)
    });

    sortedData.forEach(row => {
        // คำนวณ Plan
        let planText = '';
        if (row.INPUT_DATE) {
            // การคำนวณ Plan ยังคงต้องใช้รูปแบบที่ Date() เข้าใจ
            let inputDateStr = row.INPUT_DATE.replace(/\//g, '-');
            let inputDate = new Date(inputDateStr);
            let today = new Date();
            today.setHours(0,0,0,0);
            inputDate.setHours(0,0,0,0);
            planText = (inputDate < today) ? 'Delay' : 'On plan';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: left;">${planText}</td>
            <td style="text-align: right;">${(+row.WIP_QTY || 0).toLocaleString()}</td>
            <td style="text-align: left;">${formatDate(row.INPUT_DATE)}</td>
            <td style="text-align: left;">${row.LOT_STATUS || ''}</td>
            <td style="text-align: left;">${row.TYPELOT || ''}</td>
            <td style="text-align: left;">${row.PARTNAME || ''}</td>
            <td style="text-align: left;">${row.LOTNO || ''}</td>
            <td style="text-align: left;">${formatDate(row.WIP_DATE)}</td>
            <td style="text-align: left;">${row.WIP_PROCESS_NAME || ''}</td>
            <td style="text-align: left;">${row.PRODUCT_TYPE || ''}</td>
            <td style="text-align: left;">${row.LINE_NAME || ''}</td>
            <td style="text-align: left;">${row.LOT_COMMENT || ''}</td>
        `;

        // สี Plan
        const planCell = tr.children[0];
        if (planText === 'Delay') {
            planCell.style.color = 'red';
            planCell.style.fontWeight = 'bold';
        } else if (planText === 'On plan') {
            planCell.style.color = 'green';
            planCell.style.fontWeight = 'bold';
        }

        totalQty += Number(row.WIP_QTY) || 0;
        tbody.appendChild(tr);
    });
    
    // แสดงผลรวม QTY ใน footer
    if (totalQtyElem) {
        totalQtyElem.textContent = totalQty.toLocaleString();
    }
    
    // สร้าง DataTable
    const table = document.getElementById('wipDetailsTable');
    if (table && table.parentNode) {
        if ($.fn.DataTable.isDataTable('#wipDetailsTable')) {
            $('#wipDetailsTable').DataTable().destroy();
        }
        
        const dt = $('#wipDetailsTable').DataTable({
            paging: false,
            searching: false,
            info: false,
            scrollY: '225px',
            scrollX: true,
            dom: 'frtip',
            buttons: [
                {
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i> Export Excel',
                    className: 'btn btn-success btn-sm',
                    title: '',
                    filename: function() {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = String(today.getMonth() + 1).padStart(2, '0');
                        const day = String(today.getDate()).padStart(2, '0');
                        return `WIP_Data_${year}-${month}-${day}`;
                    },
                    exportOptions: {
                        columns: ':visible',
                        rows: ':visible'
                    }
                }
            ],
            columnDefs: [
                { 
                    targets: 0, // Plan column
                    width: '80px'
                },
                { 
                    targets: 1, // QTY column
                    width: '80px'
                },
                { 
                    targets: 2, // Input Date column
                    type: 'date-eu',
                    width: '200px'
                },
                { 
                    targets: 3, // Status column
                    width: '200px'
                },
                { 
                    targets: 4, // LotType column
                    width: '70px'
                },
                { 
                    targets: 5, // Part column
                    width: '270px'
                },
                { 
                    targets: 6, // Lot column
                    width: '130px'
                },
                { 
                    targets: 7, // WIP Date column
                    width: '200px'
                },
                { 
                    targets: 8, // Process column
                    width: '270px'
                },
                { 
                    targets: 9, // Product column
                    width: '300px'
                },
                { 
                    targets: 10, // Line column
                    width: '270px'
                },
                { 
                    targets: 11, // Lot Comment column
                    width: '850px'
                }
            ]
        });

        // Function to create footer for WIP table
        function createWIPFooter() {
            try {
                // Calculate total from table rows
                let totalQty = 0;
                const tbody = table.querySelector('tbody');
                const rows = tbody.querySelectorAll('tr:not(.footer-row)');
                
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length > 1) {
                        const qtyCell = cells[1]; // QTY อยู่ที่คอลัมน์ที่ 2 (index 1)
                        const qtyText = qtyCell.textContent.replace(/,/g, '');
                        totalQty += parseInt(qtyText) || 0;
                    }
                });
                
                // Remove existing footer row if any
                const existingFooter = tbody.querySelector('.footer-row');
                if (existingFooter) {
                    existingFooter.remove();
                }
                
                // Create footer row
                const footerRow = document.createElement('tr');
                footerRow.className = 'footer-row';
                footerRow.innerHTML = `
                    <td colspan="1" style="text-align:left !important;font-weight:bold;background:#e9ecef;border-top:1px solid #ddd;">Total</td>
                    <td style="text-align:right;font-weight:bold;background:#e9ecef;border-top:1px solid #ddd;">${totalQty.toLocaleString()}</td>
                    <td colspan="10" style="background:#e9ecef;"></td>
                `;
                
                // Add footer row to tbody
                tbody.appendChild(footerRow);
                
            } catch (error) {
                console.error('Error creating WIP footer:', error);
            }
        }

        // เพิ่มปุ่ม Export Excel ต่อท้าย table-caption
        const tableCaption = document.querySelector('#WIPDetails .table-caption');
        if (tableCaption) {
            // ลบปุ่มเก่าทั้งหมดก่อน
            const existingButtons = tableCaption.querySelectorAll('button');
            existingButtons.forEach(btn => btn.remove());
            
            const exportButton = document.createElement('button');
            exportButton.innerHTML = '<i class="fas fa-file-excel"></i> Export Excel';
            exportButton.className = 'btn btn-success btn-sm';
            exportButton.style.marginLeft = '10px';
            exportButton.onclick = function() {
                // ใช้ DataTables export
                dt.button(0).trigger();
            };
            
            // เพิ่มปุ่มต่อท้าย table-caption
            tableCaption.appendChild(exportButton);
        }

        // Create footer initially
        setTimeout(createWIPFooter, 300);

        // Recreate footer after sorting
        dt.on('order.dt', function() {
            setTimeout(createWIPFooter, 100);
        });

        // Recreate footer after searching
        dt.on('search.dt', function() {
            setTimeout(createWIPFooter, 100);
        });
    }
}
// 5.3 Input
function Input_Plan_Circle(data, canvasId) {
    const group = {};
    data.forEach(row => {
        let planText = 'UNKNOWN';
        if (row.INPUT_DATE) {
            const inputDateStr = row.INPUT_DATE;
            // Prefer Convert_Date which normalizes many input formats to ISO
            const iso = typeof Convert_Date === 'function' ? Convert_Date(inputDateStr) : null;
            let inputDate = iso ? new Date(iso) : new Date(inputDateStr.replace(/\//g, '-'));

            // If still invalid, try parsing 'DD MON YYYY' like '10 AUG 2026'
            if (isNaN(inputDate.getTime())) {
                const m = (inputDateStr || '').match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/);
                if (m) {
                    const day = m[1].padStart(2, '0');
                    const mon = m[2].toUpperCase().substr(0,3);
                    const monthNames = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };
                    const mm = monthNames[mon] || mon;
                    const iso2 = `${m[3]}-${mm}-${day}`;
                    inputDate = new Date(iso2);
                }
            }

            if (!isNaN(inputDate.getTime())) {
                let today = new Date();
                today.setHours(0,0,0,0);
                inputDate.setHours(0,0,0,0);
                planText = (inputDate < today) ? 'Delay' : 'On plan';
            } else {
                planText = 'UNKNOWN';
            }
        }
        group[planText] = (group[planText] || 0) + (parseInt(row.WIP_QTY) || 0);
    });

    function FormatKUnit(value) {
        if (value >= 1000) {
            return (value / 1000).toFixed(0).replace(/\.0$/, '') + 'K';
        } else {
            return value.toLocaleString();
        }
    }

    const keys = Object.keys(group).sort();
    const total = keys.reduce((sum, label) => sum + group[label], 0);
    const labels = keys;
    const values = keys.map(label => group[label]);
    const bgColors = keys.map(label => {
        if (label === 'On plan') return '#4F81BD';
        if (label === 'Delay') return '#FF5252';
        return Color(0);
    });

    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: function(chart) {
            const {ctx, chartArea} = chart;
            const centerX = chartArea.left + (chartArea.right - chartArea.left) / 2;
            const centerY = chartArea.top + (chartArea.bottom - chartArea.top) / 2;
            
            ctx.save();
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = '#444';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                total.toLocaleString(),
                centerX,
                centerY - 10
            );
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(
                'QTY',
                centerX,
                centerY + 10
            );
            ctx.restore();
        }
    };

    const ctx = document.getElementById(canvasId).getContext('2d');
    if (window.InputPlanDonutChart) window.InputPlanDonutChart.destroy();
    window.InputPlanDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Input by Plan' },
                datalabels: {
                    anchor: 'end',
                    align: 'outside',
                    offset: 8,
                    clamp: true,
                    clip: false,
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(223,223,223,1)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value, context) {
                        const label = context.chart.data.labels[context.dataIndex];
                        const percent = total > 0 ? (value / total) * 100 : 0;
                        return `${label} ${FormatKUnit(value)} (${percent.toFixed(0)}%)`;
                    }
                }
            },
            layout: { padding: { top: 8, right: 8, bottom: 24, left: 8 } }
        },
        plugins: [centerTextPlugin, ChartDataLabels]
    });
}
function Input_Date(data, canvasId) {
    const group = {};
    data.forEach(row => {
        const key = row.INPUT_DATE || 'UNKNOWN';
        group[key] = (group[key] || 0) + (parseInt(row.WIP_QTY) || 0);
    });
    // --- เรียงตามชื่อ (ascending) ---
    const sorted = Object.entries(group).sort((a, b) => a[0].localeCompare(b[0]));
    const labels = sorted.map(([key]) => {
        // สำหรับ Input ใช้ ShortMonthWithYear format
        // รองรับ YYYY/MM/DD format โดยตรง
        if (key.includes('/')) {
            const parts = key.split('/');
            if (parts.length === 3 && parts[0].length === 4) {
                // YYYY/MM/DD format
                const [year, month, day] = parts;
                const monthNames = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
                const monthIndex = parseInt(month, 10) - 1;
                const monthAbbr = monthNames[monthIndex] || month;
                return `${day} ${monthAbbr} ${year}`;
            }
        }
        return ShortMonthWithYear(Convert_Date(key));
    });
    const values = sorted.map(([_, value]) => value);
    const bgColors = labels.map((_, i) => Color(i));

    const maxY = Math.max(...values);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;
    const ctx = document.getElementById(canvasId).getContext('2d');
    // แก้ให้ใช้ window chart ตาม id ที่ส่งเข้ามา
    if (window[canvasId] && typeof window[canvasId].destroy === 'function') {
        window[canvasId].destroy();
    }
    window[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'QTY',
                data: values,
                backgroundColor: bgColors,
                barPercentage: 1.0,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Plan Input' },
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(200,200,200,0.4)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        if (typeof value === 'number') {
                            return FormatKUnit(value, 'dashboard');
                        }
                        return value;
                    }
                }
            },
            padding: { top: 40 },
            scales: {
                x: {
                    ticks: {
                        color: '#000000'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        callback: function(value) {
                            return FormatKUnit(value, 'dashboard');
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function Input_Part(data, canvasId) {
    const group = {};
    data.forEach(row => {
        const part = row.PARTNAME || 'UNKNOWN';
        group[part] = (group[part] || 0) + (parseInt(row.WIP_QTY) || 0);
    });
    // --- เรียงค่ามากไปน้อย ---
    const sorted = Object.entries(group).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([part]) => part);
    const values = sorted.map(([_, value]) => value);
    const bgColors = labels.map((_, i) => Color(i));

    const ctx = document.getElementById(canvasId).getContext('2d');
    // แก้ให้ใช้ window chart ตาม id ที่ส่งเข้ามา
    if (window[canvasId] && typeof window[canvasId].destroy === 'function') {
        window[canvasId].destroy();
    }
    window[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'QTY',
                data: values,
                backgroundColor: bgColors,
                barPercentage: 1.0,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: { display: true, text: 'Part Input' },
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    offset: 0,
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(200,200,200,0.4)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        if (typeof value === 'number') {
                            return FormatKUnit(value, 'dashboard');
                        }
                        return value;
                    }
                }
            },
            layout: { padding: { top: 40 } },
            scales: {
                x: {
                    beginAtZero: true,
                    max: function(context) {
                        const maxValue = Math.max(...context.chart.data.datasets[0].data);
                        return maxValue * 1.25;
                    },
                    ticks: {
                        color: '#000000',
                        callback: function(value) {
                            return FormatKUnit(value, 'dashboard');
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function Input_Table(data, tableId) {
    // ตรวจสอบว่าข้อมูลพร้อมหรือไม่
    if (!data || data.length === 0) {
        // รอข้อมูลพร้อมก่อน
        setTimeout(() => Input_Table(data, tableId), 100);
        return;
    }

    if ($.fn.DataTable.isDataTable('#' + tableId)) {
        $('#' + tableId).DataTable().destroy();
    }

    InputTable(data);

    const dt = $('#' + tableId).DataTable({
        paging: false,
        searching: true,
        info: false,
        order: [],
        scrollY: '280px',
        scrollCollapse: true,
        autoWidth: false,
        dom: 'frtip',
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<i class="fas fa-file-excel"></i> Export Excel',
                className: 'btn btn-success btn-sm',
                title: '',
                filename: function() {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    return `Input_Data_${year}-${month}-${day}`;
                },
                exportOptions: {
                    columns: ':visible',
                    rows: ':visible'
                }
            }
        ],
        columnDefs: [
            { 
                targets: 1, // Input Date column
                type: 'date-eu',
                className: 'text-start'
            }
        ]
    });

    // เพิ่มปุ่ม Export Excel ต่อท้าย table-caption
    const tableCaption = document.querySelector('#InputDetail .table-caption');
    if (tableCaption) {
        // ลบปุ่มเก่าทั้งหมดก่อน
        const existingButtons = tableCaption.querySelectorAll('button');
        existingButtons.forEach(btn => btn.remove());
        
        const exportButton = document.createElement('button');
        exportButton.innerHTML = '<i class="fas fa-file-excel"></i> Export Excel';
        exportButton.className = 'btn btn-success btn-sm';
        exportButton.style.marginLeft = '10px';
        exportButton.onclick = function() {
            // ใช้ DataTables export
            dt.button(0).trigger();
        };
        
        // เพิ่มปุ่มต่อท้าย table-caption
        tableCaption.appendChild(exportButton);
    }

    // Function to create footer
    function createFooter() {
        try {
            // Calculate total from table rows
            let totalQty = 0;
            const table = document.getElementById(tableId);
            const tbody = table.querySelector('tbody');
            const rows = tbody.querySelectorAll('tr:not(.footer-row)');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length > 0) {
                    const lastCell = cells[cells.length - 1];
                    const qtyText = lastCell.textContent.replace(/,/g, '');
                    totalQty += parseInt(qtyText) || 0;
                }
            });
            
            // Remove existing footer row if any
            const existingFooter = tbody.querySelector('.footer-row');
            if (existingFooter) {
                existingFooter.remove();
            }
            
            // Create footer row
            const footerRow = document.createElement('tr');
            footerRow.className = 'footer-row';
            
            footerRow.innerHTML = `
                <td colspan="8" style="text-align:right;font-weight:bold;background:#e9ecef;border-top:1px solid #ddd;">Total</td>
                <td style="text-align:right;font-weight:bold;background:#e9ecef;border-top:1px solid #ddd;">${totalQty.toLocaleString()}</td>
            `;
            
            // Add footer row to tbody
            tbody.appendChild(footerRow);
            
        } catch (error) {
            console.error('Error creating footer:', error);
        }
    }

    // Create footer initially
    setTimeout(createFooter, 300);

    // Recreate footer after sorting
    dt.on('order.dt', function() {
        setTimeout(createFooter, 100);
    });

    // Recreate footer after searching
    dt.on('search.dt', function() {
        setTimeout(createFooter, 100);
    });
}
function InputTable(data) {
    // ตรวจสอบว่าข้อมูลพร้อมหรือไม่
    if (!data || data.length === 0) {
        // รอข้อมูลพร้อมก่อน
        setTimeout(() => InputTable(data), 100);
        return;
    }

    const tbody = document.getElementById('SummaryDetailBodyInput');
    const thead = document.getElementById('SummaryDetailHeadInput');
    tbody.innerHTML = '';
    thead.innerHTML = '';
    let totalQty = 0;

    // ปุ่ม Export Excel จะถูกสร้างโดย DataTables Buttons ใน Input_Table

    // ฟังก์ชันสำหรับแปลงรูปแบบวันที่
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // รองรับ YYYY/MM/DD format โดยตรง
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3 && parts[0].length === 4) {
                // YYYY/MM/DD format
                const [year, month, day] = parts;
                const monthNames = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
                const monthIndex = parseInt(month, 10) - 1;
                const monthAbbr = monthNames[monthIndex] || month;
                return `${day} ${monthAbbr} ${year}`;
            }
        }
        // แปลงเป็น ISO format ก่อน แล้วใช้ ShortMonthWithYear
        const isoDate = Convert_Date(dateStr);
        return ShortMonthWithYear(isoDate);
    };
    
    // Thead
    const trHead = document.createElement('tr');
    ['Plan','InputDate','Part','Lot','LotType','WIPDate','Product','Line','Qty'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // Sort data by InputDate before creating table rows
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.INPUT_DATE || '');
        const dateB = new Date(b.INPUT_DATE || '');
        return dateA - dateB; // Sort in ascending order (oldest to newest)
    });

    // Tbody
    sortedData.forEach(row => {
        // คำนวณ Plan
        let planText = '';
        if (row.INPUT_DATE) {
            // แปลง INPUT_DATE เป็น Date object
            // รองรับทั้ง yyyy/mm/dd และ yyyy-mm-dd
            let inputDateStr = row.INPUT_DATE.replace(/\//g, '-');
            let inputDate = new Date(inputDateStr);
            let today = new Date();
            today.setHours(0,0,0,0);
            inputDate.setHours(0,0,0,0);

            if (inputDate < today) {
                planText = 'Delay';
            } else {
                planText = 'On plan';
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${planText}</td>
            <td>${formatDate(row.INPUT_DATE || '')}</td>
            <td>${row.PARTNAME || ''}</td>
            <td>${row.LOTNO || ''}</td>
            <td>${row.TYPELOT || ''}</td>
            <td>${formatDate(row.WIP_DATE || '')}</td>
            <td>${row.PRODUCT_TYPE || ''}</td>
            <td>${row.LINE_NAME || ''}</td>
            <td>${(+row.WIP_QTY || 0).toLocaleString()}</td>
        `;

        // สี Plan
        const planCell = tr.children[0];
        if (planText === 'Delay') {
            planCell.style.color = 'red';
            planCell.style.fontWeight = 'bold';
        } else if (planText === 'On plan') {
            planCell.style.color = 'green';
            planCell.style.fontWeight = 'bold';
        }

        totalQty += Number(row.WIP_QTY) || 0;
        tbody.appendChild(tr);
    });
}
// 5.4 Output
function Output_Typelot_Circle(data, canvasId) {
    const group = {};
    data.forEach(row => {
        const Plan = row.TYPELOT || 'UNKNOWN';
        group[Plan] = (group[Plan] || 0) + (parseInt(row.WIP_QTY) || 0);
    });

    const keys = Object.keys(group).sort();
    const total = keys.reduce((sum, label) => sum + group[label], 0);
    const labels = keys;
    const values = keys.map(label => group[label]);
    const bgColors = keys.map((label, index) => {
        if (label === 'Normal' || label === 'normal' || label === 'Release' || label === 'release') return '#4CAF50'; // สีเขียว
        // สีโทนที่ทำให้รู้สึกไม่ปลอดภัย - ใช้ index แทน random
        const unsafeColors = ['#FF5722', '#9C27B0', '#E91E63', '#673AB7', '#F44336', '#3F51B5'];
        return unsafeColors[index % unsafeColors.length];
    });

    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: function(chart) {
            const {ctx, chartArea} = chart;
            const centerX = chartArea.left + (chartArea.right - chartArea.left) / 2;
            const topY = chartArea.top + 150;
            
            // วาดข้อความเพื่อวัดขนาด
            ctx.save();
            ctx.font = 'bold 32px Arial';
            const numberText = total.toLocaleString();
            const numberWidth = ctx.measureText(numberText).width;
            const numberHeight = 32;
            
            ctx.font = 'bold 14px Arial';
            const qtyText = 'QTY';
            const qtyWidth = ctx.measureText(qtyText).width;
            const qtyHeight = 14;
            
            // คำนวณขนาดขอบขาวตามข้อความจริง
            const maxWidth = Math.max(numberWidth, qtyWidth);
            const totalHeight = numberHeight + qtyHeight + 10; // ระยะห่างระหว่างข้อความ
            
            // วาดขอบขาว
            ctx.fillStyle = 'rgba(255, 255, 255, 0.42)'; // สีขาวโปร่งใส
            ctx.fillRect(centerX - (maxWidth / 2) - 10, topY - (totalHeight / 2) - 5, maxWidth + 20, totalHeight + 10);
            
            // วาดข้อความ
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = '#444';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                numberText,
                centerX,
                topY - 10
            );
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(
                qtyText,
                centerX,
                topY + 10
            );
            ctx.restore();
        }
    };

    const ctx = document.getElementById(canvasId).getContext('2d');
    if (window.OutputPlanDonutChart) window.OutputPlanDonutChart.destroy();
    window.OutputPlanDonutChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    position: 'right',
                    align: 'center',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const percent = total > 0 ? (value / total) * 100 : 0;
                                    return {
                                        text: `${label}: ${FormatKUnit(value,'dashboard')} (${percent.toFixed(1)}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].backgroundColor[i],
                                        lineWidth: 0,
                                        pointStyle: 'circle',
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                title: { display: true, text: 'Output by Typelot' }
            },
            layout: { padding: { top: 8, right: 20, bottom: 24, left: 20 } }
        },
        plugins: [centerTextPlugin]
    });
}
function Output_Line(data, canvasId) {
    const group = {};
    data.forEach(row => {
        const key = row.LINE_NAME || 'UNKNOWN';
        group[key] = (group[key] || 0) + (parseInt(row.WIP_QTY) || 0);
    });
    // --- เรียงตามชื่อ (ascending) ---
    const sorted = Object.entries(group).sort((a, b) => a[0].localeCompare(b[0]));
    const labels = sorted.map(([key]) => key); // สำหรับ Output ใช้ LINE_NAME ตามเดิม
    const values = sorted.map(([_, value]) => value);
    const bgColors = labels.map((_, i) => Color(i));

    const maxY = Math.max(...values);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;
    const ctx = document.getElementById(canvasId).getContext('2d');
    // แก้ให้ใช้ window chart ตาม id ที่ส่งเข้ามา
    if (window[canvasId] && typeof window[canvasId].destroy === 'function') {
        window[canvasId].destroy();
    }
    window[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'QTY',
                data: values,
                backgroundColor: bgColors,
                barPercentage: 1.0,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Line Output' },
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(200,200,200,0.4)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        if (typeof value === 'number') {
                            return FormatKUnit(value, 'dashboard');
                        }
                        return value;
                    }
                }
            },
            padding: { top: 40 },
            scales: {
                x: {
                    ticks: {
                        color: '#000000'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        callback: function(value) {
                            return FormatKUnit(value, 'dashboard');
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function Output_Part(data, canvasId) {
    const group = {};
    data.forEach(row => {
        const part = row.PARTNAME || 'UNKNOWN';
        group[part] = (group[part] || 0) + (parseInt(row.WIP_QTY) || 0);
    });
    // --- เรียงค่ามากไปน้อย ---
    const sorted = Object.entries(group).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([part]) => part);
    const values = sorted.map(([_, value]) => value);
    const bgColors = labels.map((_, i) => Color(i));

    const ctx = document.getElementById(canvasId).getContext('2d');
    // แก้ให้ใช้ window chart ตาม id ที่ส่งเข้ามา
    if (window[canvasId] && typeof window[canvasId].destroy === 'function') {
        window[canvasId].destroy();
    }
    window[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'QTY',
                data: values,
                backgroundColor: bgColors,
                barPercentage: 1.0,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: { display: true, text: 'Part Output' },
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    offset: 0,
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(200,200,200,0.4)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        if (typeof value === 'number') {
                            return FormatKUnit(value, 'dashboard');
                        }
                        return value;
                    }
                }
            },
            layout: { padding: { top: 40 } },
            scales: {
                x: {
                    beginAtZero: true,
                    max: function(context) {
                        const maxValue = Math.max(...context.chart.data.datasets[0].data);
                        return maxValue * 1.25;
                    },
                    ticks: {
                        color: '#000000',
                        callback: function(value) {
                            return FormatKUnit(value, 'dashboard');
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function Output_Table(data, tableId) {
    // ตรวจสอบว่าข้อมูลพร้อมหรือไม่
    if (!data || data.length === 0) {
        // รอข้อมูลพร้อมก่อน
        setTimeout(() => Output_Table(data, tableId), 100);
        return;
    }

    if ($.fn.DataTable.isDataTable('#' + tableId)) {
        $('#' + tableId).DataTable().destroy();
    }

    OutputTable(data);

    const dt = $('#' + tableId).DataTable({
        paging: false,
        searching: true,
        info: false,
        order: [],
        scrollY: '280px',
        scrollCollapse: true,
        autoWidth: false,
        dom: 'frtip',
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<i class="fas fa-file-excel"></i> Export Excel',
                className: 'btn btn-success btn-sm',
                title: '',
                filename: function() {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    return `Output_Data_${year}-${month}-${day}`;
                },
                exportOptions: {
                    columns: ':visible',
                    rows: ':visible'
                }
            }
        ],
        columnDefs: [
            { 
                targets: 0, // InspDate column
                type: 'date-eu',
                className: 'text-start'
            }
        ]
    });

    // เพิ่มปุ่ม Export Excel ต่อท้าย table-caption
    const tableCaption = document.querySelector('#OutputDetail .table-caption');
    if (tableCaption) {
        // ลบปุ่มเก่าทั้งหมดก่อน
        const existingButtons = tableCaption.querySelectorAll('button');
        existingButtons.forEach(btn => btn.remove());
        
        const exportButton = document.createElement('button');
        exportButton.innerHTML = '<i class="fas fa-file-excel"></i> Export Excel';
        exportButton.className = 'btn btn-success btn-sm';
        exportButton.style.marginLeft = '10px';
        exportButton.onclick = function() {
            // ใช้ DataTables export
            dt.button(0).trigger();
        };
        
        // เพิ่มปุ่มต่อท้าย table-caption
        tableCaption.appendChild(exportButton);
    }

    // Function to create footer
    function createFooter() {
        try {
            // Calculate total from table rows
            let totalQty = 0;
            const table = document.getElementById(tableId);
            const tbody = table.querySelector('tbody');
            const rows = tbody.querySelectorAll('tr:not(.footer-row)');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length > 0) {
                    const lastCell = cells[cells.length - 1];
                    const qtyText = lastCell.textContent.replace(/,/g, '');
                    totalQty += parseInt(qtyText) || 0;
                }
            });
            
            // Remove existing footer row if any
            const existingFooter = tbody.querySelector('.footer-row');
            if (existingFooter) {
                existingFooter.remove();
            }
            
            // Create footer row
            const footerRow = document.createElement('tr');
            footerRow.className = 'footer-row';
            
            footerRow.innerHTML = `
                <td colspan="8" style="text-align:right;font-weight:bold;background:#e9ecef;border-top:1px solid #ddd;">Total</td>
                <td style="text-align:right;font-weight:bold;background:#e9ecef;border-top:1px solid #ddd;">${totalQty.toLocaleString()}</td>
            `;
            
            // Add footer row to tbody
            tbody.appendChild(footerRow);
            
        } catch (error) {
            console.error('Error creating footer:', error);
        }
    }

    // Create footer initially
    setTimeout(createFooter, 300);

    // Recreate footer after sorting
    dt.on('order.dt', function() {
        setTimeout(createFooter, 100);
    });

    // Recreate footer after searching
    dt.on('search.dt', function() {
        setTimeout(createFooter, 100);
    });
}
function OutputTable(data) {
    // ตรวจสอบว่าข้อมูลพร้อมหรือไม่
    if (!data || data.length === 0) {
        // รอข้อมูลพร้อมก่อน
        setTimeout(() => OutputTable(data), 100);
        return;
    }

    const tbody = document.getElementById('SummaryDetailBodyOutput');
    const thead = document.getElementById('SummaryDetailHeadOutput');
    tbody.innerHTML = '';
    thead.innerHTML = '';
    let totalQty = 0;

    // Thead
    const trHead = document.createElement('tr');
    ['InspDate','Part','Lot','LotType','InspDate','Insp#','Product','Line','Qty'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // Tbody
    data.forEach(row => {
        // แปลงวันที่เป็น ShortMonthWithYear format
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            // แปลงเป็น ISO format ก่อน แล้วใช้ ShortMonthWithYear
            const isoDate = Convert_Date(dateStr);
            return ShortMonthWithYear(isoDate);
        };  

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(row.COMPLETION_PRASS_DATE || '')}</td>
            <td>${row.PARTNAME || ''}</td>
            <td>${row.LOTNO || ''}</td>
            <td>${row.TYPELOT || ''}</td>
            <td>${formatDate(row.COMPLETION_PRASS_DATE || '')}</td>
            <td>${row.INSP_NO || ''}</td>
            <td>${row.PRODUCT_TYPE || ''}</td>
            <td>${row.LINE_NAME || ''}</td>
            <td>${(+row.WIP_QTY || 0).toLocaleString()}</td>
        `;
        totalQty += Number(row.WIP_QTY) || 0;
        tbody.appendChild(tr);
    });
}
// 5.5 Status
function Status_Process(data) {
    const group = {};

    data.forEach(row => {
        const process = row.PROCESS || 'UNKNOWN';
        const status = row.STATUS || 'UNKNOWN';
        const mcName = row.MC_NAME;

        if (!group[process]) group[process] = {};
        if (!group[process][status]) group[process][status] = new Set();
        if (mcName) group[process][status].add(mcName);
    });

    // เรียง processes ตามจำนวนเครื่องทั้งหมด (มากไปน้อย)
    const processes = Object.keys(group).sort((a, b) => {
        const totalA = Object.values(group[a]).reduce((sum, set) => sum + set.size, 0);
        const totalB = Object.values(group[b]).reduce((sum, set) => sum + set.size, 0);
        return totalB - totalA; // เรียงจากมากไปน้อย
    });
    
    const statuses = new Set();
    const statusCountMap = {};

    processes.forEach(process => {
        statusCountMap[process] = {};
        Object.keys(group[process]).forEach(status => {
            statuses.add(status);
            statusCountMap[process][status] = group[process][status].size;
        });
    });

    const sortedStatuses = Array.from(statuses);
    const datasets = sortedStatuses.map((status, i) => {
        return {
            label: status,
            data: processes.map(process => statusCountMap[process][status] || 0),
            backgroundColor: (status === 'NORMAL' ? '#4CBB17' : '#FFBF00'),
            categoryPercentage: 0.9,
            barPercentage: 0.8,
        };
    });
    const allValues = datasets.flatMap(ds => ds.data);
    const maxY = Math.max(...allValues);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;

    const ctx = document.getElementById('StatusProcessChart').getContext('2d');
    if (window.statusProcessChart && typeof window.statusProcessChart.destroy === 'function') {
        window.statusProcessChart.destroy();
    }

    window.statusProcessChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: processes,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Machine Status by Process',
                    font: { size: 20 }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 20,
                        font: { size: 14 }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 1,
                    color: '#000',
                    font: { weight: 'bold', size: 14 },
                    formatter: function(value, context) {
                        const datasets = context.chart.data.datasets;
                        const dataIndex = context.dataIndex;
                        const datasetIndex = context.datasetIndex;
                        let sum = 0;
                        datasets.forEach(ds => {
                            sum += ds.data[dataIndex] || 0;
                        });
                        let isTop = true;
                        for (let i = datasetIndex + 1; i < datasets.length; i++) {
                            if ((datasets[i].data[dataIndex] || 0) > 0) {
                                isTop = false;
                                break;
                            }
                        }
                        return (isTop && sum > 0) ? sum : '';
                    }
                }
            },
            layout: { padding: { top: 10 } },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#000000',
                        autoSkip: false,
                        maxRotation: 30,
                        minRotation: 30,
                        font: { size: 12 },
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: yMax,
                    title: { display: true, text: 'จำนวนเครื่อง' },
                    ticks: { stepSize: 1 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function Line_Process(data) {
    const group = {};
    data = data.filter(row => row.LINE_NAME !== null);
    data.forEach(row => {
        const line = row.LINE_NAME || 'UNKNOWN';
        const status = row.STATUS || 'UNKNOWN';
        const mcName = row.MC_NAME;

        if (!group[line]) group[line] = {};
        if (!group[line][status]) group[line][status] = new Set();
        if (mcName) group[line][status].add(mcName);
    });

    const lines = Object.keys(group).sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
    const statuses = new Set();
    const statusCountMap = {};

    lines.forEach(line => {
        statusCountMap[line] = {};
        Object.keys(group[line]).forEach(status => {
            statuses.add(status);
            statusCountMap[line][status] = group[line][status].size;
        });
    });

    const sortedStatuses = Array.from(statuses);
    const datasets = sortedStatuses.map((status, i) => {
        return {
            label: status,
            data: lines.map(line => statusCountMap[line][status] || 0),
            backgroundColor: (status === 'NORMAL' ? '#4CBB17' : '#FFBF00'),
            categoryPercentage: 0.9,
            barPercentage: 0.8,
        };
    });

    const allValues = datasets.flatMap(ds => ds.data);
    const maxY = Math.max(...allValues);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;
    const ctx = document.getElementById('StatusLineChart').getContext('2d');
    if (window.StatusLineChart && typeof window.StatusLineChart.destroy === 'function') {
        window.StatusLineChart.destroy();
    }

    window.StatusLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: lines,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Machine Status by Line',
                    font: { size: 20 }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 20,
                        font: { size: 14 }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#000',
                    font: { weight: 'bold', size: 14 },
                    formatter: function(value, context) {
                        const datasets = context.chart.data.datasets;
                        const dataIndex = context.dataIndex;
                        const datasetIndex = context.datasetIndex;
                        let sum = 0;
                        datasets.forEach(ds => {
                            sum += ds.data[dataIndex] || 0;
                        });
                        let isTop = true;
                        for (let i = datasetIndex + 1; i < datasets.length; i++) {
                            if ((datasets[i].data[dataIndex] || 0) > 0) {
                                isTop = false;
                                break;
                            }
                        }
                        return (isTop && sum > 0) ? sum : '';
                    }
                }
            },
            layout: { padding: { top: 10 } },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#000000',
                        autoSkip: false,
                        maxRotation: 30,
                        minRotation: 30,
                        font: { size: 12 },
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: yMax,
                    title: { display: true, text: 'จำนวนเครื่อง' },
                    ticks: { stepSize: 1 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function BM_Process(data) {
    const group = {};
    const mcNameMap = {}; // เก็บ mc_name สำหรับแต่ละ status
    
    data.forEach(row => {
        const status = row.STATUS || 'UNKNOWN';
        const mcName = row.MC_NAME || 'UNKNOWN';
        
        if (status !== 'NORMAL') {
            group[status] = (group[status] || 0) + 1;
            if (!mcNameMap[status]) mcNameMap[status] = [];
            mcNameMap[status].push(mcName);
        }
    });

    const statuses = Object.keys(group);
    const values = statuses.map(status => group[status]);

    const chartElement = document.getElementById('StatusBM');

    if (window.StatusBMChart && typeof window.StatusBMChart.destroy === 'function') {
        window.StatusBMChart.destroy();
    }

    if (statuses.length <= 1) {
        const parent = chartElement.parentElement;
        chartElement.remove();

        const container = document.createElement('div');
        container.id = 'StatusBM';
        container.style.textAlign = 'center';
        container.style.padding = '16px';

        if (statuses.length === 0) {
            container.innerHTML = `
                <div style="font-size: 24px; font-weight: bold; color: #666; margin-bottom: 16px;">
                    ไม่มีสถานะผิดปกติของเครื่อง BM
                </div>
            `;
        } else {
            const status = statuses[0];
            const mcNames = mcNameMap[status] || [];
            const uniqueMcNames = [...new Set(mcNames)];
            
            container.innerHTML = `
                <div style="display: inline-block; background: white; border: 3px solid #FFBF00; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                        <span style="color: #6f42c1; font-size: 24px; margin-right: 8px;">🔧</span>
                        <span style="font-weight: bold; font-size: 20px; color: #FFBF00;">${status}</span>
                    </div>
                    <div style="background: #f8f9fa; border-radius: 6px; padding: 8px 12px; font-size: 14px; color: #495057; display: inline-block;">
                        ${uniqueMcNames.join(', ')}
                    </div>
                </div>
            `;
        }

        parent.appendChild(container);
        return;
    }
    
    // กรณีมีหลาย status
    const container = document.createElement('div');
    container.id = 'StatusBM';
    container.style.textAlign = 'center';
    container.style.padding = '16px';
    
    let html = '<div style="margin-bottom: 16px; font-size: 18px; font-weight: bold; color: #333;">สถานะผิดปกติของเครื่อง BM</div>';
    
    statuses.forEach(status => {
        const mcNames = mcNameMap[status] || [];
        const uniqueMcNames = [...new Set(mcNames)];
        
        html += `
            <div style="display: inline-block; background: white; border: 3px solid #007bff; border-radius: 8px; padding: 16px; text-align: center; margin: 8px;">
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                    <span style="color: #6f42c1; font-size: 24px; margin-right: 8px;">🔧</span>
                    <span style="font-weight: bold; font-size: 20px; color: #FFBF00;">${status}</span>
                </div>
                <div style="background: #f8f9fa; border-radius: 6px; padding: 8px 12px; font-size: 14px; color: #495057; display: inline-block;">
                    ${uniqueMcNames.join(', ')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    const parent = chartElement.parentElement;
    chartElement.remove();
    parent.appendChild(container);
}
// 5.6 Loss Time
function DownTime_Circle(data) { //legend
    let filteredData = data;
    
    // Debug: ตรวจสอบข้อมูลที่เข้ามา
    if (!filteredData || filteredData.length === 0) {
        console.warn('DownTime_Circle: No data received');
        return;
    }

    const group = {};
    filteredData.forEach(row => {
        const losscode = row.LOSS_CODE || row.LOSSCODE || 'UNKNOWN';
        // รองรับทั้งตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก
        const time = parseInt(row.TIMEMIN || row.timemin) || 0;
        group[losscode] = (group[losscode] || 0) + time;
    });

    // รวมทั้งหมดก่อน
    const total = Object.values(group).reduce((sum, v) => sum + v, 0);

    // กรองเฉพาะ % >= 1.4
    const filtered = {};
    Object.keys(group).forEach(label => {
        const percent = total > 0 ? (group[label] / total) * 100 : 0;
        if (percent >= 1.4) {
            filtered[label] = group[label];
        }
    });

    const keys = Object.keys(filtered).sort((a, b) => filtered[a] - filtered[b]);
    const labels = keys;
    const values = keys.map(label => filtered[label]);
    const bgColors = keys.map((_, i) => Color(i));

    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: function(chart) {
            const {ctx, chartArea} = chart;
            const centerX = chartArea.left + (chartArea.right - chartArea.left) / 2;
            const centerY = chartArea.top + (chartArea.bottom - chartArea.top) / 2;
            
            ctx.save();
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = '#444';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                total.toLocaleString(),
                centerX,
                centerY - 10
            );
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(
                'Min',
                centerX,
                centerY + 10
            );
            ctx.restore();
        }
    };

    const ctx = document.getElementById("DowntimeCausesCircle").getContext("2d");
    if (window.DowntimeCausesCircle && typeof window.DowntimeCausesCircle.destroy === 'function') {
        window.DowntimeCausesCircle.destroy();
    }

    window.DowntimeCausesCircle = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    position: 'right',
                    align: 'start',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                        const percent = total > 0 ? (value / total) * 100 : 0;
                                    return {
                                        text: `${label}: ${value.toLocaleString()} (${percent.toFixed(0)}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].backgroundColor[i],
                                        lineWidth: 0,
                                        pointStyle: 'circle',
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                title: { display: true, text: 'Downtime Causes' }
            },
            layout: { padding: { top: 8, right: 20, bottom: 24, left: 20 } }
        },
        plugins: [centerTextPlugin]
    });
}
function MC_LossTime(data) {
    let filteredData = data;
    
    // Debug: ตรวจสอบข้อมูลที่เข้ามา
    if (!filteredData || filteredData.length === 0) {
        console.warn('MC_LossTime: No data received');
        return;
    }

    const group = {};
    const filtered = {};
    filteredData.forEach(row => {
        const mcname = row.MC_NAME || 'UNKNOWN';
        // รองรับทั้งตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก
        const time = parseInt(row.TIMEMIN || row.timemin) || 0;
        group[mcname] = (group[mcname] || 0) + time;
    });

    // รวมทั้งหมดก่อน
    const total = Object.values(group).reduce((sum, v) => sum + v, 0);

    Object.keys(group).forEach(label => {
        if (group[label] >= 1) {
            filtered[label] = group[label];
        }
    });

    // --- เรียงค่ามากไปน้อย ---
    const sorted = Object.entries(filtered).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([mcname]) => mcname);
    const values = sorted.map(([_, value]) => value);
    const bgColors = labels.map((_, i) => Color(i));

    const maxY = Math.max(...values);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;
    const ctx = document.getElementById("MCLossTimeChart").getContext("2d");
    if (window.MCLossTimeChart && typeof window.MCLossTimeChart.destroy === 'function') {
        window.MCLossTimeChart.destroy();
    }

    window.MCLossTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'MC_NAME',
                data: values,
                backgroundColor: bgColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'MC Loss Time (min)' },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(200,200,200,0.4)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        return FormatKUnit(value, ' ');
                    }
                }
            },
            layout: { padding: { top: 0 } },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#000'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function Line_LossTime(data) {
    let filteredData = data;
    
    // Debug: ตรวจสอบข้อมูลที่เข้ามา
    if (!filteredData || filteredData.length === 0) {
        console.warn('Line_LossTime: No data received');
        return;
    }

    const group = {};
    filteredData.forEach(row => {
        const line = row.LINE_NAME || 'UNKNOWN';
        // รองรับทั้งตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก
        const time = parseInt(row.TIMEMIN || row.timemin) || 0;
        if (time > 0) {
            group[line] = (group[line] || 0) + time;
        }
    });
    // --- เรียงค่ามากไปน้อย ---
    const sorted = Object.entries(group).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([line]) => line);
    const values = sorted.map(([_, value]) => value);
    const bgColors = labels.map((_, i) => Color(i));

    const maxY = Math.max(...values);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;
    const ctx = document.getElementById('LineLossTimeChart').getContext('2d');
    if (window.LineLossTimeChart && typeof window.LineLossTimeChart.destroy === 'function') {
        window.LineLossTimeChart.destroy();
    }

    window.LineLossTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time (min)',
                data: values,
                backgroundColor: bgColors,
                barPercentage: 1.0,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Line Loss Time (min)' },
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(200,200,200,0.4)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        return FormatKUnit(value, ' ');
                    }
                }
            },
            layout: { padding: { top: 40 } },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#000'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function Process_LossTime(data) {
    let filteredData = data;
    
    // Debug: ตรวจสอบข้อมูลที่เข้ามา
    if (!filteredData || filteredData.length === 0) {
        console.warn('Process_LossTime: No data received');
        return;
    }

    const group = {};
    const filtered = {};
    filteredData.forEach(row => {
        const process = row.PROCESS || 'UNKNOWN';
        // รองรับทั้งตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก
        const time = parseInt(row.TIMEMIN || row.timemin) || 0;
        if (time > 0) {
            group[process] = (group[process] || 0) + time;
        }
    });

    // --- เรียงค่ามากไปน้อย ---
    const sorted = Object.entries(group).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([process]) => process);
    const values = sorted.map(([_, value]) => value);
    const bgColors = labels.map((_, i) => Color(i));

    const maxY = Math.max(...values);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;
    const ctx = document.getElementById('ProcessLossTimeChart').getContext('2d');
    if (window.ProcessLossTimeChart && typeof window.ProcessLossTimeChart.destroy === 'function') {
        window.ProcessLossTimeChart.destroy();
    }

    window.ProcessLossTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time (min)',
                data: values,
                backgroundColor: bgColors,
                barPercentage: 1.0,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Process Loss Time (min)' },
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#000',
                    font: { weight: 'bold' },
                    backgroundColor: 'rgba(200,200,200,0.4)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        return FormatKUnit(value, ' ');
                    }
                }
            },
            layout: { padding: { top: 40 } },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#000'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function Line_Daily_DownTime_Table(data) {
    // คำนวณเดือนเป้าหมายจากตัวเลือก
    const dateFilter = $('#dateFilter').val();
    let dayInput = $('#dayInput').val();
    const monthFilter = $('#monthFilter').val();
    const yearFilter = $('#yearFilter').val();

    function parseDdMmYyyy(s) {
        // รองรับ dd/mm/yy หรือ dd/mm/yyyy
        const p = s.split('/');
        if (p.length !== 3) return null;
        let y = p[2];
        if (y.length === 2) y = '20' + y;
        return { y: +y, m: +p[1], d: +p[0] };
    }

    let targetYear, targetMonth; // 1-12
    if (dateFilter === 'day' && dayInput) {
        if (dayInput.includes('/')) {
            const o = parseDdMmYyyy(dayInput);
            if (o) { targetYear = o.y; targetMonth = o.m; }
        } else if (dayInput.includes('-')) {
            const [y, m] = dayInput.split('-');
            targetYear = +y; targetMonth = +m;
        }
    } else if (dateFilter === 'yesterday') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        targetYear = y.getFullYear();
        targetMonth = y.getMonth() + 1;
    } else if (dateFilter === 'month') {
        if (monthFilter && monthFilter.includes('-')) {
            const [y, m] = monthFilter.split('-');
            targetYear = +y; targetMonth = +m;
        } else if (monthFilter && yearFilter) {
            targetYear = +yearFilter;
            targetMonth = +monthFilter; // สมมุติเป็น 1-12
        }
    }

    if (!targetYear || !targetMonth) {
        const today = new Date();
        targetYear = today.getFullYear();
        targetMonth = today.getMonth() + 1;
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0); // วันสุดท้ายของเดือน

    // สร้างหัวตารางวันที่ 1..วันสุดท้าย
    const dateList = [];
    let d = new Date(startDate);
    while (d <= endDate) {
        const dd = d.getDate().toString().padStart(2, '0');
        const mmm = d.toLocaleString('en-US', { month: 'short' });
        dateList.push(`${dd} ${mmm}`);
        d.setDate(d.getDate() + 1);
    }

    // เตรียมข้อมูล flat สำหรับ DataTables
    const flatRows = [];
    const groupMap = {};

    data.forEach(row => {
        const line = row.LINE_NAME || 'UNKNOWN';
        const dateObj = new Date(row.DATETIME);
        if (dateObj < startDate || dateObj > endDate) return;

        const dd = dateObj.getDate().toString().padStart(2, '0');
        const mmm = dateObj.toLocaleString('en-US', { month: 'short' });
        const dateKey = `${dd} ${mmm}`;

        const groupKey = `${line}`;
        if (!groupMap[groupKey]) {
            groupMap[groupKey] = { LINE: line, dates: {}, Total: 0 };
        }
        groupMap[groupKey].dates[dateKey] = (groupMap[groupKey].dates[dateKey] || 0) + (parseInt(row.TIMEMIN) || 0);
        groupMap[groupKey].Total += (parseInt(row.TIMEMIN) || 0);
    });

    Object.values(groupMap).forEach(obj => {
        const rowArr = [
            obj.LINE,
            ...dateList.map(date => Number(obj.dates[date] || 0)),
            Number(obj.Total || 0)
        ];
        flatRows.push(rowArr);
    });

    // Destroy DataTable เดิมถ้ามี
    if ($.fn.DataTable.isDataTable('#LineDailyDowntimeTable')) {
        $('#LineDailyDowntimeTable').DataTable().destroy();
        $('#LineDailyDowntimeTable').empty(); // ล้างหัวเก่า
    }

    const dt = $('#LineDailyDowntimeTable').DataTable({
        data: flatRows,
        columns: [
            { title: "LINE", className: "text-start", width: "180px",
                createdCell: function(td) { td.style.whiteSpace = 'nowrap'; },
                render: function(data, type, row, meta) {
                    if (type === 'display') {
                        return `<div style="display: flex; align-items: center; gap: 6px;">
                                    <span class="expand-icon" style="cursor: pointer; color: #007bff; font-size: 14px; font-weight: bold; user-select: none; transition: transform 0.2s;">▶</span>
                                    <span>${data}</span>
                                </div>`;
                    }
                    return data;
                }
            },
              ...dateList.map(date => ({
                  title: date,
                  className: "text-end",
                  createdCell: function(td) {
                      td.style.whiteSpace = 'nowrap';
                      td.style.fontVariantNumeric = 'tabular-nums';
                      td.style.minWidth = '80px';
                  },
                  render: function(data, type) { return type === 'display' ? Number(data).toLocaleString() : data; }
              })),
              { title: "Total", className: "text-end", width: "80px",
                render: function(data, type) { return type === 'display' ? Number(data).toLocaleString() : data; } }
        ],
        order: [[0, 'asc']],
        paging: false, searching: false, info: false,
        scrollX: true, autoWidth: false, scrollCollapse: true,
        scrollY: '225px',
        scrollCollapse: true,
        dom: 'frtip',
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<i class="fas fa-file-excel"></i> Export Excel',
                className: 'btn btn-success btn-sm',
                title: '',
                filename: function() {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    return `LineDailyDowntime_Data_${year}-${month}-${day}`;
                },
                exportOptions: {
                    columns: ':visible',
                    rows: ':visible'
                }
            }
        ]
    });

    // เพิ่มปุ่ม Export Excel ต่อท้าย table-caption
    const tableCaption = document.querySelector('#MachineLoss .table-caption');
    if (tableCaption) {
        // ลบปุ่มเก่าทั้งหมดก่อน
        const existingButtons = tableCaption.querySelectorAll('button');
        existingButtons.forEach(btn => btn.remove());
        
        const exportButton = document.createElement('button');
        exportButton.innerHTML = '<i class="fas fa-file-excel"></i> Export Excel';
        exportButton.className = 'btn btn-success btn-sm';
        exportButton.style.marginLeft = '10px';
        exportButton.onclick = function() {
            // ใช้ DataTables export
            dt.button(0).trigger();
        };
        
        // เพิ่มปุ่มต่อท้าย table-caption
        tableCaption.appendChild(exportButton);
    }

    // Force DataTables to recalculate column widths after adding detail rows
    function adjustTableLayout() {
        dt.columns.adjust();
    }

    // Event handler for expand icon clicks
    $('#LineDailyDowntimeTable tbody').off('click').on('click', '.expand-icon', function (e) {
        e.stopPropagation();
        const tr = $(this).closest('tr');
        const row = dt.row(tr);
        const lineName = row.data()[0];
        const icon = $(this);

        if (tr.hasClass('shown-mctype')) {
            // Collapse - remove detail rows
            let next = tr.next();
            while (next.length && (next.hasClass('mctype-detail-row') || next.hasClass('process-detail-row'))) {
                const toRemove = next; next = next.next(); toRemove.remove();
            }
            tr.removeClass('shown-mctype');
            icon.text('▶').css('transform', 'rotate(0deg)');
            adjustTableLayout();
            return;
        }

        // Expand - remove other expanded rows first
        $('#LineDailyDowntimeTable tbody tr.mctype-detail-row').remove();
        $('#LineDailyDowntimeTable tbody tr.shown-mctype').removeClass('shown-mctype');
        $('#LineDailyDowntimeTable tbody .expand-icon').text('▶').css('transform', 'rotate(0deg)');

        const mctypeMap = {};
        data.forEach(row => {
            const line = row.LINE_NAME || 'UNKNOWN';
            const dateObj = new Date(row.DATETIME);
            if (line !== lineName) return;
            if (dateObj < startDate || dateObj > endDate) return;

            const dd = dateObj.getDate().toString().padStart(2, '0');
            const mmm = dateObj.toLocaleString('en-US', { month: 'short' });
            const dateKey = `${dd} ${mmm}`;
            const mctype = row.MC_TYPE || 'UNKNOWN';
            if (!mctypeMap[mctype]) mctypeMap[mctype] = {};
            mctypeMap[mctype][dateKey] = (mctypeMap[mctype][dateKey] || 0) + (parseInt(row.TIMEMIN) || 0);
            mctypeMap[mctype].Total = (mctypeMap[mctype].Total || 0) + (parseInt(row.TIMEMIN) || 0);
        });

        let html = '';
        Object.entries(mctypeMap).forEach(([mctype, obj]) => {
            html += `<tr class="mctype-detail-row"><td style="padding-left:32px;white-space:nowrap;text-align:left;background:#f8f9fa;">
                        <span class="expand-icon-mctype" style="cursor: pointer; color: #007bff; font-size: 12px; font-weight: bold; user-select: none; transition: transform 0.2s; margin-right: 6px;">▶</span>
                        ${mctype}
                    </td>`;
            dateList.forEach(date => {
                const val = obj[date] || 0;
                let bg = "#f8f9fa"; if (val > 120) bg = "#ff5252"; else if (val > 60) bg = "#ff9800"; else if (val > 30) bg = "#fff176";
                html += `<td style="text-align:right;background:${bg};">${Number(val).toLocaleString()}</td>`;
            });
            const totalVal = obj.Total || 0;
            let totalBg = "#f8f9fa"; if (totalVal > 120) totalBg = "#ff5252"; else if (totalVal > 60) totalBg = "#ff9800"; else if (totalVal > 30) totalBg = "#fff176";
            html += `<td style="text-align:right;background:${totalBg};">${Number(totalVal).toLocaleString()}</td></tr>`;
        });
        $(tr).after(html); 
        tr.addClass('shown-mctype');
        icon.text('▼').css('transform', 'rotate(0deg)');
        adjustTableLayout();
    });



    // Event handler for mctype expand icon clicks
    $('#LineDailyDowntimeTable tbody').on('click', '.expand-icon-mctype', function (e) {
        e.stopPropagation();
        const mctypeTr = $(this).closest('tr');
        const icon = $(this);
        let next = mctypeTr.next();
        while (next.hasClass('process-detail-row')) { const toRemove = next; next = next.next(); toRemove.remove(); }
        if (mctypeTr.hasClass('shown-process')) { 
            mctypeTr.removeClass('shown-process'); 
            icon.text('▶');
            adjustTableLayout();
            return; 
        }
        $('#LineDailyDowntimeTable tbody tr.process-detail-row').remove();
        $('#LineDailyDowntimeTable tbody tr.shown-process').removeClass('shown-process');
        $('#LineDailyDowntimeTable tbody .expand-icon-mctype').text('▶');

        const lineTr = mctypeTr.prevAll('tr').not('.mctype-detail-row,.process-detail-row').first();
        const lineName = lineTr.find('td').first().find('span').last().text().trim();
        const mctype = mctypeTr.find('td').first().text().trim().replace('▶', '').replace('▼', '').trim();

        const processMap = {};
        data.forEach(row => {
            if ((row.LINE_NAME || 'UNKNOWN') === lineName && (row.MC_TYPE || 'UNKNOWN') === mctype) {
                const dateObj = new Date(row.DATETIME);
                if (dateObj < startDate || dateObj > endDate) return;
                const process = row.PROCESS || "UNKNOWN";
                const dd = dateObj.getDate().toString().padStart(2, '0');
                const mmm = dateObj.toLocaleString('en-US', { month: 'short' });
                const dateKey = `${dd} ${mmm}`;
                if (!processMap[process]) processMap[process] = {};
                processMap[process][dateKey] = (processMap[process][dateKey] || 0) + (parseInt(row.TIMEMIN) || 0);
                processMap[process].Total = (processMap[process].Total || 0) + (parseInt(row.TIMEMIN) || 0);
            }
        });

        let html = '';
        Object.entries(processMap).forEach(([process, obj]) => {
            html += `<tr class="process-detail-row"><td style="padding-left:64px;white-space:nowrap;text-align:left;background:#e3f2fd;">${process}</td>`;
            dateList.forEach(date => {
                const val = obj[date] || 0;
                let bg = "#e3f2fd"; if (val > 120) bg = "#ff5252"; else if (val > 60) bg = "#ff9800"; else if (val > 30) bg = "#fff176";
                html += `<td style="text-align:right;background:${bg};">${Number(val).toLocaleString()}</td>`;
            });
            const totalVal = obj.Total || 0;
            let totalBg = "#e3f2fd"; if (totalVal > 120) totalBg = "#ff5252"; else if (totalVal > 60) totalBg = "#ff9800"; else if (totalVal > 30) totalBg = "#fff176";
            html += `<td style="text-align:right;background:${totalBg};">${Number(totalVal).toLocaleString()}</td></tr>`;
        });
        $(mctypeTr).after(html); 
        mctypeTr.addClass('shown-process');
        icon.text('▼');
        adjustTableLayout();
    });
}
function MCRecord_Table(data) {
    const tbody = document.getElementById('MCRecordDetailBody');
    const totalElem = document.getElementById('MCRecordDetailTotalQTY');
    if (!tbody) return;

    // ทำลาย DataTable เดิมก่อนเติมข้อมูล (ป้องกันโดน clear ระหว่างทาง)
    if ($.fn.DataTable.isDataTable('#MCRecordDetailTable')) {
        $('#MCRecordDetailTable').DataTable().destroy();
    }

    // Filter ทั้งเดือนตามตัวเลือก ...
    const dateFilter = $('#dateFilter').val();
    let dayInput = $('#dayInput').val();
    const monthFilter = $('#monthFilter').val();
    const yearFilter = $('#yearFilter').val();

    function parseDdMmYyyy(s) { const p=s.split('/'); if (p.length!==3) return null; let y=p[2]; if (y.length===2) y='20'+y; return { y:+y, m:+p[1], d:+p[0] }; }

    let targetYear, targetMonth;
    if (dateFilter === 'day' && dayInput) {
        if (dayInput.includes('/')) { const o=parseDdMmYyyy(dayInput); if (o){ targetYear=o.y; targetMonth=o.m; } }
        else if (dayInput.includes('-')) { const [y,m]=dayInput.split('-'); targetYear=+y; targetMonth=+m; }
    } else if (dateFilter === 'yesterday') {
        const y = new Date(); y.setDate(y.getDate()-1); targetYear=y.getFullYear(); targetMonth=y.getMonth()+1;
    } else if (dateFilter === 'month') {
        if (monthFilter?.includes('-')) { const [y,m]=monthFilter.split('-'); targetYear=+y; targetMonth=+m; }
        else if (monthFilter && yearFilter) { targetYear=+yearFilter; targetMonth=+monthFilter; }
    }
    if (!targetYear || !targetMonth) { const t=new Date(); targetYear=t.getFullYear(); targetMonth=t.getMonth()+1; }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate   = new Date(targetYear, targetMonth, 0);

    let filtered = data.filter(row => {
        const d = new Date(row.DATETIME);
        return d >= startDate && d <= endDate;
    }).sort((a,b)=>new Date(a.DATETIME)-new Date(b.DATETIME));

    // กำหนดคอลัมน์/thead
    const columns = [
        { key:'DATETIME', label:'Date' },
        { key:'TIME', label:'Time', custom:(row)=>{ const t=(row.TIME||'').trim(); const tf=(row.TIMEFIN||'').trim(); return t&&tf?`${t} - ${tf}`:(t||''); }},
        { key:'LOSSCODE', label:'Code', alt:'LOSS_CODE' },
        { key:'TIMEMIN', label:'LostTime' },
        { key:'LINE_NAME', label:'Line' },
        { key:'PROCESS', label:'Process' },
        { key:'MC_NAME', label:'Machine' },
        { key:'MC_TROUBLE', label:'Trouble' }
    ];
    const thead = document.querySelector('#MCRecordDetailTable thead');
    if (thead) thead.innerHTML = `<tr>${columns.map(c=>`<th>${c.label}</th>`).join('')}</tr>`;

    // เติม tbody
    tbody.innerHTML = '';
    let total = 0;
    filtered.forEach(row => {
        const isoDate = Convert_Date(row.DATETIME || row.datetime || '');
        const dateStr = isoDate ? ShortMonthWithYear(isoDate) : '';
        const lostTime = parseInt(row.TIMEMIN)||0;
        total += lostTime;
        const tr = document.createElement('tr');
        tr.innerHTML = columns.map(col=>{
            if (col.key==='DATETIME') return `<td style="text-align:left;">${dateStr}</td>`;
            if (col.custom) return `<td style="text-align:left;">${col.custom(row)}</td>`;
            if (col.key==='LOSSCODE') return `<td style="text-align:left;">${row.LOSSCODE || row.LOSS_CODE || ''}</td>`;
            if (col.key==='TIMEMIN') return `<td style="text-align:right;">${(+lostTime).toLocaleString()}</td>`;
            return `<td style="text-align:left;">${row[col.key]||''}</td>`;
        }).join('');
        tbody.appendChild(tr);
    });

    // init DataTable หลังจากเติมแถวเรียบร้อย (กำหนดคอลัมน์ชัดเจนและแยกสไตล์ของตัวเอง)
    const dt = $('#MCRecordDetailTable')
        .addClass('mc-record-table')
        .DataTable({
            paging: false,
            searching: true,
            info: false,
            order: [],
            scrollY: '250px',
            scrollX: true,
            autoWidth: false,
            scrollCollapse: true,
            dom: 'frtip',
            buttons: [
                {
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i> Export Excel',
                    className: 'btn btn-success btn-sm',
                    title: '',
                    filename: function() {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = String(today.getMonth() + 1).padStart(2, '0');
                        const day = String(today.getDate()).padStart(2, '0');
                        return `MCRecord_Data_${year}-${month}-${day}`;
                    },
                    exportOptions: {
                        columns: ':visible',
                        rows: ':visible'
                    }
                }
            ],
            columnDefs: [
                { targets: 0, width: '110px', className: 'text-start', type: 'date-eu' }, // Date
                { targets: 1, width: '160px', className: 'text-start' }, // Time
                { targets: 2, width: '90px',  className: 'text-start' }, // Code
                { targets: 3, width: '100px', className: 'text-end'  }, // LostTime
                { targets: 4, width: '120px', className: 'text-start' }, // Line
                { targets: 5, width: '160px', className: 'text-start' }, // Process
                { targets: 6, width: '120px', className: 'text-start' }, // Mc
                { targets: 7, width: '240px', className: 'text-start' }  // Trouble
            ]
        });

    // เพิ่มปุ่ม Export Excel ต่อท้าย table-caption
    const tableCaption = document.querySelector('.mc-detail-container .table-caption');
    if (tableCaption) {
        // ลบปุ่มเก่าทั้งหมดก่อน
        const existingButtons = tableCaption.querySelectorAll('button');
        existingButtons.forEach(btn => btn.remove());
        
        const exportButton = document.createElement('button');
        exportButton.innerHTML = '<i class="fas fa-file-excel"></i> Export Excel';
        exportButton.className = 'btn btn-success btn-sm';
        exportButton.style.marginLeft = '10px';
        exportButton.onclick = function() {
            // ใช้ DataTables export
            dt.button(0).trigger();
        };
        
        // เพิ่มปุ่มต่อท้าย table-caption
        tableCaption.appendChild(exportButton);
    }

    // Function to create footer for MC Record table
    function createMCRecordFooter() {
        try {
            // Calculate total from table rows
            let totalQty = 0;
            const table = document.getElementById('MCRecordDetailTable');
            const tbody = table.querySelector('tbody');
            const rows = tbody.querySelectorAll('tr:not(.footer-row)');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 4) { // LostTime is the 4th column (index 3)
                    const lostTimeCell = cells[3];
                    const lostTimeText = lostTimeCell.textContent.replace(/,/g, '');
                    totalQty += parseInt(lostTimeText) || 0;
                }
            });
            
            // Remove existing footer row if any
            const existingFooter = tbody.querySelector('.footer-row');
            if (existingFooter) {
                existingFooter.remove();
            }
            
            // Create footer row
            const footerRow = document.createElement('tr');
            footerRow.className = 'footer-row';
            footerRow.innerHTML = `
                <td colspan="3" style="text-align:right;font-weight:bold;background:#e9ecef;border-top:1px solid #ddd;">Total</td>
                <td style="text-align:right;font-weight:bold;background:#e9ecef;border-top:1px solid #ddd;">${totalQty.toLocaleString()}</td>
                <td colspan="4" style="background:#e9ecef;"></td>
            `;
            
            // Add footer row to tbody
            tbody.appendChild(footerRow);
            
            //console.log('MC Record Footer created with total:', totalQty);
        } catch (error) {
            console.error('Error creating MC Record footer:', error);
        }
    }

    // Create footer initially
    setTimeout(createMCRecordFooter, 300);

    // Recreate footer after sorting
    dt.on('order.dt', function() {
        setTimeout(createMCRecordFooter, 100);
    });

    // Recreate footer after searching
    dt.on('search.dt', function() {
        setTimeout(createMCRecordFooter, 100);
    });

    // ปรับคอลัมน์ให้ตรงกับ header หลังจาก init
    setTimeout(() => dt.columns.adjust(), 0);
}
// 5.7 Summary
function Summary(data) {
    // ใช้ข้อมูลจาก data ที่ส่งเข้า Monitor(data)
    // โดยใช้ accOutput, planaccOutput, accInput, planaccInput

    const planInput = Number(data.planaccInput) || 0;
    const resultInput = Number(data.accInput) || 0;
    const diffInput = resultInput - planInput;
    const percentInput = planInput > 0 ? (resultInput / planInput) * 100 : 0;

    document.getElementById('summary-plan-input').textContent = planInput.toLocaleString();
    document.getElementById('summary-result-input').textContent = resultInput.toLocaleString();
    
    const diffInputElement = document.getElementById('summary-diff-input');
    diffInputElement.textContent = diffInput > 0 ? '+' + diffInput.toLocaleString() : diffInput.toLocaleString();
    diffInputElement.style.color = resultInput >= planInput ? '#2e7d32' : '#d32f2f'; // เขียวถ้า result >= plan, แดงถ้า result < plan
    
    const percentInputElement = document.getElementById('summary-percent-input');
    percentInputElement.textContent = percentInput.toFixed(0) + '%';
    percentInputElement.style.color = resultInput >= planInput ? '#2e7d32' : '#d32f2f'; // เขียวถ้า result >= plan, แดงถ้า result < plan

    const planOutput = Number(data.planaccOutput) || 0;
    const resultOutput = Number(data.accOutput) || 0;
    const diffOutput = resultOutput - planOutput;
    const percentOutput = planOutput > 0 ? (resultOutput / planOutput) * 100 : 0;

    document.getElementById('summary-plan-output').textContent = planOutput.toLocaleString();
    document.getElementById('summary-result-output').textContent = resultOutput.toLocaleString();
    
    const diffOutputElement = document.getElementById('summary-diff-output');
    diffOutputElement.textContent = diffOutput > 0 ? '+' + diffOutput.toLocaleString() : diffOutput.toLocaleString();
    diffOutputElement.style.color = resultOutput >= planOutput ? '#2e7d32' : '#d32f2f'; // เขียวถ้า result >= plan, แดงถ้า result < plan
    
    const percentOutputElement = document.getElementById('summary-percent-output');
    percentOutputElement.textContent = percentOutput.toFixed(0) + '%';
    percentOutputElement.style.color = resultOutput >= planOutput ? '#2e7d32' : '#d32f2f'; // เขียวถ้า result >= plan, แดงถ้า result < plan
}
function Summary_Chart(resultRows, planRows, type, daily, dayInput) {
    // สำหรับ accumulate ใช้ monthFilter แทน dayInput
    if (!daily) {
        const monthFilter = $('#monthFilter').val();
        if (monthFilter && monthFilter.includes('-')) {
            // monthFilter เป็น yyyy-mm
            const [year, month] = monthFilter.split('-').map(Number);
            const lastDay = new Date(year, month, 0).getDate();
            dayInput = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
        }
    }
    
    dayInput = Convert_Date(dayInput);

    let chartId = '';
    let chartTitle = '';
    if (type === 'input') {
        chartId = daily ? 'dailyInputSummaryChart' : 'accInputSummaryChart';
        chartTitle = daily ? 'Daily Input' : 'Accumulate Input';
    } else {
        chartId = daily ? 'dailyOutputSummaryChart' : 'accOutputSummaryChart';
        chartTitle = daily ? 'Daily Output' : 'Accumulate Output';
    }

    // ✅ หาวันที่ล่าสุดที่มี Result สำหรับแต่ละ LINE
    const lineMap = {}; 
    const lineLastResultDate = {}; // เก็บวันที่ล่าสุดที่มี result สำหรับแต่ละ line

    // หาวันที่ล่าสุดที่มี Result สำหรับแต่ละ LINE
    (resultRows || []).forEach(row => {
        const line = row.LINE_NAME || 'UNKNOWN';
        const date = Convert_Date(row.COMPLETION_PRASS_DATE || row.completion_prass_date || '');
        
        if (!lineLastResultDate[line] || date > lineLastResultDate[line]) {
            lineLastResultDate[line] = date;
        }
    });

    // รวมข้อมูล Plan เฉพาะถึงวันที่ล่าสุดที่มี Result สำหรับแต่ละ LINE
    (planRows || []).forEach(row => {
        const line = row.LINE_NAME || 'UNKNOWN';
        const date = Convert_Date(row.DATETIME || row.datetime || '');
        const qty = parseInt(row.QTY) || 0;

        if (!lineMap[line]) lineMap[line] = { plan: 0, result: 0 };
        
        // ใช้ cutoff date เป็นวันที่ล่าสุดที่มี result สำหรับ line นั้น หรือ dayInput ถ้าไม่มี result
        const cutoffDate = lineLastResultDate[line] || dayInput;
        
        if (daily) {
            if (date === dayInput) lineMap[line].plan += qty;
        } else {
            if (date <= cutoffDate) lineMap[line].plan += qty;
        }
    });

    // รวมข้อมูล Result
    (resultRows || []).forEach(row => {
        const line = row.LINE_NAME || 'UNKNOWN';
        const date = Convert_Date(row.COMPLETION_PRASS_DATE || row.completion_prass_date || '');
        const qty = parseInt(row.WIP_QTY) || 0;

        if (!lineMap[line]) lineMap[line] = { plan: 0, result: 0 };
        if (daily) {
            if (date === dayInput) lineMap[line].result += qty;
        } else {
            if (date <= dayInput) lineMap[line].result += qty;
        }
    });

    // ✅ เตรียม labels และ datasets
    const labels = Object.keys(lineMap);
    const planData = labels.map(line => lineMap[line].plan);
    const resultData = labels.map(line => lineMap[line].result);
    const percentData = labels.map(line => {
        const plan = lineMap[line].plan;
        const result = lineMap[line].result;
        return plan > 0 ? ((result / plan) * 100).toFixed(0) : 0;
    });

    // เพิ่มตรงนี้: คำนวณ max ของ y เพื่อกัน datalabel ทับ legend
    const maxY = Math.max(...planData, ...resultData);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.25) : 10;
    
    // คำนวณ max ของ percentage เพื่อตั้งค่าแกน Y ด้านขวา
    const maxPercent = Math.max(...percentData.map(p => parseFloat(p) || 0));
    const yPercentMax = maxPercent > 0 ? Math.ceil(maxPercent * 1.1) : 100; // เพิ่ม 10% เพื่อให้มีพื้นที่ว่าง

    const ctx = document.getElementById(chartId).getContext('2d');
    if (window[chartId] && typeof window[chartId].destroy === 'function') window[chartId].destroy();
    window[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '%',
                    data: percentData,
                    type: 'line',
                    yAxisID: 'yPercent',
                    borderColor: '#E49B0F',
                    backgroundColor: 'rgba(255,152,0,0.15)',
                    borderWidth: 2,
                    pointRadius: 2,
                    pointBackgroundColor: '#E49B0F',
                    order: 0,
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        offset: 2,
                        color: '#E49B0F',
                        font: { weight: 'bold', size: 9 },
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        borderColor: '#E49B0F',
                        borderWidth: 1,
                        borderRadius: 4,
                        padding: 3,
                        clip: false,
                        formatter: function(value) {
                            return value + '%';
                        }
                    }
                },
                {
                    label: 'Plan',
                    data: planData,
                    backgroundColor: '#4F81BD',
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        offset: 2,
                        color: '#000',
                        font: { weight: 'bold', size: 9 },
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        borderColor: '#4F81BD',
                        borderWidth: 1,
                        borderRadius: 4,
                        padding: 3,
                        clip: false,
                        formatter: function(value) { return FormatKUnit(value, ''); }
                    }
                },
                {
                    label: 'Result',
                    data: resultData,
                    backgroundColor: '#388E3C',
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        offset: 2,
                        color: '#388E3C',
                        font: { weight: 'bold', size: 9 },
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        borderColor: '#388E3C',
                        borderWidth: 1,
                        borderRadius: 4,
                        padding: 3,
                        clip: false,
                        formatter: function(value) { return FormatKUnit(value, ''); }
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: chartTitle },
                datalabels: {}
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'QTY' },
                    max: yMax,
                    ticks: {
                        callback: function(value) {
                            return FormatKUnit(value, 'dashboard');
                        }
                    }
                },
                yPercent: {
                    position: 'right',
                    beginAtZero: false,
                    min: -50,
                    max: yPercentMax,
                    title: { display: true, text: '%' },
                    grid: { drawOnChartArea: false },
                    ticks: {
                        callback: function(value) {
                            if (value < 0) {
                                return ''; // ไม่แสดงค่าติดลบ
                            }
                            return value + '%';
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
// ================================================================
// 6.Utility
// ================================================================ 
$.fn.dataTable.ext.type.order['date-eu-pre'] = function (data) {
    if (!data) return 0;
    
    // Handle DD/MM/YYYY format
    if (data.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const parts = data.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    }
    
    // Handle DD-MMM-YY format (like 15-Jan-24)
    if (data.match(/^\d{1,2}-[A-Za-z]{3}-\d{2}$/)) {
        const months = { 
            Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06', 
            Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12',
            JAN:'01', FEB:'02', MAR:'03', APR:'04', MAY:'05', JUN:'06', 
            JUL:'07', AUG:'08', SEP:'09', OCT:'10', NOV:'11', DEC:'12'
        };
        const parts = data.split('-');
        const day = parts[0].padStart(2, '0');
        const month = months[parts[1]];
        const year = '20' + parts[2];
        return new Date(year, month - 1, day).getTime();
    }
    
    // Handle YYYY-MM-DD format
    if (data.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
        return new Date(data).getTime();
    }
    
    // Handle DD/MM/YY format
    if (data.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
        const parts = data.split('/');
        const year = '20' + parts[2];
        return new Date(year, parts[1] - 1, parts[0]).getTime();
    }
    
    return 0;
};
$.fn.dataTable.ext.type.order['date-eu-asc'] = function (a, b) {
    return a - b;
};
$.fn.dataTable.ext.type.order['date-eu-desc'] = function (a, b) {
    return b - a;
};
function FormatKUnit(value, type) {
    if (type === 'monitor') {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
        } else {
            return (value / 1000).toFixed(0).replace(/\.0$/, '') + 'K';
        }
    } else if (type === 'dashboard') {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(2).replace(/\.0$/, '') + 'M';
    } else {
            return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        } 
    } else if (type === 'chart') {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(2).replace(/\.0$/, '') + 'M';
        } else {
            return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        } 
        } else {
            return value.toLocaleString();
    }
}
function ShortMonth(isoDateStr) {
    if (!isoDateStr || typeof isoDateStr !== 'string') return '';
    const [year, month, day] = isoDateStr.split('-');
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    const monthAbbr = monthNames[monthIndex] || month;
    return `${day} ${monthAbbr}`;
}
function ShortMonthWithYear(isoDateStr) {
    if (!isoDateStr || typeof isoDateStr !== 'string') return '';
    const [year, month, day] = isoDateStr.split('-');
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    const monthAbbr = monthNames[monthIndex] || month;
    return `${day} ${monthAbbr} ${year}`;
}
function Convert_Date(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';

    // 📌 กรณี dateStr = '2025-07-15'
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    // 📌 กรณี dateStr = '15/07/2025'
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day.padStart(2, '0')}`;
    }

    // 📌 กรณี dateStr = '01-JUL-25'
    const months = {
        JAN: '01', FEB: '02', MAR: '03', APR: '04',
        MAY: '05', JUN: '06', JUL: '07', AUG: '08',
        SEP: '09', OCT: '10', NOV: '11', DEC: '12'
    };
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
        // รองรับรูปแบบเช่น '10 AUG 2026' หรือ '10 AUG 2026 05:10'
        const spaceMonthMatch = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
        if (spaceMonthMatch) {
            const day = spaceMonthMatch[1].padStart(2, '0');
            const mon = spaceMonthMatch[2].toUpperCase().slice(0,3);
            const year = spaceMonthMatch[3];
            const monthNum = months[mon];
            if (monthNum) return `${year}-${monthNum}-${day}`;
        }
        return '';
    }

    const [day, mon, year] = parts;
    let fullYear = parseInt(year, 10);
    if (fullYear < 50) fullYear += 2000;
    else if (fullYear < 100) fullYear += 1900;

    const monthNum = months[mon?.toUpperCase()];
    if (!monthNum) return '';

    return `${fullYear}-${monthNum}-${day.padStart(2, '0')}`;
}
function Color(i) {
    // ใช้ชุดสีที่นุ่มนวลแต่ไม่เป็นพาสเทล
    const palette = [
        '#6B9AC4', // Soft Blue
        '#E87979', // Muted Red
        '#A1D1A1', // Dusty Green
        '#C79A63', // Sandy Brown
        '#9C77B0', // Soft Purple
        '#63C7B2', // Teal
        '#F7C873', // Mustard Yellow
        '#82A3A4', // Slate Gray
        '#9C6381', // Mauve
        '#A0A4B8'  // Periwinkle
    ];
    return palette[i % palette.length];
}