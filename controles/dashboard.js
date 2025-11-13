// ======================================================================
// CLASE DASHBOARD - SISTEMA PRINCIPAL DE NAVEGACIÓN ACADÉMICA
// ======================================================================
// 
// Esta clase maneja el dashboard principal del alumno, coordinando todos
// los módulos del sistema y la navegación entre ellos.
// 
// FUNCIONALIDADES PRINCIPALES:
// - Verificación y gestión de sesión de usuario
// - Carga dinámica de menú lateral
// - Navegación entre módulos (Calendario, Materias, Inasistencias, etc.)
// - Gestión de configuración y perfil de usuario
// - Carga modular de componentes
// 
// ESTRUCTURA DE MÉTODOS:
// 1.  Constructor e inicialización
// 2.  Gestión de sesión y autenticación
// 3.  Carga y configuración del menú
// 4.  Navegación entre módulos
// 5.  Carga de módulos específicos
// 6.  Gestión de configuración y perfil
// 7.  Utilidades y funciones globales
// ======================================================================

class Dashboard {
    // ======================================================================
    // 1. CONSTRUCTOR E INICIALIZACIÓN
    // ======================================================================
    
    constructor() {
        this.alumnoId = null;
        this.alumnoNombre = '';
        this.alumnoApellido = '';
        this.alumnoDni = '';
        this.alumnoAnio = '';
        this.alumnoDivision = '';
        this.alumnoEmail = '';
        this.moduloActual = 'calendario';
    }

    async init() {
        await this.verificarSesion();
        await this.cargarMenu();
        await this.cargarModulo(this.moduloActual);
        this.actualizarInfoUsuario();
    }

    // ======================================================================
    // 2. GESTIÓN DE SESIÓN Y AUTENTICACIÓN
    // ======================================================================

    async verificarSesion() {
        try {
            const response = await fetch('../controles/verificar_sesion.php');
            const result = await response.json();

            if (!result.success) {
                window.location.href = 'login.html';
                return;
            }

            this.alumnoId = result.alumno.id_alumnos;
            this.alumnoNombre = result.alumno.nombre;
            this.alumnoApellido = result.alumno.apellido;
            this.alumnoDni = result.alumno.dni;
            this.alumnoAnio = result.alumno.anio;
            this.alumnoDivision = result.alumno.division;
            this.alumnoEmail = result.alumno.email;

        } catch (error) {
            console.error('Error verificando sesión:', error);
            window.location.href = 'login.html';
        }
    }

    // ======================================================================
    // 3. CARGA Y CONFIGURACIÓN DEL MENÚ
    // ======================================================================

    async cargarMenu() {
        try {
            const response = await fetch('componentes/menu_vertical.html');
            const menuHTML = await response.text();
            document.getElementById('menu-vertical').innerHTML = menuHTML;
            this.configurarMenu();
        } catch (error) {
            console.error('Error cargando menú:', error);
        }
    }

    configurarMenu() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const modulo = item.getAttribute('data-modulo');
                this.cambiarModulo(modulo);
            });
        });
        this.marcarModuloActivo();
    }

    // ======================================================================
    // 4. NAVEGACIÓN ENTRE MÓDULOS
    // ======================================================================

    async cambiarModulo(modulo) {
        if (this.moduloActual === modulo) return;
        this.moduloActual = modulo;
        this.marcarModuloActivo();
        await this.cargarModulo(modulo);
    }

    marcarModuloActivo() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-modulo') === this.moduloActual) {
                item.classList.add('active');
            }
        });

        const titulos = {
            'calendario': 'Calendario',
            'materias': 'Mis Materias',
            'inasistencias': 'Mis Inasistencias',
            'eventos': 'Eventos',
            'configuracion': 'Configuración'
        };
        document.getElementById('page-title').textContent = titulos[this.moduloActual] || 'Panel del Alumno';
    }

    async cargarModulo(modulo) {
        const contentArea = document.getElementById('content-area');

        try {
            contentArea.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Cargando ${modulo}...</p>
                </div>
            `;

            switch (modulo) {
                case 'calendario':
                    await this.cargarCalendario();
                    break;
                case 'materias':
                    await this.cargarMaterias();
                    break;
                case 'inasistencias':
                    await this.cargarInasistencias();
                    break;
                case 'eventos':
                    await this.cargarEventos();
                    break;
                case 'configuracion':
                    await this.cargarConfiguracion();
                    break;
                default:
                    await this.cargarCalendario();
            }

        } catch (error) {
            console.error(`Error cargando módulo ${modulo}:`, error);
            contentArea.innerHTML = `
                <div class="error-container">
                    <h3>❌ Error al cargar el módulo</h3>
                    <p>${error.message}</p>
                    <button onclick="dashboard.cargarModulo('${modulo}')" class="btn-primary">Reintentar</button>
                </div>
            `;
        }
    }

    // ======================================================================
    // 5. CARGA DE MÓDULOS ESPECÍFICOS
    // ======================================================================

    async cargarCalendario() {
        if (typeof Calendario !== 'undefined') {
            const calendario = new Calendario(this.alumnoId);
            await calendario.inicializar();
        } else {
            throw new Error('Módulo de calendario no disponible');
        }
    }

    // En el método cargarMaterias, agregar los estilos CSS para los nuevos badges
async cargarMaterias() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="module-container">
            <h2>📚 Mis Materias</h2>
            <style>
                .badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                .badge-duracion {
                    background-color: #e3f2fd;
                    color: #1976d2;
                    border: 1px solid #bbdefb;
                }
                .estado-cursando {
                    background-color: #e8f5e8;
                    color: #2e7d32;
                    border: 1px solid #c8e6c9;
                }
                .estado-recursando {
                    background-color: #fff3e0;
                    color: #ef6c00;
                    border: 1px solid #ffe0b2;
                }
                .estado-intensificando {
                    background-color: #e3f2fd;
                    color: #1565c0;
                    border: 1px solid #bbdefb;
                }
                .materia-duracion, .materia-estado {
                    text-align: center;
                }
            </style>
            <div id="materias-list">
                <div class="loading-message">Cargando materias...</div>
            </div>
        </div>
    `;
    
    if (typeof GestorMaterias !== 'undefined') {
        const gestor = new GestorMaterias(this.alumnoId);
        await gestor.inicializar();
    } else {
        throw new Error('Módulo de materias no disponible');
    }
}

    async cargarEventos() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="module-container">
                <h2>📋 Eventos</h2>
                <div id="eventos-list">
                    <div class="loading-message">Cargando eventos...</div>
                </div>
            </div>
        `;

        if (typeof VerEventos !== 'undefined') {
            console.log('Inicializando VerEventos...');
            window.verEventos = new VerEventos(this.alumnoId);
            await window.verEventos.inicializar();
        } else {
            console.error('VerEventos no está definido');
            throw new Error('Módulo de eventos no disponible');
        }
    }

    async cargarInasistencias() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="module-container">
                <h2>📅 Mis Inasistencias</h2>
                <div id="inasistencias-list">
                    <div class="loading-message">Cargando inasistencias...</div>
                </div>
            </div>
        `;

        if (typeof GestorInasistencias !== 'undefined') {
            window.gestorInasistencias = new GestorInasistencias(this.alumnoId);
            await window.gestorInasistencias.inicializar();
        } else {
            throw new Error('Módulo de inasistencias no disponible');
        }
    }

    // ======================================================================
    // 6. GESTIÓN DE CONFIGURACIÓN Y PERFIL
    // ======================================================================

    async cargarConfiguracion() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="module-container">
                <h2>⚙️ Configuración</h2>
                
                <div class="config-tabs">
                    <button class="tab-btn active" data-tab="agregar-materia">➕ Agregar Materia</button>
                    <button class="tab-btn" data-tab="cuenta">👤 Cuenta</button>
                </div>
                
                <div class="tab-content">
                    <div id="agregar-materia" class="tab-pane active">
                        <div id="gestion-materias-container">
                            <div class="loading-message">Cargando formulario...</div>
                        </div>
                    </div>
                    
                    <div id="cuenta" class="tab-pane">
                        <div class="config-section">
                            <h3>Información de la Cuenta</h3>
                            <div class="info-item">
                                <label>Nombre:</label>
                                <span>${this.alumnoNombre} ${this.alumnoApellido}</span>
                            </div>
                            <div class="info-item">
                                <label>DNI:</label>
                                <span>${this.alumnoDni || 'No disponible'}</span>
                            </div>
                            <div class="info-item">
                                <label>Curso:</label>
                                <span>${this.alumnoAnio}° ${this.alumnoDivision}</span>
                            </div>
                            <div class="info-item">
                                <label>Email:</label>
                                <span>${this.alumnoEmail || 'No disponible'}</span>
                            </div>
                        </div>
                        
                        <div class="config-section">
                            <h3>Cambiar Contraseña</h3>
                            <form id="form-cambiar-password">
                                <div class="form-group">
                                    <label for="password-actual">Contraseña Actual:</label>
                                    <input type="password" id="password-actual" required>
                                </div>
                                <div class="form-group">
                                    <label for="password-nueva">Nueva Contraseña:</label>
                                    <input type="password" id="password-nueva" required minlength="8">
                                    <small class="form-text">Mínimo 8 caracteres</small>
                                </div>
                                <div class="form-group">
                                    <label for="password-confirmar">Confirmar Nueva Contraseña:</label>
                                    <input type="password" id="password-confirmar" required>
                                </div>
                                <button type="submit" class="btn-primary">Cambiar Contraseña</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.configurarTabs();
        await this.cargarFormularioGestionMaterias();
        this.configurarCambioPassword();
    }

    configurarTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    async cargarFormularioGestionMaterias() {
        const container = document.getElementById('gestion-materias-container');

        try {
            const response = await fetch('componentes/formulario_materias.html');
            const formularioHTML = await response.text();
            container.innerHTML = formularioHTML;
            this.inicializarGestionMaterias();
        } catch (error) {
            console.error('Error cargando formulario de materias:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar el formulario</h3>
                    <p>No se pudo cargar el formulario de gestión de materias.</p>
                    <button onclick="dashboard.cargarFormularioGestionMaterias()" class="btn-primary">Reintentar</button>
                </div>
            `;
        }
    }

    inicializarGestionMaterias() {
        if (typeof window.gestionMaterias !== 'undefined') {
            window.gestionMaterias.inicializarFormulario();
        } else {
            console.error('Módulo de gestión de materias no disponible');
        }
    }

    configurarCambioPassword() {
        const form = document.getElementById('form-cambiar-password');
        if (form) {
            form.addEventListener('submit', (e) => this.cambiarPassword(e));
        }
    }

    async cambiarPassword(e) {
        e.preventDefault();
        
        const passwordActual = document.getElementById('password-actual').value;
        const passwordNueva = document.getElementById('password-nueva').value;
        const passwordConfirmar = document.getElementById('password-confirmar').value;
        
        if (!passwordActual || !passwordNueva || !passwordConfirmar) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        if (passwordNueva.length < 8) {
            alert('La nueva contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        if (passwordNueva !== passwordConfirmar) {
            alert('Las contraseñas nuevas no coinciden');
            return;
        }
        
        if (passwordNueva === passwordActual) {
            alert('La nueva contraseña debe ser diferente a la actual');
            return;
        }
        
        try {
            const response = await fetch('../controles/cambiar_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    alumno_id: this.alumnoId,
                    password_actual: passwordActual,
                    password_nueva: passwordNueva
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Contraseña cambiada exitosamente');
                document.getElementById('form-cambiar-password').reset();
            } else {
                alert('❌ Error: ' + result.message);
            }
            
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            alert('❌ Error al cambiar la contraseña');
        }
    }

    // ======================================================================
    // 7. UTILIDADES Y FUNCIONES GLOBALES
    // ======================================================================

    actualizarInfoUsuario() {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = `${this.alumnoNombre} ${this.alumnoApellido}`;
        }
        
        const menuUserName = document.getElementById('menu-user-name');
        if (menuUserName) {
            menuUserName.textContent = `${this.alumnoNombre} ${this.alumnoApellido}`;
        }
    }
}

// ======================================================================
// FUNCIONES GLOBALES DEL SISTEMA
// ======================================================================

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        fetch('../controles/cerrar_sesion.php', {
            method: 'POST'
        })
            .then(() => {
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Error cerrando sesión:', error);
                window.location.href = 'login.html';
            });
    }
}

// ======================================================================
// INICIALIZACIÓN DEL SISTEMA
// ======================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Dashboard...');
    window.dashboard = new Dashboard();
    window.dashboard.init();
});