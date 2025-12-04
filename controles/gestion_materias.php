<?php
header('Content-Type: application/json');
require_once '../config/Conexion.php';
require_once '../modelos/Materia.php';
require_once '../modelos/Profesor.php';
require_once '../modelos/ProfesorMateria.php';
require_once '../modelos/MateriaDia.php';

// Función para obtener todas las materias con sus relaciones
function obtenerMateriasCompletas() {
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
        
        return $materiasCompletas;
        
    } catch (Exception $e) {
        throw new Exception("Error al obtener materias completas: " . $e->getMessage());
    }
}

// Manejar las acciones
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'guardar_completo':
            guardarMateriaCompleta();
            break;
            
        case 'obtener_todo':
            $materias = obtenerMateriasCompletas();
            echo json_encode([
                'success' => true,
                'data' => $materias
            ]);
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'message' => 'Acción no válida'
            ]);
            break;
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Función para guardar materia completa con profesor y horarios
function guardarMateriaCompleta() {
    // Obtener datos del formulario
    $nombreMateria = $_POST['nombre_materia'] ?? '';
    $duracionMateria = $_POST['duracion_materia'] ?? null;
    $estadoMateria = $_POST['estado_materia'] ?? '';
    $nombreProfesor = $_POST['nombre_profesor'] ?? '';
    $apellidoProfesor = $_POST['apellido_profesor'] ?? '';
    $emailProfesor = $_POST['email_profesor'] ?? '';
    $dias = $_POST['dias'] ?? [];
    $horarios = $_POST['horarios'] ?? [];
    
    // Validaciones básicas
    if (empty($nombreMateria) || empty($nombreProfesor) || empty($apellidoProfesor) || 
        empty($estadoMateria) || empty($duracionMateria)) {
        throw new Exception('Todos los campos obligatorios deben ser completados');
    }
    
    if (count($dias) !== count($horarios) || count($dias) === 0) {
        throw new Exception('Debe agregar al menos un horario válido');
    }
    
    try {
        // 1. Crear o obtener profesor (código existente...)
        $profesorModel = new Profesor();
        $profesorExistente = $profesorModel->obtenerProfesorPorNombre($nombreProfesor, $apellidoProfesor);
        
        if ($profesorExistente) {
            $profesorId = $profesorExistente['id_profesor'];
            if (!empty($emailProfesor) && $profesorExistente['email'] !== $emailProfesor) {
                $profesorModel->actualizarProfesor($profesorId, ['email' => $emailProfesor]);
            }
        } else {
            $datosProfesor = [
                'nombre' => $nombreProfesor,
                'apellido' => $apellidoProfesor
            ];
            
            if (!empty($emailProfesor)) {
                $datosProfesor['email'] = $emailProfesor;
            }
            
            $resultado = $profesorModel->crearProfesor($datosProfesor);
            $profesorRecienCreado = $profesorModel->obtenerProfesorPorNombre($nombreProfesor, $apellidoProfesor);
            $profesorId = $profesorRecienCreado['id_profesor'];
        }
        
        // 2. Crear materia CON LOS NUEVOS CAMPOS
        $materiaModel = new Materia();
        $datosMateria = [
            'nombre' => $nombreMateria,
            'duracion' => $duracionMateria,
            'estado' => $estadoMateria
        ];
        
        $resultadoMateria = $materiaModel->crearMateria($datosMateria);
        
        if (!$resultadoMateria) {
            throw new Exception('No se pudo crear la materia');
        }
        
        // Obtener el ID de la materia recién creada
        $materiaRecienCreada = $materiaModel->obtenerMateriaPorNombre($nombreMateria);
        $materiaId = $materiaRecienCreada['id_materia'];
        
        // 3. Verificar si ya existe la relación profesor-materia
        $profesorMateriaModel = new ProfesorMateria();
        $relacionExistente = $profesorMateriaModel->obtenerRelacionProfesorMateria($profesorId, $materiaId);
        
        if (!$relacionExistente) {
            $profesorMateriaModel->asignarMateriaProfesor($profesorId, $materiaId);
        }
        
        // 4. Agregar horarios (código existente...)
        $materiaDiaModel = new MateriaDia();
        for ($i = 0; $i < count($dias); $i++) {
            if (!empty($dias[$i]) && !empty($horarios[$i])) {
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
            'message' => 'Materia guardada exitosamente',
            'data' => [
                'materia_id' => $materiaId,
                'profesor_id' => $profesorId
            ]
        ]);
        
    } catch (Exception $e) {
        throw new Exception("Error al guardar materia completa: " . $e->getMessage());
    }
}
?>