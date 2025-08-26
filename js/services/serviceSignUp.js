// La URL base la API, apuntando al controlador de usuarios.
const API_URL = 'http://localhost:8080/api/users';

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
    const response = await fetch(`${API_URL}/check-company-existence`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
        // En caso de error, asumimos que no hay compañías para no bloquear el flujo.
        console.error("Error al verificar la existencia de compañías:", await response.text());
        return false;
    }
    
    return response.json();
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