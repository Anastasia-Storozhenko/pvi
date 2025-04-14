<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="./css/index.css">
</head>
<body>
    <header class="header_main">
        <a href="./dashboard.html" class="text_header">CMS</a>
        <div class="user_info">
            <a href="./messenges.php">
                <img src="./img/bell.png" alt="Notification" class="bell">
            </a>
            <img src="./img/ava.jpg" alt="Ava" width="45" height="45" class="ava">
            <p class="name">Romeo</p>
        </div>
    </header>
    
    <nav class="navbar">
        <div class="burger-menu">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        <div class="nav-links">
            <a href="./dashboard.php" class="active">Dashboard</a>
            <a href="./students.php" >Students</a>
            <a href="./tasks.php">Tasks</a>
        </div>
    </nav>
    <h1 class="title">Dashboard</h1>
    
    <script src="auth.js"></script>
    <script src="scripts.js"></script>
</body>
</html>