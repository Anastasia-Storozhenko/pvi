<?php
ob_start();
header('Content-Type: application/json; charset=UTF-8');
require_once '../config/Database.php';

session_start();

// Перевіряємо, чи користувач залогінений
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Необхідно увійти в систему']);
    ob_end_flush();
    exit;
}

try {
    $db = new Database();
    $db->connect();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Помилка підключення до бази даних: ' . $e->getMessage()]);
    ob_end_flush();
    exit;
}

// Отримуємо дані з запиту
$input = json_decode(file_get_contents('php://input'), true);
$students = isset($input['students']) ? $input['students'] : [];

if (empty($students)) {
    echo json_encode(['success' => false, 'message' => 'Не вказано студентів для видалення']);
    ob_end_flush();
    exit;
}

try {
    $query = "DELETE FROM students WHERE first_name = :first_name AND last_name = :last_name AND birthday = :birthday";
    $stmt = $db->prepare($query);

    foreach ($students as $student) {
        $firstName = $student['first_name'] ?? '';
        $lastName = $student['last_name'] ?? '';
        $birthday = $student['birthday'] ?? '';

        if (empty($firstName) || empty($lastName) || empty($birthday)) {
            echo json_encode(['success' => false, 'message' => 'Неповні дані для видалення студента']);
            ob_end_flush();
            exit;
        }

        $stmt->bindParam(':first_name', $firstName, PDO::PARAM_STR);
        $stmt->bindParam(':last_name', $lastName, PDO::PARAM_STR);
        $stmt->bindParam(':birthday', $birthday, PDO::PARAM_STR);
        $stmt->execute();
    }

    echo json_encode(['success' => true, 'message' => 'Студенти успішно видалені']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Помилка виконання запиту: ' . $e->getMessage()]);
} finally {
    ob_end_flush();
}
?>