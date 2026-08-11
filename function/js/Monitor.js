// ================================================================
// 1.Setting
// ================================================================
document.addEventListener('DOMContentLoaded', function() {  
    // ล้าง window. ทุกตัวก่อนใช้งาน
    if ('productTypeMapping' in window) delete window.productTypeMapping;
    if ('displayProductTypes' in window) delete window.displayProductTypes;
    if ('currentDisplayProductTypeIndex' in window) delete window.currentDisplayProductTypeIndex;
    if ('cycleProductType' in window) delete window.cycleProductType;
    if ('updateProductTypeDisplay' in window) delete window.updateProductTypeDisplay;
    if ('monitorData' in window) delete window.monitorData;
    if ('wipData' in window) delete window.wipData;
    if ('statusData' in window) delete window.statusData;
    if ('downtimeData' in window) delete window.downtimeData;
    if ('wipStatusChart' in window) delete window.wipStatusChart;
    if ('wipLineChart' in window) delete window.wipLineChart;
    if ('totalWipChart' in window) delete window.totalWipChart;
    if ('wipStatusLabelInterval' in window) delete window.wipStatusLabelInterval;
    if ('machineStatusInterval' in window) delete window.machineStatusInterval;

    // Product type mapping: display name -> API value
    window.productTypeMapping = {
        'typeA': 'typeA',
        'typeB': 'typeB', 
        'typeC': 'typeC'
    };

    // Get display product types from mapping keys
    window.displayProductTypes = Object.keys(window.productTypeMapping);
    window.currentDisplayProductTypeIndex = 0;
    
    // ฟังก์ชันสำหรับเปลี่ยน Product Type
    function cycleProductType() {
        const currentDisplayProductType = window.displayProductTypes[window.currentDisplayProductTypeIndex];
        const apiProductType = window.productTypeMapping[currentDisplayProductType];
        return apiProductType;
    }
    
    // ฟังก์ชันสำหรับแสดง Product Type ใน product-type-container
    function updateProductTypeDisplay() {
        const currentDisplayProductType = window.displayProductTypes[window.currentDisplayProductTypeIndex];
        
        const productTypeElement = document.getElementById('product-type-container');
        
        if (productTypeElement) {
            productTypeElement.innerHTML = `
                <div style="display: flex; flex-direction: column; height: 100%; justify-content: center; align-items: center; text-align: center;">
                    <div style="font-size: 1.6em; font-weight: bold; color:rgb(104, 233, 108);">
                        ${currentDisplayProductType}
                    </div>
                </div>
            `;
        }
    }
    
    // เก็บฟังก์ชันไว้ใน global scope
    window.cycleProductType = cycleProductType;
    window.updateProductTypeDisplay = updateProductTypeDisplay;
    
    // รีเซ็ต index เป็น 0 เมื่อเริ่มใช้งานใหม่
    window.currentDisplayProductTypeIndex = 0;
    
    // โหลดข้อมูลครั้งแรก
    Load_Monitor_Data();
    Load_WIP_Data();
    Load_Machine_Status_Data();
    Load_McRecord_Data();
    
    // ตั้งเวลาให้โหลดข้อมูลใหม่ทุก 60 วินาที
    setInterval(() => {
        console.log('Auto-refreshing data...');
        
        // ล้าง window. ข้อมูลก่อนดึงใหม่
        if ('monitorData' in window) delete window.monitorData;
        if ('wipData' in window) delete window.wipData;
        if ('statusData' in window) delete window.statusData;
        if ('downtimeData' in window) delete window.downtimeData;
        if ('machineStatusInterval' in window) {
            clearInterval(window.machineStatusInterval);
            delete window.machineStatusInterval;
        }

        // เพิ่ม index สำหรับ Product Type
        window.currentDisplayProductTypeIndex = (window.currentDisplayProductTypeIndex + 1) % window.displayProductTypes.length;
        
        Load_Monitor_Data();
        Load_WIP_Data();
        Load_Machine_Status_Data();
        Load_McRecord_Data();
    }, 60000);
});
// ================================================================
// 2.Data
// ================================================================
function Load_Monitor_Data(){
    // ใช้ Product Type ที่วนไปแทนการดึงจาก filter
    const productType = window.cycleProductType ? window.cycleProductType() : 'typeA';
    
    const formData = new FormData();
    formData.append('productType', productType);
    formData.append('dateFilter', 'today');
    
    fetch('./function/Dashboard/Data_Monitors.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Monitor data updated:', new Date().toLocaleTimeString(), 'Product Type:', productType);
        console.log(data);
        if (data.error) {
            console.error('Server error:', data.error);
            return;
        }
        
        // เก็บข้อมูลไว้ใน window
        window.monitorData = data;
        
        // ตรวจสอบว่าข้อมูลครบหรือยัง ถ้าครบแล้วค่อยสร้าง
        if (window.monitorData && window.wipData && window.statusData && window.downtimeData) {
            Show();
        }
    })
    .catch(error => {
        console.error('Monitor data fetch error:', error);
    });
}
function Load_WIP_Data(){
    // ใช้ Product Type ที่วนไปแทนการดึงจาก filter
    const productType = window.cycleProductType ? window.cycleProductType() : 'TypeA';
    
    const params = new URLSearchParams();
    params.append('productType', productType);
    
    fetch(`./function/Dashboard/Data_WIP.php?${params.toString()}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('WIP data updated:', new Date().toLocaleTimeString(), 'Product Type:', productType);
        console.log(data);
        if (data.error) {
            console.error('WIP Error:', data.error);
        }
        
        // เก็บข้อมูลไว้ใน window
        window.wipData = data;
        
        // ตรวจสอบว่าข้อมูลครบหรือยัง ถ้าครบแล้วค่อยสร้าง
        if (window.monitorData && window.wipData && window.statusData && window.downtimeData) {
            Show();
        }
    })
    .catch(error => {
        console.error('WIP data fetch error:', error);
    });
}
function Load_Machine_Status_Data(){
    // ใช้ Product Type ที่วนไปแทนการดึงจาก filter
    const productType = window.cycleProductType ? window.cycleProductType() : 'TypeA';
    
    // ไม่ดึงข้อมูลสำหรับ CASE และ DENSO24CY
    if (productType === 'DENSO24CY') {
        console.log('Skipping Status data for Product Type:', productType);
        // เก็บข้อมูลเปล่า
        window.statusData = { statusData: [] };
        
        // ตรวจสอบว่าข้อมูลครบหรือยัง ถ้าครบแล้วค่อยสร้าง
        if (window.monitorData && window.wipData && window.statusData && window.downtimeData) {
            Show();
        }
        return;
    }
    
    const formData = new FormData();
    formData.append('productType', productType);
    formData.append('dateFilter', 'today');
    formData.append('dayInput', '');
    formData.append('monthFilter', '');
    formData.append('yearFilter', '');
    
    fetch('./function/Dashboard/Data_Status.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Status data updated:', new Date().toLocaleTimeString(), 'Product Type:', productType);
        console.log(data);
        if (data.error) {
            console.error('Status Server error:', data.error);
        }
        
        // เก็บข้อมูลไว้ใน window
        window.statusData = data;
        
        // ตรวจสอบว่าข้อมูลครบหรือยัง ถ้าครบแล้วค่อยสร้าง
        if (window.monitorData && window.wipData && window.statusData && window.downtimeData) {
            Show();
        }
    })
    .catch(error => {
        console.error('Status data fetch error:', error);
    });
}
function Load_McRecord_Data(){
    // ใช้ Product Type ที่วนไปแทนการดึงจาก filter
    const productType = window.cycleProductType ? window.cycleProductType() : 'TypeA';
    
    const formData = new FormData();
    formData.append('productType', productType);
    formData.append('dateFilter', 'today');
    formData.append('dayInput', '');
    formData.append('monthFilter', '');
    formData.append('yearFilter', '');
    
    fetch('./function/Dashboard/Data_MCRecord.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Downtime data updated:', new Date().toLocaleTimeString(), 'Product Type:', productType);
        console.log(data);
        if (data.error) {
            console.error('Downtime Server error:', data.error);
        }
        
        // เก็บข้อมูลไว้ใน window
        window.downtimeData = data;
        
        // ตรวจสอบว่าข้อมูลครบหรือยัง ถ้าครบแล้วค่อยสร้าง
        if (window.monitorData && window.wipData && window.statusData && window.downtimeData) {
            Show();
        }
    })
    .catch(error => {
        console.error('Downtime data fetch error:', error);
    });
}
// ================================================================
// 3.Display
// ================================================================
function Update_Last_Refresh(serverTime) {
    // ใช้เวลาจาก server ถ้ามี ถ้าไม่มีให้ใช้เวลาจากเครื่อง
    let timeString;
    
    if (serverTime) {
        // ใช้เวลาจาก server
        timeString = serverTime;
    } else {
        // fallback: ใช้เวลาจากเครื่อง
        const now = new Date();
        timeString = now.toLocaleString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // ดึง Product Type ปัจจุบัน (ใช้ index ปัจจุบันก่อนที่จะเพิ่ม)
    const currentDisplayProductType = window.displayProductTypes[window.currentDisplayProductTypeIndex];
    const currentProductType = window.productTypeMapping[currentDisplayProductType] || 'TypeA';
    
    // แสดงเวลาอัปเดตล่าสุดใน console
    console.log(`Dashboard refreshed at: ${timeString} - Product Type: ${currentProductType}`);
    
    // แสดงเวลารีเฟรชล่าสุดใน date-time-container
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.innerHTML = `
            <div style="font-size: 1.2em;">Last Update: ${timeString}</div>
        `;
    }
}
function Cal_Daily_Data(data, planData, planType) {
    let dailyTotal = 0;
    let planTotal = 0;
    
    // คำนวณข้อมูลทั้งหมด (ไม่กรองตามวันที่) เหมือน Cal_Monitor
    if (data && Array.isArray(data)) {
        data.forEach(item => {
            dailyTotal += parseInt(item.WIP_QTY) || 0;
        });
    }
    
    // คำนวณ Plan
    if (planData && Array.isArray(planData)) {
        // ตรวจสอบว่ามี CREATE_TYPE === '1' หรือไม่
        const hasCreateType1 = planData.some(item => item.CREATE_TYPE === '1');
        const targetCreateType = hasCreateType1 ? '1' : '0';
        
        planData.forEach(item => {
            if (item.TYPE === planType && item.CREATE_TYPE === targetCreateType) {
                planTotal += parseFloat(item.QTY) || 0;
            }
        });
    }
    
    return { dailyTotal, planTotal };
}
function Cal_Acc_Data(data, planData, planType, wipData = 0) {
    let accTotal = 0;
    let accPlanTotal = 0;
    
    // ดึง productType ปัจจุบัน
    const productType = window.cycleProductType ? window.cycleProductType() : 'TypeA';
    
    // คำนวณผลรวมทั้งหมดของข้อมูลหลัก (ไม่สนใจวันที่)
    if (data && Array.isArray(data)) {
        data.forEach(item => {
            accTotal += parseInt(item.WIP_QTY) || 0;
        });
    }
    
    // เพิ่ม WIPData สำหรับ Acc Output
    accTotal += wipData;
    
    // หาวันล่าสุดที่ result มีข้อมูล
    let latestResultDate = '';
    if (data && Array.isArray(data) && data.length > 0) {
        latestResultDate = data.reduce((latest, item) => {
            // ใช้ COMPLETION_PRASS_DATE1 สำหรับ CASE
            let completionDate = '';
            if (productType === 'CASE') {
                completionDate = item.COMPLETION_PRASS_DATE1 || item.completion_prass_date1 || '';
            } else {
                completionDate = item.COMPLETION_PRASS_DATE || item.completion_prass_date || '';
            }
            
            // แปลงวันที่เป็น Date object สำหรับการเปรียบเทียบ
            try {
                const currentDate = new Date(completionDate);
                const latestDate = new Date(latest);
                
                if (isNaN(currentDate.getTime())) {
                    return latest; // ถ้าแปลงไม่ได้ ให้ใช้ค่าเดิม
                }
                
                if (latest === '' || isNaN(latestDate.getTime()) || currentDate > latestDate) {
                    return completionDate;
                }
            } catch (error) {
                // ถ้าแปลงไม่ได้ ให้ใช้การเปรียบเทียบแบบ string
                return completionDate > latest ? completionDate : latest;
            }
            
            return latest;
        }, '');
    }
    
    // คำนวณผลรวมของ Plan เฉพาะถึงวันล่าสุดที่ result มีข้อมูล
    if (planData && Array.isArray(planData)) {
        // ตรวจสอบว่ามี CREATE_TYPE === '1' หรือไม่
        const hasCreateType1 = planData.some(item => item.CREATE_TYPE === '1');
        const targetCreateType = hasCreateType1 ? '1' : '0';
        
        planData.forEach(item => {
            if (item.TYPE === planType && item.CREATE_TYPE === targetCreateType) {
                // ตรวจสอบว่าวันที่ของ plan ไม่เกินวันล่าสุดที่ result มีข้อมูล
                const planDate = item.DATETIME || '';
                
                // แปลงวันที่เป็น Date object สำหรับการเปรียบเทียบ
                try {
                    const planDateObj = new Date(planDate);
                    const latestResultDateObj = new Date(latestResultDate);
                    
                    if (isNaN(planDateObj.getTime()) || isNaN(latestResultDateObj.getTime())) {
                        // ถ้าแปลงไม่ได้ ให้ใช้การเปรียบเทียบแบบ string
                        if (!latestResultDate || planDate <= latestResultDate) {
                            accPlanTotal += parseFloat(item.QTY) || 0;
                        }
                    } else {
                        // เปรียบเทียบวันที่
                        if (!latestResultDate || planDateObj <= latestResultDateObj) {
                            accPlanTotal += parseFloat(item.QTY) || 0;
                        }
                    }
                } catch (error) {
                    // ถ้าแปลงไม่ได้ ให้ใช้การเปรียบเทียบแบบ string
                    if (!latestResultDate || planDate <= latestResultDate) {
                        accPlanTotal += parseFloat(item.QTY) || 0;
                    }
                }
            }
        });
    }
    
    return { accTotal, accPlanTotal };
}
function UpdateDisplay(dailyTotal, planTotal, elementSelector, title) {
    const element = document.querySelector(elementSelector);
    if (!element) return;
    
    // ตรวจสอบว่าเป็น Daily หรือ Accumulate
    const isDaily = title.includes('Daily');
    
    let comparisonPlan, displayPlan;
    
    if (isDaily) {
        // สำหรับ Daily: คำนวณ hour จากเวลาของ Update_Last_Refresh (serverTime)
        const serverTime = window.monitorData ? window.monitorData.serverTime : null;
        
        if (serverTime) {
            // แปลง serverTime string "HH:MM:SS" เป็น hour และ minute
            const timeMatch = serverTime.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/);
            if (timeMatch) {
                const hour = parseInt(timeMatch[1]);
                const minute = parseInt(timeMatch[2]);
                
                // คำนวณช่วงเวลา: hour*2 + (minute > 30 ? 1 : 0)
                const timeSlot = (hour * 2) + (minute > 30 ? 1 : 0);
                
                // คำนวณ plan ใหม่: plan/48 * ช่วงเวลา
                comparisonPlan = (planTotal / 48) * timeSlot;
                
                console.log('Server time:', serverTime, 'hour:', hour, 'minute:', minute, 'timeSlot:', timeSlot, 'comparisonPlan:', comparisonPlan);
            } else {
                // ถ้าแปลง serverTime ไม่ได้ ให้ใช้ plan เดิม
                comparisonPlan = planTotal;
                console.log('Cannot parse serverTime:', serverTime);
            }
        } else {
            // ถ้าไม่มี serverTime ให้ใช้ plan เดิม
            comparisonPlan = planTotal;
            console.log('No serverTime available');
        }
        displayPlan = planTotal; // แสดง plan เดิม
        console.log('Daily adjustedPlan:', comparisonPlan);
    } else {
        // สำหรับ Accumulate: ใช้ plan เดิม
        comparisonPlan = planTotal;
        displayPlan = planTotal;
    }
    
    // กำหนดสีและไอคอนตามการเปรียบเทียบ
    let color, icon;
    if (dailyTotal > comparisonPlan) {
        color = '#4CAF50'; // สีเขียว
        icon = `<svg width="22" height="22" style="vertical-align:middle;margin-left:6px;">
            <polyline points="5,12 10,17 17,6" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="5,12 10,17 17,6" fill="none" stroke="lightgreen" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    } else {
        color = '#f44336'; // สีแดง
        icon = `<svg width="22" height="22" style="vertical-align:middle;margin-left:6px;">
            <line x1="11" y1="5" x2="11" y2="12" stroke-width="5" stroke-linecap="round"/>
            <line x1="11" y1="5" x2="11" y2="12" stroke="red" stroke-width="3" stroke-linecap="round"/>
            <circle cx="11" cy="18" r="2" fill="red" stroke-width="2"/>
        </svg>`;
    }
    
    element.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; justify-content: center; align-items: center; text-align: center;">
            <div>
                <div class="simple-title">${title}</div>
                <div style="font-size: 1.6em; font-weight: bold; color: ${color}; display: flex; align-items: center; justify-content: center;">
                    ${Math.round(dailyTotal).toLocaleString()}${icon}
                </div>
            </div>
            <div style="margin-top: 5px;">
                <div style="font-size: 1em; color: #888;">Plan ${Math.round(planTotal).toLocaleString()}</div>
            </div>
            <div class="percentage-difference-container" style="margin-top: 3px;">
                <div class="percentage-value" style="font-size: 1.2em; color: ${dailyTotal > comparisonPlan ? '#4CAF50' : '#f44336'};">
                    ${planTotal > 0 ? Math.round((dailyTotal / planTotal) * 100) : 0}%
                </div>
                <div class="difference-value" style="font-size: 1.2em; color: ${dailyTotal > comparisonPlan ? '#4CAF50' : '#f44336'};">
                    ${dailyTotal >= planTotal ? '+' : ''}${Math.round(dailyTotal - planTotal).toLocaleString()}
                </div>
            </div>
        </div>
    `;
}
function Machine_Status_Line(data) {
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

    // จัดเรียงให้ 'NORMAL' อยู่หน้าสุดเสมอ
    const sortedStatuses = Array.from(statuses).sort((a, b) => {
        if (a === 'NORMAL') return -1;
        if (b === 'NORMAL') return 1;
        return a.localeCompare(b);
    });
    const datasets = sortedStatuses.map((status, i) => {
        return {
            label: (status === 'NORMAL' ? 'NORMAL' : 'REPAIR'),
            data: lines.map(line => statusCountMap[line][status] || 0),
            backgroundColor: (status === 'NORMAL' ? '#4CBB17' : '#FFBF00'),
            categoryPercentage: 0.9,
            barPercentage: 0.8,
        };
    });

    const allValues = datasets.flatMap(ds => ds.data);
    const maxY = Math.max(...allValues);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.5) : 10;
    
    const ctx = document.getElementById('machineStatusByLineChart');
    if (!ctx) {
        console.error('machineStatusByLineChart canvas not found!');
        return;
    }
    
    // ตรวจสอบว่า canvas ยังอยู่ใน DOM หรือไม่
    if (!document.body.contains(ctx)) {
        console.log('machineStatusByLineChart canvas no longer in DOM');
        return;
    }
    
    // ลบ chart เดิมหากมี
    if (window.machineStatusByLineChart && typeof window.machineStatusByLineChart.destroy === 'function') {
        try {
            window.machineStatusByLineChart.destroy();
        } catch (error) {
            console.log('Error destroying machineStatusByLineChart:', error);
        }
    }
        
    // ตรวจสอบว่า ChartDataLabels plugin มีอยู่หรือไม่
    const plugins = [];
    if (typeof ChartDataLabels !== 'undefined') {
        plugins.push(ChartDataLabels);
    } else {
        console.log('ChartDataLabels plugin not found, datalabels will not work');
    }
    
    window.machineStatusByLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: lines,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 20,
                        font: { size: 12 },
                        color: '#fff'
                    }
                },
                title: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#fff',
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
                        color: '#fff',
                        autoSkip: false,
                        maxRotation: 0,
                        font: { size: 13},
                        weight: 'bold',
                        callback: function(value, index, ticks) {
                            const label = this.getLabelForValue(value);
                            // แบ่งชื่อที่ยาวเป็นหลายบรรทัด
                            if (label.length > 8) {
                                const words = label.split(' ');
                                if (words.length > 1) {
                                    // แบ่งตามช่องว่าง
                                    return words;
                                } else {
                                    // แบ่งตามตัวอักษรถ้าไม่มีช่องว่าง
                                    const mid = Math.ceil(label.length / 2);
                                    return [label.substring(0, mid), label.substring(mid)];
                                }
                            }
                            return label;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    stacked: true,
                    display: false,
                    max: yMax
                }
            }
        },
        plugins: plugins
    });
}
function Line_Loss_Time(data) {
    // กรองเฉพาะ LOSSCODE = 'WR'
    let filteredData = data;

    const group = {};
    filteredData.forEach(row => {
        const line = row.LINE_NAME || 'UNKNOWN';
        const time = parseInt(row.TIMEMIN) || 0;
        if (time > 0) {
            group[line] = (group[line] || 0) + time;
        }
    });
    
    // --- เรียงตามชื่อ line ---
    const sorted = Object.entries(group).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }));
    const labels = sorted.map(([line]) => line);
    const values = sorted.map(([_, value]) => value);
    
    // ดึง Product Type ปัจจุบันเพื่อกำหนด threshold
    const productType = window.cycleProductType ? window.cycleProductType() : 'MAOPN&OS3';
    
    // กำหนด threshold ตาม Product Type
    let thresholdValue = 60; // default สำหรับ MAOPN และ product อื่นๆ
    if (productType === 'CASE') {
        thresholdValue = 15; // 15 นาที สำหรับ CASE
    }
    
    // เปลี่ยนสี bar เป็นแดงเมื่อค่าเกิน threshold ที่กำหนด
    const bgColors = values.map(value => value > thresholdValue ? '#f44336' : '#FFCE56');

    const maxY = Math.max(...values);
    const yMax = maxY > 0 ? Math.ceil(maxY * 1.5) : 10;
    
    const ctx = document.getElementById('lineLossTimeChart');
    if (!ctx) {
        console.error('lineLossTimeChart canvas not found!');
        return;
    }
    
    // ตรวจสอบว่า canvas ยังอยู่ใน DOM หรือไม่
    if (!document.body.contains(ctx)) {
        console.log('lineLossTimeChart canvas no longer in DOM');
        return;
    }
    
    // ลบ chart เดิมหากมี
    if (window.lineLossTimeChart && typeof window.lineLossTimeChart.destroy === 'function') {
        try {
            window.lineLossTimeChart.destroy();
        } catch (error) {
            console.log('Error destroying lineLossTimeChart:', error);
        }
    }
        
    // ตรวจสอบว่า ChartDataLabels plugin มีอยู่หรือไม่
    const plugins = [];
    if (typeof ChartDataLabels !== 'undefined') {
        plugins.push(ChartDataLabels);
    } else {
        console.log('ChartDataLabels plugin not found, datalabels will not work');
    }
    
    window.lineLossTimeChart = new Chart(ctx, {
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
                legend: { display: false },
                title: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#fff',
                    font: { weight: 'bold', size: 16 },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: 4,
                    padding: 4,
                    formatter: function(value) {
                        return typeof value === 'number' ? value.toLocaleString() : value.toLocaleString() + ' min';
                    }
                }
            },
            layout: { padding: { top: 20, right: 10, bottom: 10, left: 10 } },
            scales: {
                y: {
                    display: false,
                    max: yMax
                },
                x: {
                    ticks: {
                        color: '#fff',
                        font: { size: 15 },
                        maxRotation: 0,
                        autoSkip: false,
                        callback: function(value, index, ticks) {
                            const label = this.getLabelForValue(value);
                            // แบ่งชื่อที่ยาวเป็นหลายบรรทัด
                            if (label.length > 8) {
                                const words = label.split(' ');
                                if (words.length > 1) {
                                    // แบ่งตามช่องว่าง
                                    return words;
                                } else {
                                    // แบ่งตามตัวอักษรถ้าไม่มีช่องว่าง
                                    const mid = Math.ceil(label.length / 2);
                                    return [label.substring(0, mid), label.substring(mid)];
                                }
                            }
                            return label;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        },
        plugins: plugins
    });
}
function WIP_Status(wipData) {
    // หาวันล่าสุดจาก WIP_DATE
    const latestDate = wipData.reduce((latest, row) => {
        const currentDate = row.WIP_DATE || '';
        return currentDate > latest ? currentDate : latest;
    }, '');
    
    // กรองข้อมูลเฉพาะวันล่าสุด
    const filteredData = wipData.filter(row => (row.WIP_DATE || '') === latestDate);
    
    const group = {};
    filteredData.forEach(row => {
        const process = row.WIP_PROCESS_NAME || 'UNKNOWN';
        
        // ไม่รวม Input process
        if (process === 'Input') {
            return; 
        }
        
        const status = row.LOT_STATUS || 'UNKNOWN';
        group[status] = (group[status] || 0) + (parseInt(row.WIP_QTY) || 0);
    });

    const keys = Object.keys(group).sort((a, b) => group[a] - group[b]);
    const total = keys.reduce((sum, label) => sum + group[label], 0);
    const labels = keys;
    const values = keys.map(label => group[label]);
    
    // กำหนดสีตาม status
    const bgColors = keys.map(label => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel === 'normal' || lowerLabel === 'release') {
            return '#36A2EB'; // สีฟ้า
        } else {
            // สีที่ดูอันตราย ไม่ซ้ำกัน
            const dangerColors = [
                '#FF5722',
                '#3F51B5',
                '#FFC000	'
            ];
            // ใช้ index ของ label ใน keys array เพื่อเลือกสี
            const index = keys.indexOf(label);
            return dangerColors[index % dangerColors.length];
        }
    });
    
    let currentChart = null;
    
    // ประกาศ currentLegendIndex เป็น global variable
    if (typeof window.wipStatusLegendIndex === 'undefined') {
        window.wipStatusLegendIndex = 0;
    }

    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: function(chart) {
            const {ctx, chartArea} = chart;
            const centerX = chartArea.left + (chartArea.right - chartArea.left) / 2;
            const centerY = chartArea.top + (chartArea.bottom - chartArea.top) / 2;
            
            // วาดพื้นหลัง
            const bgWidth = 100;
            const bgHeight = 50;
            const bgX = centerX - bgWidth / 2;
            const bgY = centerY - bgHeight / 2;
            
            ctx.save();
            
            // วาดพื้นหลัง
            ctx.fillStyle = 'rgba(71, 71, 71, 0.72)';
            ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
            
            // วาดข้อความ
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                total.toLocaleString(),
                centerX,
                centerY - 8
            );
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(
                'QTY',
                centerX,
                centerY + 8
            );
            
            ctx.restore();
        }
    };

    const ctx = document.getElementById('wipStatusChart');
    if (!ctx) {
        console.error('wipStatusChart canvas not found!');
        return;
    }
    
    // ตรวจสอบว่า canvas ยังอยู่ใน DOM หรือไม่
    if (!document.body.contains(ctx)) {
        console.log('wipStatusChart canvas no longer in DOM');
        return;
    }
    
    // ลบ chart เดิมหากมี
    if (window.wipStatusChart && typeof window.wipStatusChart.destroy === 'function') {
        try {
            window.wipStatusChart.destroy();
        } catch (error) {
            console.log('Error destroying wipStatusChart:', error);
        }
    }
        
    // ใช้เฉพาะ centerTextPlugin
    const plugins = [centerTextPlugin];
    
    currentChart = new Chart(ctx, {
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
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#ffffff',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const dataset = data.datasets[0];
                                const total = dataset.data.reduce((sum, value) => sum + value, 0);
                                
                                // แสดงเฉพาะ legend ที่ตรงกับ currentLegendIndex เท่านั้น
                                const visibleIndex = window.wipStatusLegendIndex;
                                const visibleLabel = data.labels[visibleIndex];
                                const visibleValue = dataset.data[visibleIndex];
                                const visiblePercent = total > 0 ? (visibleValue / total) * 100 : 0;
                                
                                return [{
                                    text: `${visibleLabel} (${visiblePercent.toFixed(0)}%)`,
                                    fillStyle: dataset.backgroundColor[visibleIndex],
                                    strokeStyle: dataset.backgroundColor[visibleIndex],
                                    lineWidth: 0,
                                    pointStyle: 'circle',
                                    hidden: false,
                                    index: visibleIndex,
                                    fontColor: '#ffffff'
                                }];
                            }
                            return [];
                        }
                    }
                },
                title: { display: false }
            },
            layout: { padding: { top: 10, right: 14, bottom: 24, left: 14 } }
        },
        plugins: plugins
    });
    
    window.wipStatusChart = currentChart;
    
    // ตั้งเวลาให้สลับ legend ทีละตัวทุก 3 วินาที
    if (window.wipStatusLegendInterval) {
        clearInterval(window.wipStatusLegendInterval);
    }
    
    // เริ่มต้นด้วยการแสดง legend แรก
    window.wipStatusLegendIndex = 0;
    
    window.wipStatusLegendInterval = setInterval(() => {
        if (currentChart && !currentChart.destroyed) {
            // สลับไป legend ถัดไป
            window.wipStatusLegendIndex = (window.wipStatusLegendIndex + 1) % labels.length;
            try {
                currentChart.update('none'); // อัปเดต chart โดยไม่ animate
            } catch (error) {
                console.log('Error updating wipStatusChart legend:', error);
            }
        }
    }, 3000);
    
}
function WIP_Line(wipData){
    // หาวันล่าสุดจาก WIP_DATE
    const latestDate = wipData.reduce((latest, row) => {
        const currentDate = row.WIP_DATE || '';
        return currentDate > latest ? currentDate : latest;
    }, '');
    
    // กรองข้อมูลเฉพาะวันล่าสุด
    const filteredData = wipData.filter(row => (row.WIP_DATE || '') === latestDate);
    
    const group = {};
    filteredData.forEach(row => {
        const line = row.LINE_NAME || 'Other';
        group[line] = (group[line] || 0) + (parseInt(row.WIP_QTY) || 0);
    });

    const keys = Object.keys(group).sort();
    const labels = keys;
    const values = keys.map(label => group[label]);
    const bgColors = keys.map(() => '#9966FF'); // ใช้สีเดียวกันทั้งหมด
    
    // คำนวณ maxY เพื่อให้มีพื้นที่ด้านบนมากขึ้น
    const maxValue = Math.max(...values);
    const maxY = maxValue > 0 ? Math.ceil(maxValue * 1.5) : 10;

    const ctx = document.getElementById('wipLineChart');
    if (!ctx) {
        console.error('wipLineChart canvas not found!');
        return;
    }
    
    // ตรวจสอบว่า canvas ยังอยู่ใน DOM หรือไม่
    if (!document.body.contains(ctx)) {
        console.log('wipLineChart canvas no longer in DOM');
        return;
    }
    
    // ลบ chart เดิมหากมี
    if (window.wipLineChart && typeof window.wipLineChart.destroy === 'function') {
        try {
            window.wipLineChart.destroy();
        } catch (error) {
            console.log('Error destroying wipLineChart:', error);
        }
    }
        
    // ตรวจสอบว่า ChartDataLabels plugin มีอยู่หรือไม่
    const plugins = [];
    if (typeof ChartDataLabels !== 'undefined') {
        plugins.push(ChartDataLabels);
    } else {
        console.log('ChartDataLabels plugin not found, datalabels will not work');
    }
    
    window.wipLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors,
                borderColor: bgColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false },
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'top',
                    offset: 4,
                    clamp: true,
                    clip: false,
                    color: '#fff',
                    font: { weight: 'bold', size: 16 },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: 3,
                    padding: 2,
                    formatter: function(value, context) {
                        const quantityK = (value / 1000).toFixed(1);
                        return `${quantityK}K`;
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    ticks: {
                        color: '#fff',
                        font: { size: 15 },
                        maxRotation: 0,
                        autoSkip: false
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    display: false,
                    max: maxY
                }
            },
            layout: { padding: { top: 20, right: 10, bottom: 10, left: 10 } }
        },
        plugins: plugins
    });
}
function WIP_Process(wipData){
    // หาวันล่าสุดจาก WIP_DATE
    const latestDate = wipData.reduce((latest, row) => {
        const currentDate = row.WIP_DATE || '';
        return currentDate > latest ? currentDate : latest;
    }, '');
    
    // กรองข้อมูลเฉพาะวันล่าสุด
    const filteredData = wipData.filter(row => (row.WIP_DATE || '') === latestDate);
    
    // สร้าง group ตาม process + SEQ_NO (แยก process ที่มีชื่อเดียวกันแต่ SEQ_NO ต่างกัน)
    const group = {};
    const processSeqMap = {};
    
    // ตรวจสอบว่าเป็น PIRSSR หรือไม่
    const isPIRSSR = filteredData.some(row => row.ITEMTYPECODE === 'PIRSSR');
    
    filteredData.forEach(row => {
        const process = row.WIP_PROCESS_NAME || 'UNKNOWN';
        
        if (process === 'Input') {
            return; 
        }
        
        let processKey;
        let seqNo;
        
        if (isPIRSSR) {
            // สำหรับ PIRSSR ใช้ Process_type และ Process_type_no
            const processType = row.PROCESS_TYPE || 'UNKNOWN';
            const processTypeNo = parseInt(row.PROCESS_TYPE_NO) || 999;
            processKey = `${processType}_TYPE${processTypeNo}`;
            seqNo = processTypeNo;
        } else {
            // สำหรับ product อื่นๆ ใช้ WIP_PROCESS_NAME และ SEQ_NO
            seqNo = parseInt(row.SEQ_NO) || 999;
            processKey = `${process}_SEQ${seqNo}`;
        }
        
        if (!group[processKey]) {
            group[processKey] = 0;
            processSeqMap[processKey] = seqNo;
        }
        group[processKey] += (parseInt(row.WIP_QTY) || 0);
    });

    // เรียงตาม SEQ_NO
    const sortedProcesses = Object.keys(group).sort((a, b) => {
        const seqA = processSeqMap[a] || 999;
        const seqB = processSeqMap[b] || 999;
        return seqA - seqB;
    });

    const total = sortedProcesses.reduce((sum, label) => sum + group[label], 0);
    
    // แปลง labels ให้แสดงเฉพาะชื่อ process
    const labels = sortedProcesses.map(processKey => {
        const seqNo = processSeqMap[processKey];
        if (isPIRSSR) {
            // สำหรับ PIRSSR แสดง Process_type
            return processKey.replace(`_TYPE${seqNo}`, '');
        } else {
            // สำหรับ product อื่นๆ แสดง WIP_PROCESS_NAME
            return processKey.replace(`_SEQ${seqNo}`, '');
        }
    });
    
    const values = sortedProcesses.map(label => group[label]);
    const bgColors = sortedProcesses.map(() => '#FF6384'); // ใช้สีเดียวกันทั้งหมด
    
    // คำนวณ maxY เพื่อให้มีพื้นที่ด้านบนมากขึ้น
    const maxValue = Math.max(...values);
    const maxY = maxValue > 0 ? Math.ceil(maxValue * 1.5) : 10;

    const ctx = document.getElementById('totalWipChart');
    if (!ctx) {
        console.error('totalWipChart canvas not found!');
        return;
    }
    
    // ตรวจสอบว่า canvas ยังอยู่ใน DOM หรือไม่
    if (!document.body.contains(ctx)) {
        console.log('totalWipChart canvas no longer in DOM');
        return;
    }
    
    // ลบ chart เดิมหากมี
    if (window.totalWipChart && typeof window.totalWipChart.destroy === 'function') {
        try {
            window.totalWipChart.destroy();
        } catch (error) {
            console.log('Error destroying totalWipChart:', error);
        }
    }
        
    // ตรวจสอบว่า ChartDataLabels plugin มีอยู่หรือไม่
    const plugins = [];
    if (typeof ChartDataLabels !== 'undefined') {
        plugins.push(ChartDataLabels);
    } else {
        console.log('ChartDataLabels plugin not found, datalabels will not work');
    }
    
    window.totalWipChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors,
                borderColor: bgColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false },
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'top',
                    offset: 4,
                    clamp: true,
                    clip: false,
                    color: '#fff',
                    font: { weight: 'bold', size: 16 },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: 3,
                    padding: 2,
                    formatter: function(value, context) {
                        const quantityK = (value / 1000).toFixed(1);
                        return `${quantityK}K`;
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    ticks: {
                        color: '#fff',
                        font: { size: 15 },
                        maxRotation: (window.selectedProductType === 'DENSO24CY') ? 90 : 0,
                        autoSkip: (window.selectedProductType === 'DENSO24CY') ? true : false,
                        callback: function(value, index, ticks) {
                            const label = this.getLabelForValue(value);
                            // ถ้าเป็น DENSO24CY ให้ไม่แบ่งชื่อเป็นหลายบรรทัด
                            if (window.selectedProductType === 'DENSO24CY' || window.selectedProductType === 'PIRSSR') {
                                return label;
                            }
                            // แบ่งชื่อเป็นหลายบรรทัดเฉพาะเมื่อจำนวน bar มากกว่า 8
                            if (ticks.length > 8 && label.length > 8) {
                                const words = label.split(' ');
                                if (words.length > 1) {
                                    // แบ่งตามช่องว่าง
                                    return words;
                                } else {
                                    // แบ่งตามตัวอักษรถ้าไม่มีช่องว่าง
                                    const mid = Math.ceil(label.length / 2);
                                    return [label.substring(0, mid), label.substring(mid)];
                                }
                            }
                            return label;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    display: false,
                    max: maxY
                }
            },
            layout: { padding: { top: 20, right: 10, bottom: 10, left: 10 } }
        },
        plugins: plugins
    });
    
}
// ================================================================
// 3.Utility Functions
// ================================================================
function normalizeOutputDate(str) {
    if (!str) return str;

    // YYYY-MM-DD
    const m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return str;

    const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    const year  = m[1];
    const month = monthNames[parseInt(m[2], 10) - 1];
    const day   = m[3];

    return `${day}-${month}-${year}`;
}

function FilterDaily(inputData, outputData, planData) {
    // ดึง productType ปัจจุบัน
    const productType = window.cycleProductType ? window.cycleProductType() : 'typeA';
    
    // Array ของชื่อเดือนแบบย่อ
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    // หาวันที่ล่าสุดจากข้อมูล Input และ Output
    let latestDate = null;
    let latestDay, latestMonth, latestYear;
    
    // ตรวจสอบข้อมูล Input
    if (inputData && Array.isArray(inputData)) {
        inputData.forEach(item => {
            let completionDate = '';
            completionDate = item.COMPLETION_PRASS_DATE || item.completion_prass_date || '';
            
            if (completionDate) {
                const dateMatch = completionDate.match(/(\d{1,2})-([A-Z]{3})-(\d{2})/);
                if (dateMatch) {
                    const itemDay = parseInt(dateMatch[1]);
                    const itemMonthStr = dateMatch[2];
                    const itemYear = parseInt(dateMatch[3]);
                    const itemMonth = monthNames.indexOf(itemMonthStr);
                    const fullYear = itemYear < 50 ? 2000 + itemYear : 1900 + itemYear;
                    
                    if (!latestDate || 
                        (fullYear > latestYear) || 
                        (fullYear === latestYear && itemMonth > latestMonth) || 
                        (fullYear === latestYear && itemMonth === latestMonth && itemDay > latestDay)) {
                        
                        latestDate = completionDate;
                        latestDay = itemDay;
                        latestMonth = itemMonth;
                        latestYear = fullYear;
                    }
                }
            }
        });
    }
    
    // ตรวจสอบข้อมูล Output
    if (outputData && Array.isArray(outputData)) {
        outputData.forEach(item => {
            let completionDate = '';
            completionDate = normalizeOutputDate(
                item.COMPLETION_PRASS_DATE || item.completion_prass_date || ''
            );
            
            if (completionDate) {
                const dateMatch = completionDate.match(/(\d{1,2})-([A-Z]{3})-(\d{2})/);
                if (dateMatch) {
                    const itemDay = parseInt(dateMatch[1]);
                    const itemMonthStr = dateMatch[2];
                    const itemYear = parseInt(dateMatch[3]);
                    const itemMonth = monthNames.indexOf(itemMonthStr);
                    const fullYear = itemYear < 50 ? 2000 + itemYear : 1900 + itemYear;
                    
                    if (!latestDate || 
                        (fullYear > latestYear) || 
                        (fullYear === latestYear && itemMonth > latestMonth) || 
                        (fullYear === latestYear && itemMonth === latestMonth && itemDay > latestDay)) {
                        
                        latestDate = completionDate;
                        latestDay = itemDay;
                        latestMonth = itemMonth;
                        latestYear = fullYear;
                    }
                }
            }
        });
    }
    
    // หากไม่พบวันที่ใดๆ ให้คืนข้อมูลทั้งหมด
    if (!latestDate) {
        return {
            inputData: inputData || [],
            outputData: outputData || [],
            planData: planData || []
        };
    }
    
    // กรองข้อมูล Input เฉพาะวันล่าสุด
    const filteredInputData = (inputData || []).filter(item => {
        let completionDate = '';
        if (productType === 'CASE') {
            completionDate = item.COMPLETION_PRASS_DATE1 || item.completion_prass_date1 || '';
        } else {
            completionDate = item.COMPLETION_PRASS_DATE || item.completion_prass_date || '';
        }
        
        if (completionDate) {
            const dateMatch = completionDate.match(/(\d{1,2})-([A-Z]{3})-(\d{2})/);
            if (dateMatch) {
                const itemDay = parseInt(dateMatch[1]);
                const itemMonthStr = dateMatch[2];
                const itemYear = parseInt(dateMatch[3]);
                const itemMonth = monthNames.indexOf(itemMonthStr);
                const fullYear = itemYear < 50 ? 2000 + itemYear : 1900 + itemYear;
                
                return itemDay === latestDay && itemMonth === latestMonth && fullYear === latestYear;
            }
        }
        return false;
    });
    
    // กรองข้อมูล Output เฉพาะวันล่าสุด
    const filteredOutputData = (outputData || []).filter(item => {
        let completionDate = '';
        if (productType === 'CASE') {
            completionDate = item.COMPLETION_PRASS_DATE1 || item.completion_prass_date1 || '';
        } else {
            completionDate = item.COMPLETION_PRASS_DATE || item.completion_prass_date || '';
        }
        
        if (completionDate) {
            const dateMatch = completionDate.match(/(\d{1,2})-([A-Z]{3})-(\d{2})/);
            if (dateMatch) {
                const itemDay = parseInt(dateMatch[1]);
                const itemMonthStr = dateMatch[2];
                const itemYear = parseInt(dateMatch[3]);
                const itemMonth = monthNames.indexOf(itemMonthStr);
                const fullYear = itemYear < 50 ? 2000 + itemYear : 1900 + itemYear;
                
                return itemDay === latestDay && itemMonth === latestMonth && fullYear === latestYear;
            }
        }
        return false;
    });
    
    // กรองข้อมูล Plan ตามวันที่ล่าสุด
    const filteredPlanData = (planData || []).filter(item => {
        if (!item.DATETIME) return false;
        
        const itemDate = item.DATETIME;
        let itemDay, itemMonth, itemYear;
        
        // ลองรูปแบบ DD-MMM-YY ก่อน
        const dateMatch1 = itemDate.match(/(\d{1,2})-([A-Z]{3})-(\d{2})/);
        if (dateMatch1) {
            itemDay = parseInt(dateMatch1[1]);
            const itemMonthStr = dateMatch1[2];
            itemYear = parseInt(dateMatch1[3]);
            itemMonth = monthNames.indexOf(itemMonthStr);
            const fullYear = itemYear < 50 ? 2000 + itemYear : 1900 + itemYear;
            
            return itemDay === latestDay && itemMonth === latestMonth && fullYear === latestYear;
        } else {
            // ลองรูปแบบ YYYY-MM-DD
            const dateMatch2 = itemDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
            if (dateMatch2) {
                itemYear = parseInt(dateMatch2[1]);
                itemMonth = parseInt(dateMatch2[2]) - 1; // เดือนใน JavaScript เริ่มจาก 0
                itemDay = parseInt(dateMatch2[3]);
                
                return itemDay === latestDay && itemMonth === latestMonth && itemYear === latestYear;
            }
        }
        
        return false;
    });
    
    return {
        inputData: filteredInputData,
        outputData: filteredOutputData,
        planData: filteredPlanData
    };
}
// ================================================================
// 4.Main Action
// ================================================================
function Show() {
    // แสดง Product Type หลังจากโหลดข้อมูลเสร็จ
    updateProductTypeDisplay();
    
    // กรองข้อมูลทั้งหมดเป็นวันล่าสุด
    const filteredData = FilterDaily(window.monitorData.InputData, window.monitorData.OGData, window.monitorData.PlanData);
    
    // คำนวณข้อมูล Daily Input
    const inputData = Cal_Daily_Data(filteredData.inputData, filteredData.planData, 'Input');
    
    // คำนวณข้อมูล Daily Output
    const outputData = Cal_Daily_Data(filteredData.outputData, filteredData.planData, 'Output');
    
    // คำนวณข้อมูล Acc Input
    const accInputData = Cal_Acc_Data(window.monitorData.InputData, window.monitorData.PlanData, 'Input');
    
    // คำนวณข้อมูล Acc Output
    const accOutputData = Cal_Acc_Data(window.monitorData.OGData, window.monitorData.PlanData, 'Output', window.monitorData.WIPData || 0);
    
    // แสดงผลใน Daily Input และ Plan
    UpdateDisplay(inputData.dailyTotal, inputData.planTotal, '#daily-input', 'Daily Input');
    
    // แสดงผลใน Daily Output และ Plan
    UpdateDisplay(outputData.dailyTotal, outputData.planTotal, '#daily-output', 'Daily Output');
    
    // แสดงผลใน Acc Input และ Plan
    UpdateDisplay(accInputData.accTotal, accInputData.accPlanTotal, '#acc-input', 'Accumulate Input');
    
    // แสดงผลใน Acc Output และ Plan
    UpdateDisplay(accOutputData.accTotal, accOutputData.accPlanTotal, '#acc-output', 'Accumulate Output');
    
    // แสดง Machine Status
    Machine_Status_Line(window.statusData.statusData);
    Line_Loss_Time(window.downtimeData.mcRecordData);
    
    // สร้าง WIP Charts
    if (window.wipData.SubWIP && window.wipData.SubWIP.length > 0) {
        WIP_Status(window.wipData.SubWIP);
        WIP_Line(window.wipData.SubWIP);
        WIP_Process(window.wipData.SubWIP);
    } else {
        console.log('No SubWIP data to create chart');
    }
    
    // อัปเดตเวลาหลังจากสร้าง dashboard เสร็จ
    // ใช้เวลาจาก server ถ้ามี ถ้าไม่มีให้ใช้เวลาปัจจุบัน
    const serverTime = window.monitorData.serverTime || null;
    Update_Last_Refresh(serverTime);
}