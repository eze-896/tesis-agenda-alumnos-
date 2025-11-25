<?php
require_once '../config/Conexion.php';

class ProfesorMateria {
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }
    
    public function asignarMateriaProfesor($id_profesor, $id_materia) {
        $con = $this->conexion->obtenerConexion();
        $sql = "INSERT INTO profesores_materias (id_profesor, id_materia) VALUES (:id_profesor, :id_materia)";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_profesor', $id_profesor);
        $stmt->bindParam(':id_materia', $id_materia);
        return $stmt->execute();
    }
    
    public function obtenerMateriasPorProfesor($id_profesor) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT m.* FROM materias m 
                JOIN profesores_materias pm ON m.id_materia = pm.id_materia 
                WHERE pm.id_profesor = :id_profesor";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_profesor', $id_profesor);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // Método faltante que causa el error
    public function obtenerProfesoresPorMateria($id_materia) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT p.* FROM profesores p 
                JOIN profesores_materias pm ON p.id_profesor = pm.id_profesor 
                WHERE pm.id_materia = :id_materia";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_materia', $id_materia);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // Método adicional útil
    public function obtenerRelacionProfesorMateria($id_profesor, $id_materia) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT * FROM profesores_materias 
                WHERE id_profesor = :id_profesor AND id_materia = :id_materia";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_profesor', $id_profesor);
        $stmt->bindParam(':id_materia', $id_materia);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>