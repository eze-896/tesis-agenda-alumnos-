<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['alumno_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No hay sesión activa'
    ]);
    exit;
}

// Devolver información del alumno en sesión
echo json_encode([
    'success' => true,
    'alumno' => [
        'id_alumnos' => $_SESSION['alumno_id'],
        'nombre' => $_SESSION['alumno_nombre'],
        'apellido' => $_SESSION['alumno_apellido'],
        'dni' => $_SESSION['alumno_dni'],
        'anio' => $_SESSION['alumno_anio'],
        'division' => $_SESSION['alumno_division'],
        'email' => $_SESSION['alumno_email']
    ]
]);
?>