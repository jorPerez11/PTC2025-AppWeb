// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth } from "../services/serviceLogin.js";

const API_URL = "http://localhost:8080/api";

// Define los encabezados comunes, incluyendo el token de autorización
const commonHeaders = {
    'Content-Type': 'application/json',
};

export async function getTickets(page = 0, size = 10) {
    const url = `${API_URL}/admin/GetTickets?page=${page}&size=${size}`;
    
    try {
        // 🚨 Ejecuta fetchWithAuth
        const response = await fetchWithAuth(url); 

        // 🚨 DEBUG: Muestra el objeto de respuesta en la consola
        console.log("Respuesta obtenida:", response); 
        console.log("Status:", response.status); // Verifica si esto es 200
        
        return response;
        
    } catch (error) {
        
        // Si response existe, pero falló
        console.error("Error al obtener los tickets:", error);
        throw error;
    }
}

export async function createTicket(data) {
    try {
        const response = await fetch(`${API_URL}/client/PostTicket`, {
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

export async function updateTicket(payload, id) {
    const url = `${API_URL}/client/UpdateTicket/${id}`;
    
    // **CRÍTICO:** Usamos 'payload' en lugar de 'data' para consistencia con tu ticketController
    // El 'payload' es el objeto que contiene el nuevo estado del ticket.

    try {
        
        const data = await fetchWithAuth(url, {
            method: "PATCH",
            // fetchWithAuth se encarga de JSON.stringify(body) si sigue la convención
            // Si no sigue la convención, se pasaría como 'body' normal:
            body: JSON.stringify(payload) 
        });
        
        // Si fetchWithAuth es exitoso (status < 400) y devuelve datos, retorna esos datos.
        // Si no devuelve contenido (ej. 204 No Content), data será {} o null
        return data; 

    } catch (error) {
        // Este catch captura los errores limpios lanzados por fetchWithAuth.
        console.error(`Error al actualizar el ticket ${id}:`, error.message);
        throw error; // Re-lanza el error para que el ticketController lo maneje
    }
}

export async function deleteTicket(id) {
    try {
        const response = await fetch(`${API_URL}/client/DeleteTicket/${id}`, {
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

