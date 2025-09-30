// service/serviceAllClients.js

// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth } from "../services/serviceLogin.js";

// Usaremos las URLs de tu API de Spring Boot
const API_CLIENTS = 'http://localhost:8080/api/clients'; 
const API_TICKETS = 'http://localhost:8080/api/tickets';

// Se obtiene el token de autenticación
let tokenFijo = localStorage.getItem('authToken');

// Se definen los encabezados comunes con el token
const commonHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenFijo}`
};

/**
 * Obtiene los clientes paginados y filtrados de la API de tu backend.
 * @param {number} page El número de página a obtener (basado en 0).
 * @param {number} size La cantidad de elementos por página.
 * @param {string} status El estado del ticket a filtrar.
 * @param {string} period El período de tiempo a filtrar.
 * @param {string} searchTerm El término de búsqueda.
 * @returns {Promise<Object>} Un objeto de página con el contenido y metadatos.
 */
async function fetchAllClients(page = 0, size = 10, status = 'all', period = 'all', searchTerm = '') {
    try {
        // 1. Construir la URL con los parámetros de búsqueda.
        // Se construye solo la parte del path y los parámetros.
        let urlPath = `${API_CLIENTS}/getAllClients?page=${page}&size=${size}`;

        // Agrega los parámetros de filtro si no son 'all' o vacíos
        if (status !== 'all') {
            urlPath += `&status=${status}`;
        }
        if (period !== 'all') {
            urlPath += `&period=${period}`;
        }
        if (searchTerm !== '') {
            urlPath += `&search=${encodeURIComponent(searchTerm)}`; // Es buena práctica codificar el término de búsqueda
        }

        // 2. Usar fetchWithAuth.
        // Como es un GET por defecto y no lleva body, no necesitamos pasar un segundo argumento
        const data = await fetchWithAuth(urlPath, {
             method: 'GET',
        });

        // fetchWithAuth ya maneja la verificación de 'response.ok' y el parseo a JSON.
        return data; 
    } catch (error) {
        // fetchWithAuth ya lanza un error más específico, aquí solo manejamos la contingencia.
        console.error('Error al obtener la lista de clientes paginada:', error);
        return { content: [], totalElements: 0, totalPages: 0 };
    }
}

/**
 * Obtiene los detalles de un ticket específico.
 * @param {string} ticketId El ID del ticket.
 * @returns {Promise<Object>} Un objeto con los detalles del ticket.
 */
async function fetchTicketDetails(ticketId) {
    try {
        // 1. Construir la URL completa para los detalles del ticket.
        const url = `${API_TICKETS}/${ticketId}`;

        // 2. Usar fetchWithAuth para manejar la petición con autenticación.
        // fetchWithAuth asume 'GET' y 'application/json' por defecto.
        // No es necesario pasar 'method: 'GET'' ni 'headers: commonHeaders'.
        const data = await fetchWithAuth(url);

        // fetchWithAuth ya verificó que la respuesta sea exitosa (response.ok) 
        // y parseó el JSON, o lanzó un Error si hubo un problema.
        return data;
        
    } catch (error) {
        // Manejar el error, que ya fue lanzado y loggeado por fetchWithAuth.
        console.error(`Error al obtener los detalles del ticket ${ticketId}:`, error);
        return null; // Devolver 'null' como valor de contingencia
    }
}

/**
 * Formatea una fecha en una cadena legible en español.
 * @param {string} dateString La fecha en formato de cadena.
 * @returns {string} La fecha formateada.
 */
function formatRegistrationDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Exportamos las funciones que el controlador necesita
export {
    fetchAllClients,
    fetchTicketDetails,
    formatRegistrationDate
};