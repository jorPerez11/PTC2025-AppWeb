// js/services/serviceConfig.js

const API_URL = 'http://localhost:8080/api';

function getAuthHeaders() {
    const authToken = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

export async function getUserId() {
    const username = localStorage.getItem('username');
    if (!username) {
        throw new Error('No se encontró el username en el localStorage.');
    }

    try {
        const res = await fetch(`${API_URL}/GetUserByUsername/${username}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Error al obtener el ID: ${res.status} ${res.statusText}`);
        }

        const userData = await res.json();
        return userData.id;
    } catch (err) {
        console.error('Error en getUserId:', err);
        throw err;
    }
}

export async function getUser(userId) {
    try {
        const res = await fetch(`${API_URL}/GetUser/${userId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Error al cargar el usuario: ${res.status} ${res.statusText}`);
        }
        return await res.json();
    } catch (err) {
        console.error('Error en getUser:', err);
        throw err;
    }
}

/**
 * Actualiza los datos del usuario en la API.
 */
export async function updateUser(userId, formData) {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/users/${userId}/profile`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en updateUser:', error);
        throw error;
    }
}

/**
 * Actualiza solo la foto de perfil del usuario.
 */
export async function updateUserProfilePicture(userId, profilePictureFile) {
    const formData = new FormData();
    formData.append('profilePicture', profilePictureFile);

    try {
        const authToken = localStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/users/${userId}/profile-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al actualizar la foto de perfil.');
        }

        return await res.json();
    } catch (error) {
        console.error('Error en el servicio al actualizar la foto de perfil:', error);
        throw error;
    }
}