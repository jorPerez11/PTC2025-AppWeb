import { fetchWithAuth } from "../services/serviceLogin.js";

const API_URL = "https://ptchelpdesk-a73934db2774.herokuapp.com/api";

const commonHeaders = {
    'Content-Type': 'application/json',
};


export async function getCategories(){
    try{
        const response = await fetchWithAuth(`${API_URL}/categories`);

        console.log("Respuesta obtenida:", response); 
        console.log("Status:", response.status); // Verifica si esto es 200

        return response;
        
    }catch(error){
        console.error("Error al obtener las categorias: ", error);
    }
}

export async function getUserTech(page = 0, size = 10, term = '', category = 'all', period = 'all') {
    try {
        // 1. Codificar el término de búsqueda para manejar espacios y caracteres especiales
        const encodedTerm = encodeURIComponent(term);

        const response = await fetchWithAuth(`${API_URL}/users/tech?page=${page}&size=${size}&term=${encodedTerm}&category=${category}&period=${period}`);

        console.log("Respuesta obtenida:", response); 
        console.log("Status:", response.status); // Verifica si esto es 200

        return response;
        
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
        const response = await fetchWithAuth(`${API_URL}/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });
        
        console.log("Respuesta obtenida:", response); 
        console.log("Status:", response.status); // Verifica si esto es 200
        //Debug
        
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