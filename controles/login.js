document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const togglePasswordBtn = document.getElementById("toggle-password");

    // Verificar que los elementos existan
    if (!form || !emailInput || !passwordInput || !togglePasswordBtn) {
        console.error('Error: No se encontraron los elementos del formulario de login');
        return;
    }

    // Toggle de visibilidad de contraseña
    togglePasswordBtn.addEventListener("click", (e) => {
        e.preventDefault();
        
        const icon = this.querySelector('i');
        
        // Si actualmente es password (oculto) -> cambiar a text (visible)
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash'); // Ojo tachado
        } else {
            // Si actualmente es text (visible) -> cambiar a password (oculto)
            passwordInput.type = "password";
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye'); // Ojo abierto
        }
    });

    // Manejar submit del formulario
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const correo = emailInput.value.trim();
        const password = passwordInput.value;

        // ===== VALIDACIONES BÁSICAS =====
        if (!correo) {
            alert("El correo electrónico o DNI es obligatorio.");
            emailInput.focus();
            return;
        }

        if (!password) {
            alert("La contraseña es obligatoria.");
            passwordInput.focus();
            return;
        }

        // Validación adicional: si es DNI, verificar que sean 8 números
        if (/^\d+$/.test(correo) && correo.length !== 8) {
            alert("Si ingresas DNI, debe tener exactamente 8 dígitos.");
            emailInput.focus();
            return;
        }

        // Deshabilitar botón para evitar múltiples envíos
        const submitBtn = form.querySelector('.auth-button');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Iniciando sesión...';
        submitBtn.disabled = true;

        try {
            // Preparar datos
            const formData = new FormData();
            formData.append('login_email', correo);
            formData.append('login_password', password);

            // Enviar al servidor
            const response = await fetch("../controles/login.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Login exitoso
                alert(`¡Bienvenido ${result.alumno.nombre} ${result.alumno.apellido}!`);
                
                // Limpiar formulario
                form.reset();
                
                // Redirigir al dashboard
                window.location.href = "../vistas/dashboard_alumno.html";
            } else {
                // Login fallido
                alert(`${result.message || 'Error al iniciar sesión'}`);
                
                // Re-habilitar botón
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Limpiar contraseña por seguridad
                passwordInput.value = '';
                passwordInput.focus();
            }

        } catch (error) {
            console.error("Error en el login:", error);
            alert("Error de conexión con el servidor. Por favor, intenta nuevamente.");
            
            // Re-habilitar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Focus automático en el primer campo al cargar
    emailInput.focus();
});