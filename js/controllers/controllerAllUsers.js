// controllerAllUsers.js

// Importa las funciones y constantes necesarias del servicio
import {
    getUsersFromAPI,
    getUserById,
    formatearFecha,
    statusIconMap,
    getTicketDetailsForModal // Aseguramos que esta función esté importada para el modal
} from '../services/serviceAllUsers.js';

// Variables globales para la paginación y filtros
let currentPage = 0; // La primera página es 0 en Spring Boot
let pageSize = 10;   // Tamaño por defecto

/**
 * Inicializa la página de gestión de usuarios.
 * Renderiza la barra de filtro y la lista de usuarios.
 */
async function initUsuarios() {
    try {
        renderFilterBar();
        initFilterEvents();
        // Carga los usuarios iniciales con la página y tamaño por defecto
        await loadUsers(currentPage, pageSize);
    } catch (err) {
        console.error('Error al inicializar la gestión de usuarios:', err);
        document.getElementById('lista-usuarios').innerHTML = `
            <div class="alert alert-danger text-center mt-3">
                Error al cargar los usuarios. Por favor, intenta de nuevo más tarde.
            </div>
        `;
    }
}

/**
 * Función centralizada para cargar usuarios con filtros y paginación.
 * @param {number} page - La página a cargar.
 * @param {number} size - La cantidad de elementos por página.
 */
async function loadUsers(page, size) {
    try {
        const searchTerm = document.getElementById('busquedaUsuario').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const periodFilter = document.getElementById('periodFilter').value;

        // La llamada a la API ahora incluye todos los parámetros
        const usuariosPage = await getUsersFromAPI(page, size, searchTerm, statusFilter, periodFilter);
        
        // Actualiza el estado global de la página y el tamaño
        currentPage = usuariosPage.number;
        pageSize = usuariosPage.size;

        mostrarDatos(usuariosPage.content); // Solo pasar el array de usuarios
        renderPaginacion(usuariosPage); // Renderizar la paginación con los metadatos
        updateCounts(usuariosPage); // Actualizar los contadores
    } catch (err) {
        console.error('Error al cargar usuarios con filtros:', err);
        // Puedes agregar una alerta o un mensaje en la UI para el usuario
        document.getElementById('lista-usuarios').innerHTML = `
            <div class="alert alert-warning text-center mt-3">
                No se pudieron cargar los usuarios. Por favor, revisa la consola para más detalles.
            </div>
        `;
    }
}

/**
 * Renderiza la barra de filtros y búsqueda en el contenedor designado.
 */
function renderFilterBar() {
    const html = `
        <div class="filter-bar-custom">
            <div class="row align-items-center top-bar">
                <div class="col-lg-3 col-md-12 mb-3 mb-lg-0">
                    <div class="user-counts">
                        <div>
                            <span id="userCount">0</span> Usuarios
                        </div>
                        <small>Basado en <span id="filterCount">0</span> Filtro(s)</small>
                    </div>
                </div>
                <div class="col-lg-8 col-md-12">
                    <div class="input-group search-container">
                        <span class="input-group-text search-icon-span">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="text" id="busquedaUsuario" class="form-control search-input" placeholder="Buscar Usuario / Email / ID">
                        <button class="btn btn-outline-danger d-none" id="btnBuscar"></button>
                    </div>
                </div>
                <div class="col-lg-1 d-none d-lg-block text-end">
                    <i class="bi bi-info-circle info-icon"></i>
                </div>
            </div>
            <hr class="filter-divider">
            <div class="d-flex flex-wrap gap-3 filter-row">
                <div class="filter-select-wrapper">
                    <i class="bi bi-calendar-event filter-icon"></i>
                    <select id="periodFilter" class="form-select styled-select">
                        <option value="all">Todo el tiempo</option>
                        <option value="today">Hoy</option>
                        <option value="week">Esta semana</option>
                        <option value="month">Este mes</option>
                    </select>
                </div>
                <div class="filter-select-wrapper">
                    <i class="bi bi-ticket filter-icon"></i>
                    <select id="statusFilter" class="form-select styled-select">
                        <option value="all">Todos los estados</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Cerrado">Cerrado</option>
                        <option value="En Espera">En Espera</option>
                    </select>
                </div>
                <div class="d-flex align-items-center filter-select-quantity">
                    <label for="ticketsPerPage" class="form-label me-2 ">Filtrar por cantidad:</label>
                    <select id="ticketsPerPage" class="form-select" style="width: auto;">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    document.getElementById('filter-bar-container').innerHTML = html;
}

/**
 * Inicializa los eventos de escucha para los filtros y la búsqueda.
 */
function initFilterEvents() {
    document.getElementById('periodFilter').addEventListener('change', () => loadUsers(0, pageSize));
    document.getElementById('statusFilter').addEventListener('change', () => loadUsers(0, pageSize));
    document.getElementById('busquedaUsuario').addEventListener('input', () => loadUsers(0, pageSize));
    document.getElementById('ticketsPerPage').addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value); // Convertir a número entero
        loadUsers(0, pageSize); // Reiniciar a la primera página con el nuevo tamaño
    });
}

/**
 * Actualiza los contadores de usuarios y filtros activos en la interfaz.
 * @param {Object} usuariosPage - El objeto Page con los metadatos de la paginación.
 */
function updateCounts(usuariosPage) {
    document.getElementById('userCount').textContent = usuariosPage.totalElements;

    const term = document.getElementById('busquedaUsuario').value.trim();
    const per = document.getElementById('periodFilter').value;
    const stat = document.getElementById('statusFilter').value;
    let activeFilters = 0;
    if (term) activeFilters++;
    if (per !== 'all') activeFilters++;
    if (stat !== 'all') activeFilters++;
    document.getElementById('filterCount').textContent = activeFilters;
}

/**
 * Muestra los datos de los usuarios en la tabla o lista.
 * @param {Array} usuarios - La lista de usuarios a mostrar.
 */
function mostrarDatos(usuarios) {
    const cont = document.getElementById('lista-usuarios');
    if (!cont) return;

    cont.innerHTML = '';
    
    const headers = document.createElement('div');
    headers.className = 'row g-0 text-center fw-semibold mb-2 py-2 headers-usuario d-none d-lg-flex';
    headers.innerHTML = `
        <div class="col-md-1">Foto</div>
        <div class="col-md-3">Nombre</div>
        <div class="col-md-3">Email</div>
        <div class="col-md-2">Registro</div>
        <div class="col-md-2">Solicitud</div>
        <div class="col-md-1">Actividad</div>
    `;
    cont.appendChild(headers);

    if (!usuarios || usuarios.length === 0) {
        const alertHtml = `
            <div class="alert alert-info text-center mt-3">
                No se encontraron usuarios con los filtros seleccionados.
            </div>
        `;
        cont.innerHTML += alertHtml;
        return;
    }

    usuarios.forEach(user => {
        const row = document.createElement('div');
        row.className = 'row g-0 align-items-center shadow-sm rounded mb-2 bg-white usuario-card';
        
        // Mapeo de propiedades del DTO del backend a las esperadas por el frontend
        // BASADO EN TU ESQUEMA tbUsers:
        const userId = user.userId; 
        const userName = user.fullName || 'N/A'; 
        const userEmail = user.email || 'N/A';
        const userRegistrationDate = user.registrationDate; 
        
        // Si tienes 'profilePictureUrl' en tu UserDTO, úsalo. Si no, quedará el placeholder.
        const userProfilePicture = user.profilePictureUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        
        // 'Solicitud' no está directamente en UserDTO. Se muestra 'N/A' a menos que
        // el backend sea modificado para incluir el estado del último ticket o un resumen.
        const userSolicitud = 'N/A'; 

        row.innerHTML = `
            <div class="col-md-1 d-flex justify-content-center align-items-center py-2">
                <img src="${userProfilePicture}"
                    class="rounded-circle"
                    style="width:32px; height:32px; object-fit: cover;"
                    onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
            </div>
            <div class="col-md-3 d-flex justify-content-center align-items-center px-2">
                ${userName}
            </div>
            <div class="col-md-3 d-flex justify-content-center align-items-center px-2">
                ${userEmail}
            </div>
            <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
                ${formatearFecha(userRegistrationDate)}
            </div>
            <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
                ${userSolicitud}
            </div>
            <div class="col-md-1 d-flex justify-content-center align-items-center py-2 btnact">
                <button class="btn btn-sm btn-primary ver-actividad"
                        data-id="${userId}">
                    Ver Actividad
                </button>
            </div>
        `;
        cont.appendChild(row);

        row.querySelector('.ver-actividad')
            .addEventListener('click', () => abrirModalVerActividadController(userId));
    });
}

/**
 * Renderiza los controles de paginación en el HTML.
 * @param {Object} pageable - El objeto `Page` de la respuesta del backend.
 */
function renderPaginacion(pageable) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    const { totalPages, number, first, last } = pageable;

    // Crea la lista de paginación
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // Botón "Anterior"
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${first ? 'disabled' : ''}`;
    const prevBtn = document.createElement('a');
    prevBtn.className = 'page-link';
    prevBtn.href = '#';
    prevBtn.textContent = 'Anterior';
    prevBtn.addEventListener('click', () => {
        if (!first) {
            loadUsers(number - 1, pageSize);
        }
    });
    prevLi.appendChild(prevBtn);
    ul.appendChild(prevLi);

    // Bucle para crear botones de número de página
    const startPage = Math.max(0, number - 2);
    const endPage = Math.min(totalPages - 1, number + 2);
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === number ? 'active' : ''}`;
        const pageBtn = document.createElement('a');
        pageBtn.className = 'page-link';
        pageBtn.href = '#';
        pageBtn.textContent = i + 1;
        pageBtn.addEventListener('click', () => loadUsers(i, pageSize));
        pageLi.appendChild(pageBtn);
        ul.appendChild(pageLi);
    }

    // Botón "Siguiente"
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${last ? 'disabled' : ''}`;
    const nextBtn = document.createElement('a');
    nextBtn.className = 'page-link';
    nextBtn.href = '#';
    nextBtn.textContent = 'Siguiente';
    nextBtn.addEventListener('click', () => {
        if (!last) {
            loadUsers(number + 1, pageSize);
        }
    });
    nextLi.appendChild(nextBtn);
    ul.appendChild(nextLi);

    paginationContainer.appendChild(ul);
}


/**
 * Inicializa el buscador de usuarios para que filtre al presionar Enter.
 */
function inicializarBuscadorDeUsuarios() {
    document.addEventListener('keypress', e => {
        if (e.key === 'Enter' && document.activeElement.id === 'busquedaUsuario') {
            loadUsers(0, pageSize); // Recargar la primera página con el nuevo término
        }
    });
}

/**
 * Orquesta la apertura del modal de actividad del usuario.
 * @param {number} userId - El ID del usuario cuya actividad se quiere ver.
 */
async function abrirModalVerActividadController(userId) {
    try {
        // Esta función ahora llama a getTicketDetailsForModal para obtener la información específica del ticket
        const ticketDetails = await getTicketDetailsForModal(userId); 
        displayActivityModal(ticketDetails); 
    } catch (err) {
        console.error('Error cargando la actividad del usuario/ticket:', err);
        alert('No se pudo cargar la actividad. Intenta de nuevo.');
    }
}

/**
 * Muestra el modal de actividad del usuario con los datos proporcionados.
 * NOTA: Esta función ahora espera un objeto AllUsersDTO (o similar)
 * que contiene los detalles del ticket para el modal, NO un UserDTO.
 * @param {Object} data - El objeto con la información a mostrar en el modal (AllUsersDTO).
 */
function displayActivityModal(data) {
    // Los campos aquí deben coincidir con las propiedades del AllUsersDTO del backend.
    // AllUsersDTO tiene: solicitante, rol, tecnicoEncargado, estadoDeTicket, registroDate (fecha de creación del ticket)
    
    // Asumo que tu AllUsersDTO podría tener un 'ticketId' si lo incluyes en tu SELECT SQL del backend
    document.getElementById('lblTicketId').innerHTML = `<strong>${data.id || 'N/A'}</strong>`; 
    document.getElementById('lblSolicitante').textContent = data.solicitante || '—';

    const fechaCreacionTicket = new Date(data.registroDate); // 'registroDate' en AllUsersDTO es 'Creacion' del ticket
    document.getElementById('lblCreacion').textContent = isNaN(fechaCreacionTicket)
        ? '—'
        : fechaCreacionTicket.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

    document.getElementById('lblRol').textContent = data.rol || '—'; 
    document.getElementById('lblTecnico').textContent = data.tecnicoEncargado || '—'; 
    document.getElementById('lblSolicitante').classList.add('fw-semibold');
    document.getElementById('lblRol').classList.add('fw-semibold');

    mostrarCreacion(data.registroDate, data.estadoDeTicket);
    mostrarEstado(data.estadoDeTicket);

    new bootstrap.Modal(document.getElementById('modalVerActividad')).show();
}

/**
 * Inyecta el icono de creación + fecha en el modal de actividad.
 * @param {string} fechaStr - La cadena de fecha de registro (o creación de ticket).
 * @param {string} estado - El estado de la solicitud/ticket para determinar el color del icono.
 */
function mostrarCreacion(fechaStr, estado) {
    const [_, colorClass] = statusIconMap[estado] || ['bi-question-circle', 'text-muted'];
    const fechaFormateada = fechaStr
        ? new Date(fechaStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : '—';

    const el = document.getElementById('lblCreacion');
    el.innerHTML = `
        <span class="">${fechaFormateada}</span>
        <i class="bi bi-calendar2-week ${colorClass} ms-2"></i>
    `;
}

/**
 * Inyecta el icono de estado + texto con color en el modal de actividad.
 * @param {string} estado - El estado de la solicitud/ticket.
 */
function mostrarEstado(estado) {
    const [iconClass, colorClass] = statusIconMap[estado] || ['bi-question-circle', 'text-muted'];
    const el = document.getElementById('lblEstadoTicket');
    el.innerHTML = `
        <span class="${colorClass}">${estado || '—'}</span>
        <i class="bi ${iconClass} ${colorClass} ms-2"></i>
    `;
}

// Inicia la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initUsuarios);
