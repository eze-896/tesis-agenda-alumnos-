class GestorInasistencias {
    constructor(alumnoId) {
        this.alumnoId = alumnoId;
        this.inasistencias = [];
        this.filtroEstado = 'todas';
        this.filtroSelect = null;
        this.materias = [];

        // Bind de métodos para mantener el contexto
        this.manejarCambioFiltro = this.manejarCambioFiltro.bind(this);
        this.handleEditarClick = this.handleEditarClick.bind(this);
        this.handleEliminarClick = this.handleEliminarClick.bind(this);
    }

    async inicializar() {
        await this.cargarMaterias();
        await this.cargarInasistencias();
        this.renderizarInasistencias();
    }

    async cargarMaterias() {
        try {
            const response = await fetch(`../controles/materias.php?action=obtener_materias_alumno&alumno_id=${this.alumnoId}`);
            const result = await response.json();
            if (result.success) {
                this.materias = result.data;
            }
        } catch (error) {
            console.error('Error cargando materias:', error);
        }
    }

    async cargarInasistencias() {
        try {
            const response = await fetch(`../controles/inasistencias.php?action=obtener_inasistencias_alumno&alumno_id=${this.alumnoId}`);
            const result = await response.json();

            if (result.success) {
                this.inasistencias = result.data;
                this.inasistencias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error cargando inasistencias:', error);
            throw error;
        }
    }

    renderizarInasistencias() {
        const container = document.getElementById('inasistencias-list');
        const inasistenciasFiltradas = this.filtrarInasistencias();

        if (inasistenciasFiltradas.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        container.innerHTML = `
            <div class="eventos-controls">
                <div class="filtros">
                    <label>Filtrar por estado:</label>
                    <select id="filtro-estado" class="filtro-select">
                        <option value="todas">Todas las inasistencias</option>
                        <option value="justificada">Justificadas</option>
                        <option value="no-justificada">No justificadas</option>
                    </select>
                </div>
            </div>

            <div class="eventos-grid">
                ${this.generarCardsInasistencias(inasistenciasFiltradas)}
            </div>
        `;

        this.configurarEventListeners();
    }

    configurarFiltro() {
        // Remover event listener anterior si existe
        if (this.filtroSelect) {
            this.filtroSelect.removeEventListener('change', this.manejarCambioFiltro);
        }

        // Obtener el nuevo select
        this.filtroSelect = document.getElementById('filtro-estado');

        if (this.filtroSelect) {
            // Establecer el valor actual
            this.filtroSelect.value = this.filtroEstado;

            // Bind del manejador para mantener el contexto de 'this'
            this.manejarCambioFiltro = this.manejarCambioFiltro.bind(this);

            // Agregar event listener
            this.filtroSelect.addEventListener('change', this.manejarCambioFiltro);
        }
    }

    manejarCambioFiltro(e) {
        this.filtroEstado = e.target.value;
        this.renderizarInasistencias();
    }

    handleEditarClick(id) {
        this.editarInasistencia(id);
    }

    handleEliminarClick(id) {
        this.eliminarInasistencia(id);
    }

    generarCardsInasistencias(inasistencias) {
        return inasistencias.map(inasistencia => {
            const esJustificada = inasistencia.justificada;
            const materiaTexto = inasistencia.materia ?
                `<div class="evento-descripcion">
                    <strong>Materia:</strong> ${inasistencia.materia}
                </div>` : '';

            return `
                <div class="evento-card ${esJustificada ? 'justificada' : 'no-justificada'}" data-id="${inasistencia.id_inasistencia}">
                    <div class="evento-header">
                        <div class="evento-tipo ${esJustificada ? 'justificada' : 'no-justificada'}">
                            <i class="fas ${esJustificada ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            ${esJustificada ? 'Inasistencia Justificada' : 'Inasistencia No Justificada'}
                        </div>
                        <div class="evento-estado ${esJustificada ? 'justificada' : 'no-justificada'}">
                            ${esJustificada ? '✅ Justificada' : '❌ No Justificada'}
                        </div>
                    </div>
                    
                    <div class="evento-fecha">
                        <i class="fas fa-calendar"></i>
                        ${this.formatearFecha(inasistencia.fecha)}
                    </div>
                    
                    ${materiaTexto}
                    
                    <div class="evento-actions">
                        <button class="btn-action btn-editar" data-id="${inasistencia.id_inasistencia}">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn-action btn-eliminar" data-id="${inasistencia.id_inasistencia}">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    generarOpcionesMaterias(idMateriaActual) {
        return this.materias.map(materia => `
            <option value="${materia.id_materia}" ${materia.id_materia == idMateriaActual ? 'selected' : ''}>
                ${materia.nombre}
            </option>
        `).join('');
    }

    configurarEventListeners() {
        // Remover event listeners anteriores si existen
        this.removerEventListeners();

        // Configurar filtro
        this.filtroSelect = document.getElementById('filtro-estado');
        if (this.filtroSelect) {
            this.filtroSelect.value = this.filtroEstado;
            this.filtroSelect.addEventListener('change', this.manejarCambioFiltro);
        }

        // Configurar event delegation para los botones
        const container = document.getElementById('inasistencias-list');
        if (container) {
            container.addEventListener('click', (e) => {
                const target = e.target;

                // Manejar clic en botón editar
                if (target.classList.contains('btn-editar') || target.closest('.btn-editar')) {
                    const button = target.classList.contains('btn-editar') ? target : target.closest('.btn-editar');
                    const id = button.getAttribute('data-id');
                    if (id) this.editarInasistencia(parseInt(id));
                }

                // Manejar clic en botón eliminar
                if (target.classList.contains('btn-eliminar') || target.closest('.btn-eliminar')) {
                    const button = target.classList.contains('btn-eliminar') ? target : target.closest('.btn-eliminar');
                    const id = button.getAttribute('data-id');
                    if (id) this.eliminarInasistencia(parseInt(id));
                }
            });
        }
    }

    removerEventListeners() {
        // Remover event listener del filtro
        if (this.filtroSelect) {
            this.filtroSelect.removeEventListener('change', this.manejarCambioFiltro);
            this.filtroSelect = null;
        }
    }

    getEmptyState() {
        const mensaje = this.filtroEstado === 'todas'
            ? '¡Perfecta asistencia! No tienes inasistencias registradas.'
            : `No hay inasistencias ${this.filtroEstado === 'justificada' ? 'justificadas' : 'no justificadas'}.`;

        return `
            <div class="empty-state">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #27ae60; margin-bottom: 1rem;"></i>
                <h3>No hay inasistencias</h3>
                <p>${mensaje}</p>
                ${this.filtroEstado !== 'todas' ? `
                    <button class="btn-primary" onclick="gestorInasistencias.resetearFiltro()">
                        <i class="fas fa-eye"></i>
                        Ver todas las inasistencias
                    </button>
                ` : ''}
            </div>
        `;
    }

    filtrarInasistencias() {
        if (this.filtroEstado === 'todas') {
            return this.inasistencias;
        }

        return this.inasistencias.filter(inasistencia => {
            if (this.filtroEstado === 'justificada') {
                return inasistencia.justificada;
            } else {
                return !inasistencia.justificada;
            }
        });
    }

    resetearFiltro() {
        this.filtroEstado = 'todas';
        this.renderizarInasistencias();
    }

    formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr + 'T00:00:00');
        const opciones = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    }

    async editarInasistencia(idInasistencia) {
        const inasistencia = this.inasistencias.find(i => i.id_inasistencia === idInasistencia);

        if (!inasistencia) {
            alert('No se encontró la inasistencia');
            return;
        }

        this.mostrarModalEdicion(inasistencia);
    }

    mostrarModalEdicion(inasistencia) {
        const modalId = 'modal-editar-inasistencia';

        // Remover modal existente si hay uno
        const modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }

        const modalHTML = `
            <div class="modal" id="${modalId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Editar Inasistencia</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="form-editar-inasistencia">
                            <input type="hidden" id="editar-id" value="${inasistencia.id_inasistencia}">
                            
                            <div class="form-group">
                                <label for="editar-fecha">Fecha:</label>
                                <input type="date" id="editar-fecha" value="${inasistencia.fecha}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editar-materia">Materia:</label>
                                <select id="editar-materia">
                                    <option value="">Sin materia específica</option>
                                    ${this.generarOpcionesMaterias(inasistencia.id_materia)}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="editar-justificada" ${inasistencia.justificada ? 'checked' : ''}>
                                    Justificada
                                </label>
                            </div>
                            
                            <div class="modal-actions">
                                <button type="button" class="btn-cancelar">Cancelar</button>
                                <button type="submit" class="btn-guardar">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById(modalId);
        const form = document.getElementById('form-editar-inasistencia');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = modal.querySelector('.btn-cancelar');

        // Configurar event listeners para cerrar modal
        const cerrarModal = () => {
            modal.style.display = 'none';
            modal.remove();
        };

        closeBtn.onclick = cerrarModal;
        cancelBtn.onclick = cerrarModal;

        // Cerrar modal al hacer clic fuera del contenido
        modal.onclick = (e) => {
            if (e.target === modal) {
                cerrarModal();
            }
        };

        form.onsubmit = (e) => this.guardarEdicion(e);
        modal.style.display = 'block';
    }

    async guardarEdicion(e) {
        e.preventDefault();

        const idInasistencia = document.getElementById('editar-id').value;
        const fecha = document.getElementById('editar-fecha').value;
        const idMateria = document.getElementById('editar-materia').value;
        const justificada = document.getElementById('editar-justificada').checked ? '1' : '0';

        try {
            const response = await fetch('../controles/inasistencias.php?action=editar_inasistencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_inasistencia: idInasistencia,
                    fecha: fecha,
                    id_materia: idMateria || null,
                    justificada: justificada,
                    id_alumnos: this.alumnoId
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Inasistencia actualizada exitosamente');
                document.getElementById('modal-editar-inasistencia').style.display = 'none';
                await this.cargarInasistencias();
                this.renderizarInasistencias();
            } else {
                alert('❌ Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error editando inasistencia:', error);
            alert('❌ Error al editar la inasistencia');
        }
    }

    async eliminarInasistencia(idInasistencia) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta inasistencia?\nEsta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch('../controles/inasistencias.php?action=eliminar_inasistencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_inasistencia: idInasistencia
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Inasistencia eliminada exitosamente');
                await this.cargarInasistencias();
                this.renderizarInasistencias();
            } else {
                alert('❌ Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error eliminando inasistencia:', error);
            alert('❌ Error al eliminar la inasistencia');
        }
    }

    async recargarInasistencias() {
        await this.cargarInasistencias();
        this.renderizarInasistencias();
    }
}

// Variable global para acceso desde HTML
window.gestorInasistencias = null;