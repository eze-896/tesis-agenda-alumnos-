class GestorMaterias {
    constructor(alumnoId) {
        this.alumnoId = alumnoId;
        this.materias = [];
    }

    async inicializar() {
        console.log('Inicializando GestorMaterias...');
        try {
            await this.cargarMaterias();
            this.renderizarMaterias();
            console.log('GestorMaterias inicializado correctamente');
        } catch (error) {
            console.error('Error en inicialización de GestorMaterias:', error);
            throw error;
        }
    }

    async cargarMaterias() {
        try {
            const response = await fetch(`../controles/materias.php?action=obtener_materias_alumno&alumno_id=${this.alumnoId}`);
            const result = await response.json();

            if (result.success) {
                this.materias = result.data;
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Error cargando materias:', error);
            throw error;
        }
    }

    renderizarMaterias() {
        const container = document.getElementById('materias-list');
        
        if (this.materias.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                    <h3>No tienes materias asignadas</h3>
                    <p>Contacta con la administración para que te asignen materias.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="materias-table">
                    <thead>
                        <tr>
                            <th>Materia</th>
                            <th>Profesor</th>
                            <th>Horarios</th>
                            <th>Días</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generarFilasMaterias()}
                    </tbody>
                </table>
            </div>
        `;
    }

    generarFilasMaterias() {
        return this.materias.map(materia => `
            <tr>
                <td class="materia-nombre">
                    <strong>${materia.nombre}</strong>
                </td>
                <td class="materia-profesor">
                    ${materia.profesor_nombre ? `
                        <div>${materia.profesor_nombre} ${materia.profesor_apellido}</div>
                        ${materia.profesor_email ? `<small>${materia.profesor_email}</small>` : ''}
                    ` : 'No asignado'}
                </td>
                <td class="materia-horarios">
                    ${materia.horarios && materia.horarios.length > 0 
                        ? materia.horarios.map(horario => `
                            <div class="horario-item">
                                <i class="fas fa-clock"></i>
                                ${this.formatearHora(horario.horario)}
                            </div>
                        `).join('')
                        : '<span class="no-horarios">Sin horarios</span>'
                    }
                </td>
                <td class="materia-dias">
                    ${materia.horarios && materia.horarios.length > 0 
                        ? [...new Set(materia.horarios.map(h => h.nombre_dia))].join(', ')
                        : '-'
                    }
                </td>
            </tr>
        `).join('');
    }

    formatearHora(horaString) {
        const [horas, minutos] = horaString.split(':');
        return `${horas}:${minutos} hs`;
    }
}