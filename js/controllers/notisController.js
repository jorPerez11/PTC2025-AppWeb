// js/controllers/notisController.js

// Importa el nuevo servicio de notificaciones
import { notificationService } from '../services/notisService.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const noNotificationsView = document.getElementById('no-notifications-view');
    
    // Contenedor principal para la lista de notificaciones (se creará al inicio)
    const notificationsListContainer = document.createElement('div');
    notificationsListContainer.id = 'notifications-list';
    notificationsListContainer.className = 'notifications-container';
    
    // Asegurarse de que solo se añade una vez
    if (!document.getElementById('notifications-list')) {
        mainContent.appendChild(notificationsListContainer);
    }
    
    /**
     * Mapea los datos del backend a un formato usable en el frontend
     * @param {Object} data - NotificationDTO (historial) o NotificationMessageDTO (tiempo real)
     * @returns {Object} Objeto normalizado
     */
    function normalizeNotificationData(data) {
        // Usa 'type' para mensajes en tiempo real; 'status' o 'seen' para historial
        const type = data.type || 'General'; 
        
        let iconoBs = 'bi-bell-fill';
        let iconoClass = 'icon-general';
        let tipo = 'Notificación General';
        
        // Define el link solo si hay un ticketId
        const link = data.ticketId ? `#/tickets/view/${data.ticketId}` : '#'; 

        // Lógica específica para técnicos (TIPO: ASSIGNMENT o REMINDER)
        if (type === 'ASSIGNMENT' || type === 'REMINDER') {
            iconoBs = 'bi-ticket-fill';
            iconoClass = 'icon-ticket';
            tipo = (type === 'ASSIGNMENT') ? 'Nuevo Ticket Asignado' : 'Recordatorio Urgente';
        } 
        
        // El DTO del historial puede usar 'notificationDate' o 'date'.
        const date = data.date || data.notificationDate; 
        const formattedDate = date ? new Date(date).toLocaleDateString('es-ES') : 'Fecha desconocida';

        return {
            id: data.notificationId || data.id, // Acepta ambos nombres por si el DTO de historial usa 'id'
            tipo: tipo,
            mensaje: data.message,
            fecha: formattedDate,
            iconoClass: iconoClass,
            iconoBs: iconoBs,
            link: link,
            isSeen: data.seen === 1 // Asume que el historial tiene el campo 'seen'
        };
    }

    /**
     * Función para crear el HTML de una tarjeta de notificación
     * @param {Object} noti - Objeto de notificación normalizado
     * @returns {string} HTML de la notificación
     */
    function crearNotificacionHTML(noti) {
        // La clase 'unread' se basa en el campo 'isSeen' del objeto normalizado
        const cardClass = noti.isSeen ? 'notification-card' : 'notification-card unread';
        
        return `
            <div class="${cardClass}" id="noti-${noti.id}" data-ticket-id="${noti.ticketId || ''}">
                <div class="notification-content">
                    <div class="notification-icon-wrapper ${noti.iconoClass}">
                        <i class="bi ${noti.iconoBs}"></i>
                    </div>
                    <div class="notification-text">
                        <h5>${noti.tipo}</h5>
                        <p>${noti.mensaje}</p>
                        <p class="text-muted small">${noti.fecha}</p>
                    </div>
                </div>
                <div class="action-buttons">
                    <a href="${noti.link}" class="btn-ver-mas">Ver más →</a>
                    <button class="btn-eliminar" data-notification-id="${noti.id}" title="Eliminar notificación">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Función para añadir una nueva notificación al inicio de la lista (para tiempo real)
     * @param {Object} notiData - El DTO recibido por WebSocket
     */
    function addRealTimeNotification(notiData) {
        const noti = normalizeNotificationData(notiData);
        // Las notificaciones en tiempo real siempre se consideran no leídas (isSeen: false)
        noti.isSeen = false; 

        const html = crearNotificacionHTML(noti);
        
        // Agrega el nuevo HTML al principio de la lista
        notificationsListContainer.insertAdjacentHTML('afterbegin', html);
        
        // Oculta la vista de "No tienes notificaciones" si estaba visible
        noNotificationsView.style.display = 'none';

        // Opcional: Mostrar un toast o SweetAlert
        Swal.fire({ 
            toast: true, 
            position: 'top-end', 
            icon: 'info', 
            title: noti.tipo, 
            text: noti.mensaje,
            showConfirmButton: false, 
            timer: 4000 
        });
        
        // Vuelve a añadir event listeners al nuevo botón de eliminar
        document.querySelector(`#noti-${noti.id} .btn-eliminar`)
                .addEventListener('click', manejarEliminarNotificacion);
    }
    
    /**
     * Función para renderizar todas las notificaciones (carga inicial)
     */
    async function loadAndRenderNotifications() {
        // Limpia la lista anterior
        notificationsListContainer.innerHTML = ''; 
        
        // 1. Carga el historial real
        const historial = await notificationService.getNotificationHistory();

        if (historial && historial.length > 0) {
            noNotificationsView.style.display = 'none';
            
            // Normaliza, renderiza y añade a la vista
            const htmlContent = historial
                                .map(normalizeNotificationData)
                                .map(crearNotificacionHTML)
                                .join('');
            
            notificationsListContainer.innerHTML = htmlContent;

            // Añade los event listeners para el botón de eliminar
            document.querySelectorAll('.btn-eliminar').forEach(button => {
                button.addEventListener('click', manejarEliminarNotificacion);
            });

        } else {
            noNotificationsView.style.display = 'block';
        }
    }

    /**
     * Función para manejar la eliminación de una notificación
     */
    function manejarEliminarNotificacion(event) {
        const notificationId = event.currentTarget.getAttribute('data-notification-id');
        
        Swal.fire({
            // ... (Lógica de SweetAlert2)
        }).then((result) => {
            if (result.isConfirmed) {
                // TODO: Aquí debes llamar a una API DELETE/PUT para marcar como leída o eliminar en el backend
                console.log(`Llamada API para eliminar notificación con ID: ${notificationId}`);
                
                // Simulación de eliminación visual
                const notiElement = document.getElementById(`noti-${notificationId}`);
                if (notiElement) {
                    notiElement.remove();
                    
                    if (notificationsListContainer.children.length === 0) {
                        noNotificationsView.style.display = 'block';
                    }
                }
            }
        });
    }

    // --- LÓGICA DE INICIALIZACIÓN ---

    // 1. Cargar el historial de notificaciones (API REST)
    loadAndRenderNotifications();

    // 2. Conectar al WebSocket y configurar el manejo de mensajes en tiempo real
    notificationService.connectWebSocket(addRealTimeNotification);
});