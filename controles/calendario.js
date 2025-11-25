// ======================================================================
// CLASE CALENDARIO - SISTEMA DE GESTIÓN ACADÉMICA VISUAL
// ======================================================================
// 
// Esta clase maneja la visualización y gestión de un calendario académico
// que incluye: materias, eventos e inasistencias del alumno.
// 
// FUNCIONALIDADES PRINCIPALES:
// - Visualización mensual con navegación entre meses
// - Marcado de materias según horarios semanales
// - Registro de eventos académicos (exámenes, tareas, recordatorios)
// - Registro de inasistencias (justificadas/no justificadas)
// - Modal interactivo para agregar registros
// - Sincronización con backend mediante APIs
// 
// ESTRUCTURA DE MÉTODOS:
// 1.  Constructor e inicialización
// 2.  Carga de datos desde servidor
// 3.  Renderizado del calendario
// 4.  Generación de días y eventos
// 5.  Gestión del modal de registros
// 6.  Navegación del calendario
// 7.  Guardado de datos en servidor
// ======================================================================

class Calendario {
    // ======================================================================
    // 1. CONSTRUCTOR E INICIALIZACIÓN
    // ======================================================================
    
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

    // ======================================================================
    // 2. CARGA DE DATOS DESDE SERVIDOR
    // ======================================================================

    async cargarDatos() {
        try {
            // Cargar materias con horarios desde calendario.php
            const responseMaterias = await fetch(`../controles/calendario.php?action=obtener_materias&alumno_id=${this.alumnoId}`);
            const resultMaterias = await responseMaterias.json();
            if (resultMaterias.success) this.materias = resultMaterias.data;

            // Cargar eventos académicos desde calendario.php
            const responseEventos = await fetch(`../controles/calendario.php?action=obtener_eventos&alumno_id=${this.alumnoId}`);
            const resultEventos = await responseEventos.json();
            if (resultEventos.success) this.eventos = resultEventos.data;

            // Cargar inasistencias desde calendario.php
            const responseInasistencias = await fetch(`../controles/calendario.php?action=obtener_inasistencias&alumno_id=${this.alumnoId}`);
            const resultInasistencias = await responseInasistencias.json();
            if (resultInasistencias.success) this.inasistencias = resultInasistencias.data;

        } catch (error) {
            console.error('Error cargando datos del calendario:', error);
        }
    }

    // ======================================================================
    // 3. RENDERIZADO DEL CALENDARIO
    // ======================================================================

    renderizarCalendario() {
        const container = document.getElementById('content-area');
        container.innerHTML = this.generarHTMLCalendario();
        this.generarDiasCalendario();
    }

    generarHTMLCalendario() {
        const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        return `
            <div class="calendario-container">
                <div class="calendario-header">
                    <button class="btn-nav" id="btn-prev"><i class="fas fa-chevron-left"></i></button>
                    <div class="calendario-titulo"><h2>${nombresMeses[this.mesActual]} ${this.añoActual}</h2></div>
                    <button class="btn-nav" id="btn-next"><i class="fas fa-chevron-right"></i></button>
                    <button class="btn-hoy" id="btn-hoy">Hoy</button>
                </div>

                <div class="calendario-leyenda">
                    <div class="leyenda-item"><span class="color-materia"></span><span>Materias</span></div>
                    <div class="leyenda-item"><span class="color-evento"></span><span>Eventos</span></div>
                    <div class="leyenda-item"><span class="color-inasistencia"></span><span>Inasistencias</span></div>
                </div>

                <div class="calendario-dias-semana">
                    <div class="dia-semana">Dom</div><div class="dia-semana">Lun</div><div class="dia-semana">Mar</div>
                    <div class="dia-semana">Mié</div><div class="dia-semana">Jue</div><div class="dia-semana">Vie</div>
                    <div class="dia-semana">Sáb</div>
                </div>

                <div class="calendario-grid" id="calendario-grid"></div>

                <div class="modal" id="modal-calendario">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="modal-titulo">Agregar Registro</h3>
                            <span class="close" id="modal-close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="modal-tipo-registro">Tipo de Registro:</label>
                                <select id="modal-tipo-registro" class="tipo-registro-select">
                                    <option value="evento">Evento</option>
                                    <option value="inasistencia">Inasistencia</option>
                                </select>
                            </div>

                            <form id="form-evento" class="formulario-tipo">
                                <input type="hidden" id="modal-fecha">
                                <div class="form-group">
                                    <label for="modal-descripcion">Descripción:</label>
                                    <textarea id="modal-descripcion" rows="3" required></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="modal-materia-evento">Materia:</label>
                                    <select id="modal-materia-evento"><option value="">Selecciona una materia</option></select>
                                </div>
                                <div class="form-group">
                                    <label for="modal-tipo-evento">Tipo de Evento:</label>
                                    <select id="modal-tipo-evento">
                                        <option value="examen">Examen</option>
                                        <option value="tarea">Tarea</option>
                                        <option value="recordatorio">Recordatorio</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div class="modal-actions">
                                    <button type="button" class="btn-cancelar" id="btn-cancelar">Cancelar</button>
                                    <button type="submit" class="btn-guardar">Guardar Evento</button>
                                </div>
                            </form>

                            <form id="form-inasistencia" class="formulario-tipo" style="display: none;">
                                <input type="hidden" id="modal-fecha-inasistencia">
                                <div class="form-group">
                                    <label for="modal-materia-inasistencia">Materia:</label>
                                    <select id="modal-materia-inasistencia"><option value="">Selecciona una materia</option></select>
                                </div>
                                <div class="form-group">
                                    <label><input type="checkbox" id="modal-justificada"> Justificada?</label>
                                </div>
                                <div class="modal-actions">
                                    <button type="button" class="btn-cancelar" id="btn-cancelar-inasistencia">Cancelar</button>
                                    <button type="submit" class="btn-guardar">Guardar Inasistencia</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ======================================================================
    // 4. GENERACIÓN DE DÍAS Y EVENTOS
    // ======================================================================

    generarDiasCalendario() {
        const grid = document.getElementById('calendario-grid');
        grid.innerHTML = '';

        const primerDia = new Date(this.añoActual, this.mesActual, 1);
        const ultimoDia = new Date(this.añoActual, this.mesActual + 1, 0);
        const diaInicio = primerDia.getDay();
        const totalDias = ultimoDia.getDate();

        for (let i = 0; i < diaInicio; i++) {
            const dia = document.createElement('div');
            dia.className = 'calendario-dia otro-mes';
            grid.appendChild(dia);
        }

        for (let diaNum = 1; diaNum <= totalDias; diaNum++) {
            const dia = document.createElement('div');
            dia.className = 'calendario-dia';
            dia.textContent = diaNum;
            
            const fechaCompleta = new Date(this.añoActual, this.mesActual, diaNum);
            dia.setAttribute('data-fecha', this.formatearFecha(fechaCompleta));

            if (this.esHoy(fechaCompleta)) dia.classList.add('hoy');

            this.agregarEventosAlDia(dia, fechaCompleta);
            dia.addEventListener('click', () => this.mostrarModalDia(fechaCompleta));
            grid.appendChild(dia);
        }
    }

    agregarEventosAlDia(diaElement, fecha) {
        const fechaStr = this.formatearFecha(fecha);
        
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

        const eventosHoy = this.eventos.filter(evento => evento.fecha === fechaStr);
        if (eventosHoy.length > 0) {
            const eventoMarker = document.createElement('div');
            eventoMarker.className = 'evento-marker evento-marker';
            eventoMarker.title = `Eventos: ${eventosHoy.map(e => e.descripcion).join(', ')}`;
            diaElement.appendChild(eventoMarker);
        }

        const inasistenciasHoy = this.inasistencias.filter(inasistencia => inasistencia.fecha === fechaStr);
        if (inasistenciasHoy.length > 0) {
            const inasistenciaMarker = document.createElement('div');
            inasistenciaMarker.className = 'evento-marker inasistencia-marker';
            inasistenciaMarker.title = `Inasistencias: ${inasistenciasHoy.length}`;
            diaElement.appendChild(inasistenciaMarker);
        }
    }

    obtenerMateriasDelDia(fecha) {
        const diaSemana = fecha.getDay();
        const idDia = diaSemana === 0 ? 7 : diaSemana;
        return this.materias.filter(materia => 
            materia.horarios.some(horario => horario.id_dia == idDia)
        );
    }

    obtenerHorariosMateria(materia, fecha) {
        const diaSemana = fecha.getDay();
        const idDia = diaSemana === 0 ? 7 : diaSemana;
        const horariosDelDia = materia.horarios.filter(horario => horario.id_dia == idDia);
        return horariosDelDia.map(horario => horario.horario).join(', ');
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

    // ======================================================================
    // 5. GESTIÓN DEL MODAL DE REGISTROS
    // ======================================================================

    configurarEventos() {
        document.getElementById('btn-prev').addEventListener('click', () => this.mesAnterior());
        document.getElementById('btn-next').addEventListener('click', () => this.mesSiguiente());
        document.getElementById('btn-hoy').addEventListener('click', () => this.irAHoy());

        document.getElementById('modal-tipo-registro').addEventListener('change', (e) => {
            this.cambiarTipoRegistro(e.target.value);
        });

        document.getElementById('form-evento').addEventListener('submit', (e) => this.guardarEvento(e));
        document.getElementById('form-inasistencia').addEventListener('submit', (e) => this.guardarInasistencia(e));

        document.getElementById('modal-close').addEventListener('click', () => this.cerrarModal());
        document.getElementById('btn-cancelar').addEventListener('click', () => this.cerrarModal());
        document.getElementById('btn-cancelar-inasistencia').addEventListener('click', () => this.cerrarModal());
    }

    mostrarModalDia(fecha) {
        const modal = document.getElementById('modal-calendario');
        const fechaStr = this.formatearFecha(fecha);
        
        document.getElementById('modal-fecha').value = fechaStr;
        document.getElementById('modal-fecha-inasistencia').value = fechaStr;
        document.getElementById('modal-tipo-registro').value = 'evento';
        
        this.cambiarTipoRegistro('evento');
        this.llenarSelectMaterias();
        modal.style.display = 'block';
    }

    cambiarTipoRegistro(tipo) {
        const formEvento = document.getElementById('form-evento');
        const formInasistencia = document.getElementById('form-inasistencia');
        const tituloModal = document.getElementById('modal-titulo');

        if (tipo === 'evento') {
            formEvento.style.display = 'block';
            formInasistencia.style.display = 'none';
            tituloModal.textContent = 'Agregar Evento';
        } else if (tipo === 'inasistencia') {
            formEvento.style.display = 'none';
            formInasistencia.style.display = 'block';
            tituloModal.textContent = 'Registrar Inasistencia';
            this.llenarSelectMaterias();
        }
    }

    llenarSelectMaterias() {
        const selectEvento = document.getElementById('modal-materia-evento');
        const selectInasistencia = document.getElementById('modal-materia-inasistencia');
        
        selectEvento.innerHTML = '<option value="">Selecciona una materia</option>';
        selectInasistencia.innerHTML = '<option value="">Selecciona una materia</option>';
        
        this.materias.forEach(materia => {
            const optionEvento = document.createElement('option');
            optionEvento.value = materia.id_materia;
            optionEvento.textContent = materia.nombre;
            selectEvento.appendChild(optionEvento);
            
            const optionInasistencia = document.createElement('option');
            optionInasistencia.value = materia.id_materia;
            optionInasistencia.textContent = materia.nombre;
            selectInasistencia.appendChild(optionInasistencia);
        });
    }

    cerrarModal() {
        const modal = document.getElementById('modal-calendario');
        modal.style.display = 'none';
        document.getElementById('form-evento').reset();
        document.getElementById('form-inasistencia').reset();
        document.getElementById('modal-tipo-registro').value = 'evento';
    }

    // ======================================================================
    // 6. NAVEGACIÓN DEL CALENDARIO
    // ======================================================================

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
        const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        document.querySelector('.calendario-titulo h2').textContent = `${nombresMeses[this.mesActual]} ${this.añoActual}`;
    }

    // ======================================================================
    // 7. GUARDADO DE DATOS EN SERVIDOR
    // ======================================================================

    async guardarEvento(e) {
        e.preventDefault();
        
        const fecha = document.getElementById('modal-fecha').value;
        const descripcion = document.getElementById('modal-descripcion').value;
        const tipoEvento = document.getElementById('modal-tipo-evento').value;

        try {
            const formData = new FormData();
            formData.append('fecha', fecha);
            formData.append('descripcion', descripcion);
            formData.append('tipo_evento', tipoEvento);
            formData.append('id_alumnos', this.alumnoId);

            // Guardar evento mediante calendario.php
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

    async guardarInasistencia(e) {
        e.preventDefault();
        
        const fecha = document.getElementById('modal-fecha-inasistencia').value;
        const idMateria = document.getElementById('modal-materia-inasistencia').value;
        const justificada = document.getElementById('modal-justificada').checked ? '1' : '0';

        try {
            const formData = new FormData();
            formData.append('fecha', fecha);
            formData.append('id_materia', idMateria);
            formData.append('justificada', justificada);
            formData.append('id_alumnos', this.alumnoId);

            // Guardar inasistencia mediante inasistencias.php
            const response = await fetch('../controles/inasistencias.php?action=guardar_inasistencia', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert('Inasistencia registrada exitosamente');
                this.cerrarModal();
                await this.cargarDatos();
                this.generarDiasCalendario();
            } else {
                alert('Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error guardando inasistencia:', error);
            alert('Error al guardar la inasistencia');
        }
    }
}