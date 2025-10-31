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
?>