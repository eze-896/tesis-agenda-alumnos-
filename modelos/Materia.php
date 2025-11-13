<?php
require_once '../config/Conexion.php';

class Materia {
    private $id_materia;
    private $nombre;
    private $duracion;
    private $estado;
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
    
    public function getDuracion() {
        return $this->duracion;
    }
    
    public function getEstado() {
        return $this->estado;
    }
    
    // Setters
    public function setNombre($nombre) {
        $this->nombre = $nombre;
    }
    
    public function setDuracion($duracion) {
        $this->duracion = $duracion;
    }
    
    public function setEstado($estado) {
        $this->estado = $estado;
    }
    
    // Métodos CRUD - ACTUALIZADOS
    public function crearMateria($datos) {
        $con = $this->conexion->obtenerConexion();
        
        // Verificar si los campos opcionales están presentes
        $campos = ['nombre'];
        $valores = [':nombre'];
        
        if (isset($datos['duracion'])) {
            $campos[] = 'duracion';
            $valores[] = ':duracion';
        }
        
        if (isset($datos['estado'])) {
            $campos[] = 'estado';
            $valores[] = ':estado';
        }
        
        $sql = "INSERT INTO materias (" . implode(', ', $campos) . ") VALUES (" . implode(', ', $valores) . ")";
        
        $stmt = $con->prepare($sql);
        $stmt->bindValue(':nombre', $datos['nombre']);
        
        if (isset($datos['duracion'])) {
            $stmt->bindValue(':duracion', $datos['duracion'], PDO::PARAM_INT);
        }
        
        if (isset($datos['estado'])) {
            $stmt->bindValue(':estado', $datos['estado']);
        }
        
        return $stmt->execute();
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
        
        $setParts = [];
        $params = ['id' => $id];
        
        foreach ($datos as $key => $value) {
            if ($key !== 'id') {
                $setParts[] = "$key = :$key";
                $params[$key] = $value;
            }
        }
        
        $sql = "UPDATE materias SET " . implode(', ', $setParts) . " WHERE id_materia = :id";
        
        $stmt = $con->prepare($sql);
        return $stmt->execute($params);
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