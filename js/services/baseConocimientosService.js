const API_URL = "http://localhost:8080/api";

let tokenFijo = localStorage.getItem('authToken');

// Define los encabezados comunes, incluyendo el token de autorización
const commonHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenFijo}`
};

export async function getSolutions(page = 0, size = 10) {
    try {
        const response = await fetch(`${API_URL}/GetSolutions?page=${page}&size=${size}`, {
            method: 'GET',
            headers: commonHeaders
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener las soluciones:", error);
        throw error;
    }
}

export async function createSolution(data) {
    try {
        const response = await fetch(`${API_URL}/PostSolution`, {
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
        console.error("Error al crear la solución:", error);
        throw error;
    }
}

export async function updateSolution(solutionId, data) {
    try {
        const response = await fetch(`${API_URL}/UpdateSolution/${solutionId}`, {
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
        console.error("Error al actualizar la solución:", error);
        throw error;
    }
}

export async function deleteSolution(id) {
    try {
        const response = await fetch(`${API_URL}/DeleteSolution/${id}`, {
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
        console.error("Error al eliminar la solución:", error);
        throw error;
    }
}