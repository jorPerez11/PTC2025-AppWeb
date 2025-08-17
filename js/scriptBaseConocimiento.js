// URL de la API
const API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbSolution";

// 1) Variable global para almacenar todas las soluciones
let soluciones = [];

// 2) Función que descarga el JSON y guarda en 'soluciones'
async function obtenerSoluciones() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        soluciones = await res.json();
        mostrarDatos(soluciones);
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
                <h6 class="fw-semibold fs-5 mb-3">${sol.title}</h6>
                <p class="text-muted flex-grow-1">${sol.description}</p>
                <a href="#" class="readmore text-primary fw-semibold">Leer más</a>


                <div class="dropdown more-options">
                    <button class="btn btn-sm btn-icon border-0 p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <ul class="dropdown-menu" data-action="delete">
                        <li><a class="dropdown-item" data-action="update"><i class="fas fa-pencil-alt me-2"></i>Actualizar artículo</a></li>
                        <li><a class="dropdown-item"  data-action="delete"><i class="fas fa-trash-alt me-2"></i>Eliminar artículo</a></li>
                    </ul>
                </div>
            </div>

            
        `;

        const dropdownItems = colDiv.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                const action = event.currentTarget.dataset.action;

                if (action === 'update') {
                    // Lógica para actualizar (por ahora, solo un log)
                    console.log(`Action: Actualizar artículo | ID: ${sol.id}`);
                    alert('hoal');
                    // Aquí puedes llamar a una función para abrir un modal de actualización.
                } else if (action === 'delete') {
                    // Lógica de confirmación con SweetAlert2
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
                            eliminarArticulo(sol.id);
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
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        // Muestra una alerta de éxito
        Swal.fire(
            'Eliminado!',
            'El artículo ha sido eliminado.',
            'success'
        );

        // Vuelve a cargar los datos para actualizar la vista
        obtenerSoluciones();

    } catch (error) {
        console.error("Error al eliminar el artículo:", error);
        Swal.fire(
            'Error!',
            'Hubo un problema al intentar eliminar el artículo.',
            'error'
        );
    }
}

// 4) Filtra por título O por keywords
function filtrarSoluciones(query) {
    const texto = query.trim().toLowerCase();
    if (!texto) {
        mostrarDatos(soluciones);
        return;
    }

    const filtrado = soluciones.filter(sol => {
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

    // Listener del input con debounce
    const input = document.getElementById("search-input");
    input.addEventListener(
        "input",
        debounce(e => filtrarSoluciones(e.target.value))
    );
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
