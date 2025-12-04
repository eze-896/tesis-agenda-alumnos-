<?php
require_once '../config/Conexion.php';

class Profesor {
    private $id_profesor;
    private $nombre;
    private $apellido;
    private $email;
    private $conexion;
    
    public function __construct() {
        $this->conexion = new Conexion();
    }
    
    // Getters
    public function getIdProfesor() {
        return $this->id_profesor;
    }
    
    public function getNombre() {
        return $this->nombre;
    }
    
    public function getApellido() {
        return $this->apellido;
    }
    
    public function getEmail() {
        return $this->email;
    }
    
    // Setters
    public function setNombre($nombre) {
        $this->nombre = $nombre;
    }
    
    public function setApellido($apellido) {
        $this->apellido = $apellido;
    }
    
    public function setEmail($email) {
        $this->email = $email;
    }
    
    // Métodos CRUD
    public function crearProfesor($datos) {
    $con = $this->conexion->obtenerConexion();
    
    // Construir la consulta dinámicamente basada en los datos proporcionados
    $campos = [];
    $valores = [];
    $parametros = [];
    
    foreach ($datos as $campo => $valor) {
        $campos[] = $campo;
        $valores[] = ":$campo";
        $parametros[":$campo"] = $valor;
    }
    
    $sql = "INSERT INTO profesores (" . implode(', ', $campos) . ") 
            VALUES (" . implode(', ', $valores) . ")";
    
    $stmt = $con->prepare($sql);
    $resultado = $stmt->execute($parametros);
    
    if ($resultado) {
        return $con->lastInsertId(); // Retorna el ID del profesor creado
    }
    
    return false;
    }
    
    public function obtenerProfesor($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT * FROM profesores WHERE id_profesor = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function obtenerProfesorPorNombre($nombre, $apellido) {
    $con = $this->conexion->obtenerConexion();
    $sql = "SELECT * FROM profesores WHERE nombre = :nombre AND apellido = :apellido";
    
    $stmt = $con->prepare($sql);
    $stmt->bindParam(':nombre', $nombre);
    $stmt->bindParam(':apellido', $apellido);
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
    
    public function actualizarProfesor($id, $datos) {
        $con = $this->conexion->obtenerConexion();
        $sql = "UPDATE profesores SET nombre = :nombre, apellido = :apellido, email = :email 
                WHERE id_profesor = :id";
        
        $stmt = $con->prepare($sql);
        $datos['id'] = $id;
        return $stmt->execute($datos);
    }
    
    public function eliminarProfesor($id) {
        $con = $this->conexion->obtenerConexion();
        $sql = "DELETE FROM profesores WHERE id_profesor = :id";
        
        $stmt = $con->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    
    public function listarProfesores() {
        $con = $this->conexion->obtenerConexion();
        $sql = "SELECT * FROM profesores";
        
        $stmt = $con->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>