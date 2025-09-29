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

export async function fetchNewUsersData() {
    try {
        const response = await fetch('http://localhost:8080/api/users/counts-by-month', {
            method: 'GET',
            headers: commonHeaders
        });
        if (!response.ok) {
            throw new Error(`HTTP error, status: ${response.status}`);
        }
        const data = await response.json();

        const categories = Object.keys(data);
        const values = Object.values(data);

        // Opcional -- mostrar los nombres completos de los meses en el eje X
        const monthNames = categories.map(key => {
            const [year, month] = key.split('-');
            const date = new Date(year, month - 1, 1);
            return date.toLocaleString('es-ES', { month: 'short' });
        });

        return {
            categories: monthNames,
            values: values
        };

    } catch (error) {
        console.error("Error al obtener los datos de usuarios:", error);
        // Devolver datos por defecto en caso de error
        return {
            categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            values: [0, 0, 0, 0, 0, 0]
        };
    }
}