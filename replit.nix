{ pkgs }: {
    deps = [
        pkgs.php
        pkgs.php81Packages.composer
    ];
    run = "php -S 0.0.0.0:8000";
}
