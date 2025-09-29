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
            const errorText = await res.text();
            throw new Error(`Error ${res.status}: ${errorText}`);
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
            const errorText = await res.text();
            throw new Error(`Error ${res.status}: ${errorText}`);
        }

        const userData = await res.json();

        return userData;
    } catch (err) {
        console.error('Error en getUser:', err);
        throw err;
    }
}

export async function updateUser(userId, formData) {
    try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            throw new Error('No hay token de autenticación');
        }
        
        // Debug mejorado
        for (let pair of formData.entries()) {
            if (pair[0] === 'profilePicture') {
            } else {
            }
        }

        const response = await fetch(`${API_URL}/users/${userId}/profile`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: `;
            try {
                const errorData = await response.json();
                errorMessage += errorData.error || 'Error desconocido';
            } catch {
                const errorText = await response.text();
                errorMessage += errorText || 'Error sin mensaje';
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return result;

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