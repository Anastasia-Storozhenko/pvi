<?php
ob_start();
header('Content-Type: application/json; charset=UTF-8');
require_once '../config/Database.php';

session_start();

// Перевірка авторизації
if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
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

// Параметри пагінації
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
$offset = ($page - 1) * $limit;

// Загальна кількість студентів
$totalQuery = "SELECT COUNT(*) FROM students";
$totalStmt = $db->prepare($totalQuery);
$totalStmt->execute();
$totalStudents = $totalStmt->fetchColumn();

// Отримання студентів з обраною пагінацією
$query = "SELECT id, group_name, first_name, last_name, gender, birthday, status FROM students LIMIT :limit OFFSET :offset";
$stmt = $db->prepare($query);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

// Збір студентів у масив
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Відправка JSON-відповіді
echo json_encode([
    'success' => true,
    'students' => $students,
    'total' => $totalStudents,
    'page' => $page,
    'limit' => $limit
]);

ob_end_flush();
?>
