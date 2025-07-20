// Endpoint de la API para obtener los datos de los técnicos.
const API_Tecnico = 'https://retoolapi.dev/L79ky8/dataTecnico'; //
// Endpoint de la API para obtener las categorías de los técnicos.
const API_URL2 = "https://retoolapi.dev/mNwaIw/categorias"; //

// Función principal que se ejecuta al cargar el DOM.
async function initTecnicos() {
    try {
        // Obtenemos los datos de los técnicos desde la API.
        const res = await fetch(API_Tecnico); //
        const tecnicos = await res.json(); //
        // Almacenamos los técnicos originales en una variable global para no tener que pedirlos de nuevo.
        window.todosLosTecnicos = tecnicos; //

        renderFilterBar(); // Renderiza la barra de filtros.
        await loadCategoriesIntoFilter(); // Carga las categorías en el filtro, esperando a que terminen.
        mostrarDatos(tecnicos); // Muestra los datos iniciales de los técnicos.
        initFilterEvents(); // Inicializa los eventos de los filtros y la búsqueda.
        inicializarBuscadorDeTecnicos(); // Configura el evento de búsqueda al presionar 'Enter'.
        updateCounts(); // Actualiza los contadores de técnicos.
    } catch (err) {
        console.error('Error cargando técnicos:', err); //
    }
}

// Renderiza la barra de filtros en el HTML.
function renderFilterBar() {
    const html = `
    <div class="filter-bar-custom">
      <div class="row align-items-center top-bar">
        <div class="col-lg-3 col-md-12 mb-3 mb-lg-0">
          <div class="user-counts">
            <div>
              <span id="userCount">0</span> Técnicos
            </div>
            <small>Basado en <span id="filterCount">0</span> Filtro(s)</small>
          </div>
        </div>

        <div class="col-lg-8 col-md-12">
          <div class="input-group search-container">
            <span class="input-group-text search-icon-span">
                <i class="bi bi-search"></i>
            </span>
            <input type="text" id="busquedaTecnico" class="form-control search-input" placeholder="Buscar Técnico / Email / Categoría">
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
          <i class="bi bi-bookmark-fill filter-icon"></i> <select id="categoryFilter" class="form-select styled-select">
            <option value="all">Todas las categorías</option>
            </select>
        </div>
      </div>
    </div>
  `;
    document.getElementById('filter-bar-container').innerHTML = html; 
}

// Carga las categorías desde la API_URL2 y las inserta en el select del filtro.
async function loadCategoriesIntoFilter() {
    try {
        const res = await fetch(API_URL2);
        if (!res.ok) {
            throw new Error(`Error al cargar categorías para filtro: Status ${res.status}`);
        }
        const categories = await res.json();
        const categorySelect = document.getElementById('categoryFilter');

        // Limpiar opciones existentes, excepto la primera "Todas las categorías"
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nombreDepartamento; // Usar 'nombreDepartamento' de la API
            option.textContent = cat.nombreDepartamento; 
            categorySelect.appendChild(option);
        });
    } catch (err) {
        console.error('Error cargando categorías para el filtro:', err);
    }
}

// Inicializa los listeners para los eventos de filtrado y búsqueda.
function initFilterEvents() {
    document.getElementById('categoryFilter').addEventListener('change', filtrarTecnicos);
    document.getElementById('busquedaTecnico').addEventListener('input', filtrarTecnicos);
}

// Actualiza los contadores de técnicos visibles y filtros activos.
function updateCounts() {
    const visibleCount = document.querySelectorAll('#lista-tecnico .usuario-card:not([style*="display: none"])').length;
    document.getElementById('userCount').textContent = visibleCount;

    const term = document.getElementById('busquedaTecnico').value.trim();
    const cat = document.getElementById('categoryFilter').value;
    let act = 0; 
    if (term) act++;
    if (cat !== 'all') act++;
    document.getElementById('filterCount').textContent = act;
}

// Muestra los datos de los técnicos en la tabla/cards.
function mostrarDatos(tecnicos) {
    const cont = document.getElementById('lista-tecnico'); 
    if (!cont) return;

    // Mensaje si no se encuentran técnicos.
    if (!tecnicos || tecnicos.length === 0) {
        cont.innerHTML = `
      <div class="alert alert-info text-center mt-3">
        No se encontraron técnicos con los filtros seleccionados.
      </div>
    `;
        return;
    }

    cont.innerHTML = '';

    // Cabeceras de la tabla para técnicos.
    const headers = document.createElement('div');
    headers.className = 'row g-0 text-center fw-semibold mb-2 py-2 headers-tecnico d-none d-lg-flex';
    headers.innerHTML = `
    <div class="col-md-1">Foto</div>
    <div class="col-md-4">Nombre</div>
    <div class="col-md-2">Correo</div>
    <div class="col-md-2">Teléfono</div>
    <div class="col-md-2">Categoría</div>
    <div class="col-md-1">Info</div>
  `;
    cont.appendChild(headers);

    // Filas de datos adaptadas para técnicos.
    tecnicos.forEach(tecnico => {
        const row = document.createElement('div');
        row.className = 'row g-0 align-items-center shadow-sm rounded mb-2 bg-white usuario-card'; //
        row.innerHTML = `
      <div class="col-md-1 d-flex justify-content-center align-items-center py-2">
        <img src="${tecnico.foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}"
             class="rounded-circle profile-img-sm"
             onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
      </div>
      <div class="col-md-4 d-flex justify-content-center align-items-center px-2">
        ${tecnico.nombre || 'N/A'}
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${tecnico.email || 'N/A'}
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${tecnico.phone || 'N/A'}
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${tecnico.category || 'N/A'}
      </div>
      <div class="col-md-1 d-flex justify-content-center align-items-center py-2 btnact">
        <button class="btn btn-sm btn-primary ver-mas"
                data-id="${tecnico.id}">
          Ver Más
        </button>
      </div>
    `;
        cont.appendChild(row);

        // Agregamos el listener para el botón "Ver Más".
        row.querySelector('.ver-mas')
            .addEventListener('click', () => abrirModalVerMasTecnico(tecnico.id)); //
    });
}

// Formatea una cadena de fecha a un formato legible en español.
function formatearFecha(fechaStr) {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Filtra la lista de técnicos basándose en los criterios de búsqueda y categoría.
function filtrarTecnicos() {
    const term = document.getElementById('busquedaTecnico').value.toLowerCase().trim(); 
    const categoryFilter = document.getElementById('categoryFilter').value;

    const tecnicosFiltrados = window.todosLosTecnicos.filter(tecnico => {
        // Coincidencia con el término de búsqueda (nombre, email, id, phone, rol, category)
        const matchTerm = (
            (tecnico.nombre && tecnico.nombre.toLowerCase().includes(term)) || 
            (tecnico.email && tecnico.email.toLowerCase().includes(term)) || 
            (tecnico.id && tecnico.id.toString().includes(term)) || 
            (tecnico.phone && tecnico.phone.toLowerCase().includes(term)) || 
            (tecnico.rol && tecnico.rol.toLowerCase().includes(term)) || 
            (tecnico.category && tecnico.category.toLowerCase().includes(term)) 
        );

        // Coincidencia con la categoría seleccionada.
        const matchCategory = (categoryFilter === 'all' || (tecnico.category && tecnico.category === categoryFilter)); 

        // El técnico se muestra solo si todas las condiciones son verdaderas.
        return matchTerm && matchCategory;
    });

    mostrarDatos(tecnicosFiltrados); 
    updateCounts(); 
}

// Inicializa el buscador para que filtre al presionar 'Enter'.
function inicializarBuscadorDeTecnicos() {
    document.addEventListener('keypress', e => {
        if (e.key === 'Enter' && document.activeElement.id === 'busquedaTecnico') { 
            filtrarTecnicos();
        }
    });
}

// Abre el modal para ver más detalles del técnico.
async function abrirModalVerMasTecnico(tecnicoId) {
    const url = `${API_Tecnico}/${tecnicoId}`; 
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Status ${res.status}`);
        }
        const tecnico = await res.json();

        // Rellenar el título del modal con el ID del técnico
        document.getElementById('modalTecnicoId').textContent = tecnico.id || '—';

        // Rellenar los campos del modal con los datos del técnico
        document.getElementById('lblNombreTecnico').textContent = tecnico.nombre || '—';
        document.getElementById('lblEmailTecnico').textContent = tecnico.email || '—';
        document.getElementById('lblTelefonoTecnico').textContent = tecnico.phone || '—';
        document.getElementById('lblRolTecnico').textContent = tecnico.rol || '—';

        // Inicializar la visualización de la categoría con el span y el botón
        const categoriaDisplayWrapper = document.getElementById('categoriaDisplayWrapper');
        const currentCategory = tecnico.category || '—';
        categoriaDisplayWrapper.innerHTML = `
            <span id="lblCategoriaTecnicoActual" class="me-2 fw-semibold">${currentCategory}</span>
            <a href="#" class="btn-link" id="btnCambiarCategoriaTecnico">Cambiar categoría</a>
        `;

        // Que algunos campos tengan negrita
        document.getElementById('lblNombreTecnico').classList.add('fw-semibold');

        // Configurar el botón "Cambiar categoría"
        const btnCambiarCategoria = document.getElementById('btnCambiarCategoriaTecnico');
        if (btnCambiarCategoria) {
            btnCambiarCategoria.onclick = (event) => showCategorySelector(event, tecnico.id, tecnico.category); //
        }

        // Asegurar que el footer del modal para edición esté oculto inicialmente.
        const modalFooter = document.getElementById('modalFooterContent');
        if (modalFooter) {
            modalFooter.style.display = 'none';
        }

        // Muestra el modal.
        new bootstrap.Modal(document.getElementById('modalVermas')).show();
    } catch (err) {
        console.error('Error cargando detalles del técnico:', err);
        alert('No se pudieron cargar los detalles del técnico. Intenta de nuevo.');
    }
}

async function showCategorySelector(event, tecnicoId, currentCategory) {
    event.preventDefault();
    const categoriaDisplayWrapper = document.getElementById('categoriaDisplayWrapper');

    // Cargar categorías desde la API
    let categoriesData;
    try {
        const res = await fetch(API_URL2);
        if (!res.ok) {
            throw new Error(`Error al cargar categorías: Status ${res.status}`);
        }
        categoriesData = await res.json();
        if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
            Swal.fire('Advertencia', 'No se encontraron categorías disponibles.', 'warning');
            return;
        }
    } catch (error) {
        console.error('Error al cargar las categorías desde la API:', error);
        Swal.fire('Error', `No se pudieron cargar las categorías: ${error.message}`, 'error');
        return;
    }

    // Construir las opciones del select
    const opcionesHTML = categoriesData.map(item =>
        `<option value="${item.nombreDepartamento}" ${item.nombreDepartamento === currentCategory ? 'selected' : ''}>${item.nombreDepartamento}</option>`
    ).join('');

    // Reemplazar el contenido del wrapper con el select
    categoriaDisplayWrapper.innerHTML = `
        <select class="form-select me-2" id="selectorNuevaCategoria">${opcionesHTML}</select>
    `;

    const selector = document.getElementById('selectorNuevaCategoria');
    // Guardar la categoría original para revertir si es necesario
    selector.dataset.originalCategory = currentCategory;

    selector.addEventListener('change', async (e) => {
        const newCategory = e.target.value;

        // Diálogo de confirmación
        const result = await Swal.fire({
            title: `¿Estás seguro de cambiar la categoría a "${newCategory}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#dc3545'
        });

        if (result.isConfirmed) {
            // Se realiza la actualización de la categoría
            await updateTecnicoCategory(tecnicoId, newCategory);

            // Ocultar el modal después de la actualización exitosa
            bootstrap.Modal.getInstance(document.getElementById('modalVermas')).hide();

        } else {
            // Revertir la selección en el dropdown al valor original o al que se tenía antes de abrir el SweetAlert
            e.target.value = selector.dataset.originalCategory;
        }
    });
}

async function updateTecnicoCategory(tecnicoId, newCategory) {
    console.log(`Actualizando categoría para técnico ${tecnicoId} a: ${newCategory}`);

    try {
        const res = await fetch(`${API_Tecnico}/${tecnicoId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: newCategory })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Falló la actualización en la API con status ${res.status}`);
        }

        // Actualizar el técnico en el array global
        const tecnicoIndex = window.todosLosTecnicos.findIndex(t => t.id == tecnicoId);
        if (tecnicoIndex !== -1) {
            window.todosLosTecnicos[tecnicoIndex].category = newCategory;
        }

        // Refrescar la vista de la tabla de técnicos si es necesario
        if (typeof initTecnicos === 'function') {
            initTecnicos();
        }
        Swal.fire('¡Éxito!', 'Categoría actualizada correctamente.', 'success');

    } catch (err) {
        console.error('Error al actualizar categoría:', err);
        Swal.fire('Error', `No se pudo actualizar la categoría del técnico: ${err.message}`, 'error');
    }
}

// Asegura que initTecnicos se ejecute una vez que el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', initTecnicos);