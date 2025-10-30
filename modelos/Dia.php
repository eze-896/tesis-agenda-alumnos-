<?php
require_once '../config/Conexion.php';

class Dia {
    private $id_dia;
    private $nombre_dia;
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }
    
    // Getters
    public function getIdDia() {
        return $this->id_dia;
    }
    
    public function getNombreDia() {
        return $this->nombre_dia;
    }
    
    // Setters
    public function setNombreDia($nombre_dia) {
        $this->nombre_dia = $nombre_dia;
    }
    
    // Métodos CRUD
    public function crearDia($datos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "INSERT INTO dias (nombre_dia) VALUES (:nombre_dia)";
        
        $stmt = $con->prepare($sql);
        return $stmt->execute($datos);
    }
    
    public function obtenerDia($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT * FROM dias WHERE id_dia = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function listarDias() {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT * FROM dias";
        
        $stmt = $con->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>