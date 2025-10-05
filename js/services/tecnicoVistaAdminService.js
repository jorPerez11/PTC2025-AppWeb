import { fetchWithAuth } from "./serviceLogin";

const API_URL = "https://ptchelpdesk-a73934db2774.herokuapp.com/api";

const commonHeaders = {
    'Content-Type': 'application/json',
};

export async function getUserTech(page = 0, size = 10, term = '', category = 'all', period = 'all') {
    try {
        // 1. Codificar el término de búsqueda para manejar espacios y caracteres especiales
        const encodedTerm = encodeURIComponent(term);

        const response = await fetchWithAuth(`${API_URL}/users/tech?page=${page}&size=${size}&term=${encodedTerm}&category=${category}&period=${period}`);

        console.log("Respuesta obtenida:", response); 
        console.log("Status:", response.status); // Verifica si esto es 200

        // 2. Obtener el texto de la respuesta (seguro contra errores de parseo)
        const responseText = await response.text(); 
        
        // Si la respuesta está vacía o es 'null'
        if (!responseText) {
            // Devolver un objeto de paginación vacío
            return { content: [], totalElements: 0, totalPages: 0 };
        }

        // 3. Intentar parsear el JSON
        try {
            const data = JSON.parse(responseText);
            return data;
        } catch (jsonError) {
            // Si el JSON es inválido, logueamos el error.
            console.error("Error de Parsing JSON:", jsonError, "Texto:", responseText);
            
            // Y devolvemos un objeto de paginación vacío para evitar que el controlador falle.
            return { content: [], totalElements: 0, totalPages: 0 }; 
        }
        
    } catch (error) {
       console.error("Error al obtener los técnicos (Conexión/Red):", error);
        
        // Devolvemos una estructura vacía para evitar que la cadena asíncrona se rompa.
        return { content: [], totalElements: 0, totalPages: 0 };
        }
}

export async function createUserTech(data) {
    try {
        const response = await fetchWithAuth(`${API_URL}/users/registerTech`, {
            method: "POST",
            body: JSON.stringify(data)
        });

        console.log("Respuesta obtenida:", response); 
        console.log("Status:", response.status); // Verifica si esto es 200

        return response;
    } catch (error) {
        console.error("Error al crear el técnico:", error);
        throw error;
    }
}

export async function updateUserTech(data, id) {
    try {
        const response = await fetchWithAuth(`${API_URL}/UpdateUser/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });
        
        console.log("Respuesta obtenida:", response); 
        console.log("Status:", response.status); // Verifica si esto es 200

        if (response.status === 204 || response.status === 202 || response.headers.get('content-length') === '0') {
        return {}; // Devuelve un objeto vacío y sal de la función.
        }

        
        // Maneja la respuesta de la actualización si es necesario
        return response;
    } catch (error) {
        console.error("Error al actualizar el técnico:", error);
        throw error;
    }
}

export async function deleteUserTech(id) {
    try {
        const response = await fetchWithAuth(`${API_URL}/DeleteUser/${id}`, {
            method: "DELETE",
        });

        console.log("Respuesta obtenida:", response); 

        // Maneja la respuesta de la eliminación si es necesario
        // Por ejemplo, podrías devolver un estado de éxito
        return response;
    } catch (error) {
        console.error("Error al eliminar el técnico:", error);
        throw error;
    }
}