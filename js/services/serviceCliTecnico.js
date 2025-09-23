// services/serviceCliTecnico.js

// URL de la API de Retool (ya no se usará, pero la mantenemos por referencia)
const API_Clients = 'https://retoolapi.dev/KaRBTk/clienteData';

// URL de la API real de Spring Boot
const API_Tickets = 'http://localhost:8080/api/tickets';

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
        const res = await fetch(`${API_Tickets}/myTickets`, {
            method: 'GET',
            headers: commonHeaders
        });
        if (!res.ok) {
            throw new Error('Error al cargar los clientes.');
        }
        return await res.json();
    } catch (err) {
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
    try {
        const res = await fetch(`${API_Tickets}/updateStatus/${ticketId}`, {
            method: 'PATCH',
            headers: commonHeaders,
            // Creamos el payload con el formato correcto que el backend espera
            body: JSON.stringify({
                status: {
                    id: nuevoEstadoId,
                    displayName: nuevoEstadoDisplayName
                }
            })
        });
        
        // Verifica si la respuesta es exitosa (código 204 No Content para PATCH o 200 OK)
        if (res.status === 204 || res.ok) {
            return { message: "Ticket actualizado con éxito." };
        } else {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Falló la actualización en la API.');
        }
    } catch (err) {
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