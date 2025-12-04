<?php
class Conexion {
    private $servidor = "localhost";
    private $usuario = "root";
    private $password = "root";
    private $base_datos = "tesis";
    private $conexion;
    
    public function __construct() {
        try {
            $this->conexion = new PDO(
                "mysql:host={$this->servidor};dbname={$this->base_datos}", 
                $this->usuario, 
                $this->password
            );
            $this->conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conexion->exec("SET NAMES utf8");
        } catch(PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }
    
    public function obtenerConexion() {
        return $this->conexion;
    }
    
    public function cerrarConexion() {
        $this->conexion = null;
    }
}
?>