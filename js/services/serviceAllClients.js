// service/serviceAllClients.js

// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth } from "../services/serviceLogin.js";

// Usaremos las URLs de tu API de Spring Boot
const API_CLIENTS = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api/clients';
const API_TICKETS = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api/tickets';
const API_URL = "https://ptchelpdesk-a73934db2774.herokuapp.com/api";

// Se obtiene el token de autenticación
let tokenFijo = localStorage.getItem('authToken');

// Se definen los encabezados comunes con el token
const commonHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenFijo}`
};

/**
 * Busca técnicos filtrando por un término de búsqueda.
 * Adaptado para el formato que Select2 espera.
 * @param {string} term El término de búsqueda (nombre, usuario, ID).
 * @returns {Promise<Object>} Objeto con formato { results: [ {id, text} ], total_count: number }
 */
// serviceAllClients.js (FUNCIÓN CORREGIDA)

// Asegúrate de definir API_URL globalmente
// const API_URL = '...'; 

export async function fetchTechUsersForSearch(term) {
    try {
        const encodedTerm = encodeURIComponent(term);
        
        // Usar valores fijos o razonables para los parámetros no proporcionados por Select2
        const page = 0;
        const size = 20; 
        const category = 'all'; // Omitir si no es necesario para la búsqueda de técnicos
        const period = 'all';   // Omitir si no es necesario para la búsqueda de técnicos

        const response = await fetchWithAuth(`${API_URL}/users/tech?page=${page}&size=${size}&term=${encodedTerm}&category=${category}&period=${period}`);
        if (!response.ok) {
            throw new Error(`Error al buscar técnicos: ${response.statusText}`);
        }
        const data = await response.json();

        // Mapeo al formato Select2 (id y text)
        const transformedResults = data.content.map(user => ({
            id: user.id, // Usar 'userId' si es el campo correcto de tu DTO
            text: `${user.name} (${user.username}) - ID: ${user.userId}`
        }));

        return {
            results: transformedResults,
            // total_count es opcional si no usas paginación en Select2
            // total_count: data.totalElements 
        };

    } catch (error) {
        console.error("Error en fetchTechUsersForSearch:", error);
        return { results: [] };
    }
}

/**
 * Realiza la solicitud PATCH para reasignar un técnico a un ticket.
 * * NOTA: Esta implementación utiliza el endpoint general de actualización
 * de tickets del cliente y envía un payload parcial (TicketDTO) que solo contiene
 * el ID del nuevo técnico para que el backend lo procese.
 * * @param {number} ticketId El ID del ticket a reasignar.
 * @param {number} newTechnicianId El ID del nuevo técnico.
 * @returns {Promise<boolean>} Devuelve true si la reasignación fue exitosa.
 */
export async function patchTicketTechnician(ticketId, newTechnicianId) {

    try {
        // 1. Construir el payload (TicketDTO parcial) que tu backend espera
        const payload = {
            // Se debe enviar la estructura anidada que el backend consume
            assignedTech: {
                id: newTechnicianId
            }
        };

        // 2. Usar el endpoint de actualización general: /client/UpdateTicket/{ticketId}
        const response = await fetchWithAuth(`${API_BASE_URL}/client/UpdateTicket/${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorMessage = `Fallo la reasignación. Estado: ${response.status}`;

            try {
                // Intentar leer el cuerpo de error del servidor
                const errorBody = await response.json();
                errorMessage = errorBody.error || errorBody.message || errorMessage;
            } catch (e) {
                // Si la respuesta no es JSON o es vacía
                errorMessage = response.statusText;
            }

            throw new Error(errorMessage);
        }

        // Si el backend devuelve 204 No Content (o 200 OK), se considera exitoso
        return true;

    } catch (error) {
        console.error("Error en patchTicketTechnician:", error);
        // Usar Swal para mostrar el error capturado o uno genérico
        Swal.fire('Error de Reasignación', error.message || 'Ocurrió un error desconocido al reasignar el técnico.', 'error');
        return false;
    }
}

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