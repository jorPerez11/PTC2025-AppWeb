// La URL base de la API, apuntando al controlador de usuarios.
const API_URL = 'http://localhost:8080/api/users';

/**
 * Envía las credenciales al backend para su validación.
 * @param {object} credentials - Un objeto con 'username' y 'password'.
 * @returns {Promise<object>} - La respuesta del servidor (token, rolId, passwordExpired, etc.).
 */
export async function login(credentials) {
    // Hacemos la petición POST al endpoint /login de tu API.
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // El cuerpo debe coincidir con el UserDTO de Spring: { "username": "...", "password": "..." }
        body: JSON.stringify(credentials)
    });

    // Si la respuesta no es exitosa (ej. 401 Unauthorized), leemos el mensaje de error del cuerpo si existe.
    if (!response.ok) {
        const errorData = await response.text(); // Puede que Spring envíe un mensaje de error
        throw new Error(errorData || 'Credenciales inválidas');
    }

    // Si todo sale bien, devolvemos la respuesta en formato JSON.
    return response.json();
}