const API_URL = "https://ptchelpdesk-a73934db2774.herokuapp.com/api";

export async function login({ username, password }) {
    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el login');
    }

    // Retornamos la respuesta completa para poder verificar headers si es necesario
    return {
        success: true,
        status: response.status
    };
}

export async function me() {
    const response = await fetch(`${API_URL}/users/authme`, {
        method: 'POST',
        credentials: 'include'
    });

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('No autenticado');
    }
}

/**
 * Solicita el restablecimiento de contraseña para un correo dado.
 * @param {string} email - El correo electrónico del usuario.
 * @returns {Promise<Object>} - Una promesa que resuelve con la respuesta del API.
 */
export async function requestPasswordReset(email) {
    const apiURL = `${API_URL}/users/request-password-reset`;

    const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

   //CLAVE: No verificamos si el usuario existe o no, solo si la petición
    // al servidor falló (ej. error 500 o error de red).
    if (!response.ok) {
        // Lanza un error si la respuesta HTTP no es 2xx (ej. 400 Bad Request o 500 Internal Server Error)
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor' }));
        throw new Error(errorData.message || 'Fallo al solicitar el restablecimiento de contraseña');
    }

    // Si la respuesta es 200 OK (el caso esperado, incluso si el correo no existe en la DB),
    // devolvemos la respuesta al controlador para mostrar el modal de éxito genérico.
    return response.json(); 
}

export async function changePassword(username, currentPassword, newPassword) {
    const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            username: username,
            currentPassword: currentPassword,
            newPassword: newPassword
        })
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al cambiar la contraseña');
    }
    return await response.json();
}

export async function logout() {
    try {
        const response = await fetch(`${API_URL}/users/logoutWeb`, {
            method: 'POST',
            credentials: 'include',
        });
        return response.ok;
    } catch {
        return false;
    }
}

export async function fetchWithAuth(url, options = {}) {
    console.log('🔄 Fetching:', url);
    //console.log('🍪 Cookies disponibles:', document.cookie);
    try {

        //Contruye la URL COMPLETA por si viene con algun error, aqui se solciona, asi es mas flexible
        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;

        const isFormData = options.body instanceof FormData;
        const headers = { ...options.headers };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            credentials: 'include', //Para enviar cookies
            headers: headers
        };
        console.log('📤 Request config:', config);


        const response = await fetch(fullUrl, config);


        // ✅ Primero verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        // Manejar errores de autenticación
        if (response.status === 401 || response.status === 403) {
            console.error('Acceso Denegado: El usuario no tiene permisos para ver esta información.');
            clearUserData();

            let serverMessage = 'Acceso denegado o sesión inválida';
            if (isJson) { // Si el servidor envió JSON (como tu JwtRequestFilter lo hace)
                try {
                    const errorData = await response.json();
                    serverMessage = errorData.error || serverMessage; // Captura tu mensaje de error del servidor
                } catch (e) { /* ignorar error de parseo */ }
            } else { // Si el servidor envió texto (como Spring Security sin personalizar)
                try {
                    const errorText = await response.text();
                    if (errorText.length > 0) {
                        serverMessage = `Server Response: ${errorText}`;
                    }
                } catch (e) { /* ignorar error de parseo */ }
            }

            //  Redirigir solo si es una página HTML
            if (RedirectedToLogin()) {
                //  window.location.href = 'inicioSesion.html';
            }

            throw new Error('Acceso denegado o sesión inválida');
        }

        // Manejar otros errores HTTP
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;

            if (isJson) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    console.warn('Error parseando JSON de error:', parseError);
                }
            } else {
                try {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                } catch (textError) {
                    console.warn('Error leyendo texto de error:', textError);
                }
            }

            throw new Error(errorMessage);
        }

        // Devolver el JSON parseado si es JSON, sino la respuesta
        if (isJson) {
            return await response.json();
        } else {
            return response;
        }

    } catch (error) {
        console.error('Error en fetchWithAuth:', error);
        throw error; // ✅ Relanzar el error para manejo externo
    }
}

export async function fetchPublic(url, options = {}) {
    // Llama a fetchWithAuth forzando omitCredentials a true
    return fetchWithAuth(url, options, true);
}

export async function getUserId() {
    try {
        const userData = await me();
        return userData.userId;

    } catch (error) {
        return null;
    }
}

function clearUserData() {
    const userKeys = ['rol', 'username', 'passwordExpired'];
    userKeys.forEach(key => localStorage.removeItem(key));

    console.log("datos de usuario limpiados")
}

function RedirectedToLogin() {
    if (window.location.pathname.includes('login.html')) {
        return false;
    }

    return window.location.pathname.endsWith('.html') || !window.location.pathname.includes('.');
}