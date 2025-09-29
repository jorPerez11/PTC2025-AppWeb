// Importamos la función de login desde nuestro servicio.
import { login, me } from "../services/serviceLogin.js";

document.addEventListener("DOMContentLoaded", () => {
    // --- Referencias a elementos del DOM ---
    const loginForm = document.getElementById("formLogin");
    const usernameInput = document.getElementById("inputUsername");
    const passwordInput = document.getElementById("inputPassword");
    const loginButton = document.getElementById("btnLogin");

    // Función para manejar el modal de cambio de contraseña
    function showChangePasswordModal() {
        // ... (Tu código actual del modal, no es necesario cambiarlo) ...
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
                input: 'custom-input'            // si quieres class extra en inputs
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
                const username = sessionStorage.getItem('usernameForPasswordChange');
                const tempAuthToken = sessionStorage.getItem('tempAuthToken');

                if (!username || !tempAuthToken) {
                    Swal.fire('Error', 'No se encontró la información de la sesión. Por favor, vuelve a iniciar sesión.', 'error');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:8080/api/users/change-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${tempAuthToken}`
                        },
                        body: JSON.stringify({
                            username: username,
                            currentPassword: passwordInput.value.trim(),
                            newPassword: result.value.newPassword
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.text();
                        throw new Error(errorData || 'Error al cambiar la contraseña.');
                    }

                    // Después de un cambio exitoso, muestra un mensaje y redirige al login
                    Swal.fire('¡Éxito!', 'Tu contraseña ha sido cambiada. Por favor, inicia sesión con la nueva contraseña.', 'success').then(() => {
                        window.location.href = "login.html";
                    });

                } catch (error) {
                    Swal.fire('Error', 'Error al cambiar la contraseña. ' + error.message, 'error').then(() => {
                        window.location.href = "login.html";
                    });
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

        // 3. Validación de longitud mínima de la contraseña (12 caracteres)
        if (credentials.password.length < 12) {
            showGlobalMessage("La contraseña debe tener al menos 12 caracteres.", 'error');
            return;
        }

        try {
            loginButton.disabled = true;
            const loginResponse = await login(credentials);

            if (loginResponse.passwordExpired) {
                sessionStorage.setItem('tempAuthToken', loginResponse.token);
                sessionStorage.setItem('usernameForPasswordChange', loginResponse.username);
                showChangePasswordModal();
                return;
            }

            const userData = await me();

            // 2. Si la contraseña es válida, guarda el token de larga duración
            localStorage.setItem('user_username', userData.username);
            localStorage.setItem('user_rol', userData.rol);
            localStorage.setItem('userId', userData.userId);

            console.log("Inicio de sesión exitoso. Rol:", userData.rol);

            // 3. Redirección basada en el rol
            switch (userData.rol) {
                case "ADMINISTRADOR": // Administrador
                    window.location.href = 'PlataformaWebInicio/PW_Inicio.html';
                    break;
                case "TECNICO": // Técnico
                    window.location.href = "PlataformaWebInicio/PW_Inicio.html";
                    break;
                case "CLIENTE": // Cliente
                    window.location.href = "index.html";
                    break;
                default:
                    window.location.href = "index.html";
                    break;
            }

        } catch (error) {
            showGlobalMessage("Usuario o contraseña incorrectos.", 'error');
            console.error("Fallo en el inicio de sesión:", error.message);
        } finally {
            loginButton.disabled = false;
        }
    });

    // ... (Tu función showGlobalMessage) ...
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