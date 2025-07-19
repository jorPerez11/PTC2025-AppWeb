const API_Clients = 'https://retoolapi.dev/KaRBTk/clienteData';

// Acorta un texto a una longitud máxima y añade "..."
function truncarTexto(texto, longitud = 50) {
    if (typeof texto !== 'string' || texto.length <= longitud) {
        return texto;
    }
    return texto.substring(0, longitud) + '...';
}

async function initClientes() {
    try {
        const res = await fetch(API_Clients);
        const clientes = await res.json();
        window.todosLosClientes = clientes;
        renderFilterBar();
        filtrarClientes(); // Usamos filtrar para mostrar datos iniciales y aplicar cualquier filtro por defecto
        initFilterEvents();
    } catch (err) {
        console.error('Error cargando clientes:', err);
    }
}

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
            <option value="Abierto">Abierto</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Cerrado">Cerrado</option>
            <option value="En Espera">En Espera</option>
          </select>
        </div>
      </div>
    </div>
  `;
    document.getElementById('filter-bar-container').innerHTML = html;
}

function initFilterEvents() {
    document.getElementById('periodFilter').addEventListener('change', filtrarClientes);
    document.getElementById('statusFilter').addEventListener('change', filtrarClientes);
    document.getElementById('busquedaCliente').addEventListener('input', filtrarClientes);
}

function updateCounts(clientesFiltrados) {
    document.getElementById('userCount').textContent = clientesFiltrados.length;
    const term = document.getElementById('busquedaCliente').value.trim();
    const per = document.getElementById('periodFilter').value;
    const stat = document.getElementById('statusFilter').value;
    let act = 0;
    if (term) act++;
    if (per !== 'all') act++;
    if (stat !== 'all') act++;
    document.getElementById('filterCount').textContent = act;
}

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
            <img src="${cliente.foto || 'https://via.placeholder.com/32'}" class="rounded-circle" style="width:32px; height:32px; object-fit: cover;">
          </div>
          <div class="col-md-3 d-flex justify-content-center align-items-center px-2">${cliente.fullName}</div>
          <div class="col-md-3 d-flex justify-content-center align-items-center px-2">${truncarTexto(cliente.asunto)}</div>
          <div class="col-md-2 d-flex justify-content-center align-items-center px-2">${formatearFecha(cliente.consultDate)}</div>
          <div class="col-md-2 d-flex justify-content-center align-items-center px-2">${cliente.ticketStatus}</div>
          <div class="col-md-1 d-flex justify-content-center align-items-center py-2 btnact">
            <button class="btn btn-sm btn-primary ver-mas" data-id="${cliente.id}">Ver más</button>
          </div>`;
        cont.appendChild(row);
        row.querySelector('.ver-mas').addEventListener('click', () => abrirModal(cliente.id));
    });
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'N/A';
    return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function filtrarClientes() {
    const term = document.getElementById('busquedaCliente').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const periodFilter = document.getElementById('periodFilter').value;

    const clientesFiltrados = window.todosLosClientes.filter(cliente => {
        // Búsqueda por nombre, asunto, id o ticketId
        const matchTerm =
            !term ||
            (cliente.fullName && cliente.fullName.toLowerCase().includes(term)) ||
            (cliente.asunto && cliente.asunto.toLowerCase().includes(term)) ||
            (cliente.id && cliente.id.toString().includes(term)) ||
            (cliente.ticketId && cliente.ticketId.toString().includes(term));

        // Filtro de estado
        const matchStatus = statusFilter === 'all' || cliente.ticketStatus === statusFilter;

        // Filtro de periodo con límite inferior y superior
        let matchPeriod = periodFilter === 'all';
        if (!matchPeriod && cliente.consultDate) {
            const clientDate = new Date(cliente.consultDate);
            if (!isNaN(clientDate)) {
                const todayMid = new Date();
                todayMid.setHours(0, 0, 0, 0);

                let startDate, endDate;
                switch (periodFilter) {
                    case 'today':
                        startDate = new Date(todayMid);
                        endDate = new Date(todayMid);
                        endDate.setDate(endDate.getDate() + 1);
                        break;
                    case 'week':
                        startDate = new Date(todayMid);
                        startDate.setDate(startDate.getDate() - 7);
                        endDate = new Date(todayMid);
                        endDate.setDate(endDate.getDate() + 1);
                        break;
                    case 'month':
                        startDate = new Date(todayMid.getFullYear(), todayMid.getMonth(), 1);
                        endDate = new Date(todayMid.getFullYear(), todayMid.getMonth() + 1, 1);
                        break;
                }

                matchPeriod = clientDate >= startDate && clientDate < endDate;
            }
        }

        return matchTerm && matchStatus && matchPeriod;
    });

    mostrarDatos(clientesFiltrados);
    updateCounts(clientesFiltrados);
}

const statusIconMap = {
    'Abierto': ['bi-exclamation-circle', 'text-danger'],
    'En Proceso': ['bi-grid', 'text-warning'],
    'Cerrado': ['bi-check-circle', 'text-success'],
    'En Espera': ['bi-clock', 'text-warning']
};

function construirHTMLModal(cliente) {
    const [icono, color] = statusIconMap[cliente.ticketStatus] || ['bi-question-circle', 'text-muted'];

    const estadoHTML = `${cliente.ticketStatus} <i class="bi ${icono} ms-2"></i>`;

    return `
        <dl class="row g-2">
            <div class="d-flex align-items-center ticket-separator"><dt class="col-sm-4">Cliente:</dt><dd class="col-sm-8">${cliente.fullName}</dd></div>
            <div class="d-flex align-items-center ticket-separator"><dt class="col-sm-4">Asunto:</dt><dd class="col-sm-8">${cliente.asunto}</dd></div>
            <div class="d-flex align-items-center ticket-separator">
                <dt class="col-sm-4">Fecha de consulta:</dt>
                <dd class="col-sm-8 d-flex align-items-center"><span class="">${formatearFecha(cliente.consultDate)}</span><i class="bi bi-calendar2-week ${color} ms-2"></i></dd>
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

async function abrirModal(clienteId) {
    const cliente = window.todosLosClientes.find(c => c.id === clienteId);
    if (!cliente) return;

    document.getElementById('modalTicketId').textContent = cliente.ticketId;
    document.getElementById('modalBodyContent').innerHTML = construirHTMLModal(cliente);

    const modal = new bootstrap.Modal(document.getElementById('modalVermas'));
    modal.show();

    document.getElementById('linkCambiarEstado').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarSelectorDeEstado(cliente.ticketStatus, clienteId);
    });
}

function mostrarSelectorDeEstado(estadoActual, clienteId) {
    const opciones = Object.keys(statusIconMap).map(opcion =>
        `<option value="${opcion}" ${opcion === estadoActual ? 'selected' : ''}>${opcion}</option>`
    ).join('');

    const selectorHTML = `
        <select class="form-select" id="selectorEstadoNuevo">${opciones}</select>`;

    document.getElementById('estadoActual').innerHTML = selectorHTML;
    document.getElementById('linkCambiarEstado').style.display = 'none';

    document.getElementById('selectorEstadoNuevo').addEventListener('change', async (e) => {
        const nuevoEstado = e.target.value;

        // Añadimos el diálogo de confirmación
        const result = await Swal.fire({
            title: `¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No',
            confirmButtonColor: '#0d6efd',   // primary
            cancelButtonColor: '#dc3545'     // danger
        });

        if (result.isConfirmed) {
            await actualizarEstadoTicket(clienteId, nuevoEstado);
            bootstrap.Modal
                .getInstance(document.getElementById('modalVermas'))
                .hide();
            // actualiza el estado de referencia
            estadoActual = nuevoEstado;
        } else {
            // revierte la selección al valor original
            e.target.value = estadoActual;
        }
    });
}

async function actualizarEstadoTicket(clienteId, nuevoEstado) {
    try {
        const res = await fetch(`${API_Clients}/${clienteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketStatus: nuevoEstado })
        });
        if (!res.ok) throw new Error('Falló la actualización en la API');

        // Actualizar el estado en la variable global para no recargar la página
        const clienteIndex = window.todosLosClientes.findIndex(c => c.id === clienteId);
        if (clienteIndex !== -1) {
            window.todosLosClientes[clienteIndex].ticketStatus = nuevoEstado;
        }

        filtrarClientes(); // Refrescar la vista con los datos actualizados

    } catch (err) {
        console.error('Error al actualizar estado:', err);
        alert('No se pudo actualizar el estado del ticket.');
    }
}

document.addEventListener('DOMContentLoaded', initClientes);