(function () {
    const allowPages = ['dashboard.php', 'Monitor.php'];

    const currentPage = window.location.pathname.split('/').pop();
    if (allowPages.includes(currentPage)) return;

    const token = localStorage.getItem('jwttoken');
    const loginTime = localStorage.getItem('loginTime');

    if (!token || !loginTime || Date.now() - loginTime > 3600000) {
        localStorage.removeItem('jwttoken');
        localStorage.removeItem('username');
        localStorage.removeItem('userData');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('userRole');

        window.location.href = "login.php";
    }
})();
