<?php
require_once '../config/Conexion.php';

class AlumnoEvento {
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }
    
    public function inscribirAlumnoEvento($id_alumnos, $id_evento) {
        $con = $this->conexion->obtenerConexion();
        $sql = "INSERT INTO alumnos_eventos (id_alumnos, id_evento) VALUES (:id_alumnos, :id_evento)";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_alumnos', $id_alumnos);
        $stmt->bindParam(':id_evento', $id_evento);
        return $stmt->execute();
    }
    
    public function obtenerEventosPorAlumno($id_alumnos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT e.*, m.nombre as nombre_materia 
                FROM eventos e 
                JOIN alumnos_eventos ae ON e.id_evento = ae.id_evento 
                LEFT JOIN materias m ON e.id_materia = m.id_materia 
                WHERE ae.id_alumnos = :id_alumnos";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_alumnos', $id_alumnos);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>