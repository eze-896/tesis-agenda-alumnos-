// Este archivo manejará las funcionalidades específicas de eventos e inasistencias
// Por ahora está integrado en calendario.js, pero se puede separar si crece

// Funciones adicionales para manejar eventos e inasistencias
class GestorEventos {
    constructor(alumnoId) {
        this.alumnoId = alumnoId;
    }

    async registrarInasistencia(fecha, idMateria) {
        try {
            const formData = new FormData();
            formData.append('fecha', fecha);
            formData.append('id_materia', idMateria);
            formData.append('id_alumnos', this.alumnoId);

            const response = await fetch('../controles/calendario.php?action=guardar_inasistencia', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Error registrando inasistencia:', error);
            return { success: false, message: 'Error al registrar inasistencia' };
        }
    }
}