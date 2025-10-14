import { fetchWithAuth } from "../services/serviceLogin.js"; // Asumo que esta ruta es correcta

const BASE_URL = `https://ptchelpdesk-a73934db2774.herokuapp.com/api/notifications`;

// Obtiene el ID del usuario logueado. Es crucial para los endpoints /pending y /count
const getUserId = () => {
    // Es mejor obtener el ID justo antes de la llamada, en caso de que se actualice o se cargue tarde.
    return localStorage.getItem('userId'); 
};


/**
 * 1. Obtiene todas las notificaciones pendientes (seen = 0) para el usuario logueado.
 * @returns {Promise<Array>} Lista de objetos de notificaciones del backend.
 */
export const getPendingNotifications = async () => {
    const userId = getUserId();
    if (!userId) {
        console.error("No se encontró el userId en localStorage.");
        return [];
    }

    const url = `${BASE_URL}/pending/${userId}`;
    try {
        const response = await fetchWithAuth(url, {
            method: 'GET',
        });

        if (!response.ok) {
            // Maneja 401, 403, 500, etc., si llegaran a ocurrir
            const errorBody = await response.text();
            throw new Error(`Error al obtener notificaciones: ${response.status} ${response.statusText || errorBody}`);
        }

        // Leer el texto de la respuesta primero
        const text = await response.text();
        
        // 🚨 CRÍTICO: Si no hay contenido (por ejemplo, 204 No Content), devolvemos un array vacío.
        if (!text || text.length === 0) {
            console.log(`ℹ️ No hay notificaciones pendientes para el usuario ${userId}.`);
            return [];
        }

        // Intentar parsear el JSON
        const data = JSON.parse(text);
        return data; // Retorna la lista de NotificationEntity

    } catch (error) {
        // Captura el error lanzado arriba o cualquier otro fallo de red/parsing
        console.error("❌ Fallo en la llamada a getPendingNotifications:", error);
        // Devolvemos un array vacío para que el frontend no falle
        return [];
    }
};


/**
 * 2. Marca una notificación como vista (seen = 1) en el backend.
 * Nota: Tu frontend usa "Eliminar", lo mapearemos a "Marcar como vista".
 * @param {number} notificationId - ID de la notificación a marcar.
 * @returns {Promise<boolean>} True si la actualización fue exitosa.
 */
export const markNotificationAsSeen = async (notificationId) => {
    const url = `${BASE_URL}/mark-as-seen/${notificationId}`;
    try {
        // PUT para actualizar el estado a "visto"
        const response = await fetchWithAuth(url, {
            method: 'PUT',
        });

        if (response.ok) {
            return true;
        } else {
            console.error(`Fallo al marcar notificación ${notificationId} como vista:`, response.statusText);
            return false;
        }
    } catch (error) {
        console.error("Fallo en la llamada a markNotificationAsSeen:", error);
        return false;
    }
};

/**
 * 3. Configura y conecta el cliente WebSocket (STOMP).
 * @param {Function} onMessageReceived - Callback para manejar notificaciones en tiempo real.
 */
export const connectWebSocket = (onMessageReceived) => {
    // IMPORTANTE: La URL de WebSocket debe usar el mismo dominio que la API REST (Heroku)
    const socketUrl = `https://ptchelpdesk-a73934db2774.herokuapp.com/ws`;
    
    // Usamos el protocolo seguro (wss://) si tu API está en HTTPS, lo cual es típico en Heroku.
    const socket = new SockJS(socketUrl); 
    const stompClient = Stomp.over(socket);

    // Desactivar logs de STOMP para producción (opcional)
    // stompClient.debug = null; 

    stompClient.connect(
        // NO se necesita enviar headers aquí porque la autenticación WebSocket en Spring Boot
        // la configuramos para leer la cookie "authToken" de la petición HTTP de handshake.
        {}, 
        function (frame) {
            console.log('✅ Conectado al WebSocket:', frame);

            // Suscripción al canal privado del usuario: /user/queue/notifications
            stompClient.subscribe('/user/queue/notifications', function (notification) {
                console.log("🔔 Notificación recibida en tiempo real:", notification.body);
                const payload = JSON.parse(notification.body);
                
                // Llama al callback para que el controlador actualice la UI
                onMessageReceived(payload); 
            });
        }, 
        function (error) {
            console.error('❌ Error de conexión WebSocket/STOMP:', error);
            // Mostrar un mensaje de error o intentar reconectar aquí
        }
    );
    
    return stompClient;
};