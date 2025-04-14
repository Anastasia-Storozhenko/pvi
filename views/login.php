<?php
header('Content-Type: application/json');
require_once '../config/Database.php';

session_start();

$db = new Database();
$db->connect();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
    $birthday = isset($_POST['birthDate']) ? trim($_POST['birthDate']) : '';

    if (empty($firstName) || empty($birthday)) {
        echo json_encode(['success' => false, 'message' => 'Заповніть усі поля']);
        exit;
    }

    if ($db->checkUser($firstName, $birthday)) {
        $_SESSION['is_logged_in'] = true;
        $_SESSION['logged_in'] = true;
        $_SESSION['first_name'] = $firstName;
        echo json_encode(['success' => true, 'message' => 'Вхід успішний']);
    } else {
        $_SESSION['is_logged_in'] = false;
        echo json_encode(['success' => false, 'message' => 'Невірне ім’я або дата народження']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Невірний метод запиту']);
}
?>