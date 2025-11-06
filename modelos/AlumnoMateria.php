<?php
require_once '../config/Conexion.php';

class AlumnoMateria {
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }
    
    public function inscribirAlumnoMateria($id_alumnos, $id_materia) {
        $con = $this->conexion->obtenerConexion();
        $sql = "INSERT INTO alumnos_materias (id_alumnos, id_materia) VALUES (:id_alumnos, :id_materia)";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_alumnos', $id_alumnos);
        $stmt->bindParam(':id_materia', $id_materia);
        return $stmt->execute();
    }
    
    public function obtenerMateriasPorAlumno($id_alumnos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT m.* FROM materias m 
                JOIN alumnos_materias am ON m.id_materia = am.id_materia 
                WHERE am.id_alumnos = :id_alumnos";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_alumnos', $id_alumnos);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerRelacionAlumnoMateria($id_alumnos, $id_materia) {
    $con = $this->conexion->obtenerConexion();
    $sql = "SELECT * FROM alumnos_materias 
            WHERE id_alumnos = :id_alumnos AND id_materia = :id_materia";
    
    $stmt = $con->prepare($sql);
    $stmt->bindParam(':id_alumnos', $id_alumnos);
    $stmt->bindParam(':id_materia', $id_materia);
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
}
?>