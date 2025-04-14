<?php
class Router {
    public static function route() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $basePath = '/student_app/view';
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Видаляємо базовий шлях
        if (strpos($uri, $basePath) === 0) {
            $uri = substr($uri, strlen($basePath));
        }

        if ($uri === '') {
            $uri = '/';
        }

        $method = $_SERVER['REQUEST_METHOD'];

        // Кореневий маршрут
        if ($uri === '/' && $method === 'GET') {
            require_once '../controllers/AuthController.php';
            $controller = new AuthController();
            $controller->index();
            exit;
        } elseif (preg_match('#^/auth/login$#', $uri) && $method === 'POST') {
            require_once '../controllers/AuthController.php';
            $controller = new AuthController();
            $controller->login();
        } elseif (preg_match('#^/auth/logout$#', $uri) && $method === 'POST') {
            require_once '../controllers/AuthController.php';
            $controller = new AuthController();
            $controller->logout();
        } elseif (preg_match('#^/auth/check$#', $uri) && $method === 'GET') {
            require_once '../controllers/AuthController.php';
            $controller = new AuthController();
            $controller->check();
        } elseif (preg_match('#^/students$#', $uri) && $method === 'GET') {
            require_once '../controllers/StudentController.php';
            $controller = new StudentController();
            $controller->showStudentsPage();
        } elseif (preg_match('#^/students/data$#', $uri) && $method === 'GET') {
            require_once '../controllers/StudentController.php';
            $controller = new StudentController();
            $controller->index();    
        } elseif (preg_match('#^/students$#', $uri) && $method === 'POST') {
            require_once '../controllers/StudentController.php';
            $controller = new StudentController();
            $controller->create();
        } elseif (preg_match('#^/students/(\d+)$#', $uri, $matches) && $method === 'PUT') {
            require_once '../controllers/StudentController.php';
            $controller = new StudentController();
            $controller->update($matches[1]);
        } elseif (preg_match('#^/students/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
            require_once '../controllers/StudentController.php';
            $controller = new StudentController();
            $controller->delete($matches[1]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found']);
        }
    }
}

// Виклик маршрутизатора після визначення класу
Router::route();
