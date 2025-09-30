// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth } from "../services/serviceLogin.js";

const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';

const commonHeaders = {
    'Content-Type': 'application/json',
};

/**
 * Obtiene la cantidad de tickets por estado desde la API
 * @returns {Promise<Object>} Un objeto con el conteo de tickets
 */
export async function getTicketCounts() {
    try {
        // La función `fetchWithAuth` ya se encarga del token y la autenticación
        const response = await fetchWithAuth(`${API_URL}/admin/GetTicketCounts`);

        // Mapea los nombres de estado de la base de datos a los IDs del HTML
        const mappedCounts = {
            enEspera: response['En espera'] || 0,
            enProceso: response['En Progreso'] || 0,
            cerradas: response['Completado'] || 0
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