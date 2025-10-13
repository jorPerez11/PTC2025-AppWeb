import {
    getSolutions,
    createSolution,
    updateSolution,
    deleteSolution
} from '../services/baseConocimientosService.js'

import { getUserId } from '../services/serviceLogin.js'

let solutions = [];
let currentPage = 0;
let currentSize = 4;
let solutionsPerPage = 4;
let selectedCategoryFilter = 'Todos';
let totalPages = 0;


const searchInput = document.getElementById('search-input');
const categoryDropdownItems = document.querySelectorAll('.dropdown-item');
const selectedTextSpan = document.getElementById('selected-text');
const selectedIconContainer = document.getElementById('selected-icon-container');
const contenedorArticulos = document.getElementById("contenedor-articulos");
const createArticleForm = document.getElementById('createArticleForm');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');


// 1. Función para cargar datos y renderizar
async function obtenerSoluciones() {
    try {
        const searchTerm = searchInput.value.trim();

        const data = await getSolutions(currentPage, currentSize, searchTerm, selectedCategoryFilter);
        solutions = data.content;

        totalPages = data.totalPages
        
        renderizarSoluciones();

        updatePaginationControls();
    } catch (error) {
        console.error("Error al obtener las soluciones:", error);
        contenedorArticulos.innerHTML = '<p class="text-center text-danger">Error al cargar las soluciones.</p>';
    }
}

function updatePaginationControls() {

    currentPageSpan.textContent = currentPage + 1;

    // Deshabilita el botón "Anterior" en la primera página
    prevPageBtn.classList.toggle('disabled', currentPage === 0);

    // Deshabilita el botón "Siguiente" en la última página
    nextPageBtn.classList.toggle('disabled', currentPage >= totalPages - 1);
};

// Manejador del botón "Anterior"
prevPageBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentPage > 0) {
        currentPage--;
        obtenerSoluciones();
    }
});

// Manejador del botón "Siguiente"
nextPageBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentPage < totalPages - 1) {
        currentPage++;
        obtenerSoluciones();
    }
});

const ticketsPerPageSelect = document.getElementById('ticketsPerPage');
ticketsPerPageSelect.addEventListener('change', (event) => {
    // 1. Obtiene el nuevo valor de la cantidad
    currentSize = parseInt(event.target.value);
    
    // 2. Reinicia la página a 0 para que la paginación empiece desde el inicio
    currentPage = 0;
    
    // 3. Vuelve a cargar las soluciones con la nueva cantidad
    obtenerSoluciones();
});

// 2. Función unificada para filtrar y renderizar
function renderizarSoluciones() {
    

    const resultadosFiltrados = solutions; 

    contenedorArticulos.innerHTML = "";
    if (resultadosFiltrados.length === 0) {
        contenedorArticulos.innerHTML = '<p class="text-center text-muted">No se encontraron soluciones.</p>';
        return;
    }

    resultadosFiltrados.forEach(sol => {    
        const categoryName = sol.category.displayName;
        const categoryClass = `category-${categoryName.toLowerCase()}`;

        const colDiv = document.createElement('div');
        colDiv.className = 'col-xl-3 col-lg-4 col-md-6 mb-4';

        colDiv.innerHTML = `
            <div class="card-custom">
                <div class="d-flex justify-content-between">
                    <h6 class="fw-semibold fs-5 mb-3 title">${sol.solutionTitle}</h6>
                    <p><span class="${categoryClass}">${categoryName}</span></p>
                </div>
                <p class="text-muted flex-grow-1 description">${sol.descriptionS}</p>
                <p class="text-muted mt-3 flex-grow-1 keywords">${sol.keyWords}</p>
                <input type="hidden" id="articleId" name="articleId">

                <div class="d-flex justify-content-between align-items-center">
                    <a href="#" class="readmore text-primary fw-semibold" data-action="read" data-id="${sol.solutionId}">Leer más</a>
                    <div class="dropdown more-options">
                        <button class="btn btn-sm btn-icon border-0 p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" data-action="update" data-id="${sol.solutionId}" data-category="${sol.category.id}"><i class="fas fa-pencil-alt me-2"></i>Actualizar artículo</a></li>
                            <li><a class="dropdown-item" data-action="delete" data-id="${sol.solutionId}"><i class="fas fa-trash-alt me-2"></i>Eliminar artículo</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        contenedorArticulos.appendChild(colDiv);
    });
}

// 3. Delegación de eventos para los botones de editar y eliminar
contenedorArticulos.addEventListener('click', (event) => {
    const clickedElement = event.target.closest('[data-action]');

    if (!clickedElement) return;

    // Detenemos la propagación solo si el clic es dentro de un dropdown para evitar cerrar el modal
    if (clickedElement.closest('.dropdown')) {
        event.stopPropagation();
    }

    event.stopPropagation();
    
    const action = clickedElement.dataset.action;
    const solutionId = clickedElement.dataset.id;
    
    if (action === 'update') {
        const solutionToUpdate = solutions.find(s => s.solutionId === parseInt(solutionId));
        if (solutionToUpdate) {
            openUpdateModal(solutionToUpdate);
        } else {
            console.error("Error. No se encontró el artículo a actualizar.");
        }
    } else if (action === 'delete') {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarArticulo(solutionId);
            }
        });
    } else if (action === 'read') {
        const solutionToRead = solutions.find(s => s.solutionId === parseInt(solutionId));
        if (solutionToRead) {
            openReadModal(solutionToRead);
        }else{
            console.error('Error. No se encontró el artículo a leer');
        }
    }
});

// 4. Listeners para los filtros (llaman a renderizarSoluciones)
searchInput.addEventListener('input', () => {
    currentPage = 0; // Reinicia la paginación con cada búsqueda
    obtenerSoluciones();
});

categoryDropdownItems.forEach(item => {
     item.addEventListener('click', function (event) {
        event.preventDefault();

        selectedCategoryFilter = this.getAttribute('data-value'); 
        
        const newText = this.querySelector('span').textContent;
        const newSVG = this.querySelector('svg').outerHTML;
        selectedTextSpan.textContent = newText;
        selectedIconContainer.innerHTML = newSVG;

        categoryDropdownItems.forEach(el => el.classList.remove('active'));
        this.classList.add('active');

        currentPage = 0; // Reinicia la paginación al cambiar el filtro
        obtenerSoluciones();
    });
});



// Funciones para CRUD (sin cambios importantes, solo asegurarse que llamen a `obtenerSoluciones` al final)
async function eliminarArticulo(id) {
    try {
        await deleteSolution(id);
        Swal.fire('Eliminado!', 'El artículo ha sido eliminado.', 'success');
    } catch (error) {
        console.error("Error al eliminar el artículo:", error);
        Swal.fire('Error!', 'Hubo un problema al intentar eliminar el artículo.', 'error');
    } finally {
        await obtenerSoluciones();
    }
}

function openUpdateModal(solution) {
    const updateModal = new bootstrap.Modal(document.getElementById('createArticleModal'));
    document.getElementById('articleId').value = solution.solutionId;
    document.getElementById('articleTitle').value = solution.solutionTitle;
    document.getElementById('articleDescription').value = solution.descriptionS;
    document.getElementById('articleCategory').value = solution.category.id;
    document.getElementById('articleSteps').value = solution.solutionSteps;
    document.getElementById('articleKeywords').value = solution.keyWords;

    // Habilita los campos
    document.getElementById('articleTitle').removeAttribute('readonly');
    document.getElementById('articleDescription').removeAttribute('readonly');
    document.getElementById('articleSteps').removeAttribute('readonly');
    document.getElementById('articleKeywords').removeAttribute('readonly');
    document.getElementById('articleCategory').removeAttribute('disabled');

    document.getElementById('createArticleModalLabel').textContent = "Actualizar Artículo";
    document.getElementById('createArticleSubmitBtn').textContent = "Actualizar";
    document.getElementById('createArticleSubmitBtn').style.display = 'block'; // Muestra el botón
    updateModal.show();
}

function openReadModal(solution) {
    const readModal = new bootstrap.Modal(document.getElementById('createArticleModal'));
    document.getElementById('articleId').value = solution.solutionId;
    document.getElementById('articleTitle').value = solution.solutionTitle;
    document.getElementById('articleDescription').value = solution.descriptionS;
    document.getElementById('articleCategory').value = solution.category.id;
    document.getElementById('articleSteps').value = solution.solutionSteps;
    document.getElementById('articleKeywords').value = solution.keyWords;

    // Deshabilita los campos
    document.getElementById('articleTitle').setAttribute('readonly', 'readonly');
    document.getElementById('articleDescription').setAttribute('readonly', 'readonly');
    document.getElementById('articleSteps').setAttribute('readonly', 'readonly');
    document.getElementById('articleKeywords').setAttribute('readonly', 'readonly');
    document.getElementById('articleCategory').setAttribute('disabled', 'disabled');

    document.getElementById('createArticleModalLabel').textContent = "Detalles del Artículo";
    document.getElementById('createArticleSubmitBtn').style.display = 'none'; // Oculta el botón
    readModal.show();
}



async function fillCategoriesSelect() {
    const categorySelect = document.getElementById('articleCategory');
    const categories = [
        { id: 7, name: 'Equipo' },
        { id: 6, name: 'Sistema' },
        { id: 4, name: 'Redes' }
    ];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

const crearArticuloBtn = document.querySelector('.crear-articulo');
crearArticuloBtn.addEventListener('click', () => {
    document.getElementById('articleId').value = '';
    createArticleForm.reset();

    // Habilita los campos para la creación
    document.getElementById('articleTitle').removeAttribute('readonly');
    document.getElementById('articleDescription').removeAttribute('readonly');
    document.getElementById('articleSteps').removeAttribute('readonly');
    document.getElementById('articleKeywords').removeAttribute('readonly');
    document.getElementById('articleCategory').removeAttribute('disabled');

    document.getElementById('createArticleModalLabel').textContent = "Crear Artículo";
    document.getElementById('createArticleSubmitBtn').textContent = "Crear";
    const myModal = new bootstrap.Modal(document.getElementById('createArticleModal'));
    myModal.show();
});

createArticleForm.addEventListener('submit', async (event) => {

    const creatorUserId = await getUserId();
    event.preventDefault();
    const articleId = document.getElementById('articleId').value;
    const solutionData = {
        solutionTitle: document.getElementById('articleTitle').value,
        descriptionS: document.getElementById('articleDescription').value,
        category: { id: parseInt(document.getElementById('articleCategory').value) },
        userId: creatorUserId,
        solutionSteps: document.getElementById('articleSteps').value,
        keyWords: document.getElementById('articleKeywords').value
    };

    if (!solutionData.solutionTitle || !solutionData.descriptionS || !solutionData.category.id) {
        Swal.fire('Advertencia', 'Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }

    try {
        if (articleId) {
            await updateSolution(parseInt(articleId), solutionData);
            Swal.fire('¡Éxito!', 'El artículo ha sido actualizado.', 'success'); 
        } else {
            await createSolution(solutionData);
            Swal.fire('¡Éxito!', 'El artículo ha sido creado.', 'success');
        }
    } catch (error) {
        console.error("Error al procesar el artículo:", error);
        Swal.fire('Error', 'No se pudo procesar el artículo.', 'error');
    } finally {
        await obtenerSoluciones();
        const modal = bootstrap.Modal.getInstance(document.getElementById('createArticleModal'));
        if (modal) modal.hide();
        createArticleForm.reset();
    }
});

// Carga inicial al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    obtenerSoluciones();
    fillCategoriesSelect();
});