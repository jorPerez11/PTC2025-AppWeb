// service/serviceAllClients.js

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
        const url = new URL(`${API_CLIENTS}/getAllClients`);
        url.searchParams.append('page', page);
        url.searchParams.append('size', size);

        // Agrega los parámetros de filtro si no son 'all' o vacíos
        if (status !== 'all') {
            url.searchParams.append('status', status);
        }
        if (period !== 'all') {
            url.searchParams.append('period', period);
        }
        if (searchTerm !== '') {
            url.searchParams.append('search', searchTerm);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: commonHeaders
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
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
        const response = await fetch(`${API_TICKETS}/${ticketId}`, {
            method: 'GET',
            headers: commonHeaders
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener los detalles del ticket ${ticketId}:`, error);
        return null;
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