<?php
header('Content-Type: application/json');
require_once '../modelos/Alumno.php';
require_once '../modelos/Materia.php';
require_once '../modelos/Evento.php';
require_once '../modelos/Inasistencia.php';
require_once '../modelos/MateriaDia.php';
require_once '../modelos/AlumnoMateria.php';
require_once '../modelos/AlumnoEvento.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'obtener_materias':
            obtenerMateriasAlumno();
            break;
            
        case 'obtener_eventos':
            obtenerEventosAlumno();
            break;
            
        case 'obtener_inasistencias':
            obtenerInasistenciasAlumno();
            break;
            
        case 'guardar_evento':
            guardarEvento();
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

function obtenerMateriasAlumno() {
    $alumnoId = $_GET['alumno_id'] ?? 0;
    
    if (!$alumnoId) {
        throw new Exception('ID de alumno no proporcionado');
    }
    
    $alumnoMateriaModel = new AlumnoMateria();
    $materiaDiaModel = new MateriaDia();
    
    $materias = $alumnoMateriaModel->obtenerMateriasPorAlumno($alumnoId);
    
    // Agregar horarios a cada materia
    foreach ($materias as &$materia) {
        $materia['horarios'] = $materiaDiaModel->obtenerHorariosPorMateria($materia['id_materia']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $materias
    ]);
}

function obtenerEventosAlumno() {
    $alumnoId = $_GET['alumno_id'] ?? 0;
    
    if (!$alumnoId) {
        throw new Exception('ID de alumno no proporcionado');
    }
    
    $eventoModel = new Evento();
    $alumnoEventoModel = new AlumnoEvento();
    
    // Obtener eventos del alumno específico
    $eventos = $alumnoEventoModel->obtenerEventosPorAlumno($alumnoId);
    
    echo json_encode([
        'success' => true,
        'data' => $eventos
    ]);
}

function obtenerInasistenciasAlumno() {
    $alumnoId = $_GET['alumno_id'] ?? 0;
    
    if (!$alumnoId) {
        throw new Exception('ID de alumno no proporcionado');
    }
    
    $inasistenciaModel = new Inasistencia();
    
    // Obtener inasistencias del alumno específico
    $inasistencias = $inasistenciaModel->obtenerInasistenciasPorAlumno($alumnoId);
    
    echo json_encode([
        'success' => true,
        'data' => $inasistencias
    ]);
}

function guardarEvento() {
    $fecha = $_POST['fecha'] ?? '';
    $descripcion = $_POST['descripcion'] ?? '';
    $tipoEvento = $_POST['tipo_evento'] ?? '';
    $idMateria = $_POST['id_materia'] ?? null;
    $idAlumnos = $_POST['id_alumnos'] ?? 0;
    
    if (empty($fecha) || empty($descripcion)) {
        throw new Exception('Fecha y descripción son obligatorios');
    }
    
    // 1. Crear el evento
    $eventoModel = new Evento();
    $resultado = $eventoModel->crearEvento([
        'fecha' => $fecha,
        'descripcion' => $descripcion,
        'tipo_evento' => $tipoEvento,
        'id_materia' => $idMateria ?: null
    ]);
    
    if ($resultado) {
        // 2. Obtener el ID del evento recién creado
        $eventoRecienCreado = $eventoModel->obtenerEventoRecienCreado($descripcion, $fecha);
        $idEvento = $eventoRecienCreado['id_evento'];
        
        // 3. Relacionar el evento con el alumno
        $alumnoEventoModel = new AlumnoEvento();
        $relacionCreada = $alumnoEventoModel->inscribirAlumnoEvento($idAlumnos, $idEvento);
        
        if ($relacionCreada) {
            echo json_encode([
                'success' => true,
                'message' => 'Evento guardado exitosamente'
            ]);
        } else {
            throw new Exception('Error al relacionar el evento con el alumno');
        }
    } else {
        throw new Exception('Error al guardar el evento');
    }
}

function guardarInasistencia() {
    $fecha = $_POST['fecha'] ?? '';
    $idMateria = $_POST['id_materia'] ?? null;
    $idAlumnos = $_POST['id_alumnos'] ?? 0;
    
    if (empty($fecha) || empty($idMateria)) {
        throw new Exception('Fecha y materia son obligatorios');
    }
    
    $inasistenciaModel = new Inasistencia();
    $resultado = $inasistenciaModel->crearInasistencia([
        'fecha' => $fecha,
        'id_alumnos' => $idAlumnos,
        'id_materia' => $idMateria,
        'justificada' => false
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
?>