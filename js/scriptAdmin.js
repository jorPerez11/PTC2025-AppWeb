const API_Users = 'https://retoolapi.dev/UzAWm5/Usersdata';

async function initUsuarios() {
  try {
    // Almacenaremos los usuarios originales para no tener que pedirlos a la API de nuevo
    const res = await fetch(API_Users);
    const usuarios = await res.json();
    window.todosLosUsuarios = usuarios; // Guardamos en una variable global

    renderFilterBar();
    mostrarDatos(usuarios);
    initFilterEvents();
    inicializarBuscadorDeUsuarios();
    updateCounts();
  } catch (err) {
    console.error('Error cargando usuarios:', err);
  }
}

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
            <option value="Abierto">Abierto</option>
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

function initFilterEvents() {
  document.getElementById('periodFilter').addEventListener('change', filtrarUsuarios);
  document.getElementById('statusFilter').addEventListener('change', filtrarUsuarios);
  document.getElementById('busquedaUsuario').addEventListener('input', filtrarUsuarios);
}

function updateCounts() {
  const visibleCount = document.querySelectorAll('#lista-usuarios .usuario-card:not([style*="display: none"])').length;
  document.getElementById('userCount').textContent = visibleCount;

  const term = document.getElementById('busquedaUsuario').value.trim();
  const per = document.getElementById('periodFilter').value;
  const stat = document.getElementById('statusFilter').value;
  let act = 0;
  if (term) act++;
  if (per !== 'all') act++;
  if (stat !== 'all') act++;
  document.getElementById('filterCount').textContent = act;
}

function mostrarDatos(usuarios) {
  const cont = document.getElementById('lista-usuarios');
  if (!cont) return;

  if (!usuarios || usuarios.length === 0) {
    cont.innerHTML = `
      <div class="alert alert-info text-center mt-3">
        No se encontraron usuarios con los filtros seleccionados.
      </div>
    `;
    return;
  }

  cont.innerHTML = '';

  // Cabeceras
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

  // Filas de datos
  usuarios.forEach(user => {
    const row = document.createElement('div');
    row.className = 'row g-0 align-items-center shadow-sm rounded mb-2 bg-white usuario-card';
    row.innerHTML = `
      <div class="col-md-1 d-flex justify-content-center align-items-center py-2">
        <img src="${user.foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}"
             class="rounded-circle"
             style="width:32px; height:32px; object-fit: cover;"
             onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
      </div>
      <div class="col-md-3 d-flex justify-content-center align-items-center px-2">
        ${user.nombre}
      </div>
      <div class="col-md-3 d-flex justify-content-center align-items-center px-2">
        ${user.email}
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${formatearFecha(user.registroDate)}
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${user.solicitud}
      </div>
      <div class="col-md-1 d-flex justify-content-center align-items-center py-2 btnact">
        <button class="btn btn-sm btn-primary ver-actividad"
                data-id="${user.id}">
          Ver Actividad
        </button>
      </div>
    `;
    cont.appendChild(row);

    row.querySelector('.ver-actividad')
      .addEventListener('click', () => abrirModalVerActividad(user.id));
  });
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return 'N/A';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function parseSpanishDate(dateString) {
  const meses = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
  };
  const parts = dateString.replace(/ de /g, ' ').split(' ');
  const day = parseInt(parts[0], 10);
  const month = meses[parts[1].toLowerCase()];
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}


/**
 * Filtra la lista de usuarios basándose en todos los criterios.
 */
function filtrarUsuarios() {
  const term = document.getElementById('busquedaUsuario').value.toLowerCase().trim();
  const statusFilter = document.getElementById('statusFilter').value;
  const periodFilter = document.getElementById('periodFilter').value;

  const usuariosFiltrados = window.todosLosUsuarios.filter(user => {
    // Coincidencia con el término de búsqueda
    const matchTerm = (
      user.nombre.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.id.toString().includes(term)
    );

    // Coincidencia con el estado de la solicitud
    const matchStatus = (statusFilter === 'all' || user.solicitud === statusFilter);

    // Coincidencia con el período de tiempo
    let matchPeriod = false;
    if (periodFilter === 'all') {
      matchPeriod = true;
    } else {
      const userDate = new Date(user.registroDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let startDate;
      switch (periodFilter) {
        case 'today':
          startDate = today;
          break;
        case 'week':
          startDate = new Date();
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setMonth(today.getMonth() - 1);
          break;
      }
      if (userDate >= startDate && userDate <= new Date()) { // Compara hasta el momento actual
        matchPeriod = true;
      }
    }

    // El usuario se muestra solo si todas las condiciones son verdaderas
    return matchTerm && matchStatus && matchPeriod;
  });

  mostrarDatos(usuariosFiltrados); // Vuelve a renderizar la lista con los datos filtrados
  updateCounts(); // Actualiza los contadores
}


function inicializarBuscadorDeUsuarios() {
  document.addEventListener('keypress', e => {
    if (e.key === 'Enter' && document.activeElement.id === 'busquedaUsuario') {
      filtrarUsuarios();
    }
  });
}

async function abrirModalVerActividad(userId) {
  const url = `${API_Users}/${userId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const u = await res.json();
    document.getElementById('lblTicketId').innerHTML = `<strong>${u.id}</strong>`;
    document.getElementById('lblSolicitante').textContent = u.nombre || '—';
    const fecha = new Date(u.registroDate);
    document.getElementById('lblCreacion').textContent = isNaN(fecha)
      ? '—'
      : fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    document.getElementById('lblRol').textContent = 'Cliente';
    document.getElementById('lblTecnico').textContent = 'Fernando Velásquez';
    document.getElementById('lblSolicitante').classList.add('fw-semibold');
    document.getElementById('lblRol').classList.add('fw-semibold');
    mostrarCreacion(u.registroDate, u.solicitud);
    // Estado de ticket con icono y color
    mostrarEstado(u.solicitud);
    new bootstrap.Modal(document.getElementById('modalVerActividad')).show();
  } catch (err) {
    console.error('Error cargando usuario:', err);
    alert('No se pudo cargar la actividad. Intenta de nuevo.');
  }
}

// Mapa de estado → [claseIcono, claseColor]
const statusIconMap = {
  'Abierto': ['bi-exclamation-circle', 'text-danger'],       // ❗ rojo
  'En Proceso': ['bi-grid', 'text-warning'],                 // 🎫 naranja
  'Cerrado': ['bi-check-circle', 'text-success'],            // ✅ verde
  'En Espera': ['bi-clock', 'text-warning']                  // ⏰ naranja
};

// Inyecta el icono de creación + fecha
function mostrarCreacion(fechaStr, estado) {
  const [_, color] = statusIconMap[estado] || ['bi-question-circle', 'text-muted'];
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
    <i class="bi bi-calendar2-week ${color} ms-2"></i>
  `;
}

// Inyecta el icono de estado + texto con color
function mostrarEstado(estado) {
  const [icono, color] = statusIconMap[estado] || ['bi-question-circle', 'text-muted'];
  const el = document.getElementById('lblEstadoTicket');
  el.innerHTML = `
    <span class="${color}">${estado || '—'}</span>
    <i class="bi ${icono} ${color} ms-2"></i>
  `;
}

document.addEventListener('DOMContentLoaded', initUsuarios);