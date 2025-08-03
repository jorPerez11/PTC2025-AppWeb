// URL de la API
const API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbSolution";

// Función que manda a traer el JSON
async function obtenerSoluciones() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        const data = await res.json();
        mostrarDatos(data);
    } catch (error) {
        console.error("Error al obtener las soluciones:", error);
        // Podrías mostrar un mensaje de error en la interfaz de usuario
    }
}

// Mostrar los datos en tarjetas
function mostrarDatos(datos) {
    const contenedor = document.getElementById("contenedor-articulos");
    contenedor.innerHTML = ""; // Limpia el contenedor antes de agregar nuevos artículos

    datos.forEach(solucion => {
        contenedor.innerHTML += `
        <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
            <div class="card-custom">
                <h6 class="fw-semibold fs-5 mb-3">${solucion.title}</h6>
                <p class="text-muted flex-grow-1">${solucion.description}</p>
                <a href="#" class="readmore text-primary fw-semibold">Leer más</a>
            </div>
        </div>
        `;
    });
}

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
