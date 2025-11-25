<?php
session_start();
header('Content-Type: application/json');
require_once '../modelos/Alumno.php';

$input = json_decode(file_get_contents('php://input'), true);

$alumnoId = $input['alumno_id'] ?? 0;
$passwordActual = $input['password_actual'] ?? '';
$passwordNueva = $input['password_nueva'] ?? '';

try {
    // Validaciones
    if (!$alumnoId || empty($passwordActual) || empty($passwordNueva)) {
        throw new Exception('Todos los campos son obligatorios');
    }
    
    if (strlen($passwordNueva) < 8) {
        throw new Exception('La nueva contraseña debe tener al menos 8 caracteres');
    }
    
    // Verificar que el alumno existe y la contraseña actual es correcta
    $alumnoModel = new Alumno();
    $alumno = $alumnoModel->obtenerAlumno($alumnoId);
    
    if (!$alumno) {
        throw new Exception('Alumno no encontrado');
    }
    
    // Verificar contraseña actual
    if (!password_verify($passwordActual, $alumno['password'])) {
        throw new Exception('La contraseña actual es incorrecta');
    }
    
    // Verificar que la nueva contraseña es diferente
    if (password_verify($passwordNueva, $alumno['password'])) {
        throw new Exception('La nueva contraseña debe ser diferente a la actual');
    }
    
    // Actualizar contraseña
    $passwordHash = password_hash($passwordNueva, PASSWORD_DEFAULT);
    $resultado = $alumnoModel->actualizarAlumno($alumnoId, [
        'password' => $passwordHash
    ]);
    
    if ($resultado) {
        echo json_encode([
            'success' => true,
            'message' => 'Contraseña cambiada exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar la contraseña');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>