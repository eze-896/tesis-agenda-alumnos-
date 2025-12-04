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

    public function precargarDias() {
    $dias_estaticos = [
        1 => 'LUNES',
        2 => 'MARTES',
        3 => 'MIERCOLES',
        4 => 'JUEVES',
        5 => 'VIERNES',
        6 => 'SABADO',
        7 => 'DOMINGO'
    ];

    $con = $this->conexion->obtenerConexion();
    $dias_insertados = 0;

    try {
        // Iniciar transacción para asegurar atomicidad
        $con->beginTransaction();

        // Verificar si la tabla ya tiene 7 días (asumimos que está completa si tiene 7)
        $stmt_count = $con->prepare("SELECT COUNT(*) FROM dias");
        $stmt_count->execute();
        $count = $stmt_count->fetchColumn();

        if ($count < 7) {
            $sql_insert = "INSERT INTO dias (id_dia, nombre_dia) VALUES (:id_dia, :nombre_dia) 
                           ON DUPLICATE KEY UPDATE nombre_dia=nombre_dia"; // Usamos ON DUPLICATE para evitar errores si algunos existen
            
            $stmt = $con->prepare($sql_insert);

            foreach ($dias_estaticos as $id => $nombre) {
                // Primero, intentar la inserción
                $stmt->execute([
                    ':id_dia' => $id, 
                    ':nombre_dia' => $nombre
                ]);
                
                // Si la inserción tuvo éxito (no fue duplicada), contamos
                if ($stmt->rowCount() > 0) {
                    $dias_insertados++;
                }
            }
        }
        
        $con->commit();
        return ['success' => true, 'count' => $dias_insertados];
        
    } catch (PDOException $e) {
        $con->rollBack();
        // Registrar error y lanzar excepción para ser capturada en el login.php
        error_log("Error al precargar días: " . $e->getMessage());
        throw new Exception("Error en la base de datos al precargar días.");
    }
}
}
?>