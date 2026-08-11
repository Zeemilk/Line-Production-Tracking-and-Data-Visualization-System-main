<?php
$currentPage = basename($_SERVER['PHP_SELF']);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TV Monitor</title>
    
    <!-- Chart.js -->
    <script src="./assets/js/chart.umd.min.js"></script>
    <script src="./assets/js/chartjs-plugin-datalabels.min.js"></script>
    
    <!-- Monitor Dashboard Script -->
    <script src="./function/js/Monitor.js"></script>
    
    <style>
        /* TV Monitor Specific Styles */
        body {
            margin: 0;
            padding: 5px;
            background-color: #1a1a1a;
            color: #fff;
            font-family: Arial, sans-serif;
            overflow: hidden;
            height: 100vh;
            box-sizing: border-box;
            /* ป้องกันการใช้งานเมาส์ */
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            pointer-events: none;
        }

        html {
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
        }

        * {
            box-sizing: inherit;
        }
        
        .monitor-container1 ,.monitor-container2 ,.monitor-container3{
            display: grid;
            position: relative;
            margin: 0 auto;
            gap: 5px;
            width: 100%;
            min-height: 0;
        }

        .monitor-container1{
            grid-template-columns: repeat(20, 1fr);
            grid-template-rows: repeat(2, 1fr);
            height: 15vh;
            margin-bottom: 5px;
            min-height: 100px;
        }

        .monitor-container2{
            grid-template-columns: repeat(20, 1fr);
            grid-template-rows: repeat(5, 1fr);
            height: 40vh;
            margin-bottom: 5px;
            min-height: 150px;
        }

        .monitor-container3{
            grid-template-columns: repeat(20, 1fr);
            grid-template-rows: repeat(4, 1fr);
            height: 45vh;
            min-height: 250px;
        }

        /* Grid positioning for all elements */
        #date-time-container{
            grid-column: 1 / 5;
            grid-row: 1 / 2;
        }

        #product-type-container{
            grid-column: 1 / 5;
            grid-row: 2 / 3;
        }

        #daily-input{
            grid-column: 5 / 9;
            grid-row: 1 / 3;
        }

        #daily-output{
            grid-column: 9 / 13;
            grid-row: 1 / 3;
        }
        
        #acc-input{
            grid-column: 13 / 17;
            grid-row: 1 / 3;
        }

        #acc-output{
            grid-column: 17 / 21;
            grid-row: 1 / 3;
        }

        #wip-status{
            grid-column: 1 / 4;
            grid-row: 1 / 6;
        }
        #wip-status .chartjs-legend li span {
            color: #fff;
        }

        #wip-line{
            grid-column: 4 / 10;
            grid-row: 1 / 6;
        }

        #machine-status-by-line{
            grid-column: 10 / 17;
            grid-row: 1 / 6;
        }

        #line-loss-time-container{
            grid-column: 17 / 21;
            grid-row: 1 / 6;
        }

        #total-view-wip{
            grid-column: 1 / 21;
            grid-row: 1 / 5;
        }

        .simple-box {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 8px;
            border: 2px solid #444;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: center;
            font-size: 1.2em;
            font-weight: bold;
            text-align: center;
            color: #fff;
            height: 100%;
        }

        .simple-box-white {
            background:rgb(53, 46, 79);
            border-radius: 8px;
            padding: 8px;
            border: 2px solid #444;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: center;
            font-size: 1.2em;
            font-weight: bold;
            text-align: center;
            color: #fff;
            height: 100%;
        }
        
        .simple-box canvas {
            width: 100% !important;
            height: calc(100% - 40px) !important;
            max-width: 100%;
            max-height: calc(100% - 40px);
        }

        .simple-title {
            font-size: 1.2em;
            font-weight: bold;
            text-align: center;
            color: #fff;
        }
        
        #daily-input .percentage-difference-container,
        #daily-output .percentage-difference-container,
        #acc-input .percentage-difference-container,
        #acc-output .percentage-difference-container {
            display: flex !important;
            justify-content: space-between !important;
            width: 100% !important;
            text-align: left !important;
            align-items: center !important;
        }
        
        #daily-input .percentage-value,
        #daily-output .percentage-value,
        #acc-input .percentage-value,
        #acc-output .percentage-value {
            text-align: left !important;
            flex: 1 !important;
        }
        
        #daily-input .difference-value,
        #daily-output .difference-value,
        #acc-input .difference-value,
        #acc-output .difference-value {
            text-align: right !important;
            flex: 1 !important;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1200px) {
            .monitor-container1, .monitor-container2, .monitor-container3 {
                grid-template-columns: repeat(16, 1fr);
            }
            
            #total-view-wip {
                grid-column: 1 / 17;
            }
        }

        @media (max-width: 768px) {
            .monitor-container1, .monitor-container2, .monitor-container3 {
                grid-template-columns: repeat(12, 1fr);
            }
            
            #total-view-wip {
                grid-column: 1 / 13;
            }
        }

        @media (max-width: 480px) {
            .monitor-container1, .monitor-container2, .monitor-container3 {
                grid-template-columns: repeat(8, 1fr);
            }
            
            #total-view-wip {
                grid-column: 1 / 9;
            }
        }
    </style>
</head>
<body>
    <div class="monitor-container1">
        <!-- Date Time -->
        <div id="date-time-container" class="simple-box">
            <div id="current-time">Last Update</div>
        </div>

        <!-- Product Type -->
        <div id="product-type-container" class="simple-box-white">
            Product Type
        </div>

        <!-- Daily Input -->
        <div id="daily-input" class="simple-box">
            <div class="simple-title">Daily Input</div>
        </div>
        
        <!-- Daily Output -->
        <div id="daily-output" class="simple-box">
            <div class="simple-title">Daily Output</div>
        </div>
        
        <!-- Acc Input -->
        <div id="acc-input" class="simple-box">
            <div class="simple-title">Accumulate Input</div>
        </div>
        
        <!-- Acc Output -->
        <div id="acc-output" class="simple-box">
            <div class="simple-title">Accumulate Output</div>
        </div>
    </div>

    <div class="monitor-container2">
        <!-- WIP by Status -->
        <div id="wip-status" class="simple-box">
            <div class="simple-title">WIP By Status</div>
            <canvas id="wipStatusChart"></canvas>
        </div>
        
        <!-- WIP by Line -->
        <div id="wip-line" class="simple-box">
            <div class="simple-title">WIP By Line (unit : pcs.)</div>
            <canvas id="wipLineChart"></canvas>
        </div>

        <!-- Machine Status by Line -->
        <div id="machine-status-by-line" class="simple-box">
            <div class="simple-title">Machine Status by Line (unit : no.m/c)</div>
            <canvas id="machineStatusByLineChart"></canvas>
        </div>

        <!-- Line Loss time -->
        <div id="line-loss-time-container" class="simple-box">
            <div class="simple-title">MC Breakdown Time By Line (unit : min.)</div>
            <canvas id="lineLossTimeChart"></canvas>
        </div>
    </div>

    <div class="monitor-container3">
        <!-- Total View WIP -->
        <div id="total-view-wip" class="simple-box">
            <div class="simple-title">Total View WIP</div>
            <canvas id="totalWipChart"></canvas>
        </div>
    </div>

</body>
</html>