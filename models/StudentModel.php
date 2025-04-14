<?php
require_once '../config/Database.php';

class StudentModel {
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
    }

    // Отримати студентів із пагінацією
    public function getStudents($page = 1, $limit = 5) {
        $offset = ($page - 1) * $limit;

        $totalQuery = "SELECT COUNT(*) FROM students";
        $totalStmt = $this->db->prepare($totalQuery);
        $totalStmt->execute();
        $total = $totalStmt->fetchColumn();

        $query = "SELECT * FROM students LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $students = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $students[] = $row;
        }

        return [
            'students' => $students,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ];
    }

    // Додати студента
    public function addStudent($group, $firstName, $lastName, $gender, $birthday) {
        $errors = $this->validateStudent($firstName, $lastName, $gender, $birthday, $group);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        $query = "SELECT COUNT(*) FROM students WHERE first_name = :first_name AND last_name = :last_name AND birthday = :birthday";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':first_name', $firstName, PDO::PARAM_STR);
        $stmt->bindParam(':last_name', $lastName, PDO::PARAM_STR);
        $stmt->bindParam(':birthday', $birthday, PDO::PARAM_STR);
        $stmt->execute();
        if ($stmt->fetchColumn() > 0) {
            return ['success' => false, 'errors' => ['duplicate' => 'Студент із таким ім’ям, прізвищем і датою народження вже існує']];
        }

        $query = "INSERT INTO students (group_name, first_name, last_name, gender, birthday) VALUES (:group_name, :first_name, :last_name, :gender, :birthday)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':group_name', $group, PDO::PARAM_STR);
        $stmt->bindParam(':first_name', $firstName, PDO::PARAM_STR);
        $stmt->bindParam(':last_name', $lastName, PDO::PARAM_STR);
        $stmt->bindParam(':gender', $gender, PDO::PARAM_STR);
        $stmt->bindParam(':birthday', $birthday, PDO::PARAM_STR);
        $stmt->execute();

        return ['success' => true, 'student' => [
            'group_name' => $group,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'gender' => $gender,
            'birthday' => $birthday
        ]];
    }

    // Оновити студента
    public function updateStudent($originalFirstName, $originalLastName, $originalBirthday, $group, $firstName, $lastName, $gender, $birthday) {
        $errors = $this->validateStudent($firstName, $lastName, $gender, $birthday, $group);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        $query = "SELECT COUNT(*) FROM students WHERE first_name = :first_name AND last_name = :last_name AND birthday = :birthday AND NOT (first_name = :original_first_name AND last_name = :original_last_name AND birthday = :original_birthday)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':first_name', $firstName, PDO::PARAM_STR);
        $stmt->bindParam(':last_name', $lastName, PDO::PARAM_STR);
        $stmt->bindParam(':birthday', $birthday, PDO::PARAM_STR);
        $stmt->bindParam(':original_first_name', $originalFirstName, PDO::PARAM_STR);
        $stmt->bindParam(':original_last_name', $originalLastName, PDO::PARAM_STR);
        $stmt->bindParam(':original_birthday', $originalBirthday, PDO::PARAM_STR);
        $stmt->execute();
        if ($stmt->fetchColumn() > 0) {
            return ['success' => false, 'errors' => ['duplicate' => 'Студент із таким ім’ям, прізвищем і датою народження вже існує']];
        }

        $query = "UPDATE students SET group_name = :group_name, first_name = :first_name, last_name = :last_name, gender = :gender, birthday = :birthday WHERE first_name = :original_first_name AND last_name = :original_last_name AND birthday = :original_birthday";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':group_name', $group, PDO::PARAM_STR);
        $stmt->bindParam(':first_name', $firstName, PDO::PARAM_STR);
        $stmt->bindParam(':last_name', $lastName, PDO::PARAM_STR);
        $stmt->bindParam(':gender', $gender, PDO::PARAM_STR);
        $stmt->bindParam(':birthday', $birthday, PDO::PARAM_STR);
        $stmt->bindParam(':original_first_name', $originalFirstName, PDO::PARAM_STR);
        $stmt->bindParam(':original_last_name', $originalLastName, PDO::PARAM_STR);
        $stmt->bindParam(':original_birthday', $originalBirthday, PDO::PARAM_STR);
        $stmt->execute();

        return ['success' => true, 'student' => [
            'group_name' => $group,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'gender' => $gender,
            'birthday' => $birthday
        ]];
    }

    // Видалити студентів
    public function deleteStudents($students) {
        $query = "DELETE FROM students WHERE first_name = :first_name AND last_name = :last_name AND birthday = :birthday";
        $stmt = $this->db->prepare($query);

        foreach ($students as $student) {
            $stmt->bindParam(':first_name', $student['first_name'], PDO::PARAM_STR);
            $stmt->bindParam(':last_name', $student['last_name'], PDO::PARAM_STR);
            $stmt->bindParam(':birthday', $student['birthday'], PDO::PARAM_STR);
            $stmt->execute();
        }

        return ['success' => true];
    }

    // Валідація даних студента
    private function validateStudent($firstName, $lastName, $gender, $birthday, $group) {
        $errors = [];
        $validGroups = ['pz-21', 'pz-22', 'pz-23', 'pz-24', 'pz-25', 'pz-26'];

        if (!in_array($group, $validGroups)) {
            $errors['group'] = 'Невірна група. Оберіть одну з доступних груп.';
        }
        if (empty($firstName) || !preg_match('/^[a-zA-Zа-яА-ЯґҐєЄіІїЇ]{2,}$/u', $firstName)) {
            $errors['first_name'] = 'Ім’я має містити лише літери (українські або англійські) і бути не коротше 2 символів.';
        }
        if (empty($lastName) || !preg_match('/^[a-zA-Zа-яА-ЯґҐєЄіІїЇ]{2,}$/u', $lastName)) {
            $errors['last_name'] = 'Прізвище має містити лише літери (українські або англійські) і бути не коротше 2 символів.';
        }
        if (!in_array($gender, ['male', 'female'])) {
            $errors['gender'] = 'Стать має бути "male" або "female".';
        }
        if (empty($birthday) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthday)) {
            $errors['birthday'] = 'Дата народження має бути у форматі YYYY-MM-DD.';
        } else {
            $birthDate = new DateTime($birthday);
            $today = new DateTime();
            if ($birthDate > $today) {
                $errors['birthday'] = 'Дата народження не може бути у майбутньому.';
            }
        }
        return $errors;
    }
}
?>