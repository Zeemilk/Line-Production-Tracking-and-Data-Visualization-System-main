var empIdInput = document.getElementById('empId');
var lotInput = document.getElementById('lot');

let timeout;
if (empIdInput) {
    empIdInput.addEventListener('keyup', function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            var empIdValue = empIdInput.value;
            var detailTable = document.getElementById('detailTable');
            if (empIdValue !== '') {
                var emp = document.getElementById("empId").value;
                $.ajax({
                    url: `./assets/index.php?checkemployee=${emp}`,
                    async: true,
                    success: function (result) {
                        console.log(result);
                        if (result == 1) {
                            lotInput.removeAttribute('disabled');
                        } else {
                            document.getElementById('lot').value = '';
                            lotInput.setAttribute('disabled', 'true');
                            detailTable.setAttribute('hidden', 'true');
                            createAlert("กรุณาตรวจสอบรหัสพนักงาน", "danger");
                        }
                    }
                })
            }
        }, 500);
    });
}
if (lotInput) {
    lotInput.addEventListener('change', function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            var lotValue = lotInput.value;
            var detailTable = document.getElementById('detailTable');
            let url = window.location.href;
            if (lotValue !== '') {
                var lot = lotValue.trim().toUpperCase();
                console.log(lot)
                if (lot.includes('-')) { // 18-11-24
                    lot = lot.split('-')[0];
                    lotInput.value = lot;
                    console.log(lot)
                }
                if (url.includes("print")) {
                    showLoading();
                    $.ajax({
                        url: `./assets/index.php?checklotWIP=${lot}`,
                        async: true,
                        success: function (result) {
                            console.log(result);
                            let Ares = result.split("|");
                            if (Ares[0] == 1) {
                                document.getElementById('part').innerText = Ares[1];
                                $.ajax({
                                    // url: `./assets/index.php?getDataPrint=${Ares[1]}`,
                                    url: `./assets/index.php?getDataPrint=${Ares[1] + "|" + lot}`,
                                    async: true,
                                    success: function (result) {
                                        console.log(result);
                                        if (result.includes("ERROR")) {
                                            hideLoading();
                                            detailTable.setAttribute('hidden', 'true');
                                            createAlert("กรุณาตรวจสอบเลขล็อต", "danger");
                                        } else if (result.includes("NO DATA")) {
                                            hideLoading();
                                            detailTable.setAttribute('hidden', 'true');
                                            createAlert("ไม่สามารถเรียกข้อมูลโปรดักท์ได้ กรุณาตรวจสอบเลขล็อต", "danger");
                                        } else {
                                            hideLoading();
                                            document.getElementById('product').innerText = result.split("|")[0];
                                            document.getElementById('boxSize').innerText = result.split("|")[1];
                                            document.getElementById('lotSize').innerText = result.split("|")[2];
                                            detailTable.removeAttribute('hidden');
                                        }
                                    }
                                })
                            } else {
                                hideLoading();
                                detailTable.setAttribute('hidden', 'true');
                                createAlert("กรุณาตรวจสอบเลขล็อต", "danger");
                            }
                        }
                    })
                } else {
                    var formDiv = document.getElementById('formDiv');
                    // console.log(formDiv.innerHTML)

                    $.ajax({
                        url: `./assets/index.php?getDataCheck=${lot}`,
                        async: true,
                        success: function (result) {
                            console.log(result);
                            if (result.includes("NO DATA")) {
                                // detailTable.innerHTML = '';
                                formDiv.innerHTML = '';
                                detailTable.setAttribute('hidden', 'true');
                                createAlert("ไม่สามารถเรียกข้อมูลได้ กรุณาตรวจสอบเลขล็อต", "danger");
                            } else if (result.includes("CHECKED")) {
                                detailTable.setAttribute('hidden', 'true');
                                createAlert("ล็อตนี้ถูกตรวจสอบแล้ว กรุณาตรวจสอบเลขล็อต", "danger");
                            } else {
                                let date = result.split("|")[0];
                                let time = result.split("|")[1];
                                let emp = result.split("|")[2];
                                let product = result.split("|")[3];
                                let model = result.split("|")[4];
                                let lotSize = result.split("|")[5];
                                let boxSize = result.split("|")[6];
                                let type = result.split("|")[7];
                                let total = result.split("|")[8];

                                document.getElementById('product').innerText = product;
                                document.getElementById('part').innerText = model;
                                document.getElementById('type').innerText = type;
                                document.getElementById('boxSize').innerText = boxSize;
                                document.getElementById('lotSize').innerText = lotSize;
                                document.getElementById('printDate').innerText = date;
                                document.getElementById('printTime').innerText = time;
                                document.getElementById('total').innerText = total;
                                detailTable.removeAttribute('hidden');
                                if (!document.getElementById('inputDiv')) {
                                    var inputDiv = document.createElement('div');
                                    var rowDiv = document.createElement('div');
                                    inputDiv.id = 'inputDiv';
                                    rowDiv.className = 'row';
                                    formDiv.appendChild(inputDiv);

                                    var inputs = [];

                                    for (var i = 1; i <= total; i++) {
                                        var colDiv = document.createElement('div');
                                        colDiv.className = 'col py-2';

                                        var inputElement = document.createElement('input');
                                        inputElement.type = 'text';
                                        inputElement.className = 'form-control mx-auto text-uppercase';
                                        inputElement.style = 'max-width:250px';
                                        inputElement.placeholder = 'กล่องที่ ' + i;
                                        inputElement.id = 'checkBox' + i;
                                        check = `checkLot(${i})`;
                                        inputElement.setAttribute("onchange", check);
                                        inputElement.setAttribute("onclick", 'this.value = ""');
                                        colDiv.appendChild(inputElement);
                                        rowDiv.appendChild(colDiv);
                                        inputDiv.appendChild(rowDiv);

                                        inputs.push(inputElement);

                                        if (i % 4 === 0 || i === total) {
                                            rowDiv = document.createElement('div');
                                            rowDiv.className = 'row justify-content-between';
                                            inputDiv.appendChild(rowDiv);
                                        }
                                    }
                                    var editBtn = document.createElement('button');
                                    editBtn.type = 'button';
                                    editBtn.className = 'btn btn-primary mx-auto w-50 mt-3';
                                    editBtn.textContent = 'แก้ไขจำนวน';
                                    // submitBtn.setAttribute("onclick", `checkInputs(${inputs})`);
                                    editBtn.addEventListener('click', () => {
                                        // inputCheck();
                                        var modal = new bootstrap.Modal(document.getElementById('editModal'));
                                        modal.show();
                                    });
                                    inputDiv.appendChild(editBtn);
                                }
                            }
                        }
                    })
                }
            }
        }, 500);
    });
}
function editTotal() {
    var total = document.getElementById('editTotal').value;
    let lotSize = document.getElementById('lotSize').innerText;
    let boxSize = document.getElementById('boxSize').innerText;
    var type = document.getElementById('type').innerText;
    number = Math.ceil(lotSize / boxSize) * boxSize;
    max = number / boxSize;
    console.log(total, max);
    if (total > max || total < 0 && type == 'ทั่วไป') {
        // if (total > max || total < max / 2 && type == 'ทั่วไป') {
        createAlert('กรุณาตรวจสอบจำนวน', 'danger');
        return;
    } else if (type == 'ระบุจำนวน') {
        max = Number(document.getElementById('total').innerText);
        console.log(total, max)
        if (total > max || total < 0) {
            // if (total > max || total < max / 2 || total < 0) {
            createAlert('กรุณาตรวจสอบจำนวน', 'danger');
            return;
        }
    }

    formDiv.innerHTML = '';
    document.getElementById('total').innerText = total;
    var inputDiv = document.createElement('div');
    var rowDiv = document.createElement('div');
    inputDiv.id = 'inputDiv';
    rowDiv.className = 'row';
    formDiv.appendChild(inputDiv);
    var inputs = [];
    for (var i = 1; i <= total; i++) {
        var colDiv = document.createElement('div');
        colDiv.className = 'col py-2';

        var inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.className = 'form-control mx-auto text-uppercase';
        inputElement.style = 'max-width:250px';
        inputElement.placeholder = 'กล่องที่ ' + i;
        inputElement.id = 'checkBox' + i;
        check = `checkLot(${i})`;
        inputElement.setAttribute("onchange", check);
        inputElement.setAttribute("onclick", 'this.value = ""');
        colDiv.appendChild(inputElement);
        rowDiv.appendChild(colDiv);
        inputDiv.appendChild(rowDiv);

        inputs.push(inputElement);

        if (i % 4 === 0 || i === total) {
            rowDiv = document.createElement('div');
            rowDiv.className = 'row justify-content-between';
            inputDiv.appendChild(rowDiv);
        }
    }
    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-primary mx-auto w-50 mt-3';
    editBtn.textContent = 'แก้ไขจำนวน';
    editBtn.addEventListener('click', () => {
        var modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    });
    inputDiv.appendChild(editBtn);
    createAlert('แก้ไขจำนวนเสร็จสิ้น', 'info');
}
function showPrint() {
    let boxSize = document.getElementById('boxSize').innerText;
    let lotSize = document.getElementById('lotSize').innerText;
    let typeSelect = document.querySelector('input[name="typeSelect"]:checked').value;
    let printDetail = document.getElementById("printDetail");
    let submit = document.getElementById("submit");
    console.log(typeSelect)
    printDetail.innerHTML = '';
    if (typeSelect == 'ทั่วไป') {
        if (lotSize % boxSize === 0) {
            console.log(lotSize / boxSize);

            printDetail.innerHTML = '<font class="fw-bold h4">จำนวนกล่อง : ' + lotSize / boxSize + ' (' + boxSize + ' ชิ้นงาน)</font>'
            printDetail.setAttribute("class", "py-3")
            submit.setAttribute("hidden", "false")
            submit.removeAttribute("hidden");
            // console.log(printDetail.innerHTML)
        } else {
            number = Math.ceil(lotSize / boxSize) * boxSize;
            console.log(number / boxSize);
            printDetail.innerHTML = '<font class="fw-bold h4">จำนวนกล่อง : ' + number / boxSize + ' (' + boxSize + ' ชิ้นงาน)</font>'
            printDetail.setAttribute("class", "py-3")
            submit.setAttribute("hidden", "false")
            submit.removeAttribute("hidden");
            // console.log(printDetail.innerHTML)
        }
    } else if (typeSelect == 'ระบุจำนวน') {
        printDetail.innerHTML = '<input type="number" class="form-control w-25 border-dark" id="total"><font class="fw-bold h4 col-2">กล่อง</font>'
        printDetail.setAttribute("class", "py-3 row justify-content-center border-top")
        submit.setAttribute("hidden", "false")
        submit.removeAttribute("hidden");
    } else if (typeSelect == 'เฉพาะ') {
        printDetail.innerHTML = `
        <div id="reprintType" class="row pb-2">
            <div class="col form-check form-check-inline" align="center">
                <input class="form-check-input mt-1" style="position: absolute;" type="radio" onchange="showReprint()" name="typeReprint" id="retype1" value="ใบเดียว">
                <label class="form-check-label h5 fw-bold" for="typeL1">ใบเดียว</label>
            </div>
            <div class="col form-check form-check-inline" align="center">
                <input class="form-check-input mt-1" style="position: absolute;" type="radio" onchange="showReprint()" name="typeReprint" id="retype2" value="หลายใบ">
                <label class="form-check-label h5 fw-bold" for="typeL2">หลายใบ</label>
            </div>
        </div>
        <div id="reprintDetail" class="text-center"></div>
        `
    }
}
function showReprint() {
    let typeReprint = document.querySelector('input[name="typeReprint"]:checked').value;
    let reprintDetail = document.getElementById("reprintDetail");
    let submit = document.getElementById("submit");
    console.log(typeReprint)
    reprintDetail.innerHTML = '';
    if (typeReprint == 'ใบเดียว') {
        reprintDetail.innerHTML = '<font class="fw-bold h4 col-2">กล่องที่</font><input type="number" class="form-control w-25 border-dark" id="total">'
        reprintDetail.setAttribute("class", "py-3 row justify-content-center")
        submit.setAttribute("hidden", "false")
        submit.removeAttribute("hidden");
    } else if (typeReprint == 'หลายใบ') {
        reprintDetail.innerHTML = '<font class="fw-bold h4 col-2">กล่องที่</font><input type="text" class="form-control w-25 border-dark" placeholder="e.g. 1-5, 11-13" id="total">'
        reprintDetail.setAttribute("class", "py-3 row justify-content-center")
        submit.setAttribute("hidden", "false")
        submit.removeAttribute("hidden");
    }
}
async function submit() {
    showLoading();
    let empId = document.getElementById('empId').value;
    let lot = document.getElementById('lot').value.trim().toUpperCase();
    let product = document.getElementById('product').innerText;
    let part = document.getElementById('part').innerText;
    let lotSize = document.getElementById('lotSize').innerText;
    let boxSize = document.getElementById('boxSize').innerText;
    let typeSelect = document.querySelector('input[name="typeSelect"]:checked').value;
    let total = '';
    if (typeSelect == 'ทั่วไป') {
        if (lotSize % boxSize === 0) {
            total = lotSize / boxSize;
        } else {
            number = Math.ceil(lotSize / boxSize) * boxSize;
            total = number / boxSize;
        }
    } else if (typeSelect == 'เฉพาะ' && document.querySelector('input[name="typeReprint"]:checked').value == 'หลายใบ') {
        number = Math.ceil(lotSize / boxSize) * boxSize;
        let max = number / boxSize;

        total = document.getElementById("total").value;
        console.log(document.getElementById("total"))
        let from = total.split("-")[0];
        let to = total.split("-")[1];
        // console.log(max, total, from, to, document.querySelector('input[name="typeReprint"]:checked').value)
        if (to > max || from <= 0 || to <= 0 || from > to) {
            hideLoading();
            createAlert('กรุณาตรวจสอบจำนวนการปริ้นท์', 'danger');
            return;
        }
    } else {
        number = Math.ceil(lotSize / boxSize) * boxSize;
        let max = number / boxSize;
        total = document.getElementById("total").value;
        if (total > max + 5 || total == 0) {
            hideLoading();
            createAlert('กรุณาตรวจสอบจำนวนการปริ้นท์', 'danger');
            return;
        }
    }

    // console.log(empId, lot, product, part, lotSize, boxSize, typeSelect, total);
    printdata = [];
    printdata.push(empId, lot, product, part, lotSize, boxSize, typeSelect, total)
    console.log(printdata.join("|"))

    if (typeSelect == 'ทั่วไป' || typeSelect == 'ระบุจำนวน') {
        $.ajax({
            url: `./assets/index.php?checkDups=${lot}`,
            async: true,
            success: function (result) {
                console.log(result);
                if (result.includes('existed')) {
                    hideLoading();
                    createAlert('ข้อมูลซ้ำ กรุณาตรวจสอบเลขล็อต', 'danger');
                    return;
                } else {
                    let printUrl;
                    if (product.includes('MAOPN')) {
                        printUrl = `./assets/honeywellMAOPN.php?printLabel=${printdata.join("|")}`
                    } else {
                        printUrl = `./assets/honeywellPIRSSR.php?printLabel=${printdata.join("|")}`

                    }
                    $.ajax({
                        // url: `./assets/honeywell.php?printLabel=${printdata.join("|")}`,
                        url: printUrl,
                        async: true,
                        success: function (result) {
                            // console.log(result)
                            if (result.includes("failed")) {
                                hideLoading();
                                createAlert(result, "danger");
                                return;
                            } else {
                                $.ajax({
                                    url: `./assets/index.php?recordData=${printdata.join("|")}`,
                                    async: true,
                                    success: function (result) {
                                        console.log(result);
                                        if (result.includes('ERROR')) {
                                            hideLoading();
                                            createAlert('กรุณาติดต่อ IT MT670', 'danger');
                                            return;
                                        } else {
                                            hideLoading();
                                            createAlert('ลงข้อมูลสำเร็จ', 'success');
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    } else {
        let typeReprint = document.querySelector('input[name="typeReprint"]:checked').value;
        printdata.push(typeReprint)
        if (typeReprint == 'หลายใบ' && !total.includes("-")) {
            hideLoading();
            createAlert('กรุณาตรวจสอบจำนวน', 'danger');
            return;
        }
        $.ajax({
            url: `./assets/index.php?checkDups=${lot}`,
            async: true,
            success: function (result) {
                console.log(result);
                if (result.includes('existed')) {
                    $.ajax({
                        url: `./assets/honeywell.php?printLabel=${printdata.join("|")}`,
                        async: true,
                        success: function (result) {
                            // console.log(result);
                            if (result.includes("failed")) {
                                hideLoading();
                                createAlert(result, "danger");
                                return;
                            } else {
                                $.ajax({
                                    url: `./assets/index.php?recordData=${printdata.join("|")}`,
                                    async: true,
                                    success: function (result) {
                                        console.log(result);
                                        if (result.includes('ERROR')) {
                                            hideLoading();
                                            createAlert('กรุณาติดต่อ IT MT670', 'danger');
                                            return;
                                        } else {
                                            hideLoading();
                                            createAlert('ลงข้อมูลสำเร็จ', 'success');
                                        }
                                    }
                                })
                            }
                        }
                    })
                } else {
                    hideLoading();
                    createAlert('ล็อตนี้ยังไม่เคยถูกปริ้นท์', 'danger');
                    return;
                }
            }
        })
    }

}

var currentAlert = null;

function createAlert(message, type) {
    if (currentAlert) {
        try {
            document.body.removeChild(currentAlert);
        } catch (error) {
            console.log("i cant remove alert, im stupid AI");
        }
    }
    var alert = document.createElement("div");
    alert.className = "alert alert-" + type + " fade show";
    alert.style.position = "fixed";
    alert.style.top = "0";
    alert.style.left = "0";
    alert.style.right = "0";
    alert.style.zIndex = "9999";
    alert.setAttribute("role", "alert");
    alert.innerHTML = message;
    alert.innerHTML = message +
        '<button type="button" class="btn-close float-end" aria-label="Close"></button>';


    var closeButton = alert.getElementsByClassName("btn-close")[0];
    closeButton.addEventListener("click", function () {
        alert.style.display = "none";
        if (type == 'success') {
            window.location.reload();
        }
    });
    if (type == 'success') {
        let url = window.location.href;
        window.addEventListener("click", function (event) {
            if (event.target != alert) {
                if (url.includes("print")) {
                    window.location.href = `http://172.16.76.228:6500/ThomsonLabel/menu.php`;
                } else {
                    window.location.reload();
                }
            }
        });
        if (url.includes("print")) {
            setTimeout(function () {
                window.location.href = `http://172.16.76.228:6500/ThomsonLabel/menu.php`;
            }, 2000);
        } else {
            setTimeout(function () {
                window.location.reload();
            }, 2000);
        }
    } else {
        setTimeout(function () {
            alert.style.display = "none";
        }, 5000);
    }

    document.body.appendChild(alert);
    currentAlert = alert;
}

function createModal(header, message) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const modalDialog = document.createElement('div');
    modalDialog.classList.add('modal-dialog', 'modal-dialog-centered');
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    const modalHeader = document.createElement('div');
    modalHeader.classList.add('modal-header');
    modalHeader.innerHTML = header;
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    modalBody.innerHTML = message;
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    const myModal = new bootstrap.Modal(modal);
    myModal.show(modal);
}
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}
function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {},
        i, n, v, nv;
    if (query === url || query === "") return;
    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);
        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

function ExcelReport(data) {
    var product = data.split(":")[0];
    var detail = data.split(":")[1];
    var dateF = detail.split("|")[0];
    var dateT = detail.split("|")[1];
    var name = detail.split("|")[2];
    var sheet_name = dateF + "to" + dateT;
    var elt = document.getElementById('resultTable');
    var wb = XLSX.utils.table_to_book(elt, {
        sheet: sheet_name
    });
    filename = product + ":" + dateF + "_" + name + ".xls";
    XLSX.writeFile(wb, filename);
}

