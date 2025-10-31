<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');

require_once '../config/Conexion.php';
require_once '../modelos/Alumno.php';
require_once '../modelos/Dia.php'; 

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
            // --- INICIO DE SESIÓN EXITOSO ---
            
            // 1. Establecer variables de sesión
            $_SESSION['alumno_id'] = $alumno['id_alumnos'];
            $_SESSION['alumno_nombre'] = $alumno['nombre'];
            $_SESSION['alumno_apellido'] = $alumno['apellido'];
            $_SESSION['alumno_dni'] = $alumno['dni'];
            $_SESSION['alumno_anio'] = $alumno['anio'];
            $_SESSION['alumno_division'] = $alumno['division'];
            $_SESSION['alumno_email'] = $alumno['email'];

            // 2. >>> LLAMADA AL MÉTODO PARA PRECARGAR DÍAS <<<
            try {
                $diaModel = new Dia();
                $resultado_precarga = $diaModel->precargarDias();
                // Puedes optar por registrar este evento en logs, pero no lo mostramos al usuario.
                error_log("Días precargados: " . $resultado_precarga['count']);
            } catch (Exception $e) {
                // La precarga falló, pero el login sigue siendo exitoso. Solo registramos el error.
                error_log("Advertencia: Falló la precarga de días después del login. " . $e->getMessage());
            }

            // 3. Devolver respuesta de éxito al cliente
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
        error_log("Error general en login: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error del servidor'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Metodo no permitido'
    ]);
}
?>