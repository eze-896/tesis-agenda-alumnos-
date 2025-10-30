document.addEventListener('DOMContentLoaded', function() {
    // Cargar materias existentes al iniciar
    cargarMaterias();

    // Manejar el envío del formulario unificado
    document.getElementById('form-materia-completa').addEventListener('submit', async function(e) {
        e.preventDefault();
        await guardarMateriaCompleta();
    });
});

// Función para agregar más horarios
function agregarHorario() {
    const container = document.getElementById('horarios-container');
    const horarioCount = container.children.length;
    
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
                    <option value="7">Domingo</option>
                </select>
            </div>
            <div class="form-group">
                <label>Horario</label>
                <input type="time" name="horarios[]" required>
            </div>
            <div class="form-group">
                <label>&nbsp;</label>
                <button type="button" class="btn-remove" onclick="removerHorario(this)">
                    ❌
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(nuevoHorario);
    
    // Mostrar botón de eliminar en todos los horarios si hay más de uno
    actualizarBotonesEliminar();
}

// Función para remover horario
function removerHorario(boton) {
    const horarioItem = boton.closest('.horario-item');
    horarioItem.remove();
    actualizarBotonesEliminar();
}

// Actualizar visibilidad de botones eliminar
function actualizarBotonesEliminar() {
    const horarios = document.querySelectorAll('.horario-item');
    const botones = document.querySelectorAll('.btn-remove');
    
    // Mostrar botón de eliminar solo si hay más de un horario
    botones.forEach(boton => {
        boton.style.display = horarios.length > 1 ? 'block' : 'none';
    });
}

// Limpiar formulario
function limpiarFormulario() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el formulario?')) {
        document.getElementById('form-materia-completa').reset();
        
        // Dejar solo un horario
        const container = document.getElementById('horarios-container');
        while (container.children.length > 1) {
            container.lastChild.remove();
        }
        
        actualizarBotonesEliminar();
    }
}

// Guardar toda la información de la materia
async function guardarMateriaCompleta() {
    const form = document.getElementById('form-materia-completa');
    const formData = new FormData(form);
    
    // Validaciones básicas
    const nombreMateria = formData.get('nombre_materia').trim();
    const nombreProfesor = formData.get('nombre_profesor').trim();
    const apellidoProfesor = formData.get('apellido_profesor').trim();
    
    if (!nombreMateria || !nombreProfesor || !apellidoProfesor) {
        alert('Por favor completa los campos obligatorios (*)');
        return;
    }
    
    // Validar que haya al menos un horario
    const dias = formData.getAll('dias[]');
    const horarios = formData.getAll('horarios[]');
    
    if (dias.length === 0 || horarios.length === 0 || dias.some(dia => !dia) || horarios.some(horario => !horario)) {
        alert('Por favor agrega al menos un día y horario válido');
        return;
    }
    
    try {
        // Mostrar loading
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Guardando...';
        submitBtn.disabled = true;
        
        const response = await fetch('../controles/gestion_materias.php?action=guardar_completo', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Materia guardada exitosamente');
            // Limpiar solo los campos, no todo el formulario
            form.reset();
            // Dejar solo un horario
            const container = document.getElementById('horarios-container');
            while (container.children.length > 1) {
                container.lastChild.remove();
            }
            actualizarBotonesEliminar();
            cargarMaterias(); // Recargar la lista
        } else {
            alert('❌ Error: ' + (result.message || 'Error desconocido'));
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    } finally {
        // Restaurar botón
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.innerHTML = '💾 Guardar Materia Completa';
        submitBtn.disabled = false;
    }
}

// Cargar y mostrar todas las materias
async function cargarMaterias() {
    try {
        const response = await fetch('../controles/gestion_materias.php?action=obtener_todo');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Error al cargar materias');
        }
        
        const materias = result.data || [];
        const lista = document.getElementById('lista-materias');
        
        if (materias.length === 0) {
            lista.innerHTML = `
                <div class="empty-message">
                    <h3>📚 Aún no tienes materias registradas</h3>
                    <p>Comienza agregando tu primera materia usando el formulario de arriba</p>
                </div>
            `;
            return;
        }
        
        lista.innerHTML = materias.map(materia => `
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
                        : '<div class="empty-message">No hay horarios asignados</div>'
                    }
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error cargando materias:', error);
        document.getElementById('lista-materias').innerHTML = `
            <div class="empty-message">
                <h3>❌ Error al cargar las materias</h3>
                <p>${error.message}</p>
                <p><small>Verifica que todos los archivos PHP estén correctamente configurados.</small></p>
            </div>
        `;
    }
}