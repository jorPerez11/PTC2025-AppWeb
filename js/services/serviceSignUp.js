// La URL base la API, apuntando al controlador de usuarios.
const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api/users';

// URL para endpoints de compañías (nueva constante)
const COMPANY_API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';

/**
 * Envía las credenciales al backend para su validación.
 * @param {object} credentials - Un objeto con 'username' y 'password'.
 * @returns {Promise<object>} - La respuesta del servidor (token, rolId, etc.).
 */
export async function login(credentials) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Credenciales inválidas');
    }
    return response.json();
}

/**
 * Verifica si ya existe al menos una compañía en el backend.
 * @returns {Promise<boolean>} - True si hay compañías, false si no.
 */
export async function checkCompanyExistence() {
    let result = false;

    // Función auxiliar para mostrar alertas de forma segura
    const safeSwal = (config) => {
        if (typeof Swal !== 'undefined' && Swal.fire) {
            Swal.fire(config);
        } else {
            // Mensaje de consola si Swal no está disponible (para debugging)
            console.warn("SweetAlert no está disponible. Mensaje: " + config.text);
        }
    };

    try {
        const response = await fetch(`${COMPANY_API_URL}/check-company-existence`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error del servidor al verificar la existencia de compañías:", response.status, errorText);

            // 🚨 Alerta SweetAlert para Error HTTP
            safeSwal({
                icon: 'error',
                title: 'Error de Verificación',
                text: `El servidor respondió con el código ${response.status}. Mensaje: ${errorText.substring(0, 100)}...`,
                confirmButtonText: 'Aceptar'
            });

            return false;
        }

        const responseData = await response.json();
        // Asume que la respuesta directa es el booleano
        result = typeof responseData === 'boolean' ? responseData : responseData?.exists || false;

        // ❌ ELIMINAMOS LA ALERTA DE ÉXITO. Solo devolvemos el resultado.
        
        // **DEBUGGING:** Si quieres ver el resultado antes de redirigir, usa console.log
        alert(`[checkCompanyExistence] Respuesta del Backend: ${result}`);


        return result;

    } catch (error) {
        console.error("Fallo de red al verificar la existencia de compañías:", error);

        // 🚨 Alerta SweetAlert para Fallo de Red
        safeSwal({
            icon: 'warning',
            title: 'Error de Conexión',
            text: `Fallo al intentar conectar con el servidor: ${error.message}`,
            confirmButtonText: 'Cerrar'
        });

        return false;
    }
}

/**
 * Envía los datos de un nuevo usuario para registrarlo en el sistema.
 * @param {object} userData - Objeto con los datos del usuario (fullName, username, email, password).
 * @returns {Promise<object>} - El objeto del usuario registrado devuelto por la API.
 */
export async function register(userData) {
    // Hacemos la petición POST al endpoint /register de tu API.
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // El cuerpo debe coincidir con el UserDTO de Spring.
        body: JSON.stringify(userData)
    });

    // Si la respuesta no es exitosa (ej. 400 Bad Request por usuario duplicado),
    // leemos el mensaje de error del cuerpo.
    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Error al registrar el usuario.');
    }

    // Si el registro es exitoso (código 201 CREATED), devolvemos la respuesta.
    return response.json();
}