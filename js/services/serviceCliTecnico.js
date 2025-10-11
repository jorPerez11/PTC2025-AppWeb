// services/serviceCliTecnico.js

// URL de la API de Retool (ya no se usará, pero la mantenemos por referencia)
const API_Clients = 'https://retoolapi.dev/KaRBTk/clienteData';

// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth } from "../services/serviceLogin.js";

// URL de la API real de Spring Boot
const API_Tickets = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api/tickets';

// Se obtiene el token de autenticación
let tokenFijo = localStorage.getItem('authToken');

// Se definen los encabezados comunes con el token
const commonHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenFijo}`
};

/**
 * Obtiene todos los tickets desde la API real.
 * @returns {Promise<Array>} Un array con los datos de los tickets.
 */
export async function getClientes() {
    try {
        // 1. Definir la URL
        const url = `${API_Tickets}/myTickets`;

        // 2. Usar fetchWithAuth
        // fetchWithAuth ya maneja el 'GET', headers, autenticación, 
        // verificación de errores HTTP y el parseo a JSON.
        const data = await fetchWithAuth(url);

        // Si la promesa se resuelve, 'data' ya es el JSON de respuesta.
        return data; 
        
    } catch (err) {
        // fetchWithAuth ya ha registrado un error más detallado.
        // Aquí manejamos la contingencia para devolver un arreglo vacío.
        console.error('Error cargando clientes:', err);
        return [];
    }
}

/**
 * Actualiza el estado de un ticket en la API real.
 * @param {number} ticketId El ID del ticket a actualizar.
 * @param {number} nuevoEstadoId El ID del nuevo estado del ticket.
 * @param {string} nuevoEstadoDisplayName El nombre del nuevo estado (por ejemplo, "En progreso").
 * @returns {Promise<Object>} El objeto de cliente actualizado.
 */
export async function updateTicketStatus(ticketId, nuevoEstadoId, nuevoEstadoDisplayName) {
    // 1. Crear el payload de la petición
    const payload = {
        status: {
            id: nuevoEstadoId,
            displayName: nuevoEstadoDisplayName
        }
    };

    try {
        // 2. Definir la URL
        const url = `${API_Tickets}/updateStatus/${ticketId}`;

        // 3. Usar fetchWithAuth
        // Se pasa 'PATCH' y el cuerpo (body). 
        // fetchWithAuth se encarga de:
        // - JSON.stringify() del body (ya está en el payload, pero fetchWithAuth maneja el Content-Type)
        // - credentials: 'include' (cookies)
        // - headers: {'Content-Type': 'application/json'}
        // - Manejo de errores HTTP (401, 403, 4xx, 5xx)
        const responseData = await fetchWithAuth(url, {
            method: 'PATCH',
            body: JSON.stringify(payload)
            // Ya no necesitas 'headers: commonHeaders'
        });

        // 4. Manejar el éxito: 
        // Si fetchWithAuth no lanzó un error, la petición fue exitosa (2xx).
        // Si el backend no devuelve un body, responseData podría ser la Response original (según tu fetchWithAuth), 
        // pero podemos asumir el éxito si no hubo error.
        
        // Dado que tu lógica original solo quería confirmar el éxito o devolver un mensaje,
        // puedes simplificarlo si la API devuelve un código 204 (No Content) sin cuerpo, 
        // o si devuelve un objeto de confirmación.
        
        return responseData && typeof responseData === 'object' 
            ? responseData 
            : { message: "Ticket actualizado con éxito." };
            
    } catch (err) {
        // fetchWithAuth ya ha loggeado el error con detalles si fue un error HTTP.
        // Relanzamos el error para que pueda ser manejado por la capa superior.
        console.error('Error al actualizar estado:', err);
        throw err;
    }
}

/**
 * Filtra la lista de clientes según los criterios de búsqueda.
 * @param {Array} clientes El array de clientes a filtrar.
 * @param {Object} filtros Los criterios de filtro (término, estado, periodo).
 * @returns {Array} Un array de clientes filtrados.
 */
export function filterClientes(clientes, { term, status, period }) {
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    
    let startDate, endDate;
    switch (period) {
        case 'today':
            startDate = new Date(todayMid);
            endDate = new Date(todayMid);
            endDate.setDate(endDate.getDate() + 1);
            break;
        case 'week':
            startDate = new Date(todayMid);
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date(todayMid);
            endDate.setDate(endDate.getDate() + 1);
            break;
        case 'month':
            startDate = new Date(todayMid.getFullYear(), todayMid.getMonth(), 1);
            endDate = new Date(todayMid.getFullYear(), todayMid.getMonth() + 1, 1);
            break;
    }

    return clientes.filter(cliente => {
        const matchTerm = !term ||
            (cliente.fullName?.toLowerCase().includes(term) ||
             cliente.asunto?.toLowerCase().includes(term) ||
             cliente.id?.toString().includes(term) ||
             cliente.ticketId?.toString().includes(term));

        const matchStatus = status === 'all' || cliente.ticketStatus === status;

        let matchPeriod = period === 'all';
        if (!matchPeriod && cliente.consultDate) {
            const clientDate = new Date(cliente.consultDate);
            if (!isNaN(clientDate)) {
                matchPeriod = clientDate >= startDate && clientDate < endDate;
            }
        }
        return matchTerm && matchStatus && matchPeriod;
    });
}

/**
 * Acorta un texto y añade puntos suspensivos si es necesario.
 * @param {string} texto El texto a truncar.
 * @param {number} longitud La longitud máxima del texto.
 * @returns {string} El texto truncado o el texto original.
 */
export function truncarTexto(texto, longitud = 50) {
    if (typeof texto !== 'string' || texto.length <= longitud) {
        return texto;
    }
    return texto.substring(0, longitud) + '...';
}

/**
 * Formatea una fecha en formato local.
 * @param {string} fechaStr La cadena de fecha.
 * @returns {string} La fecha formateada o 'N/A'.
 */
export function formatearFecha(fechaStr) {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'N/A';
    return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}