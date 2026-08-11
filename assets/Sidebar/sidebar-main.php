<?php
$currentPage = isset($_GET['currentPage']) ? $_GET['currentPage'] : '';
?>
<button class="open-sidebar-main-btn" onclick="toggleSidebar()">
    <img src="./assets/images/menu.png" alt="menu" style="width:18px;height:18px;vertical-align:middle;">
</button>
<div class="sidebar" id="Sidebar">
    <div class="sidebar-header">
        <h3>Menu</h3>
        <button class="close-sidebar-btn-in-header" onclick="toggleSidebar()">
            <img src="./assets/images/menu.png" alt="menu" style="width:18px;height:18px;vertical-align:middle;">
        </button>
    </div>
    <ul class="sidebar-menu">
        <li style="display: flex; justify-content: space-between; align-items: center;">
            <?php if ($currentPage == 'dashboard.php'): ?>
                <a class="disabled-link active">Monitoring</a>
            <?php else: ?>
                <a href="dashboard.php">Monitoring</a>
            <?php endif; ?>
            <a href="Monitor.php" class="tv-icon-link" style="background-color: #FFF3E0; padding: 4px; border-radius: 4px;margin-right: 10px;">
                <img src="./assets/images/tablet.png" alt="TV" style="width:16px;height:16px;vertical-align:middle;">
            </a>
        </li>
        <li>
            <?php if ($currentPage == 'import.php'): ?>
                <a class="disabled-link active">Plan Maintenance</a>
            <?php else: ?>
                <a href="import.php">Plan Maintenance</a>
            <?php endif; ?>
        </li>
        <li>
            <?php if ($currentPage == 'wiplastmonth.php'): ?>
                <a class="disabled-link active">WIP last month Maintenance</a>
            <?php else: ?>
                <a href="wiplastmonth.php">WIP last month Maintenance</a>
            <?php endif; ?>
        </li>
    </ul>
    <div class="sidebar-footer">
        <img src="assets/images/demo.png" alt="Copyright" style="width:75%;height:75%;">
    </div>
    <div class="sidebar-logout" style="padding: 15px; border-top: 1px solid #ddd; text-align: center;">
        <button id="sidebarAuthBtn" class="logout-btn">Logout</button>
    </div>
</div>