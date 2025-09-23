const API_URL = "http://localhost:8080/api";

let tokenFijo = localStorage.getItem('authToken');
// Define los encabezados comunes, incluyendo el token de autorización
const commonHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenFijo}`
};

export async function getUserTech(page = 0, size = 10, term = '', category = 'all', period = 'all') {
    try {
        // 1. Codificar el término de búsqueda para manejar espacios y caracteres especiales
        const encodedTerm = encodeURIComponent(term);

        const response = await fetch(`${API_URL}/users/tech?page=${page}&size=${size}&term=${encodedTerm}&category=${category}&period=${period}`, {
            method: 'GET',
            headers: commonHeaders
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

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
        const response = await fetch(`${API_URL}/users/registerTech`, {
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
        console.error("Error al crear el técnico:", error);
        throw error;
    }
}

export async function updateUserTech(data, id) {
    try {
        const response = await fetch(`${API_URL}/UpdateUser/${id}`, {
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
        console.error("Error al actualizar el técnico:", error);
        throw error;
    }
}

export async function deleteUserTech(id) {
    try {
        const response = await fetch(`${API_URL}/DeleteUser/${id}`, {
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
        console.error("Error al eliminar el técnico:", error);
        throw error;
    }
}