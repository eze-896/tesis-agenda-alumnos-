document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");

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

        // Nombre y Apellido: obligatorios, solo letras y espacios, mínimo 2 caracteres
        const nombreApellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
        if (!nombre) {
            console.error("Nombre vacío");
            alert("El nombre es obligatorio.");
            return;
        }
        if (!nombreApellidoRegex.test(nombre)) {
            console.error("Nombre inválido:", nombre);
            alert("El nombre debe contener solo letras y tener al menos 2 caracteres.");
            return;
        }
        if (!apellido) {
            console.error("Apellido vacío");
            alert("El apellido es obligatorio.");
            return;
        }
        if (!nombreApellidoRegex.test(apellido)) {
            console.error("Apellido inválido:", apellido);
            alert("El apellido debe contener solo letras y tener al menos 2 caracteres.");
            return;
        }

        // DNI: obligatorio, solo números, exactamente 8 dígitos
        if (!dni) {
            console.error("DNI vacío");
            alert("El DNI es obligatorio.");
            return;
        }
        if (!/^\d{8}$/.test(dni)) {
            console.error("DNI inválido:", dni);
            alert("El DNI debe tener exactamente 8 números.");
            return;
        }

        // Email: obligatorio, formato válido
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!email) {
            console.error("Email vacío");
            alert("El correo electrónico es obligatorio.");
            return;
        }
        if (!emailRegex.test(email)) {
            console.error("Email inválido:", email);
            alert("Ingrese un correo electrónico válido.");
            return;
        }

        // Año: obligatorio, entre 1 y 6
        if (!año) {
            console.error("Año vacío");
            alert("El año de cursada es obligatorio.");
            return;
        }
        if (año < 1 || año > 6) {
            console.error("Año inválido:", año);
            alert("El año de cursada debe estar entre 1° y 6° año.");
            return;
        }

        // División: obligatorio
        if (!division) {
            console.error("División vacía");
            alert("La división es obligatoria.");
            return;
        }

        // Contraseña: obligatoria, mínimo 8 caracteres, al menos una letra y un número
        if (!contraseña) {
            console.error("Contraseña vacía");
            alert("La contraseña es obligatoria.");
            return;
        }
        if (contraseña.length < 8) {
            console.error("Contraseña demasiado corta");
            alert("La contraseña debe tener al menos 8 caracteres.");
            return;
        }
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(contraseña)) {
            console.warn("Contraseña no contiene letra y número");
            alert("La contraseña debe contener al menos una letra y un número.");
            return;
        }

        // Evitar espacios en campos críticos
        if (/\s/.test(dni)) {
            console.error("DNI contiene espacios");
            alert("El DNI no debe contener espacios.");
            return;
        }
        if (/\s/.test(email)) {
            console.error("Email contiene espacios");
            alert("El correo electrónico no debe contener espacios.");
            return;
        }

        // Si pasa todas las validaciones, enviar formulario
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
        }
    });
});
