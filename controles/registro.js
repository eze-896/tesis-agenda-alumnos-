document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");

    // Configurar toggle de contraseña
    const togglePassword = document.getElementById('toggle-password-register');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordField = document.getElementById('contraseña');
            if (!passwordField) return;
            
            const icon = togglePassword.querySelector('i');
            
            if (passwordField.type === 'password') {
                // Mostrar contraseña
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                togglePassword.classList.add('active');
            } else {
                // Ocultar contraseña
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                togglePassword.classList.remove('active');
            }
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const nombre = formData.get("nombre").trim();
        const apellido = formData.get("apellido").trim();
        const dni = formData.get("dni").trim();
        const contraseña = formData.get("contraseña");
        const email = formData.get("email").trim();
        const año = formData.get("año").trim();
        const division = formData.get("division").trim();

        // Validaciones
        const nombreApellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
        if (!nombre || !nombreApellidoRegex.test(nombre)) {
            alert("El nombre es obligatorio y debe contener solo letras (mínimo 2 caracteres).");
            return;
        }
        if (!apellido || !nombreApellidoRegex.test(apellido)) {
            alert("El apellido es obligatorio y debe contener solo letras (mínimo 2 caracteres).");
            return;
        }
        if (!dni || !/^\d{8}$/.test(dni)) {
            alert("El DNI es obligatorio y debe tener exactamente 8 números.");
            return;
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            alert("Ingrese un correo electrónico válido.");
            return;
        }
        if (!año || año < 1 || año > 6) {
            alert("El año de cursada debe estar entre 1° y 6° año.");
            return;
        }
        if (!division) {
            alert("La división es obligatoria.");
            return;
        }
        if (!contraseña || contraseña.length < 8 || !/(?=.*[a-zA-Z])(?=.*\d)/.test(contraseña)) {
            alert("La contraseña debe tener al menos 8 caracteres y contener letras y números.");
            return;
        }

        // Mostrar estado de carga
        const submitBtn = form.querySelector('.auth-button');
        const originalText = submitBtn.innerHTML;
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch("../controles/registro.php", {
                method: "POST",
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                alert(result.message || "Registro exitoso.");
                window.location.href = "login.html";
            } else {
                alert(result.message || "Error en el registro.");
                if (result.error) console.error("Error detallado:", result.error);
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            alert("Ocurrió un error al registrarse. Intente nuevamente.");
        } finally {
            // Restaurar estado normal
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});