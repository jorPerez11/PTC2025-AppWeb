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
            <div class="col-xl-3 col-lg-4 col-md-6">
                <div class="card card-custom p-3 h-100">
                    <h6>${solucion.title}</h6>
                    <p class="text-muted">${solucion.description}</p>
                    <a href="#" class="text-primary">Leer más</a>
                </div>
            </div>
        `;
    });
}

// Carga inicial
obtenerSoluciones();
