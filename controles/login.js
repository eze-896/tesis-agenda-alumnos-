document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    // Botón para mostrar/ocultar contraseña
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.textContent = "Mostrar";
    toggleBtn.style.marginLeft = "10px";
    toggleBtn.style.cursor = "pointer";
    toggleBtn.style.padding = "5px 10px";
    toggleBtn.style.fontSize = "0.9rem";

    passwordInput.parentNode.appendChild(toggleBtn);

    toggleBtn.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleBtn.textContent = "Ocultar";
        } else {
            passwordInput.type = "password";
            toggleBtn.textContent = "Mostrar";
        }
    });

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const correo = emailInput.value.trim();
        const password = passwordInput.value;

        // Validaciones básicas
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

        try {
            const formData = new FormData();
            formData.append('login_email', correo);
            formData.append('login_password', password);

            const response = await fetch("../controles/login.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert(`¡Bienvenido ${result.alumno.nombre} ${result.alumno.apellido}!`);
                // Redirigir al dashboard del alumno
                window.location.href = "../vistas/dashboard_alumno.html";
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error("Error en el login:", error);
            alert("Error de conexión con el servidor.");
        }
    });
});