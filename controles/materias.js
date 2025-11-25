class GestorMaterias {
    constructor(alumnoId) {
        this.alumnoId = alumnoId;
        this.materias = [];
    }

    async inicializar() {
        console.log('Inicializando GestorMaterias para VISUALIZACIÓN...');
        try {
            await this.cargarMaterias();
            this.renderizarMaterias();
            console.log('GestorMaterias (visualización) inicializado correctamente');
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
            container.innerHTML = this.getEmptyStateAlumno();
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="materias-table">
                    <thead>
                        <tr>
                            <th style="min-width: 180px;">Materia</th>
                            <th style="min-width: 90px;">Duración</th>
                            <th style="min-width: 120px;">Estado</th>
                            <th style="min-width: 140px;">Profesor</th>
                            <th style="min-width: 100px;">Horarios</th>
                            <th style="min-width: 120px;">Días</th>
                            <th style="min-width: 100px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generarFilasMaterias()}
                    </tbody>
                </table>
            </div>
        `;

        // Agregar event listeners a los botones de acción
        this.configurarBotonesAccion();
    }

    generarFilasMaterias() {
        return this.materias.map(materia => `
            <tr>
                <td class="materia-nombre">
                    <strong>${materia.nombre}</strong>
                </td>
                <td class="materia-duracion">
                    <span class="badge badge-duracion">${materia.duracion || 'N/A'}h</span>
                </td>
                <td class="materia-estado">
                    <span class="badge estado-${materia.estado || 'cursando'}">
                        ${this.formatearEstadoCompacto(materia.estado)}
                    </span>
                </td>
                <td class="materia-profesor">
                    ${materia.profesor_nombre ? `
                        <div style="font-size: 0.85rem;">${materia.profesor_nombre} ${materia.profesor_apellido}</div>
                        ${materia.profesor_email ? `<small style="font-size: 0.75rem;">${materia.profesor_email}</small>` : ''}
                    ` : '<span style="font-size: 0.85rem; color: #95a5a6;">No asignado</span>'}
                </td>
                <td class="materia-horarios">
                    ${materia.horarios && materia.horarios.length > 0 
                        ? materia.horarios.map(horario => `
                            <div class="horario-item" style="font-size: 0.8rem;">
                                <i class="fas fa-clock" style="font-size: 0.7rem;"></i>
                                ${this.formatearHora(horario.horario)}
                            </div>
                        `).join('')
                        : '<span class="no-horarios" style="font-size: 0.8rem;">Sin horarios</span>'
                    }
                </td>
                <td class="materia-dias" style="font-size: 0.8rem;">
                    ${materia.horarios && materia.horarios.length > 0 
                        ? this.formatearDiasCompacto(materia.horarios)
                        : '-'
                    }
                </td>
                <td class="materia-acciones">
                    <button class="btn-edit-materia" data-materia-id="${materia.id_materia}" title="Editar materia" style="font-size: 0.9rem;">
                        ✏️
                    </button>
                    <button class="btn-delete-materia" data-materia-id="${materia.id_materia}" title="Eliminar materia" style="font-size: 0.9rem;">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Configurar botones de acción en la tabla
    configurarBotonesAccion() {
        // Botones eliminar
        const botonesEliminar = document.querySelectorAll('.btn-delete-materia');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                e.preventDefault();
                const materiaId = boton.getAttribute('data-materia-id');
                this.eliminarMateria(materiaId);
            });
        });

        // Botones editar
        const botonesEditar = document.querySelectorAll('.btn-edit-materia');
        botonesEditar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                e.preventDefault();
                const materiaId = boton.getAttribute('data-materia-id');
                this.editarMateria(materiaId);
            });
        });
    }

    // Eliminar materia
    async eliminarMateria(materiaId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta materia? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch('../controles/materias.php?action=eliminar_materia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    materia_id: materiaId
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Materia eliminada exitosamente');
                // Recargar la lista de materias
                await this.cargarMaterias();
                this.renderizarMaterias();
            } else {
                alert('❌ Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error eliminando materia:', error);
            alert('❌ Error al eliminar la materia: ' + error.message);
        }
    }

    // Editar materia - redirigir a configuración
    editarMateria(materiaId) {
        // Cambiar a la pestaña de configuración
        if (window.dashboard) {
            window.dashboard.cambiarModulo('configuracion');
            
            // Esperar a que cargue la configuración y luego editar la materia
            setTimeout(() => {
                if (window.gestionMaterias) {
                    window.gestionMaterias.editarMateria(materiaId);
                }
            }, 1000);
        }
    }

    formatearHora(horaString) {
        const [horas, minutos] = horaString.split(':');
        return `${horas}:${minutos}hs`;
    }

    formatearEstado(estado) {
        const estados = {
            'cursando': 'Cursando',
            'recursando': 'Recursando', 
            'intensificando': 'Intensificando'
        };
        return estados[estado] || 'Cursando';
    }

    formatearEstadoCompacto(estado) {
        const estados = {
            'cursando': 'Cursando',
            'recursando': 'Recursar', 
            'intensificando': 'Intensif.'
        };
        return estados[estado] || 'Cursando';
    }

    formatearDiasCompacto(horarios) {
        const diasUnicos = [...new Set(horarios.map(h => h.nombre_dia))];
        const diasAbreviados = diasUnicos.map(dia => {
            const abreviaciones = {
                'LUNES': 'Lun',
                'MARTES': 'Mar',
                'MIERCOLES': 'Mié',
                'JUEVES': 'Jue',
                'VIERNES': 'Vie',
                'SABADO': 'Sáb',
                'DOMINGO': 'Dom'
            };
            return abreviaciones[dia] || dia.substring(0, 3);
        });
        return diasAbreviados.join(', ');
    }

    getEmptyStateAlumno() {
        return `
            <div class="empty-state">
                <i class="fas fa-book" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                <h3>No tienes materias asignadas</h3>
                <p>Contacta con la administración para que te asignen materias.</p>
            </div>
        `;
    }
}