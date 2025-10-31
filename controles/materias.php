<?php
header('Content-Type: application/json');
require_once '../modelos/AlumnoMateria.php';
require_once '../modelos/Materia.php';
require_once '../modelos/MateriaDia.php';
require_once '../modelos/ProfesorMateria.php';
require_once '../modelos/Profesor.php';

$action = $_GET['action'] ?? '';

// Log para debugging
error_log("materias.php - Action: $action, Alumno ID: " . ($_GET['alumno_id'] ?? 'no proporcionado'));

try {
    switch ($action) {
        case 'obtener_materias_alumno':
            obtenerMateriasAlumno();
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (Exception $e) {
    error_log("Error en materias.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function obtenerMateriasAlumno() {
    $alumnoId = $_GET['alumno_id'] ?? 0;
    
    if (!$alumnoId) {
        throw new Exception('ID de alumno no proporcionado');
    }
    
    $alumnoMateriaModel = new AlumnoMateria();
    $materiaDiaModel = new MateriaDia();
    $profesorMateriaModel = new ProfesorMateria();
    $profesorModel = new Profesor();
    
    // Obtener materias del alumno
    $materias = $alumnoMateriaModel->obtenerMateriasPorAlumno($alumnoId);
    
    // Enriquecer cada materia con horarios y profesor
    foreach ($materias as &$materia) {
        // Obtener horarios
        $materia['horarios'] = $materiaDiaModel->obtenerHorariosPorMateria($materia['id_materia']);
        
        // Obtener profesor
        $profesores = $profesorMateriaModel->obtenerProfesoresPorMateria($materia['id_materia']);
        if (!empty($profesores)) {
            $profesor = $profesores[0]; // Tomar el primer profesor
            $materia['profesor_nombre'] = $profesor['nombre'];
            $materia['profesor_apellido'] = $profesor['apellido'];
            $materia['profesor_email'] = $profesor['email'];
        }
    }
    
    error_log("materias.php - Materias encontradas: " . count($materias));
    
    echo json_encode([
        'success' => true,
        'data' => $materias
    ]);
}
?>