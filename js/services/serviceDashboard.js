// 1. Obtener el token de autenticación desde el localStorage
const token = localStorage.getItem('authToken');

const commonHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ token }`
    };

/**
 * Obtiene la cantidad de tickets por estado desde la API.
 * @returns {Promise<Object>} Un objeto con el conteo de tickets.
 */

export async function getTicketCounts() {
    try {

        // 2. Si no hay token, no se puede hacer la solicitud.
        if (!token) {
            console.error("No se encontró un token de autenticación. La solicitud no se puede realizar.");
            return {
                enEspera: 0,
                enProceso: 0,
                cerradas: 0
            };
        }

        const response = await fetch('http://localhost:8080/api/GetTicketCounts', {
            method: 'GET',
            headers: commonHeaders
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos de la API');
        }

        const counts = await response.json();

        // Mapea los nombres de estado de la base de datos a los IDs del HTML
        const mappedCounts = {
            enEspera: counts['En espera'] || 0,
            enProceso: counts['En Progreso'] || 0,
            cerradas: counts['Completado'] || 0
        };

        return mappedCounts;
    } catch (error) {
        console.error("No se pudo obtener el conteo de tickets:", error);
        return {
            enEspera: 0,
            enProceso: 0,
            cerradas: 0
        };
    }
}