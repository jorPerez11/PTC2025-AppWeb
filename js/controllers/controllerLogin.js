// Importamos la función de login desde nuestro servicio.
import { login } from "../services/serviceLogin.js";

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
            // ... (el resto de las propiedades de Swal.fire) ...
            confirmButtonText: 'Cambiar Contraseña',
            preConfirm: () => {
                const newPassword = document.getElementById('newPasswordInput').value;
                const confirmPassword = document.getElementById('confirmPasswordInput').value;
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

        if (!credentials.username || !credentials.password) {
            showGlobalMessage("Por favor, ingresa tu usuario y contraseña.", 'error');
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

            // --- ESTE ES EL CÓDIGO QUE TE HACE FALTA PARA CUANDO EL LOGIN ES EXITOSO ---
            // 2. Si la contraseña es válida, guarda el token de larga duración
            localStorage.setItem('authToken', loginResponse.token);
            localStorage.setItem('username', loginResponse.username);
            localStorage.setItem('rolId', loginResponse.rolId);

            console.log("Inicio de sesión exitoso. Rol ID:", loginResponse.rolId);

            // 3. Redirección basada en el rol
            switch (loginResponse.rolId) {
                case 3: // Administrador
                    window.location.href = 'primerUso.html';
                    break;
                case 2: // Técnico
                    window.location.href = "PlataformaWebInicio/PW_Inicio.html";
                    break;
                case 1: // Cliente
                    window.location.href = "PlataformaWebInicio/PW_Inicio.html";
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