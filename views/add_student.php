<?php
ob_start();
header('Content-Type: application/json; charset=UTF-8');
require_once '../config/database.php';

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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Отримуємо дані з форми
    $group = isset($_POST['group']) ? trim($_POST['group']) : '';
    $firstName = isset($_POST['first_name']) ? trim($_POST['first_name']) : '';
    $lastName = isset($_POST['last_name']) ? trim($_POST['last_name']) : '';
    $gender = isset($_POST['gender']) ? trim($_POST['gender']) : '';
    $birthday = isset($_POST['birthday']) ? trim($_POST['birthday']) : '';

    // Логування отриманих даних для діагностики
    error_log("Received data: " . print_r($_POST, true));

    // Перевірка коректності введених даних
    $errors = [];

    // Перевірка group
    $validGroups = ['pz-21', 'pz-22', 'pz-23', 'pz-24', 'pz-25', 'pz-26'];
    if (!in_array($group, $validGroups)) {
        $errors['group'] = 'Невірна група. Оберіть одну з доступних груп.';
    }

    // Перевірка first_name
    if (empty($firstName)) {
        $errors['first_name'] = 'Ім’я не може бути порожнім.';
    } elseif (!preg_match('/^[a-zA-Zа-яА-ЯґҐєЄіІїЇ]{2,}$/u', $firstName)) {
        $errors['first_name'] = 'Ім’я має містити лише літери (українські або англійські) і бути не коротше 2 символів.';
    }

    // Перевірка last_name
    if (empty($lastName)) {
        $errors['last_name'] = 'Прізвище не може бути порожнім.';
    } elseif (!preg_match('/^[a-zA-Zа-яА-ЯґҐєЄіІїЇ]{2,}$/u', $lastName)) {
        $errors['last_name'] = 'Прізвище має містити лише літери (українські або англійські) і бути не коротше 2 символів.';
    }

    // Перевірка gender
    if (!in_array($gender, ['male', 'female'])) {
        $errors['gender'] = 'Стать має бути "male" або "female".';
    }

    // Перевірка birthday
    if (empty($birthday) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthday)) {
        $errors['birthday'] = 'Дата народження має бути у форматі YYYY-MM-DD.';
    } else {
        $birthDate = new DateTime($birthday);
        $today = new DateTime();
        if ($birthDate > $today) {
            $errors['birthday'] = 'Дата народження не може бути у майбутньому.';
        }
    }

    // Перевірка на дублювання студентів
    if (empty($errors)) {
        $query = "SELECT COUNT(*) FROM students WHERE first_name = :first_name AND last_name = :last_name AND birthday = :birthday";
        try {
            $stmt = $db->prepare($query);
            $stmt->bindParam(':first_name', $firstName, PDO::PARAM_STR);
            $stmt->bindParam(':last_name', $lastName, PDO::PARAM_STR);
            $stmt->bindParam(':birthday', $birthday, PDO::PARAM_STR);
            $stmt->execute();
            $count = $stmt->fetchColumn(); // Отримуємо значення COUNT(*)

            if ($count > 0) {
                $errors['duplicate'] = 'Студент із таким ім’ям, прізвищем і датою народження вже існує.';
                
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Помилка перевірки дублювання: ' . $e->getMessage()]);
            ob_end_flush();
            exit;
        }
    }

    // Якщо є помилки, повертаємо їх
    if (!empty($errors)) {
        echo json_encode(['success' => false, 'errors' => $errors]);
        ob_end_flush();
        exit;
    }

    // Додаємо студента до бази даних (без статусу)
    $query = "INSERT INTO students (group_name, first_name, last_name, gender, birthday) VALUES (:group_name, :first_name, :last_name, :gender, :birthday)";
    try {
        $stmt = $db->prepare($query);
        $stmt->bindParam(':group_name', $group, PDO::PARAM_STR);
        $stmt->bindParam(':first_name', $firstName, PDO::PARAM_STR);
        $stmt->bindParam(':last_name', $lastName, PDO::PARAM_STR);
        $stmt->bindParam(':gender', $gender, PDO::PARAM_STR);
        $stmt->bindParam(':birthday', $birthday, PDO::PARAM_STR);
        $stmt->execute();

        $newStudentId = $db->conn->lastInsertId(); // Отримуємо ID нового запису
        echo json_encode([
            'success' => true,
            'message' => 'Студент успішно доданий',
            'student' => [
                'id' => $newStudentId,
                'group_name' => $group,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'gender' => $gender,
                'birthday' => $birthday
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Помилка виконання запиту: ' . $e->getMessage()]);
        ob_end_flush();
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Невірний метод запиту']);
}

ob_end_flush();
?>