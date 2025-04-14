<?php
header('Content-Type: application/json');
require_once '../config/Database.php';

session_start();

try {
    $db = new Database();
    $db->connect();

    // Скидаємо статус усіх студентів на passive
    $resetQuery = "UPDATE students SET status = 'passive'";
    $resetStmt = $db->prepare($resetQuery);
    $resetStmt->execute();
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
}

session_unset();
session_destroy();

echo json_encode(['success' => true]);
?>