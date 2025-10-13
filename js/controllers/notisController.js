// js/controllers/notisController.js

document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const noNotificationsView = document.getElementById('no-notifications-view');

    // --- Datos de Notificaciones de Ejemplo (Simulación de la base de datos) ---
    // Si esta lista estuviera vacía, se mostraría el mensaje "No tienes notificaciones".
    const notificaciones = [
        { 
            id: 1, 
            tipo: 'Nuevo mensaje', 
            mensaje: 'Tienes un nuevo mensaje de José Carlos', 
            fecha: '11/07/2025', 
            iconoClass: 'icon-message', 
            iconoBs: 'bi-chat-dots-fill', 
            link: '#' 
        },
        { 
            id: 2, 
            tipo: 'Nueva incidencia', 
            mensaje: 'Tienes un nuevo ticket asignado por el cliente/a Marta Lopez.', 
            fecha: '11/07/2025', 
            iconoClass: 'icon-ticket', 
            iconoBs: 'bi-ticket-fill', 
            link: '#' 
        },
        { 
            id: 3, 
            tipo: 'Nueva incidencia', 
            mensaje: 'Tienes un nuevo ticket asignado por el cliente/a Mario Gómez.', 
            fecha: '20/06/2025', 
            iconoClass: 'icon-ticket', 
            iconoBs: 'bi-ticket-fill', 
            link: '#' 
        }
    ];

    /**
     * Función para crear el HTML de una tarjeta de notificación
     * @param {Object} noti - Objeto de notificación
     * @returns {string} HTML de la notificación
     */
    function crearNotificacionHTML(noti) {
        return `
            <div class="notification-card" id="noti-${noti.id}">
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
     * Función para renderizar todas las notificaciones
     * @param {Array} listaNotificaciones - La lista de notificaciones a mostrar
     */
    function renderizarNotificaciones(listaNotificaciones) {
        if (listaNotificaciones && listaNotificaciones.length > 0) {
            // Oculta el mensaje de "No tienes notificaciones"
            noNotificationsView.style.display = 'none';

            // Contenedor para las tarjetas de notificaciones
            const notiContainer = document.createElement('div');
            notiContainer.id = 'notifications-list';
            notiContainer.className = 'notifications-container'; // Usa tu clase de estilo si tienes una específica para el listado
            
            // Genera el HTML de cada notificación
            notiContainer.innerHTML = listaNotificaciones.map(crearNotificacionHTML).join('');
            
            // Inyecta el contenedor en el main
            mainContent.appendChild(notiContainer);

            // Añade los event listeners para el botón de eliminar
            document.querySelectorAll('.btn-eliminar').forEach(button => {
                button.addEventListener('click', manejarEliminarNotificacion);
            });

        } else {
            // Muestra el mensaje de "No tienes notificaciones"
            noNotificationsView.style.display = 'block';

            // Asegúrate de que no haya una lista de notificaciones si estaba antes
            const existingList = document.getElementById('notifications-list');
            if (existingList) {
                existingList.remove();
            }
        }
    }

    /**
     * Función para manejar la eliminación de una notificación
     * @param {Event} event - El evento click
     */
    function manejarEliminarNotificacion(event) {
        const button = event.currentTarget;
        const notificationId = button.getAttribute('data-notification-id');
        
        // **PASO 1: Mostrar confirmación (usando SweetAlert2)**
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta notificación se eliminará permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // **PASO 2: Lógica de Eliminación (Simulación)**
                // Normalmente, aquí harías una llamada API para eliminar en el backend
                console.log(`Eliminando notificación con ID: ${notificationId}`);

                // Simulación de eliminación del DOM
                const notiElement = document.getElementById(`noti-${notificationId}`);
                if (notiElement) {
                    notiElement.remove();
                    
                    // Opcional: Mostrar mensaje de éxito
                    Swal.fire(
                        '¡Eliminada!',
                        'La notificación ha sido eliminada.',
                        'success'
                    );

                    // **PASO 3: Verificar si quedan notificaciones**
                    // Comprobar si el contenedor de la lista queda vacío después de la eliminación
                    const notificationsList = document.getElementById('notifications-list');
                    if (notificationsList && notificationsList.children.length === 0) {
                        // Si no quedan, se vuelve a renderizar para mostrar el mensaje de vacío
                        renderizarNotificaciones([]); // Se pasa una lista vacía
                    }
                }
            }
        });
    }

    // Llama a la función para mostrar las notificaciones al cargar la página
    renderizarNotificaciones(notificaciones);
});