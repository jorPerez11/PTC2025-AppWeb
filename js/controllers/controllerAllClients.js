// controller/controllerAllClients.js

// Importamos las funciones del servicio
import {
    fetchAllClients,
    fetchTicketDetails,
    formatRegistrationDate,
    fetchTechUsersForSearch,
    patchTicketTechnician,
    fetchSelect2
} from '../services/serviceAllClients.js';

// Variables globales para el estado de la aplicación
let currentPage = 1;
let ticketsPerPage = 10;
let totalPages = 0;
let totalElements = 0;
let currentTicketId = null; // Variable para almacenar el ID del ticket actual
// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth } from "../services/serviceLogin.js";
const API_URL = "https://ptchelpdesk-a73934db2774.herokuapp.com/api";

/**
 * Inicializa la aplicación. Se ejecuta al cargar el DOM.
 */
async function init() {
    renderFilterBar();
    await fetchAndRenderClients();
    initFilterEvents();
    initReasignacionEvents();
}

/**
 * Obtiene los clientes de la API y los muestra en la interfaz.
 */
async function fetchAndRenderClients() {
    const searchTerm = document.getElementById('busquedaUsuario').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const periodFilter = document.getElementById('periodFilter').value;

    const clientsPage = await fetchAllClients(
        currentPage - 1,
        ticketsPerPage,
        statusFilter,
        periodFilter,
        searchTerm
    );

    if (clientsPage && Array.isArray(clientsPage.content)) {
        totalPages = clientsPage.totalPages;
        totalElements = clientsPage.totalElements;
        showClients(clientsPage.content);
        updateCounts();
        updatePagination();
    } else {
        console.error('Error: La respuesta de la API no contiene una lista de clientes válida.');
        showClients([]);
        updateCounts(0);
        updatePagination();
    }
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

        row.querySelector('.ver-actividad').addEventListener('click', () => {
            openActivityModal(client.ticketId);
        });
    });
}

function renderFilterBar() {
    const filterBarContainer = document.getElementById('filter-bar-container');
    if (!filterBarContainer) return;

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
    <div class="pagination-container" id="paginationContainer"></div>
    `;
    filterBarContainer.innerHTML = html;
}

/**
 * Inicializa los listeners para los filtros.
 */
function initFilterEvents() {
    document.getElementById('periodFilter').addEventListener('change', () => {
        currentPage = 1;
        fetchAndRenderClients();
    });
    document.getElementById('statusFilter').addEventListener('change', () => {
        currentPage = 1;
        fetchAndRenderClients();
    });
    document.getElementById('ticketsPerPage').addEventListener('change', async (e) => {
        ticketsPerPage = parseInt(e.target.value, 10);
        currentPage = 1;
        await fetchAndRenderClients();
    });
    const searchInput = document.getElementById('busquedaUsuario');
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        fetchAndRenderClients();
    });
}

/**
 * Actualiza los contadores de la interfaz.
 */
function updateCounts() {
    document.getElementById('userCount').textContent = totalElements;
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
 * Gestiona los botones de paginación con el estilo deseado.
 */
function updatePagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar

    if (totalPages > 1) {
        const paginationHtml = `
            <ul class="pagination justify-content-center mt-4 mb-4" id="paginationControls">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" aria-label="Anterior" data-page="prev">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">${currentPage} de ${totalPages}</span>
                </li>
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" aria-label="Siguiente" data-page="next">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        `;
        paginationContainer.innerHTML = paginationHtml;

        // Asignar los listeners a los nuevos elementos
        document.querySelector('[data-page="prev"]').addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                changePage(currentPage - 1);
            }
        });

        document.querySelector('[data-page="next"]').addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                changePage(currentPage + 1);
            }
        });
    }
}

/**
 * Cambia la página actual y actualiza la vista.
 * @param {number} newPage El número de la nueva página.
 */
async function changePage(newPage) {
    currentPage = newPage;
    await fetchAndRenderClients();
}

/**
 * Inicializa la lógica de eventos y Select2 para la reasignación.
 */
function initReasignacionEvents() {
    // 1. Inicializar Select2 con búsqueda remota y CORRECCIÓN DE ESTILO
    $('#selectTecnicoBusqueda').select2({
        // CORRECCIÓN VISUAL: Asegura que el dropdown aparezca sobre el modal
        dropdownParent: $('#modalVerActividad'),

        placeholder: "Buscar técnico (Nombre, ID, Usuario)...",
        allowClear: true,
        language: "es",
        minimumInputLength: 3,
        width: 'resolve',

        // ********** LÓGICA AJAX CON fetchWithAuth (VERSIÓN ROBUSTA) **********
        ajax: {
            dataType: 'json',
            delay: 250,
            cache: true,

            transport: async function (params, success, failure) {
                const encodedTerm = encodeURIComponent(params.data.term || "");
                const page = params.data.page || 0;
                const size = 20;
                const url = `${API_URL}/users/tech?page=${page}&size=${size}&term=${encodedTerm}`;

                try {
                    // LLAMADA SIMPLIFICADA
                    const data = await fetchSelect2(url);

                    // Si data viene vacío por error de red/parseo, 'data.content' será []

                    // Mapeo al formato Select2 (ProcessResults)
                    const results = data.content.map(user => {
                        // **USAMOS 'userid' y 'fullname' según tus logs SQL**
                        const displayId = user.userid || 'N/A';
                        const nameText = user.fullname || user.username || 'Técnico sin nombre';

                        return {
                            id: user.userid, // ID: El valor real a enviar
                            text: `${nameText} (Usuario: ${user.username}) - ID: ${displayId}` // TEXTO VISIBLE
                        };
                    });

                    const formattedData = {
                        results: results,
                        pagination: {
                            more: data.number < data.totalPages - 1
                        }
                    };

                    success(formattedData);

                } catch (error) {
                    // Este catch debería ser raramente alcanzado si fetchSelect2 es robusto
                    console.error("Error inesperado en transport Select2:", error);
                    failure({ message: "Error al cargar los técnicos." });
                }
            },

            // data: Define los parámetros que Select2 envía a 'transport'
            data: function (params) {
                return {
                    term: params.term,
                    page: params.page || 0,
                    size: 20
                };
            }
        }
        // *******************************************************
    });

    // 2. Manejo del click en 'Reasignar Técnico'
    $('#btnReasignarTecnico').on('click', function () {
        $('#tecnicoActualContainer').hide();
        $('#reasignarInputContainer').show();
        // Abrir el Select2 automáticamente
        $('#selectTecnicoBusqueda').select2('open');
    });

    // 3. Manejo del click en 'Cancelar'
    $('#btnCancelarReasignacion').on('click', function () {
        // Limpiar y ocultar
        $('#selectTecnicoBusqueda').val(null).trigger('change');
        $('#reasignarInputContainer').hide();
        // Mostrar el nombre actual
        $('#tecnicoActualContainer').show();
    });

    // 4. Manejo de la selección del nuevo técnico (PATCH/GUARDAR)
    $('#selectTecnicoBusqueda').on('select2:select', async function (e) {
        const nuevoTecnico = e.params.data;
        const ticketId = currentTicketId; // Usamos la variable global

        if (ticketId && nuevoTecnico.id) {
            const result = await Swal.fire({
                title: '¿Confirmar reasignación?',
                text: `¿Estás seguro de reasignar el Ticket #${ticketId} al técnico ${nuevoTecnico.text}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, reasignar',
                cancelButtonText: 'No, cancelar'
            });

            if (result.isConfirmed) {
                // Asumimos que patchTicketTechnician está disponible globalmente
                const success = await patchTicketTechnician(ticketId, nuevoTecnico.id);

                if (success) {
                    // 1. Actualizar el nombre en el modal (quita el texto entre paréntesis)
                    document.getElementById('lblTecnico').textContent = nuevoTecnico.text.split('(')[0].trim();
                    // 2. Volver al estado de visualización
                    $('#btnCancelarReasignacion').trigger('click');
                    Swal.fire('¡Reasignado!', `Ticket #${ticketId} reasignado exitosamente.`, 'success');
                    // Opcional: Recargar la lista principal si la vista cambia mucho
                    // await fetchAndRenderClients(); 
                }
                // Si falla, se asume que patchTicketTechnician ya mostró un error.
            } else {
                // Si cancela la confirmación, solo volvemos al estado de visualización
                $('#btnCancelarReasignacion').trigger('click');
            }
        }
    });
}

/**
 * Abre el modal de actividad y carga los detalles del ticket.
 * @param {string} ticketId El ID del ticket para obtener los detalles.
 */
async function openActivityModal(ticketId) {
    const ticketDetails = await fetchTicketDetails(ticketId);

    if (ticketDetails) {
        const statusIconMap = {
            'En Progreso': ['bi-grid', 'text-warning'],
            'Completado': ['bi-check-circle', 'text-success'],
            'En espera': ['bi-clock', 'text-danger']
        };

        const [icon, color] = statusIconMap[ticketDetails.estado_ticket] || ['bi-question-circle', 'text-muted'];

        document.getElementById('lblTicketId').innerHTML = `<strong>${ticketDetails.ticketId}</strong>`;
        document.getElementById('lblSolicitante').textContent = ticketDetails.solicitante || '—';
        document.getElementById('lblRol').textContent = ticketDetails.rol_solicitante || '—';

        const creationDate = ticketDetails.fecha_creacion ? new Date(ticketDetails.fecha_creacion) : null;
        const creationDateFormatted = creationDate ? creationDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

        document.getElementById('lblCreacion').innerHTML = `
            <span class="">${creationDateFormatted}</span>
            <i class="bi bi-calendar2-week ${color} ms-2"></i>
        `;

        document.getElementById('lblTecnico').textContent = ticketDetails.tecnico_encargado || '—';

        document.getElementById('lblEstadoTicket').innerHTML = `
            <span class="${color}">${ticketDetails.estado_ticket || '—'}</span>
            <i class="bi ${icon} ${color} ms-2"></i>
        `;

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

document.addEventListener('DOMContentLoaded', init);