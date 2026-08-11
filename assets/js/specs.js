function editBtn(no) {
    const row = document.getElementById(`row${no}`);
    const toggleBtn = row.querySelector('td.toggleBtn');
    let editBtn = document.getElementById(`edit${no}`);
    let deleteBtn = document.getElementById(`delete${no}`);

    if (toggleBtn) {
        toggleBtn.toggleAttribute('hidden');
        toggleBtn.classList.toggle('active');
        if (toggleBtn.hasAttribute('hidden')) {
            console.log("off");
            replaceBtn = `replace(${no})`;
            editBtn.setAttribute("src", "images/edit.png");
            editBtn.setAttribute("title", "edit");
            editBtn.setAttribute("onclick", replaceBtn);

            deleteModal = `opendeleteModal()`;
            deleteBtn.setAttribute("src", "images/delete.png");
            deleteBtn.setAttribute("title", "delete");
            deleteBtn.setAttribute("onclick", deleteModal);
        } else {
            console.log("on");
        }
    }
}
function cancel() {
    window.location.reload();
}
function replace(no) {
    let editBtn = document.getElementById(`edit${no}`);
    let deleteBtn = document.getElementById(`delete${no}`);
    let tdmodel = document.getElementById(`tdmodel${no}`);
    let tdmin = document.getElementById(`tdmin${no}`);
    let tdcenter = document.getElementById(`tdcenter${no}`);
    let tdmax = document.getElementById(`tdmax${no}`);
    let model = document.getElementById(`model${no}`);
    let min = document.getElementById(`min${no}`);
    let center = document.getElementById(`center${no}`);
    let max = document.getElementById(`max${no}`);
    let newmodel = document.getElementById(`newmodel${no}`);
    let newmin = document.getElementById(`newmin${no}`);
    let newcenter = document.getElementById(`newcenter${no}`);
    let newmax = document.getElementById(`newmax${no}`);

    accept = `confirmEdit(${no})`;
    editBtn.setAttribute("src", "images/accept.png");
    editBtn.setAttribute("title", "confirm");
    editBtn.setAttribute("onclick", accept);

    refresh = `cancel()`;
    deleteBtn.setAttribute("src", "images/cancel.png");
    deleteBtn.setAttribute("title", "cancel");
    deleteBtn.setAttribute("onclick", refresh);

    const inputModel = document.createElement('input');
    if (inputModel) {
        inputModel.setAttribute('type', 'text');
        inputModel.setAttribute('class', 'form-control form-control-sm w-100 mx-auto text-center');
        inputModel.setAttribute('required', '');
        inputModel.setAttribute('placeholder', 'Material');
        inputModel.setAttribute('id', `newmodel${no}`);
        inputModel.value = model.innerText;
        model.setAttribute('hidden', true);
        tdmodel.appendChild(inputModel);
    }

    const inputMin = document.createElement('input');
    if (inputMin) {
        inputMin.setAttribute('type', 'text');
        inputMin.setAttribute('class', 'form-control form-control-sm w-50 mx-auto text-center');
        inputMin.setAttribute('required', '');
        inputMin.setAttribute('placeholder', 'Time control');
        inputMin.setAttribute('id', `newmin${no}`);
        inputMin.type = 'number';
        inputMin.value = min.innerText;
        min.setAttribute('hidden', true);
        tdmin.appendChild(inputMin);
    }
    const inputCenter = document.createElement('input');
    if (inputCenter) {
        inputCenter.setAttribute('type', 'text');
        inputCenter.setAttribute('class', 'form-control form-control-sm w-50 mx-auto text-center');
        inputCenter.setAttribute('required', '');
        inputCenter.setAttribute('placeholder', 'Time control');
        inputCenter.setAttribute('id', `newcenter${no}`);
        inputCenter.type = 'number';
        inputCenter.value = center.innerText;
        center.setAttribute('hidden', true);
        tdcenter.appendChild(inputCenter);
    }
    const inputMax = document.createElement('input');
    if (inputMax) {
        inputMax.setAttribute('type', 'text');
        inputMax.setAttribute('class', 'form-control form-control-sm w-50 mx-auto text-center');
        inputMax.setAttribute('required', '');
        inputMax.setAttribute('placeholder', 'Time control');
        inputMax.setAttribute('id', `newmax${no}`);
        inputMax.type = 'number';
        inputMax.value = max.innerText;
        max.setAttribute('hidden', true);
        tdmax.appendChild(inputMax);
    }

}

function confirmEdit(data) {
    showLoading();
    let no = data;
    let type = urlParams.get('type');
    const location = document.getElementById(`location${no}`).innerHTML;
    const part = document.getElementById(`matPart${no}`).innerHTML;
    const timectrl = document.getElementById(`timeCtrl${no}`).innerHTML;
    const equipment = document.getElementById(`equipment${no}`).innerHTML;
    const unitType = document.getElementById(`unitType${no}`).innerHTML;
    const newloc = document.getElementById(`newloc${no}`).value;
    const newpart = document.getElementById(`newpart${no}`).value;
    const newtimectrl = document.getElementById(`newtimectrl${no}`).value;
    const neweqm = document.getElementById(`neweqm${no}`).value;
    const newunit = document.getElementById(`newunit${no}`).value;
    transfer = [];
    transfer.push(type);
    transfer.push(location);
    transfer.push(newloc);
    transfer.push(timectrl);
    transfer.push(newtimectrl);
    transfer.push(equipment);
    transfer.push(neweqm);
    transfer.push(unitType);
    transfer.push(newunit);
    transfer.push(part);
    $.ajax({
        url: `./assets/chemExp.php?checkPart=${newpart}`,
        async: true,
        success: function (result) {
            console.log(result);
            if (result == 0) {
                hideLoading();
                createAlert("รหัส Material ไม่ถูกต้อง", "danger");
            } else {
                transfer.push(newpart);
                if (type == "Mixing") {
                    console.log("MIX", transfer.join("|"));
                    const partS1 = document.getElementById(`matPartS1${no}`).innerHTML;
                    const partS2 = document.getElementById(`matPartS2${no}`).innerHTML;
                    const partS3 = document.getElementById(`matPartS3${no}`).innerHTML;
                    const newpartS1 = document.getElementById(`newpartS1${no}`).value.trim();
                    if (newpart == newpartS1) {
                        hideLoading();
                        createAlert("เลข Material ซ้ำกัน", "danger");
                    } else {
                        $.ajax({
                            url: `./assets/chemExp.php?checkPart=${newpartS1}`,
                            async: true,
                            success: function (result) {
                                console.log(result);
                                if (result == 0) {
                                    hideLoading();
                                    createAlert("รหัส Material S1 ไม่ถูกต้อง", "danger");
                                } else {
                                    console.log("S1");
                                    transfer.push(partS1);
                                    transfer.push(newpartS1);
                                    // console.log(newpartS1);
                                    if (partS2) {
                                        const newpartS2 = document.getElementById(`newpartS2${no}`).value.trim();
                                        if (newpart == newpartS2 || newpartS1 == newpartS2) {
                                            hideLoading();
                                            createAlert("เลข Material ซ้ำกัน", "danger");
                                        } else {
                                            $.ajax({
                                                url: `./assets/chemExp.php?checkPart=${newpartS2}`,
                                                async: true,
                                                success: function (result) {
                                                    console.log(result);
                                                    if (result == 0) {
                                                        hideLoading();
                                                        createAlert("รหัส Material S2 ไม่ถูกต้อง", "danger");
                                                    } else {
                                                        console.log("S2");
                                                        transfer.push(partS2);
                                                        transfer.push(newpartS2);
                                                        if (partS3) {
                                                            const newpartS3 = document.getElementById(`newpartS3${no}`).value.trim();
                                                            if (newpart == newpartS3 || newpartS1 == newpartS3 || newpartS2 == newpartS3) {
                                                                hideLoading();
                                                                createAlert("เลข Material ซ้ำกัน", "danger");
                                                            } else {
                                                                $.ajax({
                                                                    url: `./assets/chemExp.php?checkPart=${newpartS3}`,
                                                                    async: true,
                                                                    success: function (result) {
                                                                        console.log(result);
                                                                        if (result == 0) {
                                                                            hideLoading();
                                                                            createAlert("รหัส Material S3 ไม่ถูกต้อง", "danger");
                                                                        } else {
                                                                            console.log("S1");
                                                                            transfer.push(partS3);
                                                                            transfer.push(newpartS3);
                                                                            $.ajax({
                                                                                url: `./assets/chemExpTest.php?editData=${transfer.join("|")}`,
                                                                                async: true,
                                                                                success: function (result) {
                                                                                    console.log(result);
                                                                                    if (result == "1") {
                                                                                        hideLoading();
                                                                                        createAlert("มีข้อมูลดังกล่าวอยู่แล้ว กรุณาตรวงสอบข้อมูล", "danger");
                                                                                    } else {
                                                                                        hideLoading();
                                                                                        createAlert("แก้ไขข้อมูสสำเร็จ", "success");
                                                                                    }
                                                                                }
                                                                            })
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        } else {
                                                            $.ajax({
                                                                url: `./assets/chemExpTest.php?editData=${transfer.join("|")}`,
                                                                async: true,
                                                                success: function (result) {
                                                                    console.log(result);
                                                                    if (result == "1") {
                                                                        hideLoading();
                                                                        createAlert("มีข้อมูลดังกล่าวอยู่แล้ว กรุณาตรวงสอบข้อมูล", "danger");
                                                                    } else {
                                                                        hideLoading();
                                                                        createAlert("แก้ไขข้อมูสสำเร็จ", "success");
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                    } else {
                                        $.ajax({
                                            url: `./assets/chemExpTest.php?editData=${transfer.join("|")}`,
                                            async: true,
                                            success: function (result) {
                                                console.log(result);
                                                if (result == "1") {
                                                    hideLoading();
                                                    createAlert("มีข้อมูลดังกล่าวอยู่แล้ว กรุณาตรวงสอบข้อมูล", "danger");
                                                } else {
                                                    hideLoading();
                                                    createAlert("แก้ไขข้อมูสสำเร็จ", "success");
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        })
                    }
                } else {
                    console.log("TRN", transfer.join("|"));
                    $.ajax({
                        url: `./assets/chemExpTest.php?editData=${transfer.join("|")}`,
                        async: true,
                        success: function (result) {
                            console.log(result);
                            if (result == "1") {
                                hideLoading();
                                createAlert("มีข้อมูลดังกล่าวอยู่แล้ว กรุณาตรวงสอบข้อมูล", "danger");
                            } else {
                                hideLoading();
                                createAlert("แก้ไขข้อมูสสำเร็จ", "success");
                            }
                        }
                    })
                }
            }
        }
    })
}
function opendeleteModal(no) {
    document.getElementById(`delOverlay${no}`).style.display = "block";
    document.getElementById(`delModal${no}`).style.display = "block";
}

function closedeleteModal(no) {
    document.getElementById(`delOverlay${no}`).style.display = "none";
    document.getElementById(`delModal${no}`).style.display = "none";
    createAlert("ยกเลิกการลบข้อมูล", "warning");
}

function editRow(data) {
    let no = data;
    console.log(no);
    let type = urlParams.get('type');
    let loc = document.getElementById(`location${no}`).innerText;
    let part = document.getElementById(`matPart${no}`).innerText;
    let timectrl = document.getElementById(`timeCtrl${no}`).innerText;
    let eqm = document.getElementById(`equipment${no}`).innerText;
    let unit = document.getElementById(`unitType${no}`).innerText;
    let emp = document.getElementById(`addedBy${no}`).innerText;
    let regis = document.getElementById(`regisDate${no}`).innerText;
    transfer = [];
    transfer.push(type);
    transfer.push(loc);
    transfer.push(timectrl);
    transfer.push(eqm);
    transfer.push(unit);
    transfer.push(emp);
    transfer.push(regis);
    transfer.push(part);
    if (type == 'Mixing') {
        let partS1 = document.getElementById(`matPartS1${no}`).innerText;
        let partS2 = document.getElementById(`matPartS2${no}`).innerText;
        let partS3 = document.getElementById(`matPartS3${no}`).innerText;
        transfer.push(partS1);
        transfer.push(partS2);
        transfer.push(partS3);
    }
    console.log(transfer.join("|"));
    if (confirm("ยืนยันการลบข้อมูล") == true) {
        $.ajax({
            url: `./assets/chemExpTest.php?deleteRow=${transfer.join("|")}`,
            async: true,
            success: function (result) {
                console.log(result);
                if (result == 'error') {
                    createAlert("ไม่สามารถลบข้อมูลได้", "danger");
                } else {
                    createAlert("ลบข้อมูลสำเร็จ", "success");
                    // window.location.reload();
                }
            }
        });
    } else {
        createAlert("ยกเลิกการลบข้อมูล", "warning");
    }
}