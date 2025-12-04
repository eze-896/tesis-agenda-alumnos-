<?php
require_once '../config/Conexion.php';

class Alumno {
    private $id_alumnos;
    private $nombre;
    private $apellido;
    private $dni;
    private $anio;
    private $division;
    private $email;
    private $password;
    private $conexion;

    public function __construct() {
        $this->conexion = new Conexion();
    }

    // --- Getters y Setters ---
    public function getIdAlumnos() { return $this->id_alumnos; }
    public function getNombre() { return $this->nombre; }
    public function getApellido() { return $this->apellido; }
    public function getDni() { return $this->dni; }
    public function getAnio() { return $this->anio; }
    public function getDivision() { return $this->division; }
    public function getEmail() { return $this->email; }

    public function setNombre($nombre) { $this->nombre = $nombre; }
    public function setApellido($apellido) { $this->apellido = $apellido; }
    public function setDni($dni) { $this->dni = $dni; }
    public function setAnio($anio) { $this->anio = $anio; }
    public function setDivision($division) { $this->division = $division; }
    public function setEmail($email) { $this->email = $email; }
    public function setPassword($password) { $this->password = password_hash($password, PASSWORD_DEFAULT); }

    // --- CRUD ---
    public function registrarAlumno(array $datos): bool {
        try {
            $con = $this->conexion->obtenerConexion();

            $sql = "INSERT INTO alumnos (nombre, apellido, dni, email, anio, division, password) 
                    VALUES (:nombre, :apellido, :dni, :email, :anio, :division, :password)";

            $stmt = $con->prepare($sql);
            $password_hash = password_hash($datos['password'], PASSWORD_DEFAULT);

            $stmt->bindParam(':nombre', $datos['nombre']);
            $stmt->bindParam(':apellido', $datos['apellido']);
            $stmt->bindParam(':dni', $datos['dni']);
            $stmt->bindParam(':email', $datos['email']);
            $stmt->bindParam(':anio', $datos['anio']);
            $stmt->bindParam(':division', $datos['division']);
            $stmt->bindParam(':password', $password_hash);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en registrarAlumno: " . $e->getMessage());
            return false;
        }
    }

    public function obtenerAlumno(int $id): ?array {
        try {
            $con = $this->conexion->obtenerConexion();
            $sql = "SELECT * FROM alumnos WHERE id_alumnos = :id";

            $stmt = $con->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            return $resultado ?: null;
        } catch (PDOException $e) {
            error_log("Error en obtenerAlumno: " . $e->getMessage());
            return null;
        }
    }

    public function actualizarAlumno(int $id, array $datos): bool {
        try {
            $con = $this->conexion->obtenerConexion();
            
            // Construir la consulta dinámicamente
            $campos = [];
            $parametros = ['id' => $id];
            
            foreach ($datos as $campo => $valor) {
                if ($campo !== 'id') {
                    $campos[] = "$campo = :$campo";
                    $parametros[$campo] = $valor;
                }
            }
            
            if (empty($campos)) {
                return false;
            }
            
            $sql = "UPDATE alumnos SET " . implode(', ', $campos) . " WHERE id_alumnos = :id";
            
            $stmt = $con->prepare($sql);
            return $stmt->execute($parametros);
        } catch (PDOException $e) {
            error_log("Error en actualizarAlumno: " . $e->getMessage());
            return false;
        }
    }

    public function eliminarAlumno(int $id): bool {
        try {
            $con = $this->conexion->obtenerConexion();
            $sql = "DELETE FROM alumnos WHERE id_alumnos = :id";

            $stmt = $con->prepare($sql);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en eliminarAlumno: " . $e->getMessage());
            return false;
        }
    }

    public function listarAlumnos(): array {
        try {
            $con = $this->conexion->obtenerConexion();
            $sql = "SELECT * FROM alumnos ORDER BY apellido, nombre";
            $stmt = $con->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en listarAlumnos: " . $e->getMessage());
            return [];
        }
    }

    // --- Métodos específicos ---
    public function existeAlumno(string $dni, string $email): bool {
        try {
            $con = $this->conexion->obtenerConexion();
            $sql = "SELECT 1 FROM alumnos WHERE dni = :dni OR email = :email LIMIT 1";

            $stmt = $con->prepare($sql);
            $stmt->bindParam(':dni', $dni);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
        } catch (PDOException $e) {
            error_log("Error en existeAlumno: " . $e->getMessage());
            return false;
        }
    }

    public function verificarCredenciales(string $usuario, string $password): array|false {
        try {
            $con = $this->conexion->obtenerConexion();
            $sql = "SELECT id_alumnos, nombre, apellido, dni, anio, division, password, email 
                    FROM alumnos 
                    WHERE email = :usuario OR dni = :usuario";

            $stmt = $con->prepare($sql);
            $stmt->bindParam(':usuario', $usuario);
            $stmt->execute();

            $alumno = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($alumno && password_verify($password, $alumno['password'])) {
                unset($alumno['password']);
                return $alumno;
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error en verificarCredenciales: " . $e->getMessage());
            return false;
        }
    }
}
?>