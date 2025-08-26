// controllerTecnicos.js

// Importa las funciones del servicio para interactuar con las APIs
import {
    getTecnicosFromAPI,
    getCategoriasFromAPI,
    getTecnicoById,
    updateTecnicoCategoryInAPI
} from '../services/serviceAllUsers.js';

let todosLosTecnicos = [];

/**
 * Inicializa la página de gestión de técnicos.
 * Renderiza la barra de filtro y la lista de técnicos.
 */
async function initTecnicos() {
    try {
        todosLosTecnicos = await getTecnicosFromAPI();
        renderFilterBar();
        await loadCategoriesIntoFilter();
        mostrarDatos(todosLosTecnicos);
        initFilterEvents();
        inicializarBuscadorDeTecnicos();
        updateCounts();
    } catch (err) {
        console.error('Error al inicializar la gestión de técnicos:', err);
        document.getElementById('lista-tecnico').innerHTML = `
            <div class="alert alert-danger text-center mt-3">
                Error al cargar los técnicos. Por favor, intenta de nuevo más tarde.
            </div>
        `;
    }
}

/**
 * Renderiza la barra de filtros en el HTML.
 */
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
                </div>
            </div>
            <div class="col-lg-1 d-none d-lg-block text-end">
                <i class="bi bi-info-circle info-icon"></i>
            </div>
        </div>
        <hr class="filter-divider">
        <div class="d-flex flex-wrap gap-3 filter-row">
            <div class="filter-select-wrapper">
                <i class="bi bi-bookmark-fill filter-icon"></i> 
                <select id="categoryFilter" class="form-select styled-select">
                    <option value="all">Todas las categorías</option>
                </select>
            </div>
        </div>
    </div>
    `;
    document.getElementById('filter-bar-container').innerHTML = html;
}

/**
 * Carga las categorías en el filtro, esperando a que terminen.
 */
async function loadCategoriesIntoFilter() {
    try {
        const categories = await getCategoriasFromAPI();
        const categorySelect = document.getElementById('categoryFilter');
        
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nombreDepartamento;
            option.textContent = cat.nombreDepartamento;
            categorySelect.appendChild(option);
        });
    } catch (err) {
        console.error('Error cargando categorías para el filtro:', err);
    }
}

/**
 * Inicializa los listeners para los eventos de filtrado y búsqueda.
 */
function initFilterEvents() {
    document.getElementById('categoryFilter').addEventListener('change', filtrarTecnicos);
    document.getElementById('busquedaTecnico').addEventListener('input', filtrarTecnicos);
}

/**
 * Actualiza los contadores de técnicos visibles y filtros activos.
 */
function updateCounts() {
    const visibleCount = document.querySelectorAll('#lista-tecnico .usuario-card:not([style*="display: none"])').length;
    document.getElementById('userCount').textContent = visibleCount;
    
    const term = document.getElementById('busquedaTecnico').value.trim();
    const cat = document.getElementById('categoryFilter').value;
    let activeFilters = 0;
    if (term) activeFilters++;
    if (cat !== 'all') activeFilters++;
    document.getElementById('filterCount').textContent = activeFilters;
}

/**
 * Muestra los datos de los técnicos en la tabla.
 * @param {Array} tecnicos - El array de técnicos a mostrar.
 */
function mostrarDatos(tecnicos) {
    const cont = document.getElementById('lista-tecnico');
    if (!cont) return;

    cont.innerHTML = ''; // Limpia el contenido anterior

    if (!tecnicos || tecnicos.length === 0) {
        cont.innerHTML = `
            <div class="alert alert-info text-center mt-3">
                No se encontraron técnicos con los filtros seleccionados.
            </div>
        `;
        return;
    }

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

    tecnicos.forEach(tecnico => {
        const row = document.createElement('div');
        row.className = 'row g-0 align-items-center shadow-sm rounded mb-2 bg-white usuario-card';
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
                <button class="btn btn-sm btn-primary ver-mas" data-id="${tecnico.id}">
                    Ver Más
                </button>
            </div>
        `;
        cont.appendChild(row);

        row.querySelector('.ver-mas')
            .addEventListener('click', () => abrirModalVerMasTecnico(tecnico.id));
    });
}

/**
 * Filtra la lista de técnicos basándose en los criterios de búsqueda y categoría.
 */
function filtrarTecnicos() {
    const term = document.getElementById('busquedaTecnico').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('categoryFilter').value;

    const tecnicosFiltrados = todosLosTecnicos.filter(tecnico => {
        const matchTerm = (
            (tecnico.nombre && tecnico.nombre.toLowerCase().includes(term)) ||
            (tecnico.email && tecnico.email.toLowerCase().includes(term)) ||
            (tecnico.id && tecnico.id.toString().includes(term)) ||
            (tecnico.phone && tecnico.phone.toLowerCase().includes(term)) ||
            (tecnico.rol && tecnico.rol.toLowerCase().includes(term)) ||
            (tecnico.category && tecnico.category.toLowerCase().includes(term))
        );

        const matchCategory = (categoryFilter === 'all' || (tecnico.category && tecnico.category === categoryFilter));

        return matchTerm && matchCategory;
    });

    mostrarDatos(tecnicosFiltrados);
    updateCounts();
}

/**
 * Inicializa el buscador para que filtre al presionar 'Enter'.
 */
function inicializarBuscadorDeTecnicos() {
    document.addEventListener('keypress', e => {
        if (e.key === 'Enter' && document.activeElement.id === 'busquedaTecnico') {
            filtrarTecnicos();
        }
    });
}

/**
 * Abre el modal para ver más detalles del técnico.
 * @param {string|number} tecnicoId - El ID del técnico a mostrar.
 */
async function abrirModalVerMasTecnico(tecnicoId) {
    try {
        const tecnico = await getTecnicoById(tecnicoId);
        
        document.getElementById('modalTecnicoId').textContent = tecnico.id || '—';
        document.getElementById('lblNombreTecnico').textContent = tecnico.nombre || '—';
        document.getElementById('lblEmailTecnico').textContent = tecnico.email || '—';
        document.getElementById('lblTelefonoTecnico').textContent = tecnico.phone || '—';
        document.getElementById('lblRolTecnico').textContent = tecnico.rol || '—';
        document.getElementById('lblNombreTecnico').classList.add('fw-semibold');

        const categoriaDisplayWrapper = document.getElementById('categoriaDisplayWrapper');
        const currentCategory = tecnico.category || '—';
        categoriaDisplayWrapper.innerHTML = `
            <span id="lblCategoriaTecnicoActual" class="me-2 fw-semibold">${currentCategory}</span>
            <a href="#" class="btn-link" id="btnCambiarCategoriaTecnico">Cambiar categoría</a>
        `;
        
        const btnCambiarCategoria = document.getElementById('btnCambiarCategoriaTecnico');
        if (btnCambiarCategoria) {
            btnCambiarCategoria.onclick = (event) => showCategorySelector(event, tecnico.id, tecnico.category);
        }

        const modalFooter = document.getElementById('modalFooterContent');
        if (modalFooter) {
            modalFooter.style.display = 'none';
        }

        new bootstrap.Modal(document.getElementById('modalVermas')).show();
    } catch (err) {
        console.error('Error cargando detalles del técnico:', err);
        Swal.fire('Error', 'No se pudieron cargar los detalles del técnico. Intenta de nuevo.', 'error');
    }
}

/**
 * Muestra el selector de categoría en el modal.
 * @param {Event} event - El evento del click.
 * @param {string|number} tecnicoId - El ID del técnico.
 * @param {string} currentCategory - La categoría actual del técnico.
 */
async function showCategorySelector(event, tecnicoId, currentCategory) {
    event.preventDefault();
    const categoriaDisplayWrapper = document.getElementById('categoriaDisplayWrapper');

    try {
        const categoriesData = await getCategoriasFromAPI();
        if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
            Swal.fire('Advertencia', 'No se encontraron categorías disponibles.', 'warning');
            return;
        }

        const opcionesHTML = categoriesData.map(item =>
            `<option value="${item.nombreDepartamento}" ${item.nombreDepartamento === currentCategory ? 'selected' : ''}>${item.nombreDepartamento}</option>`
        ).join('');

        categoriaDisplayWrapper.innerHTML = `
            <select class="form-select me-2" id="selectorNuevaCategoria">${opcionesHTML}</select>
        `;

        const selector = document.getElementById('selectorNuevaCategoria');
        selector.dataset.originalCategory = currentCategory;

        selector.addEventListener('change', async (e) => {
            const newCategory = e.target.value;
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
                await updateTecnicoCategory(tecnicoId, newCategory);
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalVermas'));
                if (modal) modal.hide();
            } else {
                e.target.value = selector.dataset.originalCategory;
            }
        });
    } catch (error) {
        console.error('Error al mostrar el selector de categorías:', error);
        Swal.fire('Error', `No se pudieron cargar las categorías: ${error.message}`, 'error');
    }
}

/**
 * Llama al servicio para actualizar la categoría y maneja la respuesta.
 * @param {string|number} tecnicoId - El ID del técnico.
 * @param {string} newCategory - La nueva categoría.
 */
async function updateTecnicoCategory(tecnicoId, newCategory) {
    try {
        await updateTecnicoCategoryInAPI(tecnicoId, newCategory);

        const tecnicoIndex = todosLosTecnicos.findIndex(t => t.id == tecnicoId);
        if (tecnicoIndex !== -1) {
            todosLosTecnicos[tecnicoIndex].category = newCategory;
        }

        filtrarTecnicos(); // Recarga la vista con la nueva información
        Swal.fire('¡Éxito!', 'Categoría actualizada correctamente.', 'success');

    } catch (err) {
        console.error('Error al actualizar categoría:', err);
        Swal.fire('Error', `No se pudo actualizar la categoría del técnico: ${err.message}`, 'error');
    }
}

// Inicia la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initTecnicos);