// Módulo de gestión de materias para FORMULARIO
class GestionMaterias {
    constructor() {
        this.form = null;
        this.materias = [];
        this.materiaEditando = null; // Para modo edición
    }

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

    // Renderizar todas las materias (vista de cards para formulario) CON BOTONES DE ACCIÓN
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
            <div class="materia-card" data-materia-id="${materia.id_materia}">
                <div class="materia-header">
                    <div class="materia-nombre">${materia.nombre}</div>
                    <div class="materia-actions">
                        <button class="btn-edit" data-materia-id="${materia.id_materia}" title="Editar materia">
                            ✏️
                        </button>
                        <button class="btn-delete" data-materia-id="${materia.id_materia}" title="Eliminar materia">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="materia-info">
                    <div class="materia-duracion">
                        <strong>⏱️ Duración:</strong> ${materia.duracion || 'N/A'} hora${materia.duracion > 1 ? 's' : ''}
                    </div>
                    <div class="materia-estado">
                        <strong>📊 Estado:</strong> ${this.formatearEstado(materia.estado)}
                    </div>
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

        // Agregar event listeners a los botones de acción
        this.configurarBotonesAccionCards();
    }

    // ==================== MÉTODOS DE ELIMINAR Y EDITAR ====================

    // Configurar botones de acción en las cards
    configurarBotonesAccionCards() {
        // Botones eliminar en cards
        const botonesEliminar = document.querySelectorAll('.btn-delete');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                e.preventDefault();
                const materiaId = boton.getAttribute('data-materia-id');
                this.eliminarMateria(materiaId);
            });
        });

        // Botones editar en cards
        const botonesEditar = document.querySelectorAll('.btn-edit');
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
                await this.cargarTodasMaterias();
            } else {
                alert('❌ Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error eliminando materia:', error);
            alert('❌ Error al eliminar la materia: ' + error.message);
        }
    }

    // Editar materia - cargar datos en el formulario
    async editarMateria(materiaId) {
        try {
            const response = await fetch(`../controles/materias.php?action=obtener_materia_completa&materia_id=${materiaId}`);
            const result = await response.json();

            if (result.success) {
                this.materiaEditando = result.data;
                this.cargarDatosEnFormulario(result.data);
                
                // Desplazar al formulario
                setTimeout(() => {
                    const formulario = document.getElementById('form-materia-completa');
                    if (formulario) {
                        formulario.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
                
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Error cargando datos de la materia:', error);
            alert('❌ Error al cargar los datos de la materia: ' + error.message);
        }
    }

    // Cargar datos en el formulario para edición
    cargarDatosEnFormulario(materia) {
        if (!this.form) {
            alert('Formulario no disponible');
            return;
        }

        // Llenar campos básicos
        document.getElementById('nombre-materia').value = materia.nombre || '';
        document.getElementById('duracion-materia').value = materia.duracion || '';
        document.getElementById('estado-materia').value = materia.estado || 'cursando';

        // Llenar datos del profesor
        document.getElementById('nombre-profesor').value = materia.profesor_nombre || '';
        document.getElementById('apellido-profesor').value = materia.profesor_apellido || '';
        document.getElementById('email-profesor').value = materia.profesor_email || '';

        // Limpiar horarios existentes
        const container = document.getElementById('horarios-container');
        if (container) {
            container.innerHTML = '';
            
            // Agregar horarios
            if (materia.horarios && materia.horarios.length > 0) {
                materia.horarios.forEach((horario, index) => {
                    this.agregarHorario();
                    
                    // Llenar el último horario agregado
                    const ultimoHorario = container.lastElementChild;
                    if (ultimoHorario) {
                        const selectDia = ultimoHorario.querySelector('select[name="dias[]"]');
                        const inputHorario = ultimoHorario.querySelector('input[name="horarios[]"]');
                        
                        if (selectDia) selectDia.value = horario.id_dia;
                        if (inputHorario) inputHorario.value = horario.horario;
                    }
                });
            } else {
                // Agregar un horario vacío si no hay horarios
                this.agregarHorario();
            }
        }

        // Cambiar texto del botón submit
        const submitBtn = this.form.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.innerHTML = '💾 Actualizar Materia';
            submitBtn.setAttribute('data-editing', 'true');
        }

        // Agregar botón cancelar edición si no existe
        if (!this.form.querySelector('.btn-cancel-edit')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn-cancel-edit';
            cancelBtn.innerHTML = '❌ Cancelar Edición';
            cancelBtn.style.marginLeft = '10px';
            cancelBtn.addEventListener('click', () => this.cancelarEdicion());
            
            const formActions = this.form.querySelector('.form-actions');
            if (formActions) {
                formActions.appendChild(cancelBtn);
            }
        }

        this.actualizarBotonesEliminar();
    }

    // Cancelar edición
    cancelarEdicion() {
    this.materiaEditando = null;
    
    // Resetear formulario SIN llamar a limpiarFormulario()
    if (this.form) {
        this.form.reset();
        
        // Limpiar horarios manualmente
        const container = document.getElementById('horarios-container');
        if (container) {
            // Mantener solo el primer horario
            while (container.children.length > 1) {
                container.lastChild.remove();
            }
            
            // Limpiar el primer horario
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
    
    // Restaurar botón submit
    const submitBtn = this.form.querySelector('.btn-submit');
    if (submitBtn) {
        submitBtn.innerHTML = '💾 Guardar Materia Completa';
        submitBtn.removeAttribute('data-editing');
    }

    // Remover botón cancelar
    const cancelBtn = this.form.querySelector('.btn-cancel-edit');
    if (cancelBtn) {
        cancelBtn.remove();
    }
}

    // ==================== MÉTODOS COMPARTIDOS ====================

    formatearEstado(estado) {
        const estados = {
            'cursando': '🟢 Cursando',
            'recursando': '🟠 Recursando', 
            'intensificando': '🔵 Intensificando'
        };
        return estados[estado] || '🟢 Cursando';
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
        const container = document.getElementById('lista-materias');
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

    // ==================== MÉTODOS DEL FORMULARIO (EXISTENTES) ====================

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
    try {
        const horarios = document.querySelectorAll('.horario-item');
        const botones = document.querySelectorAll('.btn-remove');
        
        // Si no hay elementos, salir
        if (horarios.length === 0) {
            return;
        }
        
        // Mostrar botón de eliminar solo si hay más de un horario
        botones.forEach(boton => {
            if (boton && typeof boton.style !== 'undefined') {
                boton.style.display = horarios.length > 1 ? 'block' : 'none';
            }
        });
    } catch (error) {
        console.warn('Error en actualizarBotonesEliminar:', error);
    }
}

    limpiarFormulario() {
    // Si estamos en modo edición, usar cancelarEdicion en su lugar
    if (this.materiaEditando) {
        this.cancelarEdicion();
        return;
    }
    
    // Limpieza normal del formulario (solo cuando NO estamos editando)
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

    async guardarMateriaCompleta(e) {
        e.preventDefault();
        
        if (!this.form) {
            alert('Error: Formulario no disponible');
            return;
        }
        
        const formData = new FormData(this.form);
        const estaEditando = this.materiaEditando !== null;
        
        const nombreMateria = formData.get('nombre_materia')?.trim();
        const duracionMateria = formData.get('duracion_materia');
        const estadoMateria = formData.get('estado_materia');
        const nombreProfesor = formData.get('nombre_profesor')?.trim();
        const apellidoProfesor = formData.get('apellido_profesor')?.trim();
        
        if (!nombreMateria || !nombreProfesor || !apellidoProfesor || !duracionMateria || !estadoMateria) {
            alert('Por favor completa todos los campos obligatorios (*)');
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
            submitBtn.innerHTML = estaEditando ? '⏳ Actualizando...' : '⏳ Guardando...';
            submitBtn.disabled = true;
            
            // Agregar ID de materia si estamos editando
            if (estaEditando) {
                formData.append('materia_id', this.materiaEditando.id_materia);
            }
            
            const response = await fetch(`../controles/materias.php?action=${estaEditando ? 'actualizar_materia_completa' : 'guardar_materia_completa'}`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`✅ Materia ${estaEditando ? 'actualizada' : 'guardada'} exitosamente`);
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
                submitBtn.innerHTML = estaEditando ? '💾 Actualizar Materia' : '💾 Guardar Materia Completa';
                submitBtn.disabled = false;
            }
        }
    }
}

// Crear instancia global
window.gestionMaterias = new GestionMaterias();