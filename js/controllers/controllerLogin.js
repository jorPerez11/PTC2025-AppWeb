// Importamos la función de login desde nuestro servicio.
import { login, me, changePassword, requestPasswordReset } from "../services/serviceLogin.js";

document.addEventListener("DOMContentLoaded", () => {
    // --- Referencias a elementos del DOM ---
    const loginForm = document.getElementById("formLogin");
    const usernameInput = document.getElementById("inputUsername");
    const passwordInput = document.getElementById("inputPassword");
    const loginButton = document.getElementById("btnLogin");
    const forgotPasswordLink = document.querySelector(".forgot-password-link");

    let currentUsername = '';
    let currentPassword = '';

    // Función para manejar el modal de cambio de contraseña
    function showChangePasswordModal() {
        Swal.fire({
            title: '¡Contraseña Expirada!',
            html: `
                <p>Tu contraseña ha expirado. Por favor, crea una nueva para continuar.</p>
                <form id="changePasswordForm">
                    <div class="formInput mb-4">
                        <input type="password" class="form-control" id="newPasswordInput" placeholder="Nueva Contraseña" required>
                    </div>
                    <div class="formInput mb-4">
                        <input type="password" class="form-control" id="confirmPasswordInput" placeholder="Confirmar Contraseña" required>
                    </div>
                </form>
            `,
            confirmButtonText: 'Cambiar Contraseña',
            customClass: {
                popup: 'custom-popup',
                title: 'custom-title',
                confirmButton: 'custom-confirm-button',
                htmlContainer: 'custom-html-container',
                input: 'custom-input'
            },
            preConfirm: () => {
                const newPassword = document.getElementById('newPasswordInput').value;
                const confirmPassword = document.getElementById('confirmPasswordInput').value;

                // Validación de longitud mínima para la nueva contraseña en el modal
                if (newPassword.length < 12) {
                    Swal.showValidationMessage('La nueva contraseña debe tener al menos 12 caracteres.');
                    return false;
                }

                // Validación de coincidencia de contraseñas
                if (newPassword !== confirmPassword) {
                    Swal.showValidationMessage('Las contraseñas no coinciden.');
                    return false;
                }
                return { newPassword: newPassword };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Usamos las variables currentUsername y currentPassword que guardamos anteriormente
                    await changePassword(currentUsername, currentPassword, result.value.newPassword);

                    Swal.fire('¡Éxito!', 'Tu contraseña ha sido cambiada. Por favor, inicia sesión con la nueva contraseña.', 'success').then(() => {
                        window.location.href = "login.html";
                    });

                } catch (error) {
                    Swal.fire('Error', 'Error al cambiar la contraseña. ' + error.message, 'error');
                }
            }
        });
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const credentials = {
            username: usernameInput.value.trim(),
            password: passwordInput.value.trim()
        };

        // --- VALIDACIONES DE JAVASCRIPT ---

        // 1. Validación de campos vacíos
        if (!credentials.username || !credentials.password) {
            showGlobalMessage("Por favor, ingresa tu usuario y contraseña.", 'error');
            return;
        }

        // 2. Validación de longitud mínima del usuario (3 caracteres)
        if (credentials.username.length < 3) {
            showGlobalMessage("El usuario debe tener al menos 3 caracteres.", 'error');
            return;
        }

        try {
            loginButton.disabled = true;

            // 1. Hacer login (esto establece la cookie)
            await login(credentials);

            // 2. Obtener datos del usuario
            const userData = await me();

            // 3. Verificar si la contraseña está expirada
            if (userData.passwordExpired) {
                currentUsername = userData.username;
                currentPassword = credentials.password;
                showChangePasswordModal();
                return;
            }

            // 4. Si la contraseña es válida, guarda los datos en localStorage
            localStorage.setItem('user_username', userData.username);
            localStorage.setItem('user_rol', userData.rol);
            localStorage.setItem('userId', userData.userId);

            console.log("Inicio de sesión exitoso. Rol:", userData.rol);

            // 5. Redirección basada en el rol
            redirectBasedOnRole(userData.rol);

        } catch (error) {
            showGlobalMessage("Usuario o contraseña incorrectos.", 'error');
            console.error("Fallo en el inicio de sesión:", error.message);
        } finally {
            loginButton.disabled = false;
        }
    });

    // Función para redirección basada en rol
    function redirectBasedOnRole(rol) {
        switch (rol.toUpperCase()) {
            case "ADMINISTRADOR":
                window.location.href = 'PlataformaWebInicio/PW_Inicio.html';
                break;
            case "TECNICO":
                window.location.href = "PlataformaWebInicio/PW_Inicio.html";
                break;
            case "CLIENTE":
                window.location.href = "index.html";
                break;
            default:
                window.location.href = "index.html";
                break;
        }
    }

    function showForgotPasswordModal() {
        Swal.fire({
            title: 'Recuperar Contraseña',
            text: 'Ingresa tu correo electrónico para enviarte una contraseña temporal.',
            input: 'email',
            inputPlaceholder: 'Correo Electrónico',
            showCancelButton: true,
            confirmButtonText: 'Restablecer',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#F48C06',
            cancelButtonColor: '#03071E',
            showLoaderOnConfirm: true,
            customClass: {
                // ... (usa tus clases personalizadas si las tienes)
                popup: 'custom-popup',
                title: 'custom-title',
                confirmButton: 'custom-confirm-button',
                input: 'custom-input'
            },
            preConfirm: (email) => {
                if (!email) {
                    Swal.showValidationMessage('Por favor, ingresa un correo.');
                    return false;
                }
                // Aquí llamamos al servicio para solicitar el restablecimiento
                return requestPasswordReset(email)
                    .then(response => {
                        // El servicio debería manejar el error si el correo no existe
                        return response;
                    })
                    .catch(error => {
                        // Mensaje de error más genérico para no revelar si el usuario existe
                        Swal.showValidationMessage(`Error: No se pudo restablecer la contraseña. Por favor, verifica el correo.`);
                        // Lanzamos el error para detener el flujo
                        throw new Error(error);
                    });
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                // Se asume que si llega aquí, la petición fue exitosa (o al menos no falló con un error de red/servidor).
                // El backend debería manejar la lógica de verificación de existencia de correo internamente y responder siempre con éxito,
                // para evitar enumeración de usuarios, pero el mensaje debe ser claro.
                Swal.fire({
                    title: 'Correo Enviado!',
                    html: 'Correo de restablecimiento enviado. Al ingresar, se te pedirá establecer una nueva contraseña.',
                    icon: 'success'
                });
            }
        });
    }

    // Asociar la función al enlace de "Olvidé mi contraseña"
    forgotPasswordLink.addEventListener("click", (event) => {
        event.preventDefault(); // Evita que el '#' de la etiqueta <a> recargue la página
        showForgotPasswordModal();
    });

    // Función para mostrar mensajes globales
    function showGlobalMessage(message, type) {
        let iconType;
        let titleText;
        switch (type) {
            case 'success':
                iconType = 'success';
                titleText = 'Éxito';
                break;
            case 'error':
                iconType = 'error';
                titleText = 'Error';
                break;
            case 'info':
                iconType = 'info';
                titleText = 'Información';
                break;
            default:
                iconType = 'question';
                titleText = 'Aviso';
                break;
        }
        Swal.fire({
            icon: iconType,
            title: titleText,
            text: message,
            confirmButtonText: 'Aceptar'
        });
    }
});