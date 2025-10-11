// js/services/serviceConfig.js

const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';

// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth } from "../services/serviceLogin.js";

function getAuthHeaders() {
    const authToken = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

export async function getUserId() {
    const username = localStorage.getItem('user_username');
    
    // Si el nombre de usuario no existe localmente, lanzamos el error.
    if (!username) {
        throw new Error('No se encontró el username en el localStorage.');
    }

    try {
        // 1. Construir la URL
        const url = `${API_URL}/GetUserByUsername/${username}`;

        // 2. Usar fetchWithAuth.
        // fetchWithAuth se encarga automáticamente de:
        // - Usar el método 'GET' por defecto.
        // - Incluir las credenciales (cookies) para la autenticación.
        // - Verificar si la respuesta es exitosa (response.ok).
        // - Lanzar un error si la respuesta es 401/403 (autenticación) o cualquier otro error HTTP.
        // - Parsear la respuesta a JSON.
        const userData = await fetchWithAuth(url);

        // 3. Devolver solo el 'id' del usuario.
        return userData.id;

    } catch (err) {
        // El error ya fue loggeado dentro de fetchWithAuth si fue un error HTTP/red.
        // Aquí solo lo volvemos a lanzar para manejo externo.
        console.error('Error en getUserId:', err);
        throw err;
    }
}

export async function getUser(userId) {
    try {
        // 1. Construir la URL completa
        const url = `${API_URL}/GetUser/${userId}`;

        // 2. Usar fetchWithAuth.
        // fetchWithAuth se encarga de:
        // - Usar el método 'GET' por defecto.
        // - Incluir las credenciales (cookies) para la autenticación.
        // - Verificar si la respuesta es exitosa (response.ok).
        // - Lanzar un error si la respuesta es un error HTTP (ej. 401, 404).
        // - Parsear la respuesta a JSON y devolver el objeto 'userData'.
        const userData = await fetchWithAuth(url);

        return userData;
        
    } catch (err) {
        // El error ya fue loggeado y lanzado por fetchWithAuth.
        // Aquí solo lo volvemos a lanzar para manejo en la capa superior.
        console.error('Error en getUser:', err);
        throw err;
    }
}

export async function updateUser(userId, formData) {
    try {
        // 1. Construir la URL completa
        const url = `${API_URL}/users/${userId}/profile`;

        // 2. Usar fetchWithAuth
        // Pasamos el método y el body (FormData).
        const responseData = await fetchWithAuth(url, {
            method: 'POST',
            body: formData // Aquí pasamos el objeto FormData directamente
        });

        // fetchWithAuth se encarga de:
        // - Incluir las credenciales (cookies) para la autenticación (sustituye tu lógica de authToken en headers).
        // - NOTA: Como el body es FormData, NO establece Content-Type: application/json.
        // - Verificar si la respuesta es exitosa (response.ok) y manejar los errores HTTP/JSON.
        // - Parsear la respuesta a JSON y devolver el objeto 'responseData'.
        
        return responseData;

    } catch (error) {
        // El error ya fue loggeado y lanzado por fetchWithAuth con más detalle.
        console.error('Error en updateUser:', error);
        throw error; // Relanzar el error para manejo externo
    }
}

/**
 * Actualiza solo la foto de perfil del usuario.
 */
export async function updateUserProfilePicture(userId, profilePictureFile) {
    // 1. Crear el FormData y adjuntar el archivo
    const formData = new FormData();
    formData.append('profilePicture', profilePictureFile);

    try {
        // 2. Construir la URL completa
        const url = `${API_URL}/users/${userId}/profile-picture`;

        // 3. Usar fetchWithAuth.
        // Pasamos el método y el body (FormData). 
        // fetchWithAuth se encarga de:
        // - La autenticación (cookies/credentials: 'include').
        // - NO establecer Content-Type: application/json (crucial para FormData).
        // - La verificación de errores HTTP (401, 4xx, 5xx) y el parseo de mensajes de error.
        // - Parsear la respuesta JSON exitosa.
        const responseData = await fetchWithAuth(url, {
            method: 'POST',
            body: formData 
            // La lógica manual de authToken y headers se elimina
        });

        // responseData es el JSON de la API si la subida fue exitosa (código 2xx).
        return responseData;

    } catch (error) {
        // El error ya fue loggeado y lanzado por fetchWithAuth con detalle.
        console.error('Error en el servicio al actualizar la foto de perfil:', error);
        throw error; // Relanzar el error para manejo externo
    }
}