// controller/controllerAllClients.js

// Importamos las funciones del servicio
import {
    fetchAllClients,
    fetchTicketDetails,
    formatRegistrationDate
} from '../services/serviceAllClients.js';

// Variable global para almacenar los usuarios originales
let allClients = [];

/**
 * Inicializa la aplicación. Se ejecuta al cargar el DOM.
 */
async function init() {
    // 1. Obtener datos de la API
    const clientsPage = await fetchAllClients();
    
    // Aseguramos que la respuesta tiene la propiedad 'content' y la asignamos a allClients
    if (clientsPage && Array.isArray(clientsPage.content)) {
        allClients = clientsPage.content;
    } else {
        console.error('Error: La respuesta de la API no contiene una lista de clientes válida.');
        allClients = [];
    }

    // 2. Renderizar la interfaz
    renderFilterBar();
    showClients(allClients);

    // 3. Inicializar eventos
    initFilterEvents();
    initSearchEvents();
    updateCounts();
}

/**
 * Renderiza la barra de filtros en el DOM.
 */
function renderFilterBar() {
    // ... (El mismo código que tenías para renderizar el HTML)
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
                        <option value="En Progreso">En Progreso</option>
                        <option value="Completado">Completado</option>
                        <option value="En espera">En espera</option>
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
 * Muestra los datos de los clientes en la tabla principal.
 * @param {Array} clients Un array de objetos de cliente.
 */
function showClients(clients) {
    const container = document.getElementById('lista-usuarios');
    if (!container) return;

    if (!clients || clients.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center mt-3">
                No se encontraron clientes con los filtros seleccionados.
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    // Headers
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
    container.appendChild(headers);

    // Data rows
    clients.forEach(client => {
        const row = document.createElement('div');
        row.className = 'row g-0 align-items-center shadow-sm rounded mb-2 bg-white usuario-card';
        row.innerHTML = `
            <div class="col-md-1 d-flex justify-content-center align-items-center py-2">
                <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                     class="rounded-circle"
                     style="width:32px; height:32px; object-fit: cover;">
            </div>
            <div class="col-md-3 d-flex justify-content-center align-items-center px-2">
                ${client.nombre_cliente}
            </div>
            <div class="col-md-3 d-flex justify-content-center align-items-center px-2">
                ${client.email}
            </div>
            <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
                ${formatRegistrationDate(client.fecha_registro)}
            </div>
            <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
                ${client.estado_solicitud || 'N/A'}
            </div>
            <div class="col-md-1 d-flex justify-content-center align-items-center py-2 btnact">
                <button class="btn btn-sm btn-primary ver-actividad" data-id="${client.ticketId}">
                    Ver Actividad
                </button>
            </div>
        `;
        container.appendChild(row);

        // Agregamos el event listener al botón
        row.querySelector('.ver-actividad').addEventListener('click', () => {
            openActivityModal(client.ticketId);
        });
    });
}

/**
 * Inicializa los listeners para los filtros de periodo y estado.
 */
function initFilterEvents() {
    document.getElementById('periodFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
}

/**
 * Inicializa los listeners para el campo de búsqueda.
 */
function initSearchEvents() {
    const searchInput = document.getElementById('busquedaUsuario');
    searchInput.addEventListener('input', applyFilters);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

/**
 * Aplica todos los filtros a la lista de clientes.
 */
function applyFilters() {
    const searchTerm = document.getElementById('busquedaUsuario').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const periodFilter = document.getElementById('periodFilter').value;

    const filteredClients = allClients.filter(client => {
        const matchesSearchTerm = (
            (client.nombre_cliente && client.nombre_cliente.toLowerCase().includes(searchTerm)) ||
            (client.email && client.email.toLowerCase().includes(searchTerm)) ||
            (client.userId && client.userId.toString().includes(searchTerm))
        );

        const matchesStatus = (statusFilter === 'all' || client.estado_solicitud === statusFilter);

        let matchesPeriod = true;
        if (periodFilter !== 'all') {
            const clientDate = new Date(client.fecha_registro);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let startDate = today;
            switch (periodFilter) {
                case 'week':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(today.getMonth() - 1);
                    break;
            }
            matchesPeriod = (clientDate >= startDate && clientDate <= new Date());
        }

        return matchesSearchTerm && matchesStatus && matchesPeriod;
    });

    showClients(filteredClients);
    updateCounts();
}

/**
 * Actualiza los contadores de la interfaz.
 */
function updateCounts() {
    const visibleCount = document.querySelectorAll('#lista-usuarios .usuario-card').length;
    document.getElementById('userCount').textContent = visibleCount;

    const searchTerm = document.getElementById('busquedaUsuario').value.trim();
    const period = document.getElementById('periodFilter').value;
    const status = document.getElementById('statusFilter').value;
    let activeFilters = 0;
    if (searchTerm) activeFilters++;
    if (period !== 'all') activeFilters++;
    if (status !== 'all') activeFilters++;
    document.getElementById('filterCount').textContent = activeFilters;
}

/**
 * Abre el modal de actividad y carga los detalles del ticket.
 * @param {string} ticketId El ID del ticket para obtener los detalles.
 */
async function openActivityModal(ticketId) {
    const ticketDetails = await fetchTicketDetails(ticketId);

    if (ticketDetails) {
        // Mapeo de estado a iconos y colores
        const statusIconMap = {
            'En Progreso': ['bi-grid', 'text-warning'],
            'Completado': ['bi-check-circle', 'text-success'],
            'En espera': ['bi-clock', 'text-danger']
        };

        // Define el icono y el color ANTES de usarlos
        const [icon, color] = statusIconMap[ticketDetails.estado_ticket] || ['bi-question-circle', 'text-muted'];

        document.getElementById('lblTicketId').innerHTML = `<strong>${ticketDetails.ticketId}</strong>`;
        document.getElementById('lblSolicitante').textContent = ticketDetails.solicitante || '—';
        document.getElementById('lblRol').textContent = ticketDetails.rol_solicitante || '—';

        // Formatear la fecha de creación
        const creationDate = ticketDetails.fecha_creacion ? new Date(ticketDetails.fecha_creacion) : null;
        const creationDateFormatted = creationDate ? creationDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

        document.getElementById('lblCreacion').innerHTML = `
            <span class="">${creationDateFormatted}</span>
            <i class="bi bi-calendar2-week ${color} ms-2"></i>
        `;

        document.getElementById('lblTecnico').textContent = ticketDetails.tecnico_encargado || '—';

        // Ahora, 'icon' y 'color' están disponibles para lblEstadoTicket
        document.getElementById('lblEstadoTicket').innerHTML = `
            <span class="${color}">${ticketDetails.estado_ticket || '—'}</span>
            <i class="bi ${icon} ${color} ms-2"></i>
        `;

        // Mostrar el modal
        new bootstrap.Modal(document.getElementById('modalVerActividad')).show();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar actividad',
            text: 'No se pudo cargar la actividad. Intenta de nuevo.',
            confirmButtonText: 'Aceptar'
        });
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);