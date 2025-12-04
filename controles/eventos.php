<?php
header('Content-Type: application/json');
require_once '../modelos/AlumnoEvento.php';
require_once '../modelos/Evento.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'obtener_eventos_alumno':
            obtenerEventosAlumno();
            break;
            
        case 'editar_evento':
            editarEvento();
            break;
            
        case 'eliminar_evento':
            eliminarEvento();
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function obtenerEventosAlumno() {
    $alumnoId = $_GET['alumno_id'] ?? 0;
    
    if (!$alumnoId) {
        throw new Exception('ID de alumno no proporcionado');
    }
    
    $alumnoEventoModel = new AlumnoEvento();
    $eventos = $alumnoEventoModel->obtenerEventosPorAlumno($alumnoId);
    
    // Filtrar solo eventos futuros (incluyendo hoy)
    $eventosFuturos = array_filter($eventos, function($evento) {
        $fechaEvento = new DateTime($evento['fecha']);
        $hoy = new DateTime();
        $hoy->setTime(0, 0, 0); // Solo comparar fecha, no hora
        
        return $fechaEvento >= $hoy;
    });
    
    // Reindexar array y ordenar por fecha ascendente
    $eventosFuturos = array_values($eventosFuturos);
    usort($eventosFuturos, function($a, $b) {
        return strtotime($a['fecha']) - strtotime($b['fecha']);
    });
    
    echo json_encode([
        'success' => true,
        'data' => $eventosFuturos
    ]);
}

function editarEvento() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $idEvento = $input['id_evento'] ?? 0;
    $fecha = $input['fecha'] ?? '';
    $descripcion = $input['descripcion'] ?? '';
    $tipoEvento = $input['tipo_evento'] ?? '';
    $idMateria = $input['id_materia'] ?? null;
    
    if (!$idEvento || !$fecha || !$descripcion) {
        throw new Exception('Datos incompletos');
    }
    
    $eventoModel = new Evento();
    $resultado = $eventoModel->actualizarEvento($idEvento, [
        'fecha' => $fecha,
        'descripcion' => $descripcion,
        'tipo_evento' => $tipoEvento,
        'id_materia' => $idMateria
    ]);
    
    if ($resultado) {
        echo json_encode([
            'success' => true,
            'message' => 'Evento actualizado exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar el evento');
    }
}

function eliminarEvento() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $idEvento = $input['id_evento'] ?? 0;
    
    if (!$idEvento) {
        throw new Exception('ID de evento no proporcionado');
    }
    
    $eventoModel = new Evento();
    $resultado = $eventoModel->eliminarEvento($idEvento);
    
    if ($resultado) {
        echo json_encode([
            'success' => true,
            'message' => 'Evento eliminado exitosamente'
        ]);
    } else {
        throw new Exception('Error al eliminar el evento');
    }
}
?>