<?php
header('Content-Type: application/json');
require_once '../modelos/Inasistencia.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'obtener_inasistencias_alumno':
            obtenerInasistenciasAlumno();
            break;
            
        case 'editar_inasistencia':
            editarInasistencia();
            break;
            
        case 'eliminar_inasistencia':
            eliminarInasistencia();
            break;
            
        case 'guardar_inasistencia':
            guardarInasistencia();
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function obtenerInasistenciasAlumno() {
    $alumnoId = $_GET['alumno_id'] ?? 0;
    
    if (!$alumnoId) {
        throw new Exception('ID de alumno no proporcionado');
    }
    
    $inasistenciaModel = new Inasistencia();
    $inasistencias = $inasistenciaModel->obtenerInasistenciasPorAlumno($alumnoId);
    
    echo json_encode([
        'success' => true,
        'data' => $inasistencias
    ]);
}

function editarInasistencia() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $idInasistencia = $input['id_inasistencia'] ?? 0;
    $fecha = $input['fecha'] ?? '';
    $idMateria = $input['id_materia'] ?? null;
    $justificada = $input['justificada'] ?? '0';
    $idAlumnos = $input['id_alumnos'] ?? 0;
    
    if (!$idInasistencia || !$fecha || !$idAlumnos) {
        throw new Exception('Datos incompletos');
    }
    
    $inasistenciaModel = new Inasistencia();
    $resultado = $inasistenciaModel->actualizarInasistencia($idInasistencia, [
        'fecha' => $fecha,
        'id_materia' => $idMateria,
        'justificada' => $justificada,
        'id_alumnos' => $idAlumnos
    ]);
    
    if ($resultado) {
        echo json_encode([
            'success' => true,
            'message' => 'Inasistencia actualizada exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar la inasistencia');
    }
}

function guardarInasistencia() {
    $fecha = $_POST['fecha'] ?? '';
    $idMateria = $_POST['id_materia'] ?? null;
    $justificada = $_POST['justificada'] ?? '0';
    $idAlumnos = $_POST['id_alumnos'] ?? 0;
    
    if (empty($fecha) || !$idAlumnos) {
        throw new Exception('Fecha y alumno son obligatorios');
    }
    
    $inasistenciaModel = new Inasistencia();
    $resultado = $inasistenciaModel->crearInasistencia([
        'fecha' => $fecha,
        'id_alumnos' => $idAlumnos,
        'id_materia' => $idMateria,
        'justificada' => $justificada
    ]);
    
    if ($resultado) {
        echo json_encode([
            'success' => true,
            'message' => 'Inasistencia registrada exitosamente'
        ]);
    } else {
        throw new Exception('Error al registrar la inasistencia');
    }
}

function eliminarInasistencia() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $idInasistencia = $input['id_inasistencia'] ?? 0;
    
    if (!$idInasistencia) {
        throw new Exception('ID de inasistencia no proporcionado');
    }
    
    $inasistenciaModel = new Inasistencia();
    $resultado = $inasistenciaModel->eliminarInasistencia($idInasistencia);
    
    if ($resultado) {
        echo json_encode([
            'success' => true,
            'message' => 'Inasistencia eliminada exitosamente'
        ]);
    } else {
        throw new Exception('Error al eliminar la inasistencia');
    }
}
?>