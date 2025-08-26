const API_URL = "http://localhost:8080/api";

let tokenFijo = localStorage.getItem('authToken');

// Define los encabezados comunes, incluyendo el token de autorización
const commonHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenFijo}`
};
//s

export async function getActivities(page = 0, size = 10) {
    try {
        const response = await fetch(`${API_URL}/GetActivities?page=${page}&size=${size}`, {
            method: 'GET',
            headers: commonHeaders
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener los tickets:", error);
        throw error;
    }
}

export async function createActivity(data) {
    try {
        const response = await fetch(`${API_URL}/PostActivity`, {
            method: "POST",
            headers: commonHeaders,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // Si la creación es exitosa, podrías querer devolver algo o manejar la respuesta.
        return response.json();
    } catch (error) {
        console.error("Error al crear el ticket:", error);
        throw error;
    }
}

export async function updateActivity(data, id) {
    try {
        const response = await fetch(`${API_URL}/UpdateActivity/${id}`, {
            method: "PATCH",
            headers: commonHeaders,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        if (response.status === 204 || response.status === 202 || response.headers.get('content-length') === '0') {
        return {}; // Devuelve un objeto vacío y sal de la función.
        }

        
        // Maneja la respuesta de la actualización si es necesario
        return response.json();
    } catch (error) {
        console.error("Error al actualizar el ticket:", error);
        throw error;
    }
}

export async function deleteActivity(id) {
    try {
        const response = await fetch(`${API_URL}/DeleteActivity/${id}`, {
            method: "DELETE",
            headers: commonHeaders
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // Maneja la respuesta de la eliminación si es necesario
        // Por ejemplo, podrías devolver un estado de éxito
        return { status: "success" };
    } catch (error) {
        console.error("Error al eliminar el ticket:", error);
        throw error;
    }
}