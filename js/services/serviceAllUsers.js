// URL base del backend Spring Boot
// ¡IMPORTANTE! Cambia 'http://localhost:8080' por la URL real de tu API cuando la despliegues.
const BASE_BACKEND_API_URL = 'http://localhost:8080/api';

/**
 * Función para obtener el token de autenticación del localStorage.
 * Esto asegura que siempre se obtenga el token más actual.
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Función para construir los headers comunes con el token de autorización.
 * Se llama antes de cada petición para asegurar que el token esté actualizado.
 */
function getCommonHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '' // Añade el token solo si existe
    };
}

/**
 * Obtiene todos los usuarios de la API con paginación y filtros.
 * @param {number} page - El número de página a solicitar (basado en 0).
 * @param {number} size - La cantidad de elementos por página.
 * @param {string} searchTerm - Término de búsqueda por nombre, email o ID.
 * @param {string} statusFilter - Filtro por estado de solicitud.
 * @param {string} periodFilter - Filtro por período de registro.
 * @returns {Promise<Object>} Un objeto Page con el array de usuarios y metadatos de paginación.
 */
export async function getUsersFromAPI(page = 0, size = 10, searchTerm = '', statusFilter = 'all', periodFilter = 'all') {
    // Construir la URL con parámetros de consulta
    const queryParams = new URLSearchParams({
        page: page,
        size: size,
        term: searchTerm,
        status: statusFilter, // <-- ¡CAMBIO CLAVE AQUÍ! Ahora se envía como 'status'
        period: periodFilter
    }).toString();

    const url = `${BASE_BACKEND_API_URL}/GetUsers?${queryParams}`;

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: getCommonHeaders() // Usar la función para obtener headers actualizados
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                // Manejar la no autorización, por ejemplo, redirigir al login
                console.error("No autorizado o prohibido. Redirigiendo al login...");
                // window.location.href = '/login'; // Descomentar para redirigir
            }
            throw new Error(`Error al obtener usuarios: ${res.status} ${res.statusText}`);
        }
        return await res.json();
    } catch (err) {
        console.error('Error cargando usuarios desde la API:', err);
        throw err;
    }
}

/**
 * Obtiene un usuario específico por su ID desde la API.
 * @param {number} userId - El ID del usuario a buscar.
 * @returns {Promise<Object>} El objeto del usuario.
 */
export async function getUserById(userId) {
    const url = `${BASE_BACKEND_API_URL}/GetUser/${userId}`;
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: getCommonHeaders()
        });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                console.error("No autorizado o prohibido. Redirigiendo al login...");
                // window.location.href = '/login';
            }
            throw new Error(`Error al obtener usuario ${userId}: ${res.status} ${res.statusText}`);
        }
        return await res.json();
    } catch (err) {
        console.error(`Error cargando el usuario ${userId} desde la API:`, err);
        throw err;
    }
}

/**
 * Obtiene todos los detalles de un ticket para el modal, incluyendo autenticación.
 * @param {number} ticketId - El ID del ticket a buscar.
 * @returns {Promise<Object>} Un objeto con los detalles del ticket (AllUsersDTO).
 */
export async function getTicketDetailsForModal(ticketId) {
    const url = `${BASE_BACKEND_API_URL}/GetTicketDetailsForModal/${ticketId}`;
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: getCommonHeaders()
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                console.error("No autorizado o prohibido. Redirigiendo al login...");
                // window.location.href = '/login';
            }
            throw new Error(`Error al obtener detalles del ticket: ${res.status} ${res.statusText}`);
        }

        return await res.json();
    } catch (err) {
        console.error(`Error al cargar los detalles del ticket ${ticketId} desde la API:`, err);
        throw err;
    }
}

/**
 * NOTA: La función `filterUsers` que tenías era para filtrar en el frontend.
 * Con la paginación y el filtrado en el backend, esta función ya no es necesaria
 * para la lógica principal de carga de datos, ya que el backend maneja el filtrado.
 * La mantengo aquí comentada si aún tienes algún uso secundario para ella.
 */
// export function filterUsers(allUsers, searchTerm, statusFilter, periodFilter) {
//     const term = searchTerm.toLowerCase().trim();
//     return allUsers.filter(user => {
//         // ... (tu lógica de filtro frontend)
//     });
// }

/**
 * Formatea una cadena de fecha a un formato legible en español.
 * @param {string} fechaStr - La cadena de fecha a formatear.
 * @returns {string} La fecha formateada o 'N/A' si no es válida.
 */
export function formatearFecha(fechaStr) {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'N/A'; // Verifica si la fecha es inválida
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Parsea una cadena de fecha en español a un objeto Date.
 * (Nota: Esta función no se usa directamente en el filtro actual, pero se mantuvo si la necesitas).
 * @param {string} dateString - La cadena de fecha en español (ej. "1 de enero de 2023").
 * @returns {Date} Un objeto Date.
 */
export function parseSpanishDate(dateString) {
    const meses = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
        'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    const parts = dateString.replace(/ de /g, ' ').split(' ');
    const day = parseInt(parts[0], 10);
    const month = meses[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

// Mapa de estado → [claseIcono, claseColor] para mostrar iconos y colores
export const statusIconMap = {
    'En Proceso': ['bi-grid', 'text-warning'],         // 🎫 naranja
    'Cerrado': ['bi-check-circle', 'text-success'],      // ✅ verde
    'En Espera': ['bi-clock', 'text-danger']          // ⏰ naranja
};
