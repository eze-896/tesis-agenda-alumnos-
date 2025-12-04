// Mejoras para el sistema de login
class LoginEnhanced {
    constructor() {
        this.form = document.getElementById('login-form');
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.setupPasswordToggle();
        this.setupFormSubmission();
    }
    
    setupPasswordToggle() {
        // Configurar toggle de contraseña para login
        const toggleLogin = document.getElementById('toggle-password');
        if (toggleLogin) {
            toggleLogin.addEventListener('click', () => this.togglePassword('login-password', toggleLogin));
        }
        
        // Configurar toggle de contraseña para registro
        const toggleRegister = document.getElementById('toggle-password-register');
        if (toggleRegister) {
            toggleRegister.addEventListener('click', () => this.togglePassword('register-password', toggleRegister));
        }
    }
    
    togglePassword(fieldId, button) {
        const passwordField = document.getElementById(fieldId);
        if (!passwordField) return;
        
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        const icon = button.querySelector('i');
        if (type === 'password') {
            icon.className = 'fas fa-eye';
            button.classList.remove('active');
        } else {
            icon.className = 'fas fa-eye-slash';
            button.classList.add('active');
        }
    }
    
    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = this.form.querySelector('.auth-button');
        const originalText = submitBtn.innerHTML;
        
        // Mostrar estado de carga
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(this.form);
            
            const response = await fetch("../controles/login.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('¡Login exitoso! Redirigiendo...');
                setTimeout(() => {
                    window.location.href = "../vistas/dashboard_alumno.html";
                }, 1000);
            } else {
                this.showError(result.message || 'Error en las credenciales');
            }
            
        } catch (error) {
            console.error("Error en el login:", error);
            this.showError('Error de conexión con el servidor');
        } finally {
            // Restaurar estado normal
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showMessage(message, type) {
        // Crear notificación
        const messageDiv = document.createElement('div');
        messageDiv.className = `global-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(messageDiv);
        
        // Mostrar con animación
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoginEnhanced();
});