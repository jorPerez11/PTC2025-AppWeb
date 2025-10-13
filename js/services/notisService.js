/* // js/services/notisService.js

const API_URL = `https://ptchelpdesk-a73934db2774.herokuapp.com/api/notifications/history?userId=${userId}`;

// Usaremos un objeto global simple para gestionar el estado de las notificaciones.
const NotificationManager = {
    notifications: [],
    
    // Función para obtener el token JWT. 
    // **IMPORTANTE**: Debes adaptar esta función para obtener el token de donde lo guardes 
    // (ej. localStorage, cookies, etc.)
    getJwtToken: () => {
        // --- ADAPTA ESTO ---
        // Ejemplo asumiendo que lo guardas en localStorage
        return localStorage.getItem('jwtToken'); 
        // -------------------
    },

    // Función para obtener el nombre de usuario (usado para suscripción /user)
    getUsername: () => {
        // --- ADAPTA ESTO ---
        // Puedes decodificar el JWT o si lo guardas en sesión/localStorage
        // Por ahora, asumiremos que el backend autenticado lo maneja, 
        // pero necesitamos el nombre de usuario para el manejo local de URLs de suscripción.
        // Si el token solo contiene info, el backend lo usa. Aquí solo lo usamos para pruebas locales.
        return "tecnico1"; // Nombre de usuario de prueba
        // -------------------
    },

    connect: () => {
        const socket = new SockJS('http://localhost:8080/ws'); // Cambia 8080 si usas otro puerto
        NotificationManager.stompClient = Stomp.over(socket);

        NotificationManager.stompClient.connect({
            // El backend espera el JWT en el encabezado de autenticación.
            'Authorization': `Bearer ${NotificationManager.getJwtToken()}`
        }, (frame) => {
            console.log('✅ Conectado al WebSocket: ' + frame);
            
            // 1. SUSCRIPCIÓN PERSONAL (para mensajes directos)
            // Destino: /user/queue/notifications
            NotificationManager.stompClient.subscribe('/user/queue/notifications', (message) => {
                const notification = JSON.parse(message.body);
                NotificationManager.handleNewNotification(notification);
            });
            
            // 2. SUSCRIPCIÓN GLOBAL (solo para Admins o Roles específicos, si aplica)
            // Ejemplo de suscripción para Administradores
            // NotificationManager.stompClient.subscribe('/topic/admins/incidences', (message) => {
            //     const notification = JSON.parse(message.body);
            //     NotificationManager.handleNewNotification(notification);
            // });

        }, (error) => {
            console.error('❌ Error de conexión WebSocket:', error);
            // Reintento o manejo de error de UI
        });
    },

    handleNewNotification: (notification) => {
        // Añadir a la lista local
        NotificationManager.notifications.push(notification);
        
        // Renderizar la lista actualizada
        renderNotifications();
        
        // Mostrar una alerta (opcional, pero buena UX)
        Swal.fire({
            title: notification.title || 'Nueva Notificación',
            text: notification.message || 'Has recibido un nuevo evento.',
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000
        });
    }
}; */