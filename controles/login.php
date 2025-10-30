<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');

require_once '../config/Conexion.php';
require_once '../modelos/Alumno.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['login_email'] ?? '');
    $password = $_POST['login_password'] ?? '';
    
    if (empty($email) || empty($password)) {
        echo json_encode([
            'success' => false,
            'message' => 'Todos los campos son obligatorios'
        ]);
        exit;
    }
    
    try {
        $alumnoModel = new Alumno();
        $alumno = $alumnoModel->verificarCredenciales($email, $password);
        
        if ($alumno) {
            $_SESSION['alumno_id'] = $alumno['id_alumnos'];
            $_SESSION['alumno_nombre'] = $alumno['nombre'];
            $_SESSION['alumno_apellido'] = $alumno['apellido'];
            $_SESSION['alumno_dni'] = $alumno['dni'];
            
            echo json_encode([
                'success' => true,
                'message' => 'Login exitoso',
                'alumno' => $alumno
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ]);
        }
        
    } catch (Exception $e) {
        error_log("Error en login: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error del servidor'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}
?>