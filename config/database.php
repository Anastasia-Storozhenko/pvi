<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'students_db';
    private $username = 'root';
    private $password = '';
    public $conn;

    public function connect() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $e) {
            error_log("Connection Error: " . $e->getMessage());
        }
        return $this->conn;
    }

    public function checkUser($firstName, $birthday) {
        try {
            // Перевіряємо, чи існує користувач
            $query = "SELECT * FROM students WHERE first_name = :first_name AND birthday = :birthday";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':first_name', $firstName);
            $stmt->bindParam(':birthday', $birthday);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                // Скидаємо статус усіх студентів на passive
                $resetQuery = "UPDATE students SET status = 'passive'";
                $resetStmt = $this->conn->prepare($resetQuery);
                $resetStmt->execute();

                // Встановлюємо статус active для залогіненого користувача
                $updateQuery = "UPDATE students SET status = 'active' WHERE first_name = :first_name AND birthday = :birthday";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->bindParam(':first_name', $firstName);
                $updateStmt->bindParam(':birthday', $birthday);
                $updateStmt->execute();

                return true;
            } else {
                return false;
            }
        } catch(PDOException $e) {
            error_log("checkUser Error: " . $e->getMessage());
            return false;
        }
    }

    public function prepare($query) {
        if (!$this->conn) {
            throw new Exception("Database connection is not established.");
        }
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt === false) {
                throw new Exception("Prepare failed: " . $this->conn->errorInfo()[2]);
            }
            return $stmt;
        } catch (PDOException $e) {
            throw new Exception("Prepare failed: " . $e->getMessage());
        }
    }

    public function query($query) {
        if (!$this->conn) {
            throw new Exception("Database connection is not established.");
        }
        try {
            return $this->conn->query($query);
        } catch (PDOException $e) {
            throw new Exception("Query failed: " . $e->getMessage());
        }
    }
}
?>