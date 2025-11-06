<?php
require_once '../config/Conexion.php';

class Inasistencia {
    private $id_inasistencia;
    private $fecha;
    private $id_alumnos;
    private $id_materia;
    private $justificada;
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }
    
    // Getters
    public function getIdInasistencia() {
        return $this->id_inasistencia;
    }
    
    public function getFecha() {
        return $this->fecha;
    }
    
    public function getIdAlumnos() {
        return $this->id_alumnos;
    }
    
    public function getIdMateria() {
        return $this->id_materia;
    }
    
    public function getJustificada() {
        return $this->justificada;
    }
    
    // Setters
    public function setFecha($fecha) {
        $this->fecha = $fecha;
    }
    
    public function setIdAlumnos($id_alumnos) {
        $this->id_alumnos = $id_alumnos;
    }
    
    public function setIdMateria($id_materia) {
        $this->id_materia = $id_materia;
    }
    
    public function setJustificada($justificada) {
        $this->justificada = $justificada;
    }
    
    // Métodos CRUD
    public function crearInasistencia($datos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "INSERT INTO inasistencias (fecha, id_alumnos, id_materia, justificada) 
                VALUES (:fecha, :id_alumnos, :id_materia, :justificada)";
        
        $stmt = $con->prepare($sql);
        return $stmt->execute($datos);
    }
    
    public function obtenerInasistencia($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT i.*, a.nombre, a.apellido, m.nombre as materia 
                FROM inasistencias i 
                JOIN alumnos a ON i.id_alumnos = a.id_alumnos 
                JOIN materias m ON i.id_materia = m.id_materia 
                WHERE i.id_inasistencia = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function actualizarInasistencia($id, $datos) {
        $con = $this->conexion->obtenerConexion();
        
        // Construir la consulta dinámicamente
        $campos = [];
        $parametros = [];
        
        foreach ($datos as $campo => $valor) {
            if ($campo !== 'id') { // Excluir el ID de los campos a actualizar
                $campos[] = "$campo = :$campo";
                $parametros[":$campo"] = $valor;
            }
        }
        
        $sql = "UPDATE inasistencias SET " . implode(', ', $campos) . " WHERE id_inasistencia = :id";
        $parametros[':id'] = $id;
        
        $stmt = $con->prepare($sql);
        return $stmt->execute($parametros);
    }

    public function obtenerInasistenciasPorAlumno($id_alumnos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT i.*, m.nombre as materia 
                FROM inasistencias i 
                LEFT JOIN materias m ON i.id_materia = m.id_materia 
                WHERE i.id_alumnos = :id_alumnos
                ORDER BY i.fecha DESC";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id_alumnos', $id_alumnos);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function eliminarInasistencia($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "DELETE FROM inasistencias WHERE id_inasistencia = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    
    public function listarInasistencias() {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT i.*, a.nombre, a.apellido, m.nombre as materia 
                FROM inasistencias i 
                JOIN alumnos a ON i.id_alumnos = a.id_alumnos 
                JOIN materias m ON i.id_materia = m.id_materia";
        
        $stmt = $con->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function justificarInasistencia($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "UPDATE inasistencias SET justificada = TRUE WHERE id_inasistencia = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?>