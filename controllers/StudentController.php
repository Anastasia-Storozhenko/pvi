<?php
require_once '../models/Student.php';
require_once '../config/database.php';


class StudentController extends Controller {
    private $student;
    private $user;

    public function __construct() {
        $db = new Database();
        $this->student = new Student($db->connect());
        $this->user = new User($db->connect());
    }

    public function index() {
        if (!$this->user->isLoggedIn()) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
            return;
        }
        $page = $_GET['page'] ?? 1;
        $students = $this->student->getAll($page);
        $this->jsonResponse($students);
    }

    public function create() {
        if (!$this->user->isLoggedIn()) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $result = $this->student->add($data);
            if (is_array($result) && isset($result['error'])) {
                $this->jsonResponse($result, 400);
            } else {
                $this->jsonResponse(['success' => true, 'id' => $result]);
            }
        }
    }

    public function update($id) {
        if (!$this->user->isLoggedIn()) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);
            $result = $this->student->update($id, $data);
            if (is_array($result) && isset($result['error'])) {
                $this->jsonResponse($result, 400);
            } else {
                $this->jsonResponse(['success' => $result]);
            }
        }
    }


    public function showStudentsPage() {
        if (!$this->user->isLoggedIn()) {
            header('Location: /student_app/public/');
            exit;
        }
        $this->view('students'); // Відображаємо students.html
    }
    public function index() {
        if (!$this->user->isLoggedIn()) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
            return;
        }
        $page = $_GET['page'] ?? 1;
        $students = $this->student->getAll($page);
        $total = $this->student->getTotal(); // Додаємо підрахунок
        $this->jsonResponse(['students' => $students, 'total' => $total]);
    }
    public function getTotal() {
        if ($this->conn) {
            $query = "SELECT COUNT(*) FROM students";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchColumn();
        } else {
            return count($this->students);
        }
    }
}
?>