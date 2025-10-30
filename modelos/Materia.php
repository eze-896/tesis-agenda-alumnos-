<?php
require_once '../config/Conexion.php';

class Materia {
    private $id_materia;
    private $nombre;
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }
    
    // Getters
    public function getIdMateria() {
        return $this->id_materia;
    }
    
    public function getNombre() {
        return $this->nombre;
    }
    
    // Setters
    public function setNombre($nombre) {
        $this->nombre = $nombre;
    }
    
    // Métodos CRUD
    public function crearMateria($datos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "INSERT INTO materias (nombre) VALUES (:nombre)";
        
        $stmt = $con->prepare($sql);
        return $stmt->execute($datos);
    }
    
    public function obtenerMateria($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT * FROM materias WHERE id_materia = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function obtenerMateriaPorNombre($nombre) {
    $con = $this->conexion->obtenerConexion();
    $sql = "SELECT * FROM materias WHERE nombre = :nombre ORDER BY id_materia DESC LIMIT 1";
    
    $stmt = $con->prepare($sql);
    $stmt->bindParam(':nombre', $nombre);
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function actualizarMateria($id, $datos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "UPDATE materias SET nombre = :nombre WHERE id_materia = :id";
        
        $stmt = $con->prepare($sql);
        $datos['id'] = $id;
        return $stmt->execute($datos);
    }
    
    public function eliminarMateria($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "DELETE FROM materias WHERE id_materia = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    
    public function listarMaterias() {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT * FROM materias";
        
        $stmt = $con->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>