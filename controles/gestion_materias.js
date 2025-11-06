// Módulo unificado de gestión de materias
class GestionMaterias {
    constructor() {
        this.form = null;
        this.alumnoId = null;
        this.materias = [];
    }

    // ==================== MÉTODOS PARA FORMULARIO (CONFIGURACIÓN) ====================

    // Método específico para inicializar el formulario
    inicializarFormulario() {
        console.log('Inicializando GestionMaterias para FORMULARIO...');
        this.form = document.getElementById('form-materia-completa');
        
        if (this.form) {
            this.configurarEventListenersFormulario();
            this.cargarTodasMaterias(); // Cargar todas las materias para mostrar en configuración
            console.log('GestionMaterias (formulario) inicializado correctamente');
        } else {
            console.error('Formulario de materias no encontrado - probablemente no estamos en configuración');
        }
    }

    configurarEventListenersFormulario() {
        // Botón agregar horario
        const btnAgregarHorario = document.querySelector('.btn-add');
        if (btnAgregarHorario) {
            btnAgregarHorario.addEventListener('click', () => this.agregarHorario());
        }

        // Botón limpiar formulario
        const btnLimpiar = document.querySelector('.btn-cancel');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => this.limpiarFormulario());
        }

        // Formulario submit
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.guardarMateriaCompleta(e));
        }

        // Configurar botones eliminar existentes
        this.configurarBotonesEliminarExistentes();
        this.actualizarBotonesEliminar();
    }

    // ==================== MÉTODOS PARA VISUALIZACIÓN (MENÚ MATERIAS) ====================

    // Método específico para cargar materias del alumno (menú "Mis Materias")
    async cargarMateriasAlumno(alumnoId) {
        this.alumnoId = alumnoId;
        console.log('Cargando materias del alumno:', alumnoId);
        
        try {
            await this.obtenerMateriasAlumno();
            this.renderizarMateriasAlumno();
        } catch (error) {
            console.error('Error cargando materias del alumno:', error);
            this.mostrarErrorMaterias('Error al cargar las materias: ' + error.message);
        }
    }

    // Obtener materias del alumno específico
    async obtenerMateriasAlumno() {
        const response = await fetch(`../controles/materias.php?action=obtener_materias_alumno&alumno_id=${this.alumnoId}`);
        const result = await response.json();

        if (result.success) {
            this.materias = result.data;
            console.log(`Materias del alumno cargadas: ${this.materias.length}`);
        } else {
            throw new Error(result.message);
        }
    }

    // Renderizar materias del alumno (vista de tabla)
    renderizarMateriasAlumno() {
        const container = document.getElementById('materias-list');
        
        if (!container) {
            console.error('Contenedor de materias-list no encontrado');
            return;
        }

        if (this.materias.length === 0) {
            container.innerHTML = this.getEmptyStateAlumno();
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

    // ==================== MÉTODOS PARA TODAS LAS MATERIAS (CONFIGURACIÓN) ====================

    // Obtener todas las materias (para el formulario en configuración)
    async cargarTodasMaterias() {
        try {
            const response = await fetch('../controles/materias.php?action=obtener_todas_materias');
            const result = await response.json();

            if (result.success) {
                this.materias = result.data;
                this.renderizarTodasMaterias();
                console.log(`Todas las materias cargadas: ${this.materias.length}`);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error cargando todas las materias:', error);
            this.mostrarErrorMaterias('Error al cargar las materias: ' + error.message);
        }
    }

    // Renderizar todas las materias (vista de cards para formulario)
    renderizarTodasMaterias() {
        const container = document.getElementById('lista-materias');
        
        if (!container) {
            console.log('Contenedor de lista-materias no encontrado - no estamos en configuración');
            return;
        }

        if (this.materias.length === 0) {
            container.innerHTML = this.getEmptyStateTodas();
            return;
        }

        container.innerHTML = this.materias.map(materia => `
            <div class="materia-card">
                <div class="materia-header">
                    <div class="materia-nombre">${materia.nombre}</div>
                </div>
                
                <div class="profesor-info">
                    <div class="profesor-nombre">👨‍🏫 Profesor: ${materia.profesor_nombre} ${materia.profesor_apellido}</div>
                    ${materia.profesor_email ? `<div class="profesor-email">📧 ${materia.profesor_email}</div>` : ''}
                </div>
                
                <div class="horarios-list">
                    <strong>🕒 Horarios:</strong>
                    ${materia.horarios && materia.horarios.length > 0 
                        ? materia.horarios.map(horario => `
                            <div class="horario-item-list">
                                <span class="dia-horario">${horario.nombre_dia}</span>
                                <span class="hora">${horario.horario}</span>
                            </div>
                        `).join('')
                        : '<div class="no-horarios">No hay horarios asignados</div>'
                    }
                </div>
            </div>
        `).join('');
    }

    // ==================== MÉTODOS COMPARTIDOS ====================

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

    getEmptyStateAlumno() {
        return `
            <div class="empty-state">
                <i class="fas fa-book" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                <h3>No tienes materias asignadas</h3>
                <p>Contacta con la administración para que te asignen materias.</p>
            </div>
        `;
    }

    getEmptyStateTodas() {
        return `
            <div class="empty-message">
                <h3>📚 Aún no tienes materias registradas</h3>
                <p>Comienza agregando tu primera materia usando el formulario de arriba</p>
            </div>
        `;
    }

    mostrarErrorMaterias(mensaje) {
        const container = document.getElementById('materias-list') || document.getElementById('lista-materias');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar las materias</h3>
                    <p>${mensaje}</p>
                </div>
            `;
        }
    }

    // ==================== MÉTODOS DEL FORMULARIO ====================

    configurarBotonesEliminarExistentes() {
        const botones = document.querySelectorAll('.btn-remove');
        botones.forEach(boton => {
            boton.addEventListener('click', (e) => {
                e.preventDefault();
                this.removerHorario(boton);
            });
        });
    }

    agregarHorario() {
        const container = document.getElementById('horarios-container');
        if (!container) {
            console.error('Contenedor de horarios no encontrado');
            return;
        }

        const nuevoHorario = document.createElement('div');
        nuevoHorario.className = 'horario-item';
        nuevoHorario.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Día</label>
                    <select name="dias[]" required>
                        <option value="">Selecciona un día</option>
                        <option value="1">Lunes</option>
                        <option value="2">Martes</option>
                        <option value="3">Miércoles</option>
                        <option value="4">Jueves</option>
                        <option value="5">Viernes</option>
                        <option value="6">Sábado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Horario</label>
                    <input type="time" name="horarios[]" required>
                </div>
                <div class="form-group">
                    <label>&nbsp;</label>
                    <button type="button" class="btn-remove">
                        ❌
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(nuevoHorario);
        
        // Agregar event listener al nuevo botón eliminar
        const btnRemove = nuevoHorario.querySelector('.btn-remove');
        if (btnRemove) {
            btnRemove.addEventListener('click', (e) => {
                e.preventDefault();
                this.removerHorario(btnRemove);
            });
        }
        
        this.actualizarBotonesEliminar();
    }

    removerHorario(boton) {
        const horarioItem = boton.closest('.horario-item');
        if (horarioItem) {
            horarioItem.remove();
            this.actualizarBotonesEliminar();
        }
    }

    actualizarBotonesEliminar() {
        const horarios = document.querySelectorAll('.horario-item');
        const botones = document.querySelectorAll('.btn-remove');
        
        // Mostrar botón de eliminar solo si hay más de un horario
        botones.forEach(boton => {
            boton.style.display = horarios.length > 1 ? 'block' : 'none';
        });
    }

    limpiarFormulario() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el formulario?')) {
            if (this.form) {
                this.form.reset();
                
                const container = document.getElementById('horarios-container');
                if (container) {
                    while (container.children.length > 1) {
                        container.lastChild.remove();
                    }
                    
                    const primerHorario = container.querySelector('.horario-item');
                    if (primerHorario) {
                        const select = primerHorario.querySelector('select');
                        const input = primerHorario.querySelector('input[type="time"]');
                        if (select) select.value = '';
                        if (input) input.value = '';
                    }
                }
                
                this.actualizarBotonesEliminar();
            }
        }
    }

    async guardarMateriaCompleta(e) {
        e.preventDefault();
        
        if (!this.form) {
            alert('Error: Formulario no disponible');
            return;
        }
        
        const formData = new FormData(this.form);
        
        const nombreMateria = formData.get('nombre_materia')?.trim();
        const nombreProfesor = formData.get('nombre_profesor')?.trim();
        const apellidoProfesor = formData.get('apellido_profesor')?.trim();
        
        if (!nombreMateria || !nombreProfesor || !apellidoProfesor) {
            alert('Por favor completa los campos obligatorios (*)');
            return;
        }
        
        const dias = formData.getAll('dias[]');
        const horarios = formData.getAll('horarios[]');
        
        if (dias.length === 0 || horarios.length === 0 || 
            dias.some(dia => !dia) || horarios.some(horario => !horario)) {
            alert('Por favor agrega al menos un día y horario válido');
            return;
        }
        
        try {
            const submitBtn = this.form.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Guardando...';
            submitBtn.disabled = true;
            
            const response = await fetch('../controles/materias.php?action=guardar_materia_completa', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Materia guardada exitosamente');
                this.limpiarFormulario();
                this.cargarTodasMaterias(); // Recargar la lista después de guardar
            } else {
                alert('❌ Error: ' + (result.message || 'Error desconocido'));
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error: ' + error.message);
        } finally {
            const submitBtn = this.form.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.innerHTML = '💾 Guardar Materia Completa';
                submitBtn.disabled = false;
            }
        }
    }
}

// Crear instancia global
window.gestionMaterias = new GestionMaterias();