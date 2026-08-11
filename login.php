<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
    <link rel="icon" type="image/png" href="assets/images/responsive-design.png">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="./assets/css/style.css">
    <link rel="stylesheet" href="./assets/css/sweetalert2.min.css">
    <link href="./assets/css/bootstrap.css" rel="stylesheet">
    <link href="./assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="./assets/css/index.css" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="./assets/js/bootstrap.min.js"></script>
    <script src="./function/js/login.js"></script>
    <script src="./assets/js/sweetalert2.all.min.js"></script>
    <title>Login</title>

    <style>
        .sidebar {
        left: 0;
        top: 0;
        z-index: 1000;
        }
        /* .inputBox input#username{
           
        } */
    </style>
</head>
<body>
    <div class="loginBox" id="loginBox">
        <div class="login">
            Login
        </div>
        <span class="logintag">Username</span>
        <div class="inputBox">
            <input type="text" required="required" id="username">
        </div>
        <span class="logintag">Password</span>
        <div class="inputBox">
            <input type="password" required="required" id="password">
        </div>
        <div class="demo-hint" style="margin: 12px 0; padding: 10px 14px; background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 6px; font-size: 13px; color: #2e7d32; text-align: center;">
            User: <code>demo</code> / <code>demo</code> <br>
            Admin: <code>admin</code> / <code>admin</code>
        </div>
            <button class="enter" onclick="loginChecking()">Enter</button>
    </div>

    <div id="SidebarContainer"></div>
    <script>
        fetch('./assets/Sidebar/sidebar-login.php')
        .then(r => r.text())
        .then(html => {
            document.getElementById('SidebarContainer').innerHTML = html;
            if (typeof updateSidebarAuthBtn === 'function') updateSidebarAuthBtn();
            if (typeof updateSidebarMenuByLogin === 'function') updateSidebarMenuByLogin();
            if (typeof setupLogoutButton === 'function') setupLogoutButton();
        });
    </script>

    <script src="./function/Login/logout.js"></script>
    <script src="./function/Login/sidebar-auth-btn.js"></script>
    <script>
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        usernameInput.addEventListener('keydown', function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                loginChecking();
            }
        });
        passwordInput.addEventListener('keydown', function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                loginChecking();
            }
        });
    </script>
    <script>
</script>
</body>
</html>