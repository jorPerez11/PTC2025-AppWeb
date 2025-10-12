import {
    getTech,
    getTickets,
    updateTicket,
    getUser
} from "../services/ticketService.js";



// Las variables y objetos se definen fuera del evento DOMContentLoaded
// para que su alcance sea global dentro del script.
const estados = {
    'En espera': 'en-espera-list',
    'En progreso': 'en-progreso-list',
    'Completado': 'completado-list'
};

const categories = [
        { id: 7, name: 'Equipo' },
        { id: 6, name: 'Sistema' },
        { id: 5, name: 'Incidentes críticos' },
        { id: 4, name: 'Redes' },
        { id: 3, name: 'Gestion de usuarios' },
        { id: 2, name: 'Consultas' },
        { id: 1, name: 'Soporte Técnico' },
    ];

const priorities = [
    { id: 4, name: 'Critica'},
    { id: 3, name: 'Alta' },
    { id: 2, name: 'Media' },
    { id: 1, name: 'Baja' }
];

const findNameById = (id, array) => {
    // Convierte el ID a número por si viene como string del JSON.
    const numericId = parseInt(id); 
    const item = array.find(item => item.id === numericId);
    if (item && (item.displayName || item.name)) {
        // Devuelve el displayName, si no existe, intenta con name.
        return item.displayName || item.name || 'N/A';
    }
    
    // Para categorías y prioridades (que usan 'name' en tus arrays locales)
    return item ? item.name : 'N/A';
};

const estadosApi = {
    'En espera': { id: 1, displayName: 'En espera' },
    'En progreso': { id: 2, displayName: 'En progreso' },
    'Completado': { id: 3, displayName: 'Completado' }
};

const badgeColors = {
    'En espera': 'danger',
    'En progreso': 'warning',
    'Completado': 'success'
};

let currentPage = 0;
let currentSize = 10;
let totalPages = 0;
let techList = [];

const calendarIcons = {
    'En espera': `
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
    <g clip-path="url(#clip0_76_620)">
        <path d="M17.4167 1.78116H14.8438V0.593658C14.8439 0.436185 14.7814 0.285121 14.6701 0.173697C14.5588 0.0622731 14.4079 -0.000383159 14.2504 -0.00048814C14.0929 -0.000593122 13.9419 0.0618618 13.8304 0.173137C13.719 0.284413 13.6564 0.435394 13.6562 0.592866V1.78116H10.0938V0.593658C10.0938 0.515685 10.0785 0.438466 10.0487 0.366409C10.0189 0.294352 9.97522 0.228869 9.92013 0.173697C9.86503 0.118526 9.7996 0.0747466 9.72758 0.0448599C9.65557 0.0149731 9.57837 -0.000436168 9.5004 -0.000488149C9.34292 -0.000593131 9.19186 0.0618618 9.08043 0.173137C8.96901 0.284413 8.90635 0.435394 8.90625 0.592866V1.78116H5.34375V0.593658C5.3438 0.515685 5.3285 0.438466 5.29871 0.366409C5.26891 0.294352 5.22522 0.228869 5.17012 0.173697C5.11503 0.118526 5.0496 0.0747466 4.97758 0.0448599C4.90557 0.0149731 4.82837 -0.000436168 4.7504 -0.000488149C4.59292 -0.000593131 4.44186 0.0618618 4.33044 0.173137C4.21901 0.284413 4.15635 0.435394 4.15625 0.592866V1.78116H1.58333C1.16354 1.78116 0.760937 1.94786 0.464027 2.24463C0.167118 2.54139 0.000209894 2.94391 0 3.3637V17.4158C0 17.8357 0.166815 18.2384 0.463748 18.5354C0.76068 18.8323 1.16341 18.9991 1.58333 18.9991H17.4167C17.8366 18.9991 18.2393 18.8323 18.5363 18.5354C18.8332 18.2384 19 17.8357 19 17.4158V3.3637C18.9998 2.94391 18.8329 2.54139 18.536 2.24463C18.2391 1.94786 17.8365 1.78116 17.4167 1.78116ZM17.8125 17.4166C17.8125 17.5214 17.7709 17.622 17.6968 17.6962C17.6228 17.7704 17.5223 17.8122 17.4175 17.8124H1.58333C1.47835 17.8124 1.37767 17.7707 1.30344 17.6965C1.2292 17.6222 1.1875 17.5216 1.1875 17.4166V3.36449C1.18771 3.25965 1.22951 3.15917 1.30372 3.08511C1.37793 3.01104 1.47849 2.96945 1.58333 2.96945H4.15625V4.15695C4.15615 4.31442 4.2186 4.46549 4.32988 4.57691C4.44115 4.68833 4.59213 4.75099 4.7496 4.7511C4.90708 4.7512 5.05814 4.68875 5.16956 4.57747C5.28099 4.46619 5.34365 4.31521 5.34375 4.15774V2.96945H8.90625V4.15695C8.90615 4.31442 8.9686 4.46549 9.07988 4.57691C9.19115 4.68833 9.34213 4.75099 9.4996 4.7511C9.65708 4.7512 9.80814 4.68875 9.91957 4.57747C10.031 4.46619 10.0936 4.31521 10.0938 4.15774V2.96945H13.6562V4.15695C13.6561 4.31442 13.7186 4.46549 13.8299 4.57691C13.9412 4.68833 14.0921 4.75099 14.2496 4.7511C14.4071 4.7512 14.5581 4.68875 14.6696 4.57747C14.781 4.46619 14.8436 4.31521 14.8438 4.15774V2.96945H17.4167C17.5214 2.96966 17.6217 3.01135 17.6958 3.08539C17.7698 3.15943 17.8115 3.25978 17.8117 3.36449L17.8125 17.4166Z" fill="#DC2F02"/>
    <path d="M4.15625 7.125H6.53125V8.90625H4.15625V7.125ZM4.15625 10.0938H6.53125V11.875H4.15625V10.0938ZM4.15625 13.0625H6.53125V14.8438H4.15625V13.0625ZM8.3125 13.0625H10.6875V14.8438H8.3125V13.0625ZM8.3125 10.0938H10.6875V11.875H8.3125V10.0938ZM8.3125 7.125H10.6875V8.90625H8.3125V7.125ZM12.4688 13.0625H14.8438V14.8438H12.4688V13.0625ZM12.4688 10.0938H14.8438V11.875H12.4688V10.0938ZM12.4688 7.125H14.8438V8.90625H12.4688V7.125Z" fill="#DC2F02"/>
    </g>
    <defs>
        <clipPath id="clip0_76_620">
        <rect width="19" height="19" fill="white"/>
        </clipPath>
    </defs>
    </svg>
    `,
    'En progreso': `
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
    <g clip-path="url(#clip0_77_697)">
        <path d="M17.4167 1.78116H14.8438V0.593658C14.8439 0.436185 14.7814 0.285121 14.6701 0.173697C14.5588 0.0622731 14.4079 -0.000383159 14.2504 -0.00048814C14.0929 -0.000593122 13.9419 0.0618618 13.8304 0.173137C13.719 0.284413 13.6564 0.435394 13.6562 0.592866V1.78116H10.0938V0.593658C10.0938 0.515685 10.0785 0.438466 10.0487 0.366409C10.0189 0.294352 9.97522 0.228869 9.92013 0.173697C9.86503 0.118526 9.7996 0.0747466 9.72758 0.0448599C9.65557 0.0149731 9.57837 -0.000436168 9.5004 -0.000488149C9.34292 -0.000593131 9.19186 0.0618618 9.08043 0.173137C8.96901 0.284413 8.90635 0.435394 8.90625 0.592866V1.78116H5.34375V0.593658C5.3438 0.515685 5.3285 0.438466 5.29871 0.366409C5.26891 0.294352 5.22522 0.228869 5.17012 0.173697C5.11503 0.118526 5.0496 0.0747466 4.97758 0.0448599C4.90557 0.0149731 4.82837 -0.000436168 4.7504 -0.000488149C4.59292 -0.000593131 4.44186 0.0618618 4.33044 0.173137C4.21901 0.284413 4.15635 0.435394 4.15625 0.592866V1.78116H1.58333C1.16354 1.78116 0.760937 1.94786 0.464027 2.24463C0.167118 2.54139 0.000209894 2.94391 0 3.3637V17.4158C0 17.8357 0.166815 18.2384 0.463748 18.5354C0.76068 18.8323 1.16341 18.9991 1.58333 18.9991H17.4167C17.8366 18.9991 18.2393 18.8323 18.5363 18.5354C18.8332 18.2384 19 17.8357 19 17.4158V3.3637C18.9998 2.94391 18.8329 2.54139 18.536 2.24463C18.2391 1.94786 17.8365 1.78116 17.4167 1.78116ZM17.8125 17.4166C17.8125 17.5214 17.7709 17.622 17.6968 17.6962C17.6228 17.7704 17.5223 17.8122 17.4175 17.8124H1.58333C1.47835 17.8124 1.37767 17.7707 1.30344 17.6965C1.2292 17.6222 1.1875 17.5216 1.1875 17.4166V3.36449C1.18771 3.25965 1.22951 3.15917 1.30372 3.08511C1.37793 3.01104 1.47849 2.96945 1.58333 2.96945H4.15625V4.15695C4.15615 4.31442 4.2186 4.46549 4.32988 4.57691C4.44115 4.68833 4.59213 4.75099 4.7496 4.7511C4.90708 4.7512 5.05814 4.68875 5.16956 4.57747C5.28099 4.46619 5.34365 4.31521 5.34375 4.15774V2.96945H8.90625V4.15695C8.90615 4.31442 8.9686 4.46549 9.07988 4.57691C9.19115 4.68833 9.34213 4.75099 9.4996 4.7511C9.65708 4.7512 9.80814 4.68875 9.91957 4.57747C10.031 4.46619 10.0936 4.31521 10.0938 4.15774V2.96945H13.6562V4.15695C13.6561 4.31442 13.7186 4.46549 13.8299 4.57691C13.9412 4.68833 14.0921 4.75099 14.2496 4.7511C14.4071 4.7512 14.5581 4.68875 14.6696 4.57747C14.781 4.46619 14.8436 4.31521 14.8438 4.15774V2.96945H17.4167C17.5214 2.96966 17.6217 3.01135 17.6958 3.08539C17.7698 3.15943 17.8115 3.25978 17.8117 3.36449L17.8125 17.4166Z" fill="#F48C06"/>
    <path d="M4.15625 7.125H6.53125V8.90625H4.15625V7.125ZM4.15625 10.0938H6.53125V11.875H4.15625V10.0938ZM4.15625 13.0625H6.53125V14.8438H4.15625V13.0625ZM8.3125 13.0625H10.6875V14.8438H8.3125V13.0625ZM8.3125 10.0938H10.6875V11.875H8.3125V10.0938ZM8.3125 7.125H10.6875V8.90625H8.3125V7.125ZM12.4688 13.0625H14.8438V14.8438H12.4688V13.0625ZM12.4688 10.0938H14.8438V11.875H12.4688V10.0938ZM12.4688 7.125H14.8438V8.90625H12.4688V7.125Z" fill="#F48C06"/>
    </g>
    <defs>
        <clipPath id="clip0_77_697">
        <rect width="19" height="19" fill="white"/>
        </clipPath>
    </defs>
    </svg>
    `,
    'Completado': `
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
    <g clip-path="url(#clip0_77_776)">
        <path d="M17.4167 1.78116H14.8438V0.593658C14.8439 0.436185 14.7814 0.285121 14.6701 0.173697C14.5588 0.0622731 14.4079 -0.000383159 14.2504 -0.00048814C14.0929 -0.000593122 13.9419 0.0618618 13.8304 0.173137C13.719 0.284413 13.6564 0.435394 13.6562 0.592866V1.78116H10.0938V0.593658C10.0938 0.515685 10.0785 0.438466 10.0487 0.366409C10.0189 0.294352 9.97522 0.228869 9.92013 0.173697C9.86503 0.118526 9.7996 0.0747466 9.72758 0.0448599C9.65557 0.0149731 9.57837 -0.000436168 9.5004 -0.000488149C9.34292 -0.000593131 9.19186 0.0618618 9.08043 0.173137C8.96901 0.284413 8.90635 0.435394 8.90625 0.592866V1.78116H5.34375V0.593658C5.3438 0.515685 5.3285 0.438466 5.29871 0.366409C5.26891 0.294352 5.22522 0.228869 5.17012 0.173697C5.11503 0.118526 5.0496 0.0747466 4.97758 0.0448599C4.90557 0.0149731 4.82837 -0.000436168 4.7504 -0.000488149C4.59292 -0.000593131 4.44186 0.0618618 4.33044 0.173137C4.21901 0.284413 4.15635 0.435394 4.15625 0.592866V1.78116H1.58333C1.16354 1.78116 0.760937 1.94786 0.464027 2.24463C0.167118 2.54139 0.000209894 2.94391 0 3.3637V17.4158C0 17.8357 0.166815 18.2384 0.463748 18.5354C0.76068 18.8323 1.16341 18.9991 1.58333 18.9991H17.4167C17.8366 18.9991 18.2393 18.8323 18.5363 18.5354C18.8332 18.2384 19 17.8357 19 17.4158V3.3637C18.9998 2.94391 18.8329 2.54139 18.536 2.24463C18.2391 1.94786 17.8365 1.78116 17.4167 1.78116ZM17.8125 17.4166C17.8125 17.5214 17.7709 17.622 17.6968 17.6962C17.6228 17.7704 17.5223 17.8122 17.4175 17.8124H1.58333C1.47835 17.8124 1.37767 17.7707 1.30344 17.6965C1.2292 17.6222 1.1875 17.5216 1.1875 17.4166V3.36449C1.18771 3.25965 1.22951 3.15917 1.30372 3.08511C1.37793 3.01104 1.47849 2.96945 1.58333 2.96945H4.15625V4.15695C4.15615 4.31442 4.2186 4.46549 4.32988 4.57691C4.44115 4.68833 4.59213 4.75099 4.7496 4.7511C4.90708 4.7512 5.05814 4.68875 5.16956 4.57747C5.28099 4.46619 5.34365 4.31521 5.34375 4.15774V2.96945H8.90625V4.15695C8.90615 4.31442 8.9686 4.46549 9.07988 4.57691C9.19115 4.68833 9.34213 4.75099 9.4996 4.7511C9.65708 4.7512 9.80814 4.68875 9.91957 4.57747C10.031 4.46619 10.0936 4.31521 10.0938 4.15774V2.96945H13.6562V4.15695C13.6561 4.31442 13.7186 4.46549 13.8299 4.57691C13.9412 4.68833 14.0921 4.75099 14.2496 4.7511C14.4071 4.7512 14.5581 4.68875 14.6696 4.57747C14.781 4.46619 14.8436 4.31521 14.8438 4.15774V2.96945H17.4167C17.5214 2.96966 17.6217 3.01135 17.6958 3.08539C17.7698 3.15943 17.8115 3.25978 17.8117 3.36449L17.8125 17.4166Z" fill="#32C91E"/>
    <path d="M4.15625 7.125H6.53125V8.90625H4.15625V7.125ZM4.15625 10.0938H6.53125V11.875H4.15625V10.0938ZM4.15625 13.0625H6.53125V14.8438H4.15625V13.0625ZM8.3125 13.0625H10.6875V14.8438H8.3125V13.0625ZM8.3125 10.0938H10.6875V11.875H8.3125V10.0938ZM8.3125 7.125H10.6875V8.90625H8.3125V7.125ZM12.4688 13.0625H14.8438V14.8438H12.4688V13.0625ZM12.4688 10.0938H14.8438V11.875H12.4688V10.0938ZM12.4688 7.125H14.8438V8.90625H12.4688V7.125Z" fill="#32C91E"/>
    </g>
    <defs>
        <clipPath id="clip0_77_776">
        <rect width="19" height="19" fill="white"/>
        </clipPath>
    </defs>
    </svg>
    `
};

async function loadTechs() {
    try {
        // Llama a getTech() del service y almacena la lista de técnicos
        techList = await getTech();
        console.log("Técnicos cargados:", techList);
    } catch (error) {
        console.error("Error al cargar la lista de técnicos:", error);
        // Si falla, techList será un array vacío, manejado por findNameById.
    }
}

async function getClientDetails(userId) {
    console.log(`Buscando datos del cliente con ID: ${userId}...`);
    try{
        const userData = await getUser(userId);
        return userData;
    } catch (error) {
         console.error("Error al obtener datos del cliente:", error);
         return null;
    }
}

function mostrarDatosCliente(userData) {
        
    // 1. Poblar el campo ID oculto
    const clientIdHiddenField = document.getElementById('modalClientId');
    if (clientIdHiddenField) {
        clientIdHiddenField.value = userData.id;
    }
    
    // 2. Poblar los campos de visualización (usando innerText)
    
    const clientName = userData.displayName || userData.name || 'N/A';
    document.getElementById('modalClientNameDisplay').innerText = clientName;
    
    document.getElementById('modalClientEmailDisplay').innerText = userData.email || 'N/A';
    
    document.getElementById('modalClientUserDisplay').innerText = userData.username || 'N/A';
    
    document.getElementById('modalClientPhoneDisplay').innerText = userData.phone || 'N/A';
    
    
    // 3. Mostrar el modal
    const modalElement = document.getElementById('modalDatosCliente');
    if (modalElement) {
        // Asegúrate de que 'bootstrap' esté cargado
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}


/**
 * Función para poblar el modal de detalles del ticket.
 * @param {object} ticketData - El objeto con los datos del ticket (incluyendo IDs de categoría/prioridad/técnico).
 */
function mostrarDetallesTicket(ticketData) {
    
    // 1. Mapear los IDs a nombres
    const categoryName = findNameById(ticketData.id_category, categories);
    const priorityName = findNameById(ticketData.id_priority, priorities);
    const technicianName = findNameById(ticketData.id_tech, techList); // Usa la lista global de técnicos

    // 2. Poblar los campos visibles

    document.getElementById('modalTicketIdDisplay').innerText = `#${String(ticketData.id || ticketData.ticketId).padStart(4, '0')}`;

    document.getElementById('modalTicketTitle').value = ticketData.title || '';
    document.getElementById('modalTicketCategory').value = categoryName;
    document.getElementById('modalTicketPriority').value = priorityName;
    document.getElementById('modalTicketDescription').value = ticketData.description || '';
    
    // Asumiendo que has añadido el campo 'modalTicketTechnician'
    const technicianField = document.getElementById('modalTicketTechnician');
    if (technicianField) {
        technicianField.value = technicianName;
    }

    // 3. Poblar el campo ID invisible 
    const ticketIdHiddenField = document.getElementById('modalTicketId');
    if (ticketIdHiddenField) {
        ticketIdHiddenField.value = ticketData.id || ticketData.ticketId;
    }

    const clientDataId = ticketData.id_user;
    document.getElementById('modalTicketUserId').value = clientDataId;

    const viewClientButton = document.getElementById('viewClientButton'); 
    if (viewClientButton) {
        // Limpiamos listeners anteriores y añadimos el nuevo
        viewClientButton.onclick = async () => {
            if (clientDataId) {
                // Deshabilitar botón durante la carga para UX
                viewClientButton.disabled = true;
                viewClientButton.innerText = 'Cargando...';

                const userData = await getClientDetails(clientDataId);
                
                // Re-habilitar botón
                viewClientButton.disabled = false;
                viewClientButton.innerText = 'Ver Cliente';

                if (userData) {
                    mostrarDatosCliente(userData);
                } else {
                    alert('No se pudieron cargar los datos del cliente.');
                }
            } else {
                alert('ID de cliente no disponible para este ticket.');
            }
        };
    }

    // 4. Muestra el modal de Bootstrap
    const modalElement = document.getElementById('viewTicketModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}


// La función 'obtenerTickets' se define con un ámbito global.
async function obtenerTickets() {
    try {
        const data = await getTickets(currentPage, currentSize);
        // CRÍTICO: Aseguramos que data.content sea un array o un array vacío para el forEach
        const items = data?.content || [];

         console.log("Respuesta Completa de la API (DATA):", data);

         if (items.length > 0) {
            console.log("Estructura de un Ticket (Primer Item):", items[0]);
        }

        // Actualizar variables de paginación con la respuesta de la API
        totalPages = data.totalPages;
        currentPage = data.number;

        const enEsperaList = document.getElementById(estados['En espera']);
        const enProgresoList = document.getElementById(estados['En progreso']);
        const completadoList = document.getElementById(estados['Completado']);

        // Los contadores de estados deben reiniciarse para cada nueva página
        // Agregamos un estado 'N/A' por si acaso falla el mapeo
        const conteoEstados = { 'En espera': 0, 'En progreso': 0, 'Completado': 0, 'N/A': 0 };

        if (enEsperaList) enEsperaList.innerHTML = "";
        if (enProgresoList) enProgresoList.innerHTML = "";
        if (completadoList) completadoList.innerHTML = "";

        items.forEach((ticket) => {
            const estado = ticket.status?.displayName || 'N/A';

            // Aseguramos que solo contamos estados válidos
            if (conteoEstados.hasOwnProperty(estado)) {
                conteoEstados[estado]++;
            } else {
                conteoEstados['N/A']++;
            }

            const container = document.getElementById(estados[estado]);
            if (!container) {
                // Si el ticket tiene un estado que no está mapeado, lo ignoramos
                console.warn(`Contenedor para estado "${estado}" no existe. Ticket ID: ${ticket.ticketId}`);
                return;
            }

            const creationDate = ticket.creationDate
                ? new Date(ticket.creationDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                })
                : 'N/A';


            const ticketDataForModal = JSON.stringify({
                id: ticket.ticketId, 
                title: ticket.title || 'Sin Título',
                description: ticket.description || 'Sin descripción',
                id_category: ticket.category?.id, 
                id_priority: ticket.priority?.id, 
                id_tech: ticket.assignedTech?.id,
                id_user: ticket.user?.id || ticket.userId
            });


            const card = document.createElement("div");
            card.className = "ticket-card mb-3";

            card.innerHTML = `
                <h6>${ticket.title || 'Sin Título'}</h6>
                <p class="mb-1 datos">
                <small>#${String(ticket.ticketId).padStart(4, '0')} · ${ticket.userName || 'N/A'}</small>
                </p>
                <div class="card-body">
                    <p class="card-text">${ticket.description || 'Sin descripción'}</p>
                </div>
                <div class="ticket-fecha">
                    ${calendarIcons[estado] || ''}
                    <p class="mb-0 ms-1"><small>${creationDate}</small></p>
                </div>
                <div class="dropdown">
                    <button class="status-badge status-${badgeColors[estado] || 'default'} dropdown-toggle" 
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            data-ticket-id="${ticket.ticketId}"
                            data-ticket-status="${estado}">
                        <span>${estado}</span>
                    </button>
                    <ul class="dropdown-menu">
                        <li style="cursor: pointer"><a class="dropdown-item" data-new-status="En espera">En espera</a></li>
                        <li style="cursor: pointer"><a class="dropdown-item" data-new-status="En progreso">En progreso</a></li>
                        <li style="cursor: pointer"><a class="dropdown-item" data-new-status="Completado">Completado</a></li>
                    </ul>
                    <div class="data-button" data-ticket-json='${ticketDataForModal}'>
                        <i class="fas fa-eye"></i>
                    </div>
                </div>
            `;

            // Listener para el cambio de estado
            card.querySelector('.dropdown-menu').addEventListener('click', (event) => {
                const dropdownItem = event.target.closest('.dropdown-item');
                if (dropdownItem) {
                    const ticketId = card.querySelector('button').dataset.ticketId;
                    const newStatus = dropdownItem.dataset.newStatus;
                    actualizarEstadoTicket(newStatus, ticketId);
                }
            });

            // Listener para el botón de visualización de datos
            const viewButton = card.querySelector('.data-button');
            if (viewButton) {
                viewButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const ticketJson = event.currentTarget.getAttribute('data-ticket-json');
                    if (ticketJson) {
                        try {
                            const ticketData = JSON.parse(ticketJson);
                            mostrarDetallesTicket(ticketData);
                        } catch (e) {
                            console.error("Error parseando la data del ticket JSON:", e);
                        }
                    }
                });
            }


            container.appendChild(card);
        });

        // Actualiza los contadores en el header de cada columna con el conteo de la página actual
        // 🐛 FIX 2: Aseguramos que solo actualizamos headers si existen en el HTML
        const enEsperaHeader = document.querySelector('#en-espera-header-count');
        if (enEsperaHeader) {
            enEsperaHeader.innerText = `(${conteoEstados['En espera']})`;
        }

        const enProgresoHeader = document.querySelector('#en-progreso-header-count');
        if (enProgresoHeader) {
            enProgresoHeader.innerText = `(${conteoEstados['En progreso']})`;
        }

        const completadoHeader = document.querySelector('#completado-header-count');
        if (completadoHeader) {
            completadoHeader.innerText = `(${conteoEstados['Completado']})`;
        }

        // Llama a la función para actualizar los controles de paginación
        actualizarPaginacion();

    } catch (err) {
        // Mantenemos el error, pero ahora estamos seguros que se lanzó en getTickets
        console.error("Error FATAL al cargar los tickets, revisa el Service para ver por qué lanzó el error:", err);
    }
}

function actualizarPaginacion() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const currentPageLink = document.getElementById('currentPage').querySelector('a');

    // Muestra la página actual (la API usa un índice base 0, por eso sumamos 1)
    if (currentPageLink) {
        currentPageLink.innerText = currentPage + 1;
    }

    // Habilita o deshabilita los botones
    if (prevButton) {
        prevButton.classList.toggle('disabled', currentPage <= 0);
    }
    if (nextButton) {
        nextButton.classList.toggle('disabled', currentPage >= totalPages - 1);
    }
}

// La función 'actualizarEstadoTicket' también se define con un ámbito global.
async function actualizarEstadoTicket(newStatus, ticketId) {
    try {
        const payload = {
            status: estadosApi[newStatus]
        };
        const data = await updateTicket(payload, ticketId);
        console.log('Ticket actualizado:', data);
        // SweetAlert2 para mostrar confirmación (opcional, pero útil)
        Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: `El ticket #${String(ticketId).padStart(4, '0')} se movió a "${newStatus}".`,
            showConfirmButton: false,
            timer: 1500
        });
        obtenerTickets();
    } catch (error) {
        console.error("Error al actualizar el ticket:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Actualización',
            text: 'Hubo un problema al intentar actualizar el estado del ticket.',
        });
    }
}

// Llama a la función `obtenerTickets` una vez que el DOM esté completamente cargado.
document.addEventListener("DOMContentLoaded", () => {
    // Es CRÍTICO que la clase 'bootstrap' esté cargada en el HTML.

    // Inicializa la carga de tickets.
    loadTechs().then(() => {
        obtenerTickets();
    });

    // Event listener para el botón de página anterior
    const prevPageButton = document.getElementById('prevPage');
    if (prevPageButton) {
        prevPageButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 0) {
                currentPage--;
                obtenerTickets();
            }
        });
    }


    // Event listener para el botón de página siguiente
    const nextPageButton = document.getElementById('nextPage');
    if (nextPageButton) {
        nextPageButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages - 1) {
                currentPage++;
                obtenerTickets();
            }
        });
    }


    // Event listener para el filtro de tamaño
    const ticketsPerPageSelect = document.getElementById('ticketsPerPage');
    if (ticketsPerPageSelect) {
        ticketsPerPageSelect.addEventListener('change', (e) => {
            currentSize = parseInt(e.target.value);
            currentPage = 0; // Reinicia a la primera página al cambiar el tamaño
            obtenerTickets();
        });
    }
});