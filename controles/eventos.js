class VerEventos {
    constructor(alumnoId) {
        this.alumnoId = alumnoId;
        this.eventos = [];
        this.filtroTipo = 'todos';
        this.filtroSelect = null;
        this.materias = [];

        // Bind de métodos para mantener el contexto
        this.manejarCambioFiltro = this.manejarCambioFiltro.bind(this);
        this.handleEditarClick = this.handleEditarClick.bind(this);
        this.handleEliminarClick = this.handleEliminarClick.bind(this);
    }

    async inicializar() {
        await this.cargarMaterias();
        await this.cargarEventos();
        this.renderizarEventos();
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

    async cargarEventos() {
        try {
            const response = await fetch(`../controles/eventos.php?action=obtener_eventos_alumno&alumno_id=${this.alumnoId}`);
            const result = await response.json();

            if (result.success) {
                // Filtrar solo eventos futuros (incluyendo hoy)
                this.eventos = this.filtrarEventosFuturos(result.data);
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Error cargando eventos:', error);
            throw error;
        }
    }

    filtrarEventosFuturos(eventos) {
        const ahora = new Date();
        
        return eventos.filter(evento => {
            const fechaEvento = new Date(evento.fecha);
            // Incluir eventos de hoy y futuros
            return fechaEvento >= ahora;
        }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Ordenar por fecha ascendente
    }

    renderizarEventos() {
        const container = document.getElementById('eventos-list');
        const eventosFiltrados = this.filtrarEventos();

        if (eventosFiltrados.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        container.innerHTML = `
            <div class="eventos-controls">
                <div class="filtros">
                    <label>Filtrar por tipo:</label>
                    <select id="filtro-tipo" class="filtro-select">
                        <option value="todos">Todos los eventos</option>
                        <option value="examen">Exámenes</option>
                        <option value="tarea">Tareas</option>
                        <option value="recordatorio">Recordatorios</option>
                        <option value="otro">Otros</option>
                    </select>
                </div>
            </div>

            <div class="eventos-grid">
                ${this.generarCardsEventos(eventosFiltrados)}
            </div>
        `;

        // Configurar el filtro después de renderizar
        this.configurarEventListeners();
    }

    configurarEventListeners() {
        // Remover event listeners anteriores si existen
        this.removerEventListeners();

        // Configurar filtro
        this.filtroSelect = document.getElementById('filtro-tipo');
        if (this.filtroSelect) {
            this.filtroSelect.value = this.filtroTipo;
            this.filtroSelect.addEventListener('change', this.manejarCambioFiltro);
        }

        // Configurar event delegation para los botones
        const container = document.getElementById('eventos-list');
        if (container) {
            container.addEventListener('click', (e) => {
                const target = e.target;

                // Manejar clic en botón editar
                if (target.classList.contains('btn-editar') || target.closest('.btn-editar')) {
                    const button = target.classList.contains('btn-editar') ? target : target.closest('.btn-editar');
                    const id = button.getAttribute('data-id');
                    if (id) this.editarEvento(parseInt(id));
                }

                // Manejar clic en botón eliminar
                if (target.classList.contains('btn-eliminar') || target.closest('.btn-eliminar')) {
                    const button = target.classList.contains('btn-eliminar') ? target : target.closest('.btn-eliminar');
                    const id = button.getAttribute('data-id');
                    if (id) this.eliminarEvento(parseInt(id));
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

    manejarCambioFiltro(e) {
        this.filtroTipo = e.target.value;
        this.renderizarEventos();
    }

    handleEditarClick(id) {
        this.editarEvento(id);
    }

    handleEliminarClick(id) {
        this.eliminarEvento(id);
    }

    generarCardsEventos(eventos) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        return eventos.map(evento => {
            const fechaEvento = new Date(evento.fecha);
            const esHoy = this.esMismaFecha(fechaEvento, hoy);
            
            let claseEstado = '';
            let textoEstado = '';
            
            if (esHoy) {
                claseEstado = 'hoy';
                textoEstado = 'Hoy';
            } else {
                claseEstado = 'futuro';
                const diasRestantes = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
                textoEstado = `En ${diasRestantes} día(s)`;
            }

            return `
                <div class="evento-card ${claseEstado}" data-id="${evento.id_evento}">
                    <div class="evento-header">
                        <div class="evento-tipo ${evento.tipo_evento}">
                            <i class="${this.getIconoTipo(evento.tipo_evento)}"></i>
                            ${this.getNombreTipo(evento.tipo_evento)}
                        </div>
                        <div class="evento-estado ${claseEstado}">
                            ${textoEstado}
                        </div>
                    </div>
                    
                    <div class="evento-fecha">
                        <i class="fas fa-calendar"></i>
                        ${this.formatearFecha(evento.fecha)}
                    </div>
                    
                    <div class="evento-descripcion">
                        ${evento.descripcion}
                    </div>
                    
                    ${evento.nombre_materia ? `
                        <div class="evento-materia">
                            <i class="fas fa-book"></i>
                            ${evento.nombre_materia}
                        </div>
                    ` : ''}

                    <div class="evento-actions">
                        <button class="btn-action btn-editar" data-id="${evento.id_evento}">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn-action btn-eliminar" data-id="${evento.id_evento}">
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

    getEmptyState() {
        const mensaje = this.filtroTipo === 'todos' 
            ? 'No hay eventos programados para el futuro.'
            : `No hay eventos de tipo "${this.getNombreTipo(this.filtroTipo)}" programados.`;

        return `
            <div class="empty-state">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                <h3>No hay eventos</h3>
                <p>${mensaje}</p>
                ${this.filtroTipo !== 'todos' ? `
                    <button class="btn-primary" onclick="verEventos.resetearFiltro()">
                        <i class="fas fa-eye"></i>
                        Ver todos los eventos
                    </button>
                ` : ''}
            </div>
        `;
    }

    filtrarEventos() {
        if (this.filtroTipo === 'todos') {
            return this.eventos;
        }
        return this.eventos.filter(evento => evento.tipo_evento === this.filtroTipo);
    }

    resetearFiltro() {
        this.filtroTipo = 'todos';
        this.renderizarEventos();
    }

    getIconoTipo(tipo) {
        const iconos = {
            'examen': 'fas fa-file-alt',
            'tarea': 'fas fa-tasks',
            'recordatorio': 'fas fa-bell',
            'otro': 'fas fa-flag'
        };
        return iconos[tipo] || 'fas fa-flag';
    }

    getNombreTipo(tipo) {
        const nombres = {
            'examen': 'Examen',
            'tarea': 'Tarea',
            'recordatorio': 'Recordatorio',
            'otro': 'Otro'
        };
        return nombres[tipo] || 'Evento';
    }

    formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    }

    esMismaFecha(fecha1, fecha2) {
        return fecha1.toDateString() === fecha2.toDateString();
    }

    async editarEvento(idEvento) {
        const evento = this.eventos.find(e => e.id_evento === idEvento);

        if (!evento) {
            alert('No se encontró el evento');
            return;
        }

        this.mostrarModalEdicion(evento);
    }

    mostrarModalEdicion(evento) {
        const modalId = 'modal-editar-evento';

        // Remover modal existente si hay uno
        const modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }

        const modalHTML = `
            <div class="modal" id="${modalId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Editar Evento</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="form-editar-evento">
                            <input type="hidden" id="editar-id" value="${evento.id_evento}">
                            
                            <div class="form-group">
                                <label for="editar-fecha">Fecha:</label>
                                <input type="date" id="editar-fecha" value="${evento.fecha}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editar-descripcion">Descripción:</label>
                                <textarea id="editar-descripcion" rows="3" required>${evento.descripcion}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="editar-tipo-evento">Tipo de Evento:</label>
                                <select id="editar-tipo-evento">
                                    <option value="examen" ${evento.tipo_evento === 'examen' ? 'selected' : ''}>Examen</option>
                                    <option value="tarea" ${evento.tipo_evento === 'tarea' ? 'selected' : ''}>Tarea</option>
                                    <option value="recordatorio" ${evento.tipo_evento === 'recordatorio' ? 'selected' : ''}>Recordatorio</option>
                                    <option value="otro" ${evento.tipo_evento === 'otro' ? 'selected' : ''}>Otro</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="editar-materia">Materia (opcional):</label>
                                <select id="editar-materia">
                                    <option value="">Sin materia específica</option>
                                    ${this.generarOpcionesMaterias(evento.id_materia)}
                                </select>
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
        const form = document.getElementById('form-editar-evento');
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

        const idEvento = document.getElementById('editar-id').value;
        const fecha = document.getElementById('editar-fecha').value;
        const descripcion = document.getElementById('editar-descripcion').value;
        const tipoEvento = document.getElementById('editar-tipo-evento').value;
        const idMateria = document.getElementById('editar-materia').value;

        try {
            const response = await fetch('../controles/eventos.php?action=editar_evento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_evento: idEvento,
                    fecha: fecha,
                    descripcion: descripcion,
                    tipo_evento: tipoEvento,
                    id_materia: idMateria || null
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Evento actualizado exitosamente');
                document.getElementById('modal-editar-evento').style.display = 'none';
                await this.cargarEventos();
                this.renderizarEventos();
            } else {
                alert('❌ Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error editando evento:', error);
            alert('❌ Error al editar el evento');
        }
    }

    async eliminarEvento(idEvento) {
        if (!confirm('¿Estás seguro de que quieres eliminar este evento?\nEsta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch('../controles/eventos.php?action=eliminar_evento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_evento: idEvento
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Evento eliminado exitosamente');
                await this.cargarEventos();
                this.renderizarEventos();
            } else {
                alert('❌ Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error eliminando evento:', error);
            alert('❌ Error al eliminar el evento');
        }
    }

    async recargarEventos() {
        await this.cargarEventos();
        this.renderizarEventos();
    }
}

// Variable global para acceso desde HTML
window.verEventos = null;