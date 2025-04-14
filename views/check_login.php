<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode([
        'logged_in' => true,
        'first_name' => $_SESSION['first_name']
    ]);
} else {
    echo json_encode([
        'logged_in' => false
    ]);
}
?>