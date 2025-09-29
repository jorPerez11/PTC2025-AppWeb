// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth } from "../services/serviceLogin.js";

const API_URL = "http://localhost:8080/api";

// Define los encabezados comunes, incluyendo el token de autorización
const commonHeaders = {
    'Content-Type': 'application/json',
};
//

export async function getActivities(page = 0, size = 10, searchTerm = '') {
    try {
        let url = `${API_URL}/GetActivities?page=${page}&size=${size}`;

        //  Añadir el término de búsqueda si existe
        if (searchTerm.trim() !== '') {
            // Asumimos que el parámetro de búsqueda en GetActivities es 'search'
            url += `&search=${encodeURIComponent(searchTerm)}`; 
        }
        
        console.log("URL de Paginación y Búsqueda:", url); 

        const response = await fetchWithAuth(url);
        return response;
    } catch (error) {
        console.error("Error al obtener las actividades:", error);
        throw error;
    }
}

export async function searchActivity(page = 0, size = 10){
    try{



    }catch (error) {
        console.error("Error al obtener los tickets:", error);
        throw error;
    }
}

export async function createActivity(data) {
    try {
        const response = await fetchWithAuth(`${API_URL}/PostActivity`, {
            method: "POST",
            body: JSON.stringify(data)
        });

        // 🚨 DEBUG: Muestra el objeto de respuesta en la consola
        console.log("Respuesta obtenida:", response); 

        // Si la creación es exitosa, devuelve la respuesta.
        return response;
    } catch (error) {
        console.error("Error al crear el ticket:", error);
        throw error;
    }
}

export async function updateActivity(data, id) {

    const url = `${API_URL}/UpdateActivity/${id}`;

    try {
        const response = await fetchWithAuth(url, {
            method: "PATCH",
            // fetchWithAuth se encarga de JSON.stringify(body) si sigue la convención
            // Si no sigue la convención, se pasaría como 'body' normal:
            body: JSON.stringify(data) 
        });
        
        // 🚨 DEBUG: Muestra el objeto de respuesta en la consola
        console.log("Respuesta obtenida:", response); 
        console.log("Status:", response.status); // Verifica si esto es 200

        
        // Maneja la respuesta de la actualización si es necesario
        return response;
    } catch (error) {
        console.error("Error al actualizar el ticket:", error);
        throw error;
    }
}

export async function deleteActivity(id) {
    try {
        const response = await fetchWithAuth(`${API_URL}/DeleteActivity/${id}`, {
            method: "DELETE",
        });

        // 🚨 DEBUG: Muestra el objeto de respuesta en la consola
        console.log("Respuesta obtenida:", response); 

        // Maneja la respuesta de la eliminación si es necesario
        // Por ejemplo, podrías devolver un estado de éxito
        return response;
    } catch (error) {
        console.error("Error al eliminar el ticket:", error);
        throw error;
    }
}