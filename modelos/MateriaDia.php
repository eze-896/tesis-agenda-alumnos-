<?php
require_once '../config/Conexion.php';

class MateriaDia {
    private $id_materia;
    private $id_dia;
    private $horario;
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }
    
    // Getters
    public function getIdMateria() {
        return $this->id_materia;
    }
    
    public function getIdDia() {
        return $this->id_dia;
    }
    
    public function getHorario() {
        return $this->horario;
    }
    
    // Setters
    public function setIdMateria($id_materia) {
        $this->id_materia = $id_materia;
    }
    
    public function setIdDia($id_dia) {
        $this->id_dia = $id_dia;
    }
    
    public function setHorario($horario) {
        $this->horario = $horario;
    }
    
    // Métodos CRUD
    public function crearMateriaDia($datos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "INSERT INTO materias_dias (id_materia, id_dia, horario) 
                VALUES (:id_materia, :id_dia, :horario)";
        
        $stmt = $con->prepare($sql);
        return $stmt->execute($datos);
    }
    
    public function obtenerHorariosPorMateria($id_materia) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT md.*, d.nombre_dia 
                FROM materias_dias md 
                JOIN dias d ON md.id_dia = d.id_dia 
                WHERE md.id_materia = :id_materia";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_materia', $id_materia);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerHorarioExistente($id_materia, $id_dia, $horario) {
    $con = $this->conexion->obtenerConexion();
    $sql = "SELECT * FROM materias_dias 
            WHERE id_materia = :id_materia AND id_dia = :id_dia AND horario = :horario";
    
    $stmt = $con->prepare($sql);
    $stmt->bindParam(':id_materia', $id_materia);
    $stmt->bindParam(':id_dia', $id_dia);
    $stmt->bindParam(':horario', $horario);
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function eliminarMateriaDia($id_materia, $id_dia) {
        $con = $this->conexion->obtenerConexion();
        $sql = "DELETE FROM materias_dias WHERE id_materia = :id_materia AND id_dia = :id_dia";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_materia', $id_materia);
        $stmt->bindParam(':id_dia', $id_dia);
        return $stmt->execute();
    }
}
?>