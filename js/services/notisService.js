// js/services/notisService.js

// Asumimos que 'fetchWithAuth' incluye el JWT automáticamente en los headers
import { fetchWithAuth } from "../services/serviceLogin.js"; 

const BASE_API_URL = `https://ptchelpdesk-a73934db2774.herokuapp.com/api/notifications`;

/**
 * Función auxiliar para obtener el ID del usuario desde localStorage.
 * @returns {string | null} El ID del usuario o null si no existe.
 */
function getUserId() {
    // Obtiene el 'userId' directamente de localStorage, como solicitaste.
    return localStorage.getItem('userId'); 
}

/**
 * 1. Carga el historial de notificaciones desde el API REST.
 * @returns {Promise<Array>} Lista de notificaciones.
 */
export async function getNotificationHistory() {
    const userId = getUserId(); 
    if (!userId) {
        console.error("Error: userId no encontrado en localStorage.");
        return [];
    }
    
    // Endpoint para obtener el historial: /api/notifications/history?userId={userId}
    const API_URL = `${BASE_API_URL}/history?userId=${userId}`;

    try {
        const response = await fetchWithAuth(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error al cargar historial: ${response.statusText}`);
        }

        // Retorna la lista de objetos NotificationDTO del backend
        return await response.json(); 

    } catch (error) {
        console.error("❌ Error al obtener el historial de notificaciones:", error);
        return [];
    }
}

/**
 * 2. Conexión y Suscripción al WebSocket.
 * @param {function} onNotificationReceived - Callback que se ejecuta cuando llega un mensaje.
 * @returns {Object | null} El cliente STOMP o null si falla la conexión.
 */
export function connectWebSocket(onNotificationReceived) {
    const userId = getUserId();
    const token = localStorage.getItem('jwt_token'); // Asumimos que el token también está en localStorage

    if (!userId || !token) {
        console.error("Error: userId o Token JWT no encontrados. No se puede conectar el WebSocket.");
        return null;
    }

    // El backend usa /ws para el endpoint STOMP
    const socket = new SockJS('https://ptchelpdesk-a73934db2774.herokuapp.com/ws'); 
    const stompClient = Stomp.over(socket);
    
    // El token es CRUCIAL para que Spring Security (JwtHandshakeInterceptor) identifique al usuario.
    const headers = {
        'Authorization': `Bearer ${token}` 
        // Spring Security extraerá el 'username' (que debe ser el userId) del token.
    };

    stompClient.connect(headers, frame => {
        console.log(`🔗 Conectado al WebSocket (User ID: ${userId})`);

        // Suscripción al destino privado. El destino final: /user/{userId}/queue/notifications
        const destination = `/user/queue/notifications`;
        
        stompClient.subscribe(destination, message => {
            console.log('📩 Mensaje recibido en tiempo real:', message.body);
            // El cuerpo del mensaje es el JSON (NotificationMessageDTO)
            const notification = JSON.parse(message.body);
            
            onNotificationReceived(notification); 
        });

    }, error => {
        console.error('❌ Error de conexión WebSocket:', error);
    });

    return stompClient;
}

// Exporta las funciones para que el controlador las use
export const notificationService = {
    getNotificationHistory,
    connectWebSocket,
};