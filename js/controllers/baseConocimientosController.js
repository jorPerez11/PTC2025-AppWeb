import {
    getSolutions,
    createSolution,
    updateSolution,
    deleteSolution
} from '../services/baseConocimientosService.js'

let solutions = [];

let currentPage = 0;
let currentSize = 10;



// 2) Función que descarga el JSON y guarda en 'soluciones'
async function obtenerSoluciones() {
    try {
        const data = await getSolutions(currentPage, currentSize);
        solutions = data.content;
        mostrarDatos(solutions);
    } catch (error) {
        console.error("Error al obtener las soluciones:", error);
    }
}

// 3) Renderiza un array de soluciones en tarjetas
function mostrarDatos(datos) {
    const contenedor = document.getElementById("contenedor-articulos");
    contenedor.innerHTML = ""; // Limpia el contenido del contenedor de cards

    datos.forEach(sol => {
        // crea un div para cada elemento
        const colDiv = document.createElement('div');
        colDiv.className = 'col-xl-3 col-lg-4 col-md-6 mb-4';

        colDiv.innerHTML = `
            <div class="card-custom">
                
                <h6 class="fw-semibold fs-5 mb-3">${sol.solutionTitle}</h6>
                <p class="text-muted flex-grow-1">${sol.descriptionS}</p>
                <p class=text-muted mt-3 flex-grow-1>${sol.keyWords}</p>
                <p class= d-none>${sol.category.id}</p>
                <input type="hidden" id="articleId" name="articleId">
                <a href="#" class="readmore text-primary fw-semibold">Leer más</a>


                <div class="dropdown more-options">
                    <button class="btn btn-sm btn-icon border-0 p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <ul class="dropdown-menu" data-action="delete">
                        <li><a class="dropdown-item" data-action="update" data-id="${sol.solutionId}" data-category="${sol.category.id}"><i class="fas fa-pencil-alt me-2"></i>Actualizar artículo</a></li>
                        <li><a class="dropdown-item"  data-action="delete" data-id="${sol.solutionId}"><i class="fas fa-trash-alt me-2"></i>Eliminar artículo</a></li>
                    </ul>
                </div>
            </div>
        `;


        const dropdownItems = colDiv.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                const action = event.currentTarget.dataset.action;
                const solutionId = event.currentTarget.dataset.id;
                const categoryId = event.currentTarget.dataset.category;

                if (action === 'update') {
                    console.log(`Action: Actualizar artículo | ID: ${solutionId} | Categoria: ${categoryId}`);
                    const solutionToUpdate = solutions.find(s => s.solutionId === parseInt(solutionId));

                    if (solutionToUpdate) {
                        openUpdateModal(solutionToUpdate); 
                    } else {
                        console.error("Article not found for update.");
                    }

                } else if (action === 'delete') {
                    Swal.fire({
                        title: '¿Estás seguro?',
                        text: "No podrás revertir esto!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545', // Color rojo de Bootstrap
                        cancelButtonColor: '#6c757d', // Color gris de Bootstrap
                        confirmButtonText: 'Sí, eliminarlo!',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            eliminarArticulo(solutionId); 
                        }
                    });
                }
            });
        });

        contenedor.appendChild(colDiv);
    });
}




async function eliminarArticulo(id) {
    try {
        const res = await deleteSolution(id);

        Swal.fire(
            'Eliminado!',
            'El artículo ha sido eliminado.',
            'success'
        );


        console.error("Error al eliminar el artículo:", error);
        Swal.fire(
            'Error!',
            'Hubo un problema al intentar eliminar el artículo.',
            'error'
        );

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
    } catch (error) {
        Swal.fire(
            'Eliminado!',
            'El artículo ha sido eliminado.',
            'success'
        );
    }
    obtenerSoluciones();
}

function openUpdateModal(solution) {
    const updateModal = new bootstrap.Modal(document.getElementById('createArticleModal'));
    
    // Set the hidden input field with the article ID
    document.getElementById('articleId').value = solution.solutionId;
    
    // Populate the form fields with the solution's data
    document.getElementById('articleTitle').value = solution.solutionTitle;
    document.getElementById('articleDescription').value = solution.descriptionS;
    document.getElementById('articleCategory').value = solution.category.id;
    document.getElementById('articleSteps').value = solution.solutionSteps;
    document.getElementById('articleKeywords').value = solution.keyWords;

    // Change the modal's title
    const modalTitle = document.getElementById('createArticleModalLabel');
    if (modalTitle) {
      modalTitle.textContent = "Actualizar Artículo";
    } else {
      console.error("Modal title element not found.");
    }
    
    // Change the modal's submit button text
    const submitBtn = document.getElementById('createArticleSubmitBtn');
    if (submitBtn) {
      submitBtn.textContent = "Actualizar";
    } else {
      console.error("Submit button not found.");
    }

    // Show the modal
    updateModal.show();
}

// Función para llenar el select de categorías
async function fillCategoriesSelect() {
    const categorySelect = document.getElementById('articleCategory');
    // Ejemplo de categorías estáticas, reemplaza con una llamada a tu API
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

// Listener para el botón "Crear artículo"
const crearArticuloBtn = document.querySelector('.crear-articulo');
crearArticuloBtn.addEventListener('click', () => {
    document.getElementById('articleId').value = '';
    createArticleForm.reset();

    // Change modal title and button text to "Create"
    document.getElementById('createArticleModalLabel').textContent = "Crear Artículo";
    document.getElementById('createArticleSubmitBtn').textContent = "Crear";

    // Now show the modal
    const myModal = new bootstrap.Modal(document.getElementById('createArticleModal'));
    myModal.show();
});

// Listener para el formulario del modal
const createArticleForm = document.getElementById('createArticleForm');
createArticleForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 1. Get the article ID from the hidden input field
    const articleId = document.getElementById('articleId').value;
    
    // 2. Get the values from the form inputs
    const title = document.getElementById('articleTitle').value;
    const description = document.getElementById('articleDescription').value;
    const categoryId = document.getElementById('articleCategory').value;
    const steps = document.getElementById('articleSteps').value;
    const keywords = document.getElementById('articleKeywords').value;

    // Check for required fields
    if (!title || !description || !categoryId) {
        Swal.fire('Advertencia', 'Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }

    // 3. Create the solution object with the form data
    const solutionData = {
        solutionTitle: title,
        descriptionS: description,
        category: {
            id: parseInt(categoryId),
        },
        userId: 24, // Assuming this is a fixed user ID
        solutionSteps: steps,
        keyWords: keywords
    };

    try {
        if (articleId) {
            // If the articleId exists, perform an update
            await updateSolution(parseInt(articleId), solutionData);
            Swal.fire('¡Éxito!', 'El artículo ha sido actualizado.', 'success'); 
        } else {
            // If the articleId is empty, perform a creation
            await createSolution(solutionData);
            Swal.fire('¡Éxito!', 'El artículo ha sido creado.', 'success');
        }

        // Common actions for both create and update
        obtenerSoluciones();
        const modal = bootstrap.Modal.getInstance(document.getElementById('createArticleModal'));
        modal.hide();
        createArticleForm.reset();

    } catch (error) {
        // Handle any error from either createSolution or updateSolution
        console.error("Error al procesar el artículo:", error);
        Swal.fire('Error', 'No se pudo procesar el artículo.', 'error');
    }
});


// 4) Filtra por título O por keywords
function filtrarSoluciones(query) {
    const texto = query.trim().toLowerCase();
    if (!texto) {
        mostrarDatos(solutions);
        return;
    }

    const filtrado = solutions.filter(sol => {
        // Chequea título
        const matchTitle = sol.title.toLowerCase().includes(texto);

        // Chequea keywords (separa por comas y revisa cada una)
        const kwList = sol.keyWords
            .toLowerCase()
            .split(",")
            .map(k => k.trim());
        const matchKW = kwList.some(k => k.includes(texto));

        return matchTitle || matchKW;
    });

    mostrarDatos(filtrado);
}

// 5) Utilidad debounce para no disparar el filtro en cada pulsación
function debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// 6) Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    // Descarga y render inicial
    obtenerSoluciones();
    fillCategoriesSelect();

    // Listener del input con debounce
    const input = document.getElementById("search-input");
    input.addEventListener(
        "input",
        debounce(e => filtrarSoluciones(e.target.value))
    );
});

document.addEventListener('DOMContentLoaded', function () {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const selectedTextSpan = document.getElementById('selected-text');
    const solutionCards = document.querySelectorAll('.solution-card');

    dropdownItems.forEach(item => {
        item.addEventListener('click', function (event) {
            event.preventDefault();

            // Obtener el data-value de cada atributo
            const selectedCategory = this.getAttribute('data-value');

            // Actualizar el texto con la categoria seleccionada
            selectedTextSpan.textContent = selectedCategory;

            // Quitar todas las acciones del dropdown
            dropdownItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.check-icon').classList.add('d-none');
            });

            // Añadir la clase activa a cada elemento de dropdown
            this.classList.add('active');
            this.querySelector('.check-icon').classList.remove('d-none');

            // filtrar las soluciones por la categoria
            filterCards(selectedCategory);
        });
    });

    function filterCards(category) {
        solutionCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'Todos' || cardCategory === category) {
                card.style.display = ''; // Mostrar la tarjeta
            } else {
                card.style.display = 'none'; // Esconder la tarjeta
            }
        });
    }

    
});

document.addEventListener('DOMContentLoaded', function () {
    const dropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');
    const dropdownButton = document.getElementById('dropdownMenuButton');
    const selectedTextSpan = document.getElementById('selected-text');
    const selectedIconContainer = document.getElementById('selected-icon-container');
    const dropdownArrow = document.getElementById('dropdown-arrow');

    // Inicialmente, activa el elemento con data-value="Sistema" (o el que desees por defecto)
    const defaultItem = document.querySelector('.dropdown-item[data-value="Sistema"]');
    if (defaultItem) {
        defaultItem.classList.add('active');
        defaultItem.querySelector('.check-icon').classList.remove('d-none');
    }

    dropdownItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Desactiva el checkmark de todos los elementos y remueve la clase 'active'
            dropdownItems.forEach(el => {
                el.classList.remove('active');
                const checkIcon = el.querySelector('.check-icon');
                if (checkIcon) {
                    checkIcon.classList.add('d-none');
                }
            });

            // Agrega la clase 'active' y muestra el checkmark al elemento clickeado
            this.classList.add('active');
            const checkIcon = this.querySelector('.check-icon');
            if (checkIcon) {
                checkIcon.classList.remove('d-none');
            }

            // Obtiene el texto y el SVG del elemento clickeado
            const newText = this.querySelector('span').textContent;
            const newSVG = this.querySelector('svg').outerHTML;

            // Actualiza el contenido del botón con el nuevo texto y SVG
            selectedTextSpan.textContent = newText;
            selectedIconContainer.innerHTML = newSVG;
        });
    });

    // Muestra/oculta la flecha al abrir/cerrar el dropdown
    dropdownButton.addEventListener('click', function () {
        dropdownArrow.classList.toggle('up');
    });
});

// Carga inicial
obtenerSoluciones();
document.addEventListener("DOMContentLoaded", obtenerSoluciones);
