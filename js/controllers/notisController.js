import { 
    getPendingNotifications, 
    markNotificationAsSeen,
    connectWebSocket 
} from "../services/notisService.js";

// Contenedor principal donde se inyectarán las notificaciones
const mainContent = document.querySelector('.main-content');
const noNotificationsView = document.getElementById('no-notifications-view');
let notificationsListContainer; // Referencia al contenedor de la lista de tarjetas

// Usamos un Map para almacenar las notificaciones activas por ID para un manejo más fácil.
let activeNotifications = new Map();


// --- Lógica de Renderizado y UI ---

/**
 * Función para crear el HTML de una tarjeta de notificación a partir del objeto del Backend.
 * @param {Object} noti - Objeto de notificación del Backend (NotificationEntity).
 * @returns {string} HTML de la notificación
 */
function crearNotificacionHTML(noti) {
    // **NOTA:** Aquí debes mapear los datos del backend a tu estilo.
    
    // Mapeo simple basado en el mensaje o ticket ID para el icono y link
    let iconoBs = 'bi-bell-fill'; // Icono por defecto
    let iconoClass = 'icon-default';
    let link = '#'; // Link por defecto
    let tipo = 'Actualización';
    
    if (noti.ticket) { // Si la notificación está asociada a un ticket
        iconoBs = 'bi-ticket-fill';
        iconoClass = 'icon-ticket';
        tipo = noti.message.includes('ALERTA') ? 'ALERTA DE SISTEMA' : 'Actualización de Ticket';
        link = `/ticket-detail.html?id=${noti.ticket.ticketId}`; // Ejemplo de link a detalle
    }

    // Formatear la fecha
    const fecha = new Date(noti.notificationDate);
    const formattedDate = fecha.toLocaleDateString('es-ES', { 
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    return `
        <div class="notification-card ${noti.seen === 0 ? 'card-unseen' : ''}" id="noti-${noti.notificationId}">
            <div class="notification-content">
                <div class="notification-icon-wrapper ${iconoClass}">
                    <i class="bi ${iconoBs}"></i>
                </div>
                <div class="notification-text">
                    <h5>${tipo}</h5>
                    <p>${noti.message}</p>
                    <p class="text-muted small">${formattedDate}</p>
                </div>
            </div>
            <div class="action-buttons">
                <a href="${link}" class="btn-ver-mas">Ver más →</a>
                <button class="btn-eliminar" data-notification-id="${noti.notificationId}" title="Marcar como vista y eliminar">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza todas las notificaciones
 * @param {Array} listaNotificaciones - La lista de objetos de notificaciones.
 */
function renderizarNotificaciones(listaNotificaciones) {
    // 1. Limpiar y reconstruir el mapa de notificaciones activas
    activeNotifications.clear();
    listaNotificaciones.forEach(noti => activeNotifications.set(noti.notificationId, noti));

    if (listaNotificaciones && listaNotificaciones.length > 0) {
        // Oculta/elimina el mensaje de "No tienes notificaciones"
        noNotificationsView.style.display = 'none';
        
        // Si el contenedor de la lista ya existe, lo vaciamos, si no, lo creamos
        if (!notificationsListContainer) {
            notificationsListContainer = document.createElement('div');
            notificationsListContainer.id = 'notifications-list';
            notificationsListContainer.className = 'notifications-container';
            mainContent.appendChild(notificationsListContainer);
        } else {
            notificationsListContainer.innerHTML = ''; // Limpiar el contenido existente
        }

        // 2. Generar el HTML
        notificationsListContainer.innerHTML = listaNotificaciones.map(crearNotificacionHTML).join('');
        
        // 3. Re-añadir event listeners
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', manejarEliminarNotificacion);
        });

    } else {
        // 4. Mostrar el mensaje de vacío
        noNotificationsView.style.display = 'flex';
        if (notificationsListContainer) {
            notificationsListContainer.remove();
            notificationsListContainer = null;
        }
    }
}

/**
 * Añade una nueva notificación a la lista (usada para WS)
 * @param {Object} noti - Objeto de notificación del Backend.
 */
function addNewNotification(noti) {
    // 1. Añadir al mapa y asegurar que se muestre el contenedor de lista
    activeNotifications.set(noti.notificationId, noti);
    
    // Si estaba la vista de "no notificaciones", la ocultamos
    if (noNotificationsView.style.display !== 'none') {
        renderizarNotificaciones(Array.from(activeNotifications.values()));
        return; // Ya se renderizó todo, salimos
    }

    // Si ya existe la lista, solo agregamos el nuevo elemento al inicio
    const newHtml = crearNotificacionHTML(noti);
    notificationsListContainer.insertAdjacentHTML('afterbegin', newHtml);
    
    // 2. Re-asociar listener al nuevo botón
    const newCard = document.getElementById(`noti-${noti.notificationId}`);
    newCard.querySelector('.btn-eliminar').addEventListener('click', manejarEliminarNotificacion);
}

/**
 * Función principal para obtener y renderizar notificaciones al cargar.
 */
async function loadNotifications() {
    // Usamos la función del servicio para obtener datos reales
    const notifications = await getPendingNotifications();

    // 🚨 AÑADE ESTA LÍNEA PARA VER LA ESTRUCTURA DE LOS DATOS
    console.log("➡️ Notificaciones recibidas de la API:", notifications); 

    renderizarNotificaciones(notifications);
}

/**
 * Maneja la eliminación de una notificación (Marcar como vista)
 */
async function manejarEliminarNotificacion(event) {
    const button = event.currentTarget;
    const notificationId = button.getAttribute('data-notification-id');
    
    Swal.fire({
        title: '¿Marcar como vista?',
        text: "La notificación se ocultará de la lista de pendientes.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff9900', // Color primario
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, vista',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            
            // 1. Llamada al servicio para marcar como vista
            const success = await markNotificationAsSeen(notificationId);

            if (success) {
                // 2. Eliminación del DOM y del mapa local
                const notiElement = document.getElementById(`noti-${notificationId}`);
                if (notiElement) {
                    notiElement.remove();
                    activeNotifications.delete(Number(notificationId));
                    
                    // 3. Verificar si no quedan notificaciones para mostrar el mensaje de vacío
                    if (activeNotifications.size === 0) {
                        renderizarNotificaciones([]); // Redibuja la vista de vacío
                    }

                    Swal.fire('¡Vista!', 'Notificación marcada como vista.', 'success');
                }
            } else {
                Swal.fire('Error', 'No se pudo marcar la notificación como vista.', 'error');
            }
        }
    });
}


// --- Lógica de Inicialización ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga el historial pendiente al iniciar
    loadNotifications(); 
    
    // 2. Conecta el WebSocket para notificaciones en tiempo real
    connectWebSocket((newNotification) => {
        // Muestra la notificación en la UI y un pop-up
        addNewNotification(newNotification);
        
        // Pop-up con SweetAlert2 para alertar en tiempo real
        Swal.fire({
            title: newNotification.message,
            text: 'Acabas de recibir una actualización en tiempo real.',
            icon: 'info',
            position: 'top-end',
            toast: true,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
        });
    });
});