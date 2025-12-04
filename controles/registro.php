<?php
session_start();
header('Content-Type: application/json');

require_once '../config/Conexion.php';
require_once '../modelos/Alumno.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
    exit;
}

try {
    // Obtener datos del formulario
    $nombre = trim($_POST['nombre'] ?? '');
    $apellido = trim($_POST['apellido'] ?? '');
    $dni = trim($_POST['dni'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $año = intval($_POST['año'] ?? 0);
    $division = trim($_POST['division'] ?? '');
    $contraseña = $_POST['contraseña'] ?? '';

    // Validaciones básicas en el servidor
    if (empty($nombre) || empty($apellido) || empty($dni) || empty($email) || empty($contraseña) || $año === 0 || empty($division)) {
        echo json_encode(["success" => false, "message" => "Todos los campos obligatorios deben ser completados."]);
        exit;
    }

    if (strlen($dni) !== 8 || !is_numeric($dni)) {
        echo json_encode(["success" => false, "message" => "El DNI debe tener exactamente 8 números."]);
        exit;
    }

    if (strlen($contraseña) < 8) {
        echo json_encode(["success" => false, "message" => "La contraseña debe tener al menos 8 caracteres."]);
        exit;
    }

    if ($año < 1 || $año > 6) {
        echo json_encode(["success" => false, "message" => "El año de cursada debe ser entre 1° y 6° año."]);
        exit;
    }

    // Crear instancia del modelo Alumno
    $alumnoModel = new Alumno();
    
    // Verificar si el alumno ya existe (por DNI o email)
    if ($alumnoModel->existeAlumno($dni, $email)) {
        echo json_encode(["success" => false, "message" => "El DNI o correo electrónico ya están registrados."]);
        exit;
    }

    // Registrar al alumno
    $resultado = $alumnoModel->registrarAlumno([
        'nombre' => $nombre,
        'apellido' => $apellido,
        'dni' => $dni,
        'email' => $email,
        'anio' => $año,
        'division' => $division,
        'password' => $contraseña
    ]);

    if ($resultado) {
        echo json_encode([
            "success" => true,
            "message" => "Registro exitoso. Ahora puedes iniciar sesión."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error al registrar el alumno."
        ]);
    }

} catch (Exception $e) {
    error_log("Error en registro: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Ocurrió un error en el registro.",
        "error" => $e->getMessage()
    ]);
}
?>