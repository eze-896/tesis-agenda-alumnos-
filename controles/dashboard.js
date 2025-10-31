class Dashboard {
    constructor() {
        this.alumnoId = null;
        this.alumnoNombre = '';
        this.alumnoApellido = '';
        this.alumnoDni = '';
        this.alumnoAnio = '';
        this.alumnoDivision = '';
        this.alumnoEmail = '';
        this.moduloActual = 'calendario';
        this.init();
    }

    async init() {
        await this.verificarSesion();
        await this.cargarMenu();
        await this.cargarModulo(this.moduloActual);
        this.actualizarInfoUsuario();
    }

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

    async cargarMenu() {
        try {
            const response = await fetch('componentes/menu_vertical.html');
            const menuHTML = await response.text();
            
            document.getElementById('menu-vertical').innerHTML = menuHTML;
            
            // Agregar event listeners a los items del menú
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

        // Marcar el módulo actual como activo
        this.marcarModuloActivo();
    }

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

        // Actualizar título de la página
        const titulos = {
            'calendario': 'Calendario',
            'materias': 'Mis Materias',
            'inasistencias': 'Mis Inasistencias',
            'eventos': 'Eventos',
            'perfil': 'Mi Perfil',
            'configuracion': 'Configuración'
        };
        
        document.getElementById('page-title').textContent = titulos[this.moduloActual] || 'Panel del Alumno';
    }

    async cargarModulo(modulo) {
        const contentArea = document.getElementById('content-area');
        
        try {
            // Mostrar loading
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
                case 'perfil':
                    await this.cargarPerfil();
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

    async cargarCalendario() {
        // Inicializar el calendario
        if (typeof Calendario !== 'undefined') {
            const calendario = new Calendario(this.alumnoId);
            await calendario.inicializar();
        } else {
            throw new Error('Módulo de calendario no disponible');
        }
    }

    async cargarMaterias() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="module-container">
            <h2>📚 Mis Materias</h2>
            <div id="materias-list">
                <div class="loading-message">Cargando materias...</div>
            </div>
        </div>
    `;
    
    // Inicializar el gestor de materias
    if (typeof GestorMaterias !== 'undefined') {
        const gestorMaterias = new GestorMaterias(this.alumnoId);
        await gestorMaterias.inicializar();
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
    
    // Inicializar el gestor de eventos
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
        
        // TODO: Implementar gestor de inasistencias
        setTimeout(() => {
            document.getElementById('inasistencias-list').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                    <h3>Módulo en desarrollo</h3>
                    <p>La funcionalidad de inasistencias estará disponible próximamente.</p>
                </div>
            `;
        }, 1000);
    }

    async cargarPerfil() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="module-container">
                <h2>👤 Mi Perfil</h2>
                <div class="profile-info">
                    <div class="info-item">
                        <label>Nombre:</label>
                        <span>${this.alumnoNombre} ${this.alumnoApellido}</span>
                    </div>
                    <div class="info-item">
                        <label>Dni:</label>
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
            </div>
        `;
    }

    async cargarConfiguracion() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="module-container">
                <h2>⚙️ Configuración</h2>
                <div class="config-options">
                    <p>Aquí puedes ajustar tus preferencias y configuraciones.</p>
                    <div class="config-item">
                        <label>
                            <input type="checkbox" id="notificaciones"> 
                            Recibir notificaciones
                        </label>
                    </div>
                    <div class="config-item">
                        <label>
                            <input type="checkbox" id="email-recordatorios"> 
                            Recordatorios por email
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    actualizarInfoUsuario() {
        document.getElementById('user-name').textContent = 
            `${this.alumnoNombre} ${this.alumnoApellido}`;
    }
}

// Función global para cerrar sesión
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

// Inicializar dashboard cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Dashboard...');
    window.dashboard = new Dashboard();
});