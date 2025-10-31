class VerEventos {
    constructor(alumnoId) {
        this.alumnoId = alumnoId;
        this.eventos = [];
        this.filtroTipo = 'todos';
        this.filtroSelect = null;
    }

    async inicializar() {
        await this.cargarEventos();
        this.renderizarEventos();
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
        this.configurarFiltro();
    }

    configurarFiltro() {
        // Remover event listener anterior si existe
        if (this.filtroSelect) {
            this.filtroSelect.removeEventListener('change', this.manejarCambioFiltro);
        }

        // Obtener el nuevo select
        this.filtroSelect = document.getElementById('filtro-tipo');
        
        if (this.filtroSelect) {
            // Establecer el valor actual
            this.filtroSelect.value = this.filtroTipo;
            
            // Bind del manejador para mantener el contexto de 'this'
            this.manejarCambioFiltro = this.manejarCambioFiltro.bind(this);
            
            // Agregar event listener
            this.filtroSelect.addEventListener('change', this.manejarCambioFiltro);
        }
    }

    manejarCambioFiltro(e) {
        this.filtroTipo = e.target.value;
        this.renderizarEventos(); // Esto solo actualiza el grid, no todo el contenido
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
                </div>
            `;
        }).join('');
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

    async recargarEventos() {
        await this.cargarEventos();
        this.renderizarEventos();
    }
}

// Variable global para acceso desde HTML
window.verEventos = null;