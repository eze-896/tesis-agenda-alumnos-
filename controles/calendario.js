class Calendario {
    constructor(alumnoId) {
        this.alumnoId = alumnoId;
        this.fechaActual = new Date();
        this.mesActual = this.fechaActual.getMonth();
        this.añoActual = this.fechaActual.getFullYear();
        this.eventos = [];
        this.materias = [];
        this.inasistencias = [];
    }

    async inicializar() {
        await this.cargarDatos();
        this.renderizarCalendario();
        this.configurarEventos();
    }

    async cargarDatos() {
        try {
            // Cargar materias del alumno con sus horarios
            const responseMaterias = await fetch(`../controles/calendario.php?action=obtener_materias&alumno_id=${this.alumnoId}`);
            const resultMaterias = await responseMaterias.json();
            
            if (resultMaterias.success) {
                this.materias = resultMaterias.data;
            }

            // Cargar eventos del alumno
            const responseEventos = await fetch(`../controles/calendario.php?action=obtener_eventos&alumno_id=${this.alumnoId}`);
            const resultEventos = await responseEventos.json();
            
            if (resultEventos.success) {
                this.eventos = resultEventos.data;
            }

            // Cargar inasistencias del alumno
            const responseInasistencias = await fetch(`../controles/calendario.php?action=obtener_inasistencias&alumno_id=${this.alumnoId}`);
            const resultInasistencias = await responseInasistencias.json();
            
            if (resultInasistencias.success) {
                this.inasistencias = resultInasistencias.data;
            }

        } catch (error) {
            console.error('Error cargando datos del calendario:', error);
        }
    }

    renderizarCalendario() {
        const container = document.getElementById('content-area');
        container.innerHTML = this.generarHTMLCalendario();
        this.generarDiasCalendario();
    }

    generarHTMLCalendario() {
        const nombresMeses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        return `
            <div class="calendario-container">
                <div class="calendario-header">
                    <button class="btn-nav" id="btn-prev">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    
                    <div class="calendario-titulo">
                        <h2>${nombresMeses[this.mesActual]} ${this.añoActual}</h2>
                    </div>
                    
                    <button class="btn-nav" id="btn-next">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    
                    <button class="btn-hoy" id="btn-hoy">
                        Hoy
                    </button>
                </div>

                <div class="calendario-leyenda">
                    <div class="leyenda-item">
                        <span class="color-materia"></span>
                        <span>Materias</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="color-evento"></span>
                        <span>Eventos</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="color-inasistencia"></span>
                        <span>Inasistencias</span>
                    </div>
                </div>

                <div class="calendario-dias-semana">
                    <div class="dia-semana">Dom</div>
                    <div class="dia-semana">Lun</div>
                    <div class="dia-semana">Mar</div>
                    <div class="dia-semana">Mié</div>
                    <div class="dia-semana">Jue</div>
                    <div class="dia-semana">Vie</div>
                    <div class="dia-semana">Sáb</div>
                </div>

                <div class="calendario-grid" id="calendario-grid">
                    <!-- Los días se generan dinámicamente -->
                </div>

                <!-- Modal para agregar eventos/inasistencias -->
                <div class="modal" id="modal-calendario">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="modal-titulo">Agregar Evento</h3>
                            <span class="close" id="modal-close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="form-evento">
                                <input type="hidden" id="modal-fecha">
                                <input type="hidden" id="modal-tipo">
                                
                                <div class="form-group">
                                    <label for="modal-descripcion">Descripción:</label>
                                    <textarea id="modal-descripcion" rows="3" required></textarea>
                                </div>
                                
                                <div class="form-group" id="grupo-materia" style="display: none;">
                                    <label for="modal-materia">Materia:</label>
                                    <select id="modal-materia">
                                        <option value="">Selecciona una materia</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="modal-tipo-evento">Tipo:</label>
                                    <select id="modal-tipo-evento">
                                        <option value="examen">Examen</option>
                                        <option value="tarea">Tarea</option>
                                        <option value="recordatorio">Recordatorio</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                
                                <div class="modal-actions">
                                    <button type="button" class="btn-cancelar" id="btn-cancelar">Cancelar</button>
                                    <button type="submit" class="btn-guardar">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generarDiasCalendario() {
        const grid = document.getElementById('calendario-grid');
        grid.innerHTML = '';

        const primerDia = new Date(this.añoActual, this.mesActual, 1);
        const ultimoDia = new Date(this.añoActual, this.mesActual + 1, 0);
        
        const diaInicio = primerDia.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        const totalDias = ultimoDia.getDate();

        // Días del mes anterior
        for (let i = 0; i < diaInicio; i++) {
            const dia = document.createElement('div');
            dia.className = 'calendario-dia otro-mes';
            grid.appendChild(dia);
        }

        // Días del mes actual
        for (let diaNum = 1; diaNum <= totalDias; diaNum++) {
            const dia = document.createElement('div');
            dia.className = 'calendario-dia';
            dia.textContent = diaNum;
            
            const fechaCompleta = new Date(this.añoActual, this.mesActual, diaNum);
            dia.setAttribute('data-fecha', this.formatearFecha(fechaCompleta));

            // Verificar si es hoy
            if (this.esHoy(fechaCompleta)) {
                dia.classList.add('hoy');
            }

            // Agregar eventos del día
            this.agregarEventosAlDia(dia, fechaCompleta);

            // Hacer clickable
            dia.addEventListener('click', () => this.mostrarModalDia(fechaCompleta));

            grid.appendChild(dia);
        }
    }

    agregarEventosAlDia(diaElement, fecha) {
        const fechaStr = this.formatearFecha(fecha);
        
        // Materias de este día (basado en horarios semanales)
        const materiasHoy = this.obtenerMateriasDelDia(fecha);
        if (materiasHoy.length > 0) {
            const materiasContainer = document.createElement('div');
            materiasContainer.className = 'materias-container';
            
            materiasHoy.forEach(materia => {
                const materiaItem = document.createElement('div');
                materiaItem.className = 'materia-item';
                materiaItem.textContent = materia.nombre;
                materiaItem.title = `${materia.nombre} - ${this.obtenerHorariosMateria(materia, fecha)}`;
                materiasContainer.appendChild(materiaItem);
            });
            
            diaElement.appendChild(materiasContainer);
        }

        // Eventos de este día
        const eventosHoy = this.eventos.filter(evento => evento.fecha === fechaStr);
        if (eventosHoy.length > 0) {
            const eventoMarker = document.createElement('div');
            eventoMarker.className = 'evento-marker evento-marker';
            eventoMarker.title = `Eventos: ${eventosHoy.map(e => e.descripcion).join(', ')}`;
            diaElement.appendChild(eventoMarker);
        }

        // Inasistencias de este día
        const inasistenciasHoy = this.inasistencias.filter(inasistencia => inasistencia.fecha === fechaStr);
        if (inasistenciasHoy.length > 0) {
            const inasistenciaMarker = document.createElement('div');
            inasistenciaMarker.className = 'evento-marker inasistencia-marker';
            inasistenciaMarker.title = `Inasistencias: ${inasistenciasHoy.length}`;
            diaElement.appendChild(inasistenciaMarker);
        }
    }

    obtenerHorariosMateria(materia, fecha) {
        const diaSemana = fecha.getDay();
        const idDia = diaSemana === 0 ? 7 : diaSemana;
        
        const horariosDelDia = materia.horarios.filter(horario => horario.id_dia == idDia);
        return horariosDelDia.map(horario => horario.horario).join(', ');
    }

     mostrarModalDia(fecha) {
        const modal = document.getElementById('modal-calendario');
        const fechaStr = this.formatearFecha(fecha);
        
        document.getElementById('modal-fecha').value = fechaStr;
        document.getElementById('modal-titulo').textContent = `Agregar Evento - ${fechaStr}`;
        
        // Mostrar siempre el grupo de materia para eventos relacionados
        document.getElementById('grupo-materia').style.display = 'block';
        
        // Llenar select de materias
        this.llenarSelectMaterias();
        
        modal.style.display = 'block';
    }
    
    obtenerMateriasDelDia(fecha) {
        const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        // Mapear día de la semana a id_dia (asumiendo: 1=Lunes, 2=Martes, ..., 7=Domingo)
        const idDia = diaSemana === 0 ? 7 : diaSemana;
        
        return this.materias.filter(materia => 
            materia.horarios.some(horario => horario.id_dia == idDia)
        );
    }

    esHoy(fecha) {
        const hoy = new Date();
        return fecha.getDate() === hoy.getDate() &&
               fecha.getMonth() === hoy.getMonth() &&
               fecha.getFullYear() === hoy.getFullYear();
    }

    formatearFecha(fecha) {
        return fecha.toISOString().split('T')[0];
    }

    configurarEventos() {
        // Navegación del calendario
        document.getElementById('btn-prev').addEventListener('click', () => this.mesAnterior());
        document.getElementById('btn-next').addEventListener('click', () => this.mesSiguiente());
        document.getElementById('btn-hoy').addEventListener('click', () => this.irAHoy());

        // Modal
        document.getElementById('modal-close').addEventListener('click', () => this.cerrarModal());
        document.getElementById('btn-cancelar').addEventListener('click', () => this.cerrarModal());
        document.getElementById('form-evento').addEventListener('submit', (e) => this.guardarEvento(e));

        // Cambiar tipo de registro
        document.getElementById('modal-tipo-evento').addEventListener('change', (e) => {
            this.actualizarFormularioModal(e.target.value);
        });
    }

    mesAnterior() {
        this.mesActual--;
        if (this.mesActual < 0) {
            this.mesActual = 11;
            this.añoActual--;
        }
        this.generarDiasCalendario();
        this.actualizarTitulo();
    }

    mesSiguiente() {
        this.mesActual++;
        if (this.mesActual > 11) {
            this.mesActual = 0;
            this.añoActual++;
        }
        this.generarDiasCalendario();
        this.actualizarTitulo();
    }

    irAHoy() {
        this.fechaActual = new Date();
        this.mesActual = this.fechaActual.getMonth();
        this.añoActual = this.fechaActual.getFullYear();
        this.generarDiasCalendario();
        this.actualizarTitulo();
    }

    actualizarTitulo() {
        const nombresMeses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        document.querySelector('.calendario-titulo h2').textContent = 
            `${nombresMeses[this.mesActual]} ${this.añoActual}`;
    }

    mostrarModalDia(fecha) {
        const modal = document.getElementById('modal-calendario');
        const fechaStr = this.formatearFecha(fecha);
        
        document.getElementById('modal-fecha').value = fechaStr;
        document.getElementById('modal-titulo').textContent = `Agregar Evento - ${fechaStr}`;
        
        // Llenar select de materias
        this.llenarSelectMaterias();
        
        modal.style.display = 'block';
    }

    llenarSelectMaterias() {
        const select = document.getElementById('modal-materia');
        select.innerHTML = '<option value="">Selecciona una materia</option>';
        
        this.materias.forEach(materia => {
            const option = document.createElement('option');
            option.value = materia.id_materia;
            option.textContent = materia.nombre;
            select.appendChild(option);
        });
    }

    actualizarFormularioModal(tipo) {
        const grupoMateria = document.getElementById('grupo-materia');
        
        if (tipo === 'inasistencia') {
            grupoMateria.style.display = 'block';
        } else {
            grupoMateria.style.display = 'none';
        }
    }

    async guardarEvento(e) {
        e.preventDefault();
        
        const fecha = document.getElementById('modal-fecha').value;
        const descripcion = document.getElementById('modal-descripcion').value;
        const tipoEvento = document.getElementById('modal-tipo-evento').value;
        const idMateria = document.getElementById('modal-materia').value;

        try {
            const formData = new FormData();
            formData.append('fecha', fecha);
            formData.append('descripcion', descripcion);
            formData.append('tipo_evento', tipoEvento);
            formData.append('id_materia', idMateria);
            formData.append('id_alumnos', this.alumnoId);

            const response = await fetch('../controles/calendario.php?action=guardar_evento', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert('Evento guardado exitosamente');
                this.cerrarModal();
                await this.cargarDatos();
                this.generarDiasCalendario();
            } else {
                alert('Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error guardando evento:', error);
            alert('Error al guardar el evento');
        }
    }

    cerrarModal() {
        document.getElementById('modal-calendario').style.display = 'none';
        document.getElementById('form-evento').reset();
    }
}