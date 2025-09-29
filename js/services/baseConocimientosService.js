// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth } from "../services/serviceLogin.js";

const API_URL = "http://localhost:8080/api";

// Define los encabezados comunes, incluyendo el token de autorización
const commonHeaders = {
    'Content-Type': 'application/json',
};
//DEPURACION PRUEBA

export async function getSolutions(page = 0, size = 10, searchTerm = '', categoryFilter = 'Todos') {
    try {
        // 1. Iniciar la URL con paginación
        let url = `${API_URL}/GetSolutionsWeb?page=${page}&size=${size}`;

        // 2. Añadir el término de búsqueda si existe (usando 'search' como parámetro)
        if (searchTerm.trim() !== '') {
            url += `&search=${encodeURIComponent(searchTerm)}`; 
        }

        // 3. Añadir el filtro de categoría si no es 'Todos'
        // Asumiendo que la API espera 'categoryId' o 'category' como parámetro para filtrar por ID
        if (categoryFilter !== 'Todos') {
            url += `&category=${categoryFilter}`; 
        }
        
        console.log("URL de Búsqueda y Filtro de Soluciones:", url); 

        const response = await fetchWithAuth(url);
        return response;
    } catch (error) {
        console.error("Error al obtener las soluciones:", error);
        throw error;
    }
}

export async function createSolution(data) {
    try {
        const response = await fetchWithAuth(`${API_URL}/PostSolution`, {
            method: "POST",
            body: JSON.stringify(data) 
        });

        // 🚨 DEBUG: Muestra el objeto de respuesta en la consola
        console.log("Respuesta obtenida:", response); 

        return response;
    } catch (error) {
        console.error("Error al crear la solución:", error);
        throw error;
    }
}

export async function updateSolution(solutionId, data) {

    const url = `${API_URL}/UpdateSolution/${solutionId}`;

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
        console.error("Error al actualizar la solución:", error);
        throw error;
    }
}

export async function deleteSolution(id) {
    try {
        const response = await fetchWithAuth(`${API_URL}/DeleteSolution/${id}`, {
            method: "DELETE"
        });

        // 🚨 DEBUG: Muestra el objeto de respuesta en la consola
        console.log("Respuesta obtenida:", response); 
        console.log("Status:", response.status); // Verifica si esto es 200

        // Maneja la respuesta de la eliminación si es necesario
        // Por ejemplo, podrías devolver un estado de éxito
        return response;
    } catch (error) {
        console.error("Error al eliminar la solución:", error);
        throw error;
    }
}