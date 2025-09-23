// controllers/controllerCliTecnico.js
import * as cliService from '../services/serviceCliTecnico.js';

// Variables globales para el estado
let todosLosClientes = [];
let clientesFiltrados = [];
let paginaActual = 1;
let ticketsPorPagina = 10;

// Mapa de iconos de estado
const statusIconMap = {
    'En Progreso': ['bi-grid', 'text-warning'],
    'Completado': ['bi-check-circle', 'text-success'],
    'En espera': ['bi-clock', 'text-danger']
};

// Mapa para traducir el nombre del estado a su ID
const statusIdMap = {
    'En espera': 1,
    'En Progreso': 2,
    'Completado': 3,
};

/**
 * Inicializa la aplicación, carga los datos y los eventos.
 */
export async function init() {
    todosLosClientes = await cliService.getClientes();
    renderFilterBar();
    initFilterEvents();
    // La primera vez que se carga, no hay filtros ni paginación,
    // así que se hace la primera llamada a la paginación
    filtrarYRenderizar();
}

/**
 * Renderiza la barra de filtro en el DOM.
 */
function renderFilterBar() {
    const html = `
    <div class="filter-bar-custom">
      <div class="row align-items-center top-bar">
        <div class="col-lg-3 col-md-12 mb-3 mb-lg-0">
          <div class="user-counts">
            <div>
              <span id="userCount">0</span> Clientes
            </div>
            <small>Basado en <span id="filterCount">0</span> Filtro(s)</small>
          </div>
        </div>
        <div class="col-lg-8 col-md-12">
          <div class="input-group search-container">
            <span class="input-group-text search-icon-span"><i class="bi bi-search"></i></span>
            <input type="text" id="busquedaCliente" class="form-control search-input" placeholder="Buscar Nombre / Asunto / ID">
          </div>
        </div>
        <div class="col-lg-1 d-none d-lg-block text-end">
          <i class="bi bi-info-circle info-icon"></i>
        </div>
      </div>
      <hr class="filter-divider">
      <div class="d-flex flex-wrap gap-3 filter-row">
        <div class="filter-select-wrapper">
          <i class="bi bi-calendar-event filter-icon-1"></i>
          <select id="periodFilter" class="form-select styled-select">
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
        <div class="filter-select-wrapper">
          <i class="bi bi-ticket filter-icon-2"></i>
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
            <option value="10" selected>10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>`;
    document.getElementById('filter-bar-container').innerHTML = html;
}

/**
 * Inicializa los listeners de los eventos de filtro y paginación.
 */
function initFilterEvents() {
    document.getElementById('periodFilter')?.addEventListener('change', () => {
        paginaActual = 1;
        filtrarYRenderizar();
    });
    document.getElementById('statusFilter')?.addEventListener('change', () => {
        paginaActual = 1;
        filtrarYRenderizar();
    });
    document.getElementById('busquedaCliente')?.addEventListener('input', () => {
        paginaActual = 1;
        filtrarYRenderizar();
    });
    document.getElementById('ticketsPerPage')?.addEventListener('change', (e) => {
        ticketsPorPagina = parseInt(e.target.value);
        paginaActual = 1;
        filtrarYRenderizar();
    });
    document.getElementById('prevPage')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (paginaActual > 1) {
            paginaActual--;
            renderizarPagina();
        }
    });
    document.getElementById('nextPage')?.addEventListener('click', (e) => {
        e.preventDefault();
        const totalPaginas = Math.ceil(clientesFiltrados.length / ticketsPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarPagina();
        }
    });
}

/**
 * Combina la lógica de filtrado y renderizado para evitar repetición.
 */
function filtrarYRenderizar() {
    const term = document.getElementById('busquedaCliente')?.value.toLowerCase().trim() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const periodFilter = document.getElementById('periodFilter')?.value || 'all';

    const filtros = { term, status: statusFilter, period: periodFilter };
    clientesFiltrados = cliService.filterClientes(todosLosClientes, filtros);

    updateCounts(clientesFiltrados, filtros);
    renderizarPagina();
}

/**
 * Muestra los datos de la página actual en el DOM.
 */
function renderizarPagina() {
    const inicio = (paginaActual - 1) * ticketsPorPagina;
    const fin = inicio + ticketsPorPagina;
    const clientesDePagina = clientesFiltrados.slice(inicio, fin);
    mostrarDatos(clientesDePagina);
    renderPaginationControls();
}

/**
 * Muestra los datos de los clientes en el DOM.
 * @param {Array} clientes Los clientes a mostrar.
 */
function mostrarDatos(clientes) {
    const cont = document.getElementById('lista-clientes');
    if (!cont) return;

    if (!clientes || clientes.length === 0) {
        cont.innerHTML = `<div class="alert alert-info text-center mt-3">No se encontraron clientes.</div>`;
        return;
    }

    cont.innerHTML = '';
    const headers = document.createElement('div');
    headers.className = 'row g-0 text-center fw-semibold mb-2 py-2 headers-clientes d-none d-lg-flex';
    headers.innerHTML = `
      <div class="col-md-1">Foto</div><div class="col-md-3">Cliente</div><div class="col-md-3">Asunto</div>
      <div class="col-md-2">Fecha de Consulta</div><div class="col-md-2">Estado del Ticket</div><div class="col-md-1">Actividad</div>`;
    cont.appendChild(headers);

    clientes.forEach(cliente => {
        const row = document.createElement('div');
        row.className = 'row g-0 align-items-center shadow-sm rounded mb-2 bg-white usuario-card';
        row.innerHTML = `
          <div class="col-md-1 d-flex justify-content-center align-items-center py-2">
            <img src="${cliente.foto || 'https://i.ibb.co/HTjfpbxk/152d8b7a2e44.png'}" class="rounded-circle" style="width:32px; height:32px; object-fit: cover;">
          </div>
          <div class="col-md-3 d-flex justify-content-center align-items-center px-2">${cliente.fullName}</div>
          <div class="col-md-3 d-flex justify-content-center align-items-center px-2">${cliService.truncarTexto(cliente.asunto)}</div>
          <div class="col-md-2 d-flex justify-content-center align-items-center px-2">${cliService.formatearFecha(cliente.consultDate)}</div>
          <div class="col-md-2 d-flex justify-content-center align-items-center px-2">${cliente.ticketStatus}</div>
          <div class="col-md-1 d-flex justify-content-center align-items-center py-2 btnact">
            <button class="btn btn-sm btn-primary ver-mas" data-id="${cliente.id}" data-ticketId="${cliente.ticketId}">Ver más</button>
          </div>`;
        cont.appendChild(row);
        row.querySelector('.ver-mas')?.addEventListener('click', (e) => {
            const ticketId = parseInt(e.target.getAttribute('data-ticketId'));
            if (!isNaN(ticketId)) {
                abrirModal(ticketId);
            }
        });
    });
}

/**
 * Actualiza los contadores en la barra de filtro.
 * @param {Array} clientesFiltrados El array de clientes después de aplicar los filtros.
 * @param {Object} filtros Los filtros aplicados.
 */
function updateCounts(clientesFiltrados, filtros) {
    document.getElementById('userCount').textContent = clientesFiltrados.length;
    let activeFilters = 0;
    if (filtros.term) activeFilters++;
    if (filtros.period !== 'all') activeFilters++;
    if (filtros.status !== 'all') activeFilters++;
    document.getElementById('filterCount').textContent = activeFilters;
}

/**
 * Construye el HTML para el contenido del modal.
 * @param {Object} cliente El objeto del cliente.
 * @returns {string} El HTML del modal.
 */
function construirHTMLModal(cliente) {
    const [icono, color] = statusIconMap[cliente.ticketStatus] || ['bi-question-circle', 'text-muted'];
    const estadoHTML = `${cliente.ticketStatus} <i class="bi ${icono} ms-2"></i>`;

    return `
        <dl class="row g-2">
            <div class="d-flex align-items-center ticket-separator"><dt class="col-sm-4">Cliente:</dt><dd class="col-sm-8">${cliente.fullName}</dd></div>
            <div class="d-flex align-items-center ticket-separator"><dt class="col-sm-4">Asunto:</dt><dd class="col-sm-8">${cliente.asunto}</dd></div>
            <div class="d-flex align-items-center ticket-separator">
                <dt class="col-sm-4">Fecha de consulta:</dt>
                <dd class="col-sm-8 d-flex align-items-center"><span class="">${cliService.formatearFecha(cliente.consultDate)}</span><i class="bi bi-calendar2-week ${color} ms-2"></i></dd>
            </div>
            <div class="d-flex align-items-center ticket-separator">
                <dt class="col-sm-4">Estado del Ticket:</dt>
                <dd class="col-sm-8 d-flex align-items-center">
                    <span id="estadoActual" class="${color}">${estadoHTML}</span>
                    <a href="#" id="linkCambiarEstado" class="btn btn-link btn-sm ms-2">Cambiar Estado</a>
                </dd>
            </div>
        </dl>`;
}

/**
 * Abre el modal con los detalles del cliente.
 * @param {number} ticketId El ID del ticket a mostrar.
 */
function abrirModal(ticketId) {
    const cliente = todosLosClientes.find(c => c.ticketId === ticketId);
    if (!cliente) return;

    document.getElementById('modalTicketId').textContent = cliente.ticketId;
    document.getElementById('modalBodyContent').innerHTML = construirHTMLModal(cliente);

    const modal = new bootstrap.Modal(document.getElementById('modalVermas'));
    modal.show();

    document.getElementById('linkCambiarEstado')?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarSelectorDeEstado(cliente.ticketStatus, cliente.ticketId);
    });
}

/**
 * Muestra un selector de estado dentro del modal.
 * @param {string} estadoActual El estado actual del ticket.
 * @param {number} ticketId El ID del ticket.
 */
function mostrarSelectorDeEstado(estadoActual, ticketId) {
    const opciones = Object.keys(statusIdMap).map(opcion =>
        `<option value="${opcion}" ${opcion === estadoActual ? 'selected' : ''}>${opcion}</option>`
    ).join('');

    const selectorHTML = `<select class="form-select" id="selectorEstadoNuevo">${opciones}</select>`;

    document.getElementById('estadoActual').innerHTML = selectorHTML;
    document.getElementById('linkCambiarEstado').style.display = 'none';

    document.getElementById('selectorEstadoNuevo')?.addEventListener('change', async (e) => {
        const nuevoEstadoDisplayName = e.target.value;
        const nuevoEstadoId = statusIdMap[nuevoEstadoDisplayName];
        
        const result = await Swal.fire({
            title: `¿Estás seguro de cambiar el estado a "${nuevoEstadoDisplayName}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#dc3545'
        });

        if (result.isConfirmed) {
            try {
                await cliService.updateTicketStatus(ticketId, nuevoEstadoId, nuevoEstadoDisplayName);
                const clienteIndex = todosLosClientes.findIndex(c => c.ticketId === ticketId);
                if (clienteIndex !== -1) {
                    todosLosClientes[clienteIndex].ticketStatus = nuevoEstadoDisplayName;
                }
                filtrarYRenderizar();
                bootstrap.Modal.getInstance(document.getElementById('modalVermas'))?.hide();
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el estado del ticket.',
                    confirmButtonText: 'Aceptar'
                });
            }
        } else {
            e.target.value = estadoActual;
        }
    });
}

/**
 * Renderiza los controles de paginación.
 */
function renderPaginationControls() {
    const paginationContainer = document.getElementById('paginationControls');
    const totalPaginas = Math.ceil(clientesFiltrados.length / ticketsPorPagina);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');

    if (!paginationContainer || !prevBtn || !nextBtn || !currentPageSpan) {
        return;
    }

    // Actualizar el número de página actual
    currentPageSpan.textContent = paginaActual;

    // Habilitar/deshabilitar botones
    prevBtn.classList.toggle('disabled', paginaActual === 1);
    nextBtn.classList.toggle('disabled', paginaActual === totalPaginas);
}

document.addEventListener('DOMContentLoaded', init);