// Importamos la función de registro desde nuestro servicio.
import { register } from "../services/serviceSignUp.js";

document.addEventListener("DOMContentLoaded", () => {
    // --- Referencias a elementos del DOM ---
    const registerForm = document.getElementById("registerForm");
    const fullNameInput = document.getElementById("inputFullName");
    const usernameInput = document.getElementById("inputUsername");
    const emailInput = document.getElementById("inputEmail");
    const phoneInput = document.getElementById("inputNumber");
    const registerButton = registerForm.querySelector('button[type="submit"]');

    // Inicializa la librería intl-tel-input
    const iti = window.intlTelInput(phoneInput, {
        preferredCountries: ["sv", "mx", "gt", "cr", "pa"], // Países preferidos
        separateDialCode: true,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js", // URL del script de utilidades
    });

    // Manejo del envío del formulario de registro
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evita que la página se recargue

        // Obtiene el número de teléfono completo, incluyendo el prefijo del país
        const phoneNumber = iti.getNumber();

        // Creamos un objeto con los datos del usuario.
        const userData = {
            name: fullNameInput.value.trim(),
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneNumber // Asigna el número completo con el prefijo
        };

        // Validación simple en el frontend
        if (!userData.name || !userData.username || !userData.email || !userData.phone) {
            showGlobalMessage("Todos los campos son obligatorios.", 'error');
            return;
        }

        try {
            // -- INICIO del estado de CARGA
            document.body.style.cursor = 'wait'; // Pone el cursor en "cargando"
            registerButton.disabled = true; // Deshabilita el botón

            // Llamamos a la función del servicio para registrar al usuario
            const registeredUser = await register(userData);

            console.log("Usuario registrado exitosamente:", registeredUser);
            showGlobalMessage("¡Registro exitoso! Serás redirigido a la página de inicio de sesión.", 'success');

            // Después de un breve retraso, redirigimos al usuario a la página de login
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000); // 2 segundos de espera

        } catch (error) {
            // Si el servicio lanza un error (ej. email o usuario ya existen), lo mostramos.
            showGlobalMessage(error.message, 'error');
            console.error("Fallo en el registro:", error.message);
        } finally {
            // -- FIN del estado de CARGA
            document.body.style.cursor = 'default'; // Restaura el cursor a la normalidad
            registerButton.disabled = false; // Habilita el botón
        }
    });

    // Función para mostrar mensajes
    function showGlobalMessage(message, type) {
        if (type === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: message,
                confirmButtonText: 'Aceptar'
            });
        } else if (type === 'error') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                confirmButtonText: 'Aceptar'
            });
        } else {
            // En caso de tipo desconocido, se muestra un mensaje genérico.
            Swal.fire({
                icon: 'info',
                title: 'Información',
                text: 'Ha ocurrido un error inesperado.',
                confirmButtonText: 'Aceptar'
            });
        }
    }
});