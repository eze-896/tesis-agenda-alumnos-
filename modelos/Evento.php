<?php
require_once '../config/Conexion.php';

class Evento {
    private $id_evento;
    private $fecha;
    private $descripcion;
    private $tipo_evento;
    private $id_materia;
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }
    
    // Getters
    public function getIdEvento() {
        return $this->id_evento;
    }
    
    public function getFecha() {
        return $this->fecha;
    }
    
    public function getDescripcion() {
        return $this->descripcion;
    }
    
    public function getTipoEvento() {
        return $this->tipo_evento;
    }
    
    public function getIdMateria() {
        return $this->id_materia;
    }
    
    // Setters
    public function setFecha($fecha) {
        $this->fecha = $fecha;
    }
    
    public function setDescripcion($descripcion) {
        $this->descripcion = $descripcion;
    }
    
    public function setTipoEvento($tipo_evento) {
        $this->tipo_evento = $tipo_evento;
    }
    
    public function setIdMateria($id_materia) {
        $this->id_materia = $id_materia;
    }
    
    // Métodos CRUD
    public function crearEvento($datos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "INSERT INTO eventos (fecha, descripcion, tipo_evento, id_materia) 
                VALUES (:fecha, :descripcion, :tipo_evento, :id_materia)";
        
        $stmt = $con->prepare($sql);
        return $stmt->execute($datos);
    }
    
    public function obtenerEvento($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT e.*, m.nombre as nombre_materia 
                FROM eventos e 
                LEFT JOIN materias m ON e.id_materia = m.id_materia 
                WHERE e.id_evento = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function obtenerEventoRecienCreado($descripcion, $fecha) {
    $con = $this->conexion->obtenerConexion();
    $sql = "SELECT * FROM eventos WHERE descripcion = :descripcion AND fecha = :fecha ORDER BY id_evento DESC LIMIT 1";
    
    $stmt = $con->prepare($sql);
    $stmt->bindParam(':descripcion', $descripcion);
    $stmt->bindParam(':fecha', $fecha);
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function actualizarEvento($id, $datos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "UPDATE eventos SET fecha = :fecha, descripcion = :descripcion, 
                tipo_evento = :tipo_evento, id_materia = :id_materia 
                WHERE id_evento = :id";
        
        $stmt = $con->prepare($sql);
        $datos['id'] = $id;
        return $stmt->execute($datos);
    }
    
    public function eliminarEvento($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "DELETE FROM eventos WHERE id_evento = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    
    public function listarEventos() {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT e.*, m.nombre as nombre_materia 
                FROM eventos e 
                LEFT JOIN materias m ON e.id_materia = m.id_materia";
        
        $stmt = $con->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>