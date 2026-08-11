 <?php
    //dashboard.php
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
    <link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">

    <!-- jQuery & UI -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="//code.jquery.com/ui/1.13.2/jquery-ui.js"></script>

    <!-- Bootstrap -->
    <script src="./assets/js/bootstrap.min.js"></script>

    <!-- SweetAlert2 -->
    <script src="./assets/js/sweetalert2.all.min.js"></script>

    <!-- Chart.js v4 + datalabels -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0"></script>

    <!-- Select2 -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

    <!-- DataTables CSS/JS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.8/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.8/css/dataTables.bootstrap4.min.css"/>
    <script src="https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/1.13.8/js/dataTables.bootstrap4.min.js"></script>
    <link rel="stylesheet" href="https://cdn.datatables.net/rowgroup/1.4.1/css/rowGroup.dataTables.min.css">
    <script src="https://cdn.datatables.net/rowgroup/1.4.1/js/dataTables.rowGroup.min.js"></script>
    
    <!-- DataTables Buttons for Excel Export -->
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.bootstrap4.min.css">
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.bootstrap4.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>


    <!-- Data Notification Script -->
    <script src="./assets/js/data_notification.js"></script>
    
    <!-- Dashboard Script -->
    <script src="./function/js/dashboard.js"></script>
    <title>Monitering</title>
<style>
    /* ================= 1) Layout & Header ================= */
    .top-navbar-flex > a.navbar-brand {
        margin-left: 16px;
    }
    .navbar-open-sidebar-main-btn {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0 8px 0 0;ๅ
        box-shadow: none;
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        position: static;
    }
    .top-navbar-flex {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        width: 100%;
        gap: 5px;
        background-color: white;
    }
    .filters-row {
        display: flex;
        align-items: center;
    }
    #dayInput {
        width: 102px;
    }
    .ui-datepicker {
        z-index: 2000 !important;
    }
    #main-navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
        background-color: white; /* หรือสี navbar เดิม */
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    #navbar-hover-zone {
        position: fixed;
        top: 0;
        left: 0;
        height: 30px;
        width: 100%;
        z-index: 999;
        cursor: pointer;
    }
    /* เมื่อเมาส์ hover บน hover-zone หรือ navbar เอง */
    #navbar-hover-zone:hover + #main-navbar,
    #main-navbar:hover {
        transform: translateY(0%);
    }
    #dayFilterContainer,
    #monthFilterContainer,
    #yearFilterContainer {
        display: none;
    }
    .tab-filter {
        display: none;
    }
    .tab-filter.active {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-start;
        padding: 8px 12px;
        background: #e5e2e2ff;
    }
    .tab-filter .form-group,
    .tab-filter .form-group.col-auto {
        justify-content: flex-start !important;
        align-items: flex-start !important;
        text-align: left !important;
    }
    #productTypeFilter,
    #dateFilter,
    #monthFilter,
    #typelotFilter,
    #statusFilter,
    #yearFilter {
        width: auto !important;
    }
    .form-group.col-auto label {
        margin-right: 12px;
    }
    .select2-container .select2-selection--single {
        height: 38px !important;
        padding: 6px 12px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
        min-width: 120px;
    }
    .select2-container--default .select2-selection--single .select2-selection__arrow {
        height: 38px !important;
        top: 0px !important;
        right: 8px;
        width: 30px;
    }
    .select2-dropdown {
        min-width: 100% !important;
        max-width: 300px;
        box-sizing: border-box;
    }
    #Special-text {
        position: fixed;
        top: 150px;
        right: 24px;
        z-index: 3000;
        background: rgba(255, 255, 255, 1);
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        text-align: right;
        pointer-events: auto
    }
    #Special-text-toggle {
        text-align: right;
        font-size: 16px;
        margin-bottom: 4px;
        user-select: none;
        pointer-events: auto;
    }
    #CreateTypePlan {
        position: fixed;
        top: 150px;
        right: 100px;
        z-index: 2999;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        text-align: right;
        pointer-events: auto
    }
    .e-card {
        background: transparent;
        box-shadow: 0px 8px 28px -9px rgba(0,0,0,0.45);
        position: relative;
        width: 200px;
        height: 110px;
        border-radius: 16px;
        overflow: hidden;
        background-color:rgb(255, 255, 255);
        border: 1px solid rgb(0, 0, 0);
    }
    .Maininfo {
        text-align: center;
        font-size: 23px;
        position: absolute;
        top: 35px;
        left: 0;
        right: 0;
        color: rgb(255, 255, 255); 
        font-weight: 600;
    }
    .main-text, .differenceinfo, .percentinfo {
        font-weight: bold;
    }
    .Maininfo ,.Subinfo {
        margin-top: -8px;
        display: block;
    }
    .Subinfo {
        top: 5px;
        font-size: 14px;
        font-weight: 1000;
        position: relative;
        color: #000;
    }
    .dailyHead, .accHead, .SpecialHead {
        font-size: 18px;
        font-weight: bold;
        color : white;
        text-align: center;
        margin-bottom: 20px;
    }
    .dailyHead {
        background-color: skyblue;
    }
    .accHead {
        background-color: blue;
    }
    .SpecialHead {
        background-color: green;
    }
    .percentinfo, .differenceinfo {
        position: absolute;
        bottom: 4px;
        font-size: 17px;
        font-weight: 500;
        color: rgb(0, 0, 0);
        z-index: 3;
        opacity: 0.95;
        letter-spacing: 0.5px;
    }
    .percentinfo {
        left: 20px;
        text-align: left;
    }
    .differenceinfo {
        right: 20px;
        text-align: right;
    }
    .divider-vertical {
        position: absolute;
        top: 150px;
        bottom: 0;
        left: 25.5%;
        width: 2px;
        background-color: #002D80;
        z-index: 10;
    }
    .divider-horizontal {
        position: absolute;
        top: 60%;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #002D80;
        z-index: 10;
    }
    /* ================= 2) Charts & Summary containers ================= */
    .wip-chart-container,.Summary-Inout-Container,.Summary-Container{
        min-width: 0;
        min-height: 250px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
    }
    #donutchart{t;
        width: 100% !important;
        height: 100% !important;
    }
    #wipLineChart {
        width: 100% !important;
        height: 350px !important;
    }
    #wipProcessChart {
        width: 100% !important;
        height: 100% !important;
        max-height: none !important;
    }
    #SummaryInputCircle, #SummaryOutputCircle, #SummaryPlanChartInput, #SummaryPlanChartOutput, #SummaryPartChartInput, #SummaryPartChartOutput {
        width: 100% !important;
        height: 100% !important;
        max-width: 100%;
        max-height: 100%;
        display: block;
    }
    .Summary-Inout-Container canvas {
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        max-height: none !important;
    }
    .Summary-Inout-Container {
        position: relative;
        width: 100%;
        height: 100%;
    }
    /* ================= 3) Tables: Sticky headers/footers (global) ================= */
    /* Global sticky headers */
    #SummaryDetailTableInput thead th, 
    #SummaryDetailTableOutput thead th {
        position: sticky !important;
        top: 0;
        background: #f8f9fa;
        z-index: 2;
        text-align: center;
        font-weight: 600;
        border: 1px solid #dee2e6;
        padding: 4px 8px; /* same as body cells */
        font-size: 13px;  /* same as body cells */
        line-height: 1.2; /* same as body cells */
        box-sizing: border-box; /* ensure equal width calc */
    }
    
    /* Global sticky footers */
    #SummaryDetailTableInput tfoot td, 
    #SummaryDetailTableOutput tfoot td,
    table.dataTable tfoot td {
        position: sticky !important;
        bottom: 0 !important;
        background: #e9ecef !important;
        z-index: 10 !important;
        text-align: right !important;
        font-family: inherit;
        font-size: inherit;
        padding: 8px;
        border-top: 1px solid #ddd !important;
        font-weight: bold !important;
        color: #333 !important;
    }
    /* ================= 4) Tables: Base ================= */
    #SummaryDetailTableInput,
    #SummaryDetailTableOutput,
    #MCRecordDetailTable {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }
    /* ================= 5) Sections (InputDetail / OutputDetail) ================= */
    #InputDetail, #OutputDetail {
        max-height: 100vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    #InputDetail .chart-section, #OutputDetail .chart-section {
        flex: 0 0 45vh;
        display: flex;
        gap: 24px;
    }
    #InputDetail .table-section, #OutputDetail .table-section {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 400px;
    }
    /* ================= 6) Table wrappers ================= */
    #SummaryDetailTableInput_wrapper,
    #SummaryDetailTableOutput_wrapper {
        overflow: hidden;
        height: 100%;
    }
    /* ================= 7) Sticky footer emulation (tbody row) ================= */
    .dataTables_scrollBody table tbody tr.sticky-tfoot-row td {
        position: sticky !important;
        bottom: 0 !important;
        background: #e9ecef !important;
        z-index: 10 !important;
        border-top: 1px solid #ddd !important;
        font-weight: bold !important;
        color: #333 !important;
    }
    
    /* Ensure footer is visible in DataTables */
    .dataTables_scrollBody {
        overflow-y: auto !important;
    }
    
    /* Force footer visibility */
    tr.sticky-tfoot-row {
        display: table-row !important;
        visibility: visible !important;
    }
    
    /* Additional footer styling for DataTables */
    .dataTables_scrollBody table tbody tr.sticky-tfoot-row {
        position: sticky !important;
        bottom: 0 !important;
        z-index: 10 !important;
    }
    
    .dataTables_scrollBody table tbody tr.sticky-tfoot-row td {
        background: #e9ecef !important;
        border-top: 1px solid #ddd !important;
        font-weight: bold !important;
        color: #333 !important;
    }
    
    /* Ensure footer is visible in scroll body */
    .dataTables_scrollBody {
        position: relative !important;
        height: 280px !important;
        overflow-y: auto !important;
    }
    
    /* Make sure footer row is not hidden */
    .sticky-tfoot-row {
        display: table-row !important;
        visibility: visible !important;
        opacity: 1 !important;
    }
    
    /* Override any DataTables hiding */
    .dataTables_scrollBody .sticky-tfoot-row {
        display: table-row !important;
        visibility: visible !important;
        opacity: 1 !important;
    }

    /* ================= 9) Tables: Cells formatting ================= */
    #SummaryDetailTableInput th, #SummaryDetailTableInput td,
    #SummaryDetailTableOutput th, #SummaryDetailTableOutput td,
    #MCRecordDetailTable th, #MCRecordDetailTable td{
    border: 2px solid #6c757d;
    padding: 4px 8px;
    font-size: 13px;
    line-height: 1.2;
    }
    #SummaryDetailTableInput th, #SummaryDetailTableOutput th, #MCRecordDetailTable th{
    background-color: #f8f9fa;
    text-align: center;
    font-weight: bold;
    }
    #SummaryDetailTableInput td, #SummaryDetailTableOutput td, #MCRecordDetailTable td{
    text-align: left;
    }
    #SummaryDetailTableInput td:last-child,
    #SummaryDetailTableOutput td:last-child,
    #MCRecordDetailTable td:last-child,
    #MCRecordDetailTable td:nth-child(4){
    text-align: right;
    }
    /* ================= 10) Tables: Footers (specific) ================= */
    #MCRecordDetailTable tfoot td{
    background: #e9ecef;
    font-weight: bold;
    }
    #MCRecordDetailTable tfoot td:first-child {
    text-align: right;
    }
    #StatusBM {
        position: fixed;
        top: 0;
        right: 24px;
        z-index: 3000;
        font-size: 24px;
        font-weight: bold;
        display: inline-block;
        text-align: center;
    }
    /* ================= 12) DataTables internal wrappers ================= */
    
    /* Enhanced borders for DataTables */
    .dataTables_wrapper table,
    .dataTables_wrapper table th,
    .dataTables_wrapper table td {
        border: 2px solid #6c757d !important;
    }

    .dataTables_scrollFoot {
        overflow: visible !important;
        display: block !important;
    }
    .dataTables_scrollFootInner {
        width: 100% !important;
        overflow: visible !important;
        display: block !important;
    }
    .dataTables_scrollFootInner table {
        width: 100% !important;
        table-layout: fixed !important;
        display: table !important;
    }
    
    /* Force tfoot to be visible */
    .dataTables_wrapper tfoot {
        display: table-footer-group !important;
        visibility: visible !important;
    }
    
    .dataTables_wrapper tfoot tr {
        display: table-row !important;
        visibility: visible !important;
    }
    
    .dataTables_wrapper tfoot td {
        display: table-cell !important;
        visibility: visible !important;
    }
    
    /* Override DataTables hiding tfoot */
    .dataTables_wrapper .dataTables_scrollFoot {
        display: block !important;
        visibility: visible !important;
        height: auto !important;
        overflow: visible !important;
    }
    
    /* Ensure tfoot is not hidden by DataTables */
    table.dataTable tfoot {
        display: table-footer-group !important;
        visibility: visible !important;
    }
    
    table.dataTable tfoot tr {
        display: table-row !important;
        visibility: visible !important;
    }
    
    table.dataTable tfoot td {
        display: table-cell !important;
        visibility: visible !important;
    }
    

    .table-wrapper {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
    max-width: 1455px;
    max-height: 300px;
    overflow-y: auto;
    }
    /* ================= 13) DataTables integration (head/body sync) ================= */
    .dataTables_wrapper .dataTables_scrollHead,
    .dataTables_wrapper .dataTables_scrollBody {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }
    
    /* Force tfoot to be visible in scroll body */
    .dataTables_scrollBody {
        position: relative !important;
    }
    
    .dataTables_scrollBody table tfoot {
        display: table-footer-group !important;
        visibility: visible !important;
        position: sticky !important;
        bottom: 0 !important;
        z-index: 10 !important;
    }
    
    .dataTables_scrollBody table tfoot tr {
        display: table-row !important;
        visibility: visible !important;
    }
    
    .dataTables_scrollBody table tfoot td {
        display: table-cell !important;
        visibility: visible !important;
        background: #e9ecef !important;
        border-top: 1px solid #ddd !important;
        font-weight: bold !important;
        color: #333 !important;
    }
    
    /* Footer row styling */
    .footer-row {
        position: sticky ;
        bottom: 0 !important;
        z-index: 10 !important;
        background: #e9ecef !important;
    }
    
    .footer-row td {
        background: #e9ecef !important;
        border-top: 1px solid #ddd !important;
        font-weight: bold !important;
        color: #333 !important;
        text-align: right;
    }
    .dataTables_wrapper .dataTables_scrollHead table,
    .dataTables_wrapper .dataTables_scrollBody table {
        width: 100% !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        border-spacing: 0 !important;
        border-collapse: collapse !important;
        table-layout: auto !important;
    }
    .dataTables_wrapper tbody td {
        border-top: none !important;
        border-bottom: 1px solid #dee2e6;
    }
    /* ================= 14) LineDailyDowntimeTable specifics ================= */
    #LineDailyDowntimeTable th:first-child,
    #LineDailyDowntimeTable td:first-child {
        min-width: 160px;
        max-width: 240px;
        white-space: nowrap;
        background: #f8f9fa;
        z-index: 2;
    }
    
    /* Ensure header and body columns align properly */
    .dataTables_scrollHead table,
    .dataTables_scrollBody table {
        width: 100% !important;
        table-layout: fixed !important;
    }
    
    /* Force column width consistency */
    .dataTables_scrollHead th,
    .dataTables_scrollBody td {
        box-sizing: border-box !important;
    }
    
    /* Ensure detail rows don't break layout */
    .mctype-detail-row td,
    .process-detail-row td {
        box-sizing: border-box !important;
        white-space: nowrap !important;
    }
    #LineDailyDowntimeTable th:not(:first-child):not(:last-child),
    #LineDailyDowntimeTable td:not(:first-child):not(:last-child) {
        width: 80px !important;
        text-align: right !important;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }
    #LineDailyDowntimeTable_wrapper .dataTables_scrollHead thead th:first-child{
        position: sticky !important;
        left: 0;
        z-index: 4;
        background: #f8f9fa;
        box-shadow: 2px 0 2px -1px #ccc;
    }
    #LineDailyDowntimeTable tbody td:first-child {
        position: sticky !important;
        left: 0;
        z-index: 3;
        background: #f8f9fa;
        box-shadow: 2px 0 2px -1px #ccc;
    }
    #LineDailyDowntimeTable tbody td:last-child {
        position: sticky;
        right: 0;
        z-index: 3;
        background: #f8f9fa;
        box-shadow: -2px 0 2px -1px #ccc;
    }
    /* ================= 15) DataTables sticky columns ================= */
    .dataTables_scrollHeadInner {
        position: relative;
        overflow: hidden; /* keep header width in sync with body incl. scrollbar */
    }
    
    /* Sticky left column */
    .dataTables_scrollHead thead th:nth-child(1) {
        left: 0;
        z-index: 5;
        box-shadow: 2px 0 2px -1px #ccc;
    }
    
    /* Sticky right column for LineDailyDowntimeTable */
    #LineDailyDowntimeTable_wrapper .dataTables_scrollHead thead th:last-child {
        position: sticky !important;
        right: 0;
        z-index: 5;
        box-shadow: -2px 0 2px -1px #ccc;
    }
    
    #LineDailyDowntimeTable td {
        border: 1px solid #dee2e6;
        padding: 4px 8px;
        font-size: 14px;
        white-space: nowrap;
    }
    /* ================= 16) DataTables alignment & borders ================= */
    .dataTables_wrapper table thead th,
    .dataTables_wrapper table tbody td {
        box-sizing: border-box;
        padding: 4px 8px;
        border-right: 1px solid #dee2e6;
        font-size: 13px;
        line-height: 1.2;
    }
    
    .dataTables_wrapper table tbody td { background: #ffffff; }
    
    /* Zebra striping */
    .dataTables_wrapper table tbody tr:nth-child(even) td {
        background: #fcfcfc;
    }
    
    /* Border alignment */
    .dataTables_wrapper table thead th:first-child,
    .dataTables_wrapper table tbody td:first-child {
        border-left: 1px solid #dee2e6;
    }
    
    .dataTables_wrapper table thead th:last-child,
    .dataTables_wrapper table tbody td:last-child {
        border-right: 1px solid transparent; /* avoid double border at table edge */
    }
    /* ================= 18) Misc / Containers ================= */
    .dataTables_scrollHeadInner,
    .dataTables_scrollFootInner {
        width: 100%;
        overflow: visible;
    }
    
    .mc-detail-container {
        max-height: 400px;
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: 12px;
        border-radius: 10px;
        padding: 0;
        background: #fff;
    }
    /* ================= 19) Table captions ================= */
    .table-caption {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-bottom: 12px;
        padding: 8px 0;
        text-align: left;
    }
    
    /* ================= 20) DataTables search alignment ================= */
    /* Move search to top right of table wrapper */
    .dataTables_wrapper {
        position: relative;
        height: 100%;
        overflow: hidden;
    }
    
    .dataTables_filter {
        position: absolute;
        top: -40px;
        right: 0;
        z-index: 10;
    }
    
    .dataTables_filter label {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        white-space: nowrap;
    }
    
    .dataTables_filter input {
        margin-left: 8px;
    }
    
    /* Position table caption and search on same line */
    .table-section {
        position: relative;
    }
    
    .table-caption {
        display: inline-block;
        margin-bottom: 8px;
    }
    
    /* ================= 21) Summary cards ================= */
    .summary-flex-row {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 24px;
    }
    .summary-block {
        flex: 1;
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        max-width: 1200px;
    }
    .summary-title-bar-blue {
        background-color: #007bff;
        color: #fff;
        padding: 12px;
        font-size: 22px;
        font-weight: 600;
        text-align: center;
    }
    .summary-values-card {
        padding: 16px;
    }
    .summary-values-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    .summary-labels-row {
        display: flex;
        justify-content: space-between;
    }
    .summary-value {
        font-size: 20px;
        font-weight: 700;
        color: #333;
        text-align: center;
        min-width: 70px;
    }
    .Summary-vertical {
        position: absolute;
        top: 180px;
        bottom: 0;
        left: 50%;
        width: 2px;
        background-color: #002D80;
        z-index: 10;
    }
    .Summary-horizontal {
        position: absolute;
        top: 61%;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #002D80;
        z-index: 10;
    }
    /* MCRecordDetailTable: isolated styles */
    #MCRecordDetailTable.mc-record-table { table-layout: fixed; width: 100%; border-collapse: collapse; }
    #MCRecordDetailTable.mc-record-table thead th,
    #MCRecordDetailTable.mc-record-table tbody td {
        box-sizing: border-box;
        padding: 4px 8px;
        border: 1px solid #dee2e6;
        font-size: 13px;
        line-height: 1.2;
        white-space: nowrap;
    }
    #MCRecordDetailTable.mc-record-table thead th {
        background: #f8f9fa; text-align: center; font-weight: bold; position: sticky; top: 0; z-index: 2;
    }
    #MCRecordDetailTable.mc-record-table tfoot td {
        position: sticky; bottom: 0; background: #e9ecef; z-index: 2; text-align: right; padding: 8px; border-top: 1px solid #ddd;
    }
    
    
    /* Full-screen Summary (no scroll) */
    #SummaryDetails { height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
    #SummaryDetails .summary-flex-row { flex: 0 0 auto; }
    #SummaryDetails .summary-charts-row { flex: 1 1 0; min-height: 0; }
    #SummaryDetails .Summary-Container { min-height: 0; height: 100%; }
    #SummaryDetails .Summary-Container canvas { width: 100% !important; height: 100% !important; }
</style>
</head>
<body>
    <script>
        fetch('./assets/Sidebar/sidebar-monitor.php?currentPage=' + encodeURIComponent('<?php echo $currentPage; ?>'))
        .then(r => r.text())
        .then(html => {
            document.getElementById('SidebarContainer').innerHTML = html;
            if (typeof updateSidebarAuthBtn === 'function') updateSidebarAuthBtn();
            if (typeof updateSidebarMenuByLogin === 'function') updateSidebarMenuByLogin();
            if (typeof setupLogoutButton === 'function') setupLogoutButton();
        });
    </script>
    <div id="SidebarContainer"></div>
    <div id="navbar-hover-zone"></div>
    <div id="main-navbar">
        <div class="top-navbar-flex">
            <a class="navbar-brand">
                <button class="navbar-open-sidebar-main-btn" onclick="toggleSidebar()">
                    <img src="./assets/images/menu.png" alt="menu" style="width:18px;height:18px;vertical-align:middle;">
                </button>
            </a>
            <div class="filters-row">
                <form class="d-flex flex-wrap align-items-center gap-3"">
                    <div class="form-group">
                    <label for="productTypeFilter" class="mb-0 me-2">*Product:</label>
                    <select class="form-select" id="productTypeFilter">
                        <option value="" disabled <?php if(empty($_GET['productType'])) echo 'selected'; ?>>Choose Product</option>
                        <option value="typeA">Type A</option>
                        <option value="typeB">Type B</option>
                        <option value="typeC">Type C</option>
                    </select>
                    </div>
                    <div class="form-group">
                    <label for="dateFilter" class="mb-0 me-2">Date Type</label>
                    <select class="form-control" id="dateFilter" onchange="handleDateFilterChange()">
                        <option value="yesterday">yesterday</option>
                        <option value="day">day</option>
                        <option value="month">month</option>
                        <option value="year">year</option>
                    </select>
                    </div>
                    <div class="form-group" id="dayFilterContainer" style="display: flex; align-items: center;">
                    <label for="dayInput" class="mb-0 me-2">Date:</label>
                    <input type="text" id="dayInput" class="form-control">
                    </div>
                    <div class="form-group" id="monthFilterContainer" style="display: flex; align-items: center;">
                    <label for="monthFilter" class="mb-0 me-2">Month:</label>
                    <select id="monthFilter" class="form-control"></select>
                    </div>
                    <div class="form-group" id="yearFilterContainer" style="display: flex; align-items: center;">
                    <label for="yearFilter" class="mb-0 me-2">Year:</label>
                    <select id="yearFilter" class="form-control" onchange="handleYearChange()"></select>
                    </div>
                </form>
            </div>
            <div class="radio-inputs">
                <label class="radio">
                    <input type="radio" name="radio" checked="">
                    <span class="name">Monitor</span>
                </label>
                <label class="radio">
                    <input type="radio" name="radio">
                    <span class="name">Input Details</span>
                </label>
                <label class="radio">
                    <input type="radio" name="radio">
                    <span class="name">WIP Details</span>
                </label>    
                <label class="radio">
                    <input type="radio" name="radio">
                    <span class="name">Outgoing</span>
                </label>
                <label class="radio">
                    <input type="radio" name="radio">
                    <span class="name">Machine Status</span>
                </label>
                <label class="radio">
                    <input type="radio" name="radio">
                    <span class="name">Machine loss time</span>
                </label>
                <label class="radio">
                    <input type="radio" name="radio">
                    <span class="name">Summary</span>
                </label>
            </div>
        </div>
        
        <div id="navbar-tab-filters">
            <div class="tab-filter" data-tab="monitor">
                <div class="form-group">
                <label for="lineTypeFilter" class="mb-0 me-2">Line:</label>
                <select class="form-control" id="lineTypeFilter">
                    <option value="all">All</option>
                    <?php echo $lineOptions; ?>
                </select>
                </div>
            </div>
        </div>

        <div id="navbar-tab-filters">
            <div class="tab-filter" data-tab="InputDetail">
                <div class="form-group col-auto" id="typelotFilterContainer">
                    <label for="typelotFilter">TypeLot:</label>
                    <select class="form-control" id="typelotFilter">
                        <option value="all">All</option>
                        <option value="normal">normal</option>
                        <option value="resort">resort</option>
                        <option value="changemodel">change model</option>
                        <option value="renew">renew</option>
                        <option value="cutlot">cut lot</option>
                        <option value="test">test</option>
                    </select>
                </div>
            </div>
        </div>

        <div id="navbar-tab-filters">
            <div class="tab-filter" data-tab="WIPDetails">
                <div class="top-row-flex-no-gap justify-content-center">                
                    <div class="form-group col-auto" id="partFilterContainer">
                        <label for="partFilter">Part:</label>
                        <select class="form-control select2" id="partFilter">
                            <option value="all">All</option>
                        </select>
                    </div> 
                    
                    <div class="form-group col-auto" id="lotFilterContainer">
                        <label for="lotFilter">Lot:</label>
                        <select class="form-control select2" id="lotFilter">
                            <option value="all">All</option>
                        </select>
                    </div>

                    <div class="form-group col-auto" id="processFilterContainer">
                        <label for="processFilter">Process:</label>
                        <select class="form-control select2" id="processFilter">
                            <option value="all">All</option>
                        </select>
                    </div>

                    <div class="form-group col-auto">
                        <label for="lineTypeFilterWIP">line:</label>
                        <select class="form-control" id="lineTypeFilterWIP" >
                            <option value="all">All</option>
                            <?php echo $lineOptions; ?>
                        </select>
                    </div>

                    <div class="form-group col-auto" id="statusFilterContainer">
                        <label for="statusFilter">Status:</label>
                        <select class="form-control" id="statusFilter">
                            <option value="all">All</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div id="navbar-tab-filters">
            <div class="tab-filter" data-tab="OutputDetail">
                <div class="form-group col-auto" id="typelotFilterContainer">
                    <label for="typelotFilter">TypeLot:</label>
                    <select class="form-control" id="typelotFilter">
                        <option value="all">All</option>
                        <option value="normal">normal</option>
                        <option value="resort">resort</option>
                        <option value="changemodel">change model</option>
                        <option value="renew">renew</option>
                        <option value="cutlot">cut lot</option>
                        <option value="test">test</option>
                    </select>
                </div>
            </div>
        </div>

        <div id="navbar-tab-filters">
            <div class="tab-filter" data-tab="MachineLoss">
                <div class="top-row-flex-no-gap justify-content-center">
                    <div class="form-group col-auto">
                        <label for="lineTypeFilterMLT">line:</label>
                        <select class="form-control" id="lineTypeFilterMLT" >
                            <option value="all">All</option>
                            <select id="lineTypeFilterMLT"></select>
                        </select>
                    </div>

                    <div class="form-group col-auto">
                        <label for="LossCodeFilter">loss code:</label>
                        <select class="form-control" id="LossCodeFilter" >
                            <option value="all">All</option>
                            <select id="LossCodeFilter"></select>
                        </select>
                    </div>
                </div> 
            </div>
        </div>

    </div>

    <div id="Monitor" class="mainContentDashboard mt-1">
        <div id="Special-text">
            <div id="Special-text-toggle" style="cursor:pointer; font-weight:bold; color:#007bff; text-align:right;">&#x25BC;</div>
            <div id="Special-text-content"></div>
        </div>
        <div id="CreateTypePlan">
            <div id="CreateTypePlan-text"></div>
        </div>
        
        <div class="top-row-flex-gap justify-content-center">
            <div class="e-card playing">
                <div class="dailyHead">Daily Input</div>
                <div class="Maininfo">     
                    <span class="main-text" id="dailyInput">0</span> 
                    <div class="Subinfo" id="plandailyInput">Plan: 0</div>
                </div>
                <div class="percentinfo" id="dailyInputpercent">0%</div>
                <div class="differenceinfo" id="dailyInputdifference">0</div>
            </div>
            <div class="e-card playing">
                <div class="dailyHead">Daily Output</div>
                    <div class="Maininfo">     
                        <span class="main-text" id="dailyOutput">0</span>
                        <div class="Subinfo" id="plandailyOutput">Plan: 0</div>
                    </div>
                <div class="percentinfo" id="dailyOutputpercent">0%</div>
                <div class="differenceinfo" id="dailyOutputdifference">0</div>
            </div>
            <div class="e-card playing">
                <div class="accHead">Acc Input</div>
                    <div class="Maininfo">     
                        <span class="main-text" id="accInput">0</span>
                        <div class="Subinfo" id="planaccInput">Plan: 0</div>
                    </div>
                <div class="percentinfo" id="accInputpercent">0%</div>
                <div class="differenceinfo" id="accInputdifference">0</div>
            </div>
            <div class="e-card playing">
                <div class="accHead">Acc Output</div>
                    <div class="Maininfo">     
                        <span class="main-text" id="accOutput">0</span>
                        <div class="Subinfo" id="planaccOutput">Plan: 0</div>
                    </div>
                <div class="percentinfo" id="accOutputpercent">0%</div>
                <div class="differenceinfo" id="accOutputdifference">0</div>
            </div>

            <div class="e-card playing" id="A1AccOutputCard" style="display:none;">
                <div class="SpecialHead">A1 Acc Output</div>
                <div class="Maininfo">     
                    <span class="main-text" id="A1AccOutput">0</span> 
                    <div class="Subinfo" id="planA1AccOutput">Plan: 0</div>
                </div>
                <div class="percentinfo" id="A1AccOutputpercent">0%</div>
                <div class="differenceinfo" id="A1AccOutputdifference">0</div>
            </div>
            <div class="e-card playing" id="A2AccOutputCard" style="display:none;">
                <div class="SpecialHead">A2 Acc Output</div>
                <div class="Maininfo">     
                    <span class="main-text" id="A2AccOutput">0</span> 
                    <div class="Subinfo" id="planA2AccOutput">Plan: 0</div>
                </div>
                <div class="percentinfo" id="A2AccOutputpercent">0%</div>
                <div class="differenceinfo" id="A2AccOutputdifference">0</div>
            </div>
            <div class="e-card playing" id="A3AccOutputCard" style="display:none;">
                <div class="SpecialHead">A3 Acc Output</div>
                <div class="Maininfo">     
                    <span class="main-text" id="A3AccOutput">0</span> 
                    <div class="Subinfo" id="planA3AccOutput">Plan: 0</div>
                </div>
                <div class="percentinfo" id="A3AccOutputpercent">0%</div>
                <div class="differenceinfo" id="A3AccOutputdifference">0</div>
            </div>

            <div class="e-card playing" id="1AAccOutputCard" style="display:none;">
                <div class="SpecialHead">1A Acc Output</div>
                <div class="Maininfo">     
                    <span class="main-text" id="1AAccOutput">0</span> 
                    <div class="Subinfo" id="plan1AAccOutput">Plan: 0</div>
                </div>
                <div class="percentinfo" id="1AAccOutputpercent">0%</div>
                <div class="differenceinfo" id="1AAccOutputdifference">0</div>
            </div>
            <div class="e-card playing" id="2AAccOutputCard" style="display:none;">
                <div class="SpecialHead">2A Acc Output</div>
                <div class="Maininfo">     
                    <span class="main-text" id="2AAccOutput">0</span> 
                    <div class="Subinfo" id="plan2AAccOutput">Plan: 0</div>
                </div>
                <div class="percentinfo" id="2AAccOutputpercent">0%</div>
                <div class="differenceinfo" id="2AAccOutputdifference">0</div>
            </div>
            <div class="e-card playing" id="3AAccOutputCard" style="display:none;">
                <div class="SpecialHead">3A Acc Output</div>
                <div class="Maininfo">     
                    <span class="main-text" id="3AAccOutput">0</span> 
                    <div class="Subinfo" id="plan3AAccOutput">Plan: 0</div>
                </div>
                <div class="percentinfo" id="3AAccOutputpercent">0%</div>
                <div class="differenceinfo" id="3AAccOutputdifference">0</div>
            </div>
            <div class="e-card playing" id="4AAccOutputCard" style="display:none;">
                <div class="SpecialHead">4A Acc Output</div>
                <div class="Maininfo">     
                    <span class="main-text" id="4AAccOutput">0</span> 
                    <div class="Subinfo" id="plan4AAccOutput">Plan: 0</div>
                </div>
                <div class="percentinfo" id="4AAccOutputpercent">0%</div>
                <div class="differenceinfo" id="4AAccOutputdifference">0</div>
            </div>
        </div>

        <div class="row" style="margin-top:40px;">
            <div class="col-md-3 col-12">
                <canvas id="dailyInputChart" height="400"></canvas>
            </div>
            <div class="col-md-9 col-12">
                <canvas id="accInputChart" height="400"></canvas>
            </div>
        </div>

        <div class="row" style="margin-top:40px;">
            <div class="col-md-3 col-12">
                <canvas id="dailyOutputChart" height="400"></canvas>
            </div>
            <div class="col-md-9 col-12">
                <canvas id="accOutputChart" height="400"></canvas>
            </div>
        </div>

        <div class="divider-vertical"></div>
        <div class="divider-horizontal"></div>
    </div>

    <div id="InputDetail" class="mainContentDashboard mt-1">
        
        <div class="chart-section" style="display: flex; gap: 24px; height: 35vh;">
            <div class="Summary-Inout-Container" style="flex: 1;">
                <canvas id="SummaryInputCircle"></canvas>
            </div>
            <div class="Summary-Inout-Container" style="flex: 1.4;">
                <canvas id="SummaryPlanChartInput"></canvas>
            </div>
            <div class="Summary-Inout-Container" style="flex: 1.6;">
                <canvas id="SummaryPartChartInput"></canvas>
            </div>
        </div>

        <div class="table-section" style="flex: 1;">
            <div class="table-caption">Input Details Table</div>
            <table id="SummaryDetailTableInput" class="display table table-bordered table-hover" style="width:100%; border-collapse:collapse;">
                <thead id="SummaryDetailHeadInput"></thead>
                <tbody id="SummaryDetailBodyInput"></tbody>
            </table>
        </div>
    
    </div>

    <div id="WIPDetails" class="mainContentDashboard mt-1">

        <div id="WIP_lastmonth" style="margin-left:10px; font-size:20px;">WIP last month: 0</div>  

        <div style="display: flex; gap: 24px;">
            <div class="wip-chart-container" style="flex: 0 0 20%;">
                <canvas id="donutchart"></canvas>
            </div>
            <div class="wip-chart-container" style="flex: 0 0 20%;">
                <canvas id="wipLineChart" style="height: 100% !important; max-height: 400px !important; width: 100% !important;"></canvas>
            </div>
            <div style="flex: 0 0 55%; overflow: hidden;">
                <div class="table-caption">WIP Details Table</div>
                <div style="overflow-x: auto; max-width: 100%;">
                    <table id="wipDetailsTable" class="display table table-bordered table-hover" style="width:100%; border-collapse:collapse; min-width: 1500px;">
                      <thead>
                        <tr>
                          <th>Plan</th>
                          <th>QTY</th>
                          <th>Input Date</th>
                          <th>Status</th>
                          <th>LotType</th>
                          <th>Part</th>
                          <th>Lot</th>
                          <th>WIP Date</th>
                          <th>Process</th>
                          <th>Product</th>
                          <th>Line</th>
                          <th>Lot Comment</th>
                        </tr>
                      </thead>
                      <tbody id="wipDetailsBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div>
            <div class="wip-chart-container" style="height: 390px;">
                <canvas id="wipProcessChart"></canvas>
            </div>
        </div>
        
    </div>

    <div id="OutputDetail" class="mainContentDashboard mt-1">

        <div class="chart-section" style="display: flex; gap: 24px; height: 45vh;">
            <div class="Summary-Inout-Container" style="flex: 1.1;">
                <canvas id="SummaryOutputCircle"></canvas>
            </div>
            <div class="Summary-Inout-Container" style="flex: 1.3;">
                <canvas id="SummaryPlanChartOutput"></canvas>
            </div>
            <div class="Summary-Inout-Container" style="flex: 1.6;">
                <canvas id="SummaryPartChartOutput"></canvas>
            </div>
        </div>
        <div class="table-section" style="flex: 1;">
            <div class="table-caption">Output Details Table</div>
            <table id="SummaryDetailTableOutput" class="display table table-bordered table-hover" style="width:100%; border-collapse:collapse;">
                <thead id="SummaryDetailHeadOutput"></thead>
                <tbody id="SummaryDetailBodyOutput"></tbody>
            </table>
        </div>
    </div>

    <div id="StatusMachine" class="mainContentDashboard mt-1">
        <canvas id="StatusBM"></canvas>

        <div style="display: flex; gap: 24px; align-items: flex-start;">
            <div class="Status-Machine-Container" style="width: 100%; height: 375px;">
                <canvas id="StatusProcessChart"></canvas>
            </div>
        </div>
        <div style="display: flex; gap: 24px; align-items: flex-start; margin-top: 24px;">
            <div class="Status-Machine-Container" style="width: 100%; height: 375px;">
                <canvas id="StatusLineChart"></canvas>
            </div>
        </div>
    </div>

    <div id="MachineLoss" class="mainContentDashboard mt-1">
        
        <div style="display: flex; gap: 24px; align-items: flex-start;">
            <div class="Status-Machine-Container" style="width: 30%; height: 350px;">
                <canvas id="DowntimeCausesCircle"></canvas>
            </div>

            <div class="Status-Machine-Container" style="width: 70%; height: 350px;">
                <canvas id="MCLossTimeChart"></canvas>
            </div>
        </div>

        <div style="display: flex; gap: 24px; align-items: stretch; margin-top: 24px;">
            <div class="Status-Machine-Container" style="width: 30%; height: 350px;">
                <canvas id="LineLossTimeChart" style="width:100%;height:100%;"></canvas>
            </div>
            <div class="Status-Machine-Container" style="width: 70%; height: 350px;">
                <canvas id="ProcessLossTimeChart" style="width:100%;height:100%;"></canvas>
            </div>
        </div>

            <h5 class="text-center" style="margin-top: 50px;">** Tap the + icon for details on the 30-minute (yellow), 60-minute (orange), and 120-minute (red) </h5>

            <div style="display: flex; gap: 24px; align-items: center;"> 
                <div class="Status-Machine-Container">
                    <div class="table-caption">Daily Downtime Table</div>
                    <div class="table-wrapper">
                        <table id="LineDailyDowntimeTable" class="display table table-bordered table-hover"></table>
                    </div>
                </div>
            </div>

        <div class="mc-detail-container">
            <div class="table-caption">Machine Record Detail Table</div>
            <table id="MCRecordDetailTable" class="display table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Code</th>
                        <th>LostTime</th>
                        <th>Line</th>
                        <th>Process</th>
                        <th>Machine</th>
                        <th>Trouble</th>
                    </tr>
                </thead>
                <tbody id="MCRecordDetailBody"></tbody>
            </table>
        </div>

    </div>

    <div id="SummaryDetails" class="mainContentDashboard">
        <div class="summary-flex-row">
            <div class="summary-block">
                <div class="summary-title-bar-blue">Total Input</div>
                <div class="summary-values-card">
                    <div class="summary-values-row">
                        <div id="summary-plan-input" class="summary-value">0</div>
                        <div id="summary-result-input" class="summary-value">0</div>
                        <div id="summary-diff-input" class="summary-value">0</div>
                        <div id="summary-percent-input" class="summary-value">0%</div>
                    </div>
                    <div class="summary-labels-row">
                        <div class="summary-label">Plan</div>
                        <div class="summary-label">Result</div>
                        <div class="summary-label">Diff</div>
                        <div class="summary-label">%</div>
                    </div>
                </div>
            </div>
            <div class="summary-block">
                <div class="summary-title-bar-blue">Total Output</div>
                <div class="summary-values-card">
                    <div class="summary-values-row">
                        <div id="summary-plan-output" class="summary-value">0</div>
                        <div id="summary-result-output" class="summary-value">0</div>
                        <div id="summary-diff-output" class="summary-value">0</div>
                        <div id="summary-percent-output" class="summary-value">0%</div>
                    </div>
                    <div class="summary-labels-row">
                        <div class="summary-label">Plan</div>
                        <div class="summary-label">Result</div>
                        <div class="summary-label">Diff</div>
                        <div class="summary-label">%</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: stretch; margin-top: 24px;" class="summary-charts-row">
            <div class="Summary-Container" style="width: 50%; height: 100%;">
                <canvas id="dailyInputSummaryChart" style="width:100%;height:100%;"></canvas>
            </div>
            <div class="Summary-Container" style="width: 50%; height: 100%;">
                <canvas id="accInputSummaryChart" style="width:100%;height:100%;"></canvas>
            </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: stretch;" class="summary-charts-row">
            <div class="Summary-Container" style="width: 50%; height: 100%;">
                <canvas id="dailyOutputSummaryChart" style="width:100%;height:100%;"></canvas>
            </div>
            <div class="Summary-Container" style="width: 50%; height: 100%;">
                <canvas id="accOutputSummaryChart" style="width:100%;height:100%;"></canvas>
            </div>
        </div>

            <div class="Summary-vertical"></div>
            <div class="Summary-horizontal"></div>
        </div>
    </div>
    
</body>
</html>

<script src="function\Login\sidebar-auth-btn.js"></script>