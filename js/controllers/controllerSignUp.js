// Importamos la función de registro desde nuestro servicio.
import { register, checkCompanyExistence } from "../services/serviceSignUp.js";

document.addEventListener("DOMContentLoaded", async () => {
    // --- VERIFICACIÓN INMEDIATA AL CARGAR LA PÁGINA ---
    // Mostrar cursor de carga inmediatamente
    document.body.style.cursor = 'wait';

    let companyExists = false;

    try {
        companyExists = await checkCompanyExistence();
        
        if (!companyExists) {
            // Si no hay compañías, redirigir inmediatamente al primer uso
            console.log("No hay compañías existentes, redirigiendo al primer uso...");
            // Es crucial restablecer el cursor ANTES de la redirección, aunque no siempre se ve.
            document.body.style.cursor = 'default'; 
            window.location.href = "primerUso.html";
            return; // Importante: salir de la función
        }
    } catch (error) {
        // Restaurar cursor normal en caso de error de red/servidor (ya no es estrictamente necesario, pero no estorba)
        // document.body.style.cursor = 'default'; // Se moverá al finally
        
        console.error("Error al verificar existencia de compañías:", error);
        
        // El error fue lanzado/mostrado en la función checkCompanyExistence
        showGlobalMessage("Error al verificar el estado del sistema. Por favor, recarga o intenta más tarde.", 'error');
        
        return; // Salir, ya que la verificación falló catastróficamente
    } finally {
        // ✅ SOLUCIÓN: Restablece el cursor siempre, haya habido éxito o error (excepto redirección).
        if (companyExists) {
            document.body.style.cursor = 'default';
        }
        // Si hay un error, el 'return' en el catch ya detuvo el flujo y el cursor se restablece más abajo.
        // La mejor práctica es simplemente restablecerlo aquí:
        document.body.style.cursor = 'default';
    }

    // --- SOLO SI HAY COMPAÑÍAS EXISTENTES, CARGAMOS EL FORMULARIO DE REGISTRO NORMAL ---

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

    let phoneMask;

    phoneInput.addEventListener("countrychange", function(){
        // 1. Obtiene el placeholder/formato para el país seleccionado
        const placeholder = phoneInput.placeholder;

        // 2. Transforma el placeholder a un formato de máscara (ej. (555) 5555-5555 -> {000} 0000-0000)
        // IMask usa '0' para números y el resto son caracteres fijos.
        const maskFormat = placeholder.replace(/0/g, '0').replace(/\d/g, '0');

        if (phoneMask){
            phoneMask.destroy();
        }

        phoneMask = IMask(phoneInput, {
            mask: maskFormat,
            lazy: false,
            //placeholder: '_',
            commit: function(value, masked){
                masked._value = value.replace(/\s+/g, '');
            }
        })
    });

    phoneInput.dispatchEvent(new Event('countrychange'));

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

        // --- VALIDACIONES DE JAVASCRIPT ---
        // 1. Validación de campos vacíos
        if (!userData.name || !userData.username || !userData.email || !userData.phone) {
            showGlobalMessage("Todos los campos son obligatorios.", 'error');
            return;
        }

        // 2. Validación de formato de nombre (al menos dos palabras, cada una con al menos una letra)
        const nameRegex = /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/;
        const nameParts = userData.name.split(/\s+/).filter(Boolean);
        if (!nameRegex.test(userData.name) || nameParts.length < 2) {
            showGlobalMessage("Por favor, ingresa tu nombre completo (nombre y apellido). Solo se permiten letras y espacios.", 'error');
            return;
        }

        // 3. Validación de nombre de usuario (sin espacios, alfanumérico con guiones bajos)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(userData.username)) {
            showGlobalMessage("El nombre de usuario solo puede contener letras, números y guiones bajos.", 'error');
            return;
        }

        // 4. Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            showGlobalMessage("Por favor, ingresa una dirección de correo electrónico válida.", 'error');
            return;
        }

        // 5. Validación de número de teléfono con la librería intl-tel-input
        if (!iti.isValidNumber()) {
            showGlobalMessage("Por favor, ingresa un número de teléfono válido.", 'error');
            return;
        }

        // 6. Validación de la cantidad de caracteres (min y max)
        if (userData.name.length < 5 || userData.name.length > 100) {
            showGlobalMessage("El nombre completo debe tener entre 5 y 100 caracteres.", 'error');
            return;
        }
        if (userData.username.length < 3 || userData.username.length > 100) {
            showGlobalMessage("El nombre de usuario debe tener entre 3 y 100 caracteres.", 'error');
            return;
        }
        if (userData.email.length > 100) {
            showGlobalMessage("El email excede el límite de 100 caracteres.", 'error');
            return;
        }
        if (userData.phone.length > 20) {
            showGlobalMessage("El número de teléfono excede el límite de 20 caracteres.", 'error');
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