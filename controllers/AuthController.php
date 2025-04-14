<?php
require_once '../models/Students.php';
require_once '../config/database.php';


class AuthController extends Controller {
    private $user;

    public function __construct() {
        $db = new Database();
        $this->user = new User($db->connect());
    }

    public function login() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $username = $data['file_name'] ?? '';
            $password = $data['birthday'] ?? '';
            if ($this->user->login($username, $password)) {
                $this->jsonResponse(['success' => true]);
            } else {
                $this->jsonResponse(['success' => false, 'error' => 'Invalid credentials']);
            }
        }
    }

    public function logout() {
        $this->user->logout();
        $this->jsonResponse(['success' => true]);
    }

    public function check() {
        $this->jsonResponse(['loggedIn' => $this->user->isLoggedIn()]);
    }
    public function index() {
        if ($this->user->isLoggedIn()) {
            // Якщо користувач залогінений, перенаправляємо на сторінку студентів
            header('Location: /student_app/views/students');
            exit;
        } else {
            // Якщо не залогінений, показуємо сторінку логіну
            $this->view('login'); // dashboard.html - сторінка з формою логіну
        }
    }
    public function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    // Вихід із системи
    public function logout() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $_SESSION = array();
            session_destroy();
            echo json_encode(['success' => true, 'message' => 'Вихід успішний']);
        }
    }

    // Перевірка статусу авторизації
    public function check() {
        if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
            echo json_encode(['loggedin' => true, 'firstName' => $_SESSION['firstName']]);
        } else {
            echo json_encode(['loggedin' => false]);
        }
    }
}
?>