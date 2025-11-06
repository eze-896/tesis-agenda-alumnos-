<?php
session_start();
header('Content-Type: application/json');
require_once '../config/Conexion.php';
require_once '../modelos/AlumnoMateria.php';
require_once '../modelos/Materia.php';
require_once '../modelos/MateriaDia.php';
require_once '../modelos/ProfesorMateria.php';
require_once '../modelos/Profesor.php';

$action = $_GET['action'] ?? '';

// Log para debugging
error_log("materias.php - Action: $action, Sesión Alumno ID: " . ($_SESSION['alumno_id'] ?? 'no en sesión'));

try {
    // Verificar sesión para acciones que requieren alumno autenticado
    if (in_array($action, ['obtener_materias_alumno', 'guardar_materia_completa'])) {
        if (!isset($_SESSION['alumno_id'])) {
            throw new Exception('No hay sesión activa');
        }
    }

    switch ($action) {
        case 'obtener_materias_alumno':
            obtenerMateriasAlumno();
            break;
            
        case 'obtener_todas_materias':
            obtenerTodasMaterias();
            break;
            
        case 'guardar_materia_completa':
            guardarMateriaCompleta();
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (Exception $e) {
    error_log("Error en materias.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function obtenerMateriasAlumno() {
    // Usar el ID de la sesión en lugar del parámetro GET
    $alumnoId = $_SESSION['alumno_id'];
    
    if (!$alumnoId) {
        throw new Exception('ID de alumno no disponible en sesión');
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
    
    error_log("materias.php - Materias del alumno encontradas: " . count($materias));
    
    echo json_encode([
        'success' => true,
        'data' => $materias
    ]);
}

function obtenerTodasMaterias() {
    try {
        $materiaModel = new Materia();
        $profesorMateriaModel = new ProfesorMateria();
        $materiaDiaModel = new MateriaDia();
        
        // Obtener todas las materias
        $materias = $materiaModel->listarMaterias();
        
        $materiasCompletas = [];
        
        foreach ($materias as $materia) {
            // Obtener profesores de esta materia
            $profesores = $profesorMateriaModel->obtenerProfesoresPorMateria($materia['id_materia']);
            
            // Obtener horarios de esta materia
            $horarios = $materiaDiaModel->obtenerHorariosPorMateria($materia['id_materia']);
            
            // Tomar el primer profesor (puedes ajustar esto si una materia tiene múltiples profesores)
            $profesor = !empty($profesores) ? $profesores[0] : null;
            
            $materiasCompletas[] = [
                'id_materia' => $materia['id_materia'],
                'nombre' => $materia['nombre'],
                'profesor_nombre' => $profesor ? $profesor['nombre'] : 'No asignado',
                'profesor_apellido' => $profesor ? $profesor['apellido'] : '',
                'profesor_email' => $profesor ? $profesor['email'] : '',
                'horarios' => $horarios
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $materiasCompletas
        ]);
        
    } catch (Exception $e) {
        throw new Exception("Error al obtener todas las materias: " . $e->getMessage());
    }
}

function guardarMateriaCompleta() {
    // Obtener datos del formulario
    $nombreMateria = $_POST['nombre_materia'] ?? '';
    $nombreProfesor = $_POST['nombre_profesor'] ?? '';
    $apellidoProfesor = $_POST['apellido_profesor'] ?? '';
    $emailProfesor = $_POST['email_profesor'] ?? '';
    $dias = $_POST['dias'] ?? [];
    $horarios = $_POST['horarios'] ?? [];
    
    // Validaciones básicas
    if (empty($nombreMateria) || empty($nombreProfesor) || empty($apellidoProfesor)) {
        throw new Exception('El nombre de la materia y del profesor son obligatorios');
    }
    
    if (count($dias) !== count($horarios) || count($dias) === 0) {
        throw new Exception('Debe agregar al menos un horario válido');
    }
    
    try {
        // 1. Crear o obtener profesor
        $profesorModel = new Profesor();
        
        // Buscar si el profesor ya existe
        $profesorExistente = $profesorModel->obtenerProfesorPorNombre($nombreProfesor, $apellidoProfesor);
        
        if ($profesorExistente) {
            $profesorId = $profesorExistente['id_profesor'];
            
            // Actualizar email si es necesario y si se proporcionó
            if (!empty($emailProfesor) && $profesorExistente['email'] !== $emailProfesor) {
                $profesorModel->actualizarProfesor($profesorId, [
                    'email' => $emailProfesor
                ]);
            }
        } else {
            // Crear nuevo profesor
            $datosProfesor = [
                'nombre' => $nombreProfesor,
                'apellido' => $apellidoProfesor
            ];
            
            // Solo agregar email si no está vacío
            if (!empty($emailProfesor)) {
                $datosProfesor['email'] = $emailProfesor;
            }
            
            // Usar el método crearProfesor que retorna el ID
            $resultado = $profesorModel->crearProfesor($datosProfesor);
            
            if ($resultado) {
                // Obtener el ID del profesor recién creado
                $profesorRecienCreado = $profesorModel->obtenerProfesorPorNombre($nombreProfesor, $apellidoProfesor);
                $profesorId = $profesorRecienCreado['id_profesor'];
            } else {
                throw new Exception('No se pudo crear el profesor');
            }
        }
        
        // 2. Crear materia
        $materiaModel = new Materia();
        $resultadoMateria = $materiaModel->crearMateria([
            'nombre' => $nombreMateria
        ]);
        
        if (!$resultadoMateria) {
            throw new Exception('No se pudo crear la materia');
        }
        
        // Obtener el ID de la materia recién creada
        $materiaRecienCreada = $materiaModel->obtenerMateriaPorNombre($nombreMateria);
        $materiaId = $materiaRecienCreada['id_materia'];
        
        // 3. Asignar materia al alumno de la sesión
        $alumnoMateriaModel = new AlumnoMateria();
        $alumnoId = $_SESSION['alumno_id'];
        
        // Verificar si ya existe la relación alumno-materia
        $relacionExistente = $alumnoMateriaModel->obtenerMateriasPorAlumno($alumnoId);
        $materiaYaAsignada = false;
        
        foreach ($relacionExistente as $materiaExistente) {
            if ($materiaExistente['id_materia'] == $materiaId) {
                $materiaYaAsignada = true;
                break;
            }
        }
        
        if (!$materiaYaAsignada) {
            $alumnoMateriaModel->inscribirAlumnoMateria($alumnoId, $materiaId);
        }
        
        // 4. Asignar profesor a materia
        $profesorMateriaModel = new ProfesorMateria();
        $relacionProfesorExistente = $profesorMateriaModel->obtenerRelacionProfesorMateria($profesorId, $materiaId);
        
        if (!$relacionProfesorExistente) {
            $profesorMateriaModel->asignarMateriaProfesor($profesorId, $materiaId);
        }
        
        // 5. Agregar horarios
        $materiaDiaModel = new MateriaDia();
        for ($i = 0; $i < count($dias); $i++) {
            if (!empty($dias[$i]) && !empty($horarios[$i])) {
                // Verificar si ya existe este horario
                $horarioExistente = $materiaDiaModel->obtenerHorarioExistente($materiaId, $dias[$i], $horarios[$i]);
                
                if (!$horarioExistente) {
                    $materiaDiaModel->crearMateriaDia([
                        'id_materia' => $materiaId,
                        'id_dia' => $dias[$i],
                        'horario' => $horarios[$i]
                    ]);
                }
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Materia guardada y asignada exitosamente',
            'data' => [
                'materia_id' => $materiaId,
                'profesor_id' => $profesorId,
                'alumno_id' => $alumnoId
            ]
        ]);
        
    } catch (Exception $e) {
        throw new Exception("Error al guardar materia completa: " . $e->getMessage());
    }
}
?>