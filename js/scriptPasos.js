let paso = 1;

// Función para actualizar el indicador visual del paso actual
function actualizarIndicadorPaso() {
    // Remover clase 'activo' de todos los pasos
    document.querySelectorAll('.paso').forEach(p => p.classList.remove('activo'));

    // Agregar clase 'activo' al paso actual
    const pasos = document.querySelectorAll('.paso');
    if (pasos[paso - 1]) {
        pasos[paso - 1].classList.add('activo');
    }
}

// Función principal para cargar el contenido de cada paso
function cargarPaso() {
    fetch(`pasosPrimerUso/paso${paso}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById("contenido-dinamico").innerHTML = html;
            document.getElementById("paso-actual").textContent = paso;
            actualizarIndicadorPaso();

            setTimeout(() => {
                inicializarInputsTelefono(); // Asegúrate de que esta función esté declarada si la usas

                requestAnimationFrame(() => {
                    // Ejecutar funciones específicas según el paso
                    if (paso === 1) {
                        restaurarDatosPaso1(); // Asegúrate de que esta función esté declarada si la usas
                    }
                    if (paso === 2) {
                        initPaso2(); // IMPORTANTE: Ejecutar initPaso2() antes de restaurar datos. Asegúrate de que esta función esté declarada.
                        setTimeout(() => {
                            restaurarDatosPaso2(); // Asegúrate de que esta función esté declarada si la usas
                        }, 500); // Dar tiempo para que se carguen los Técnicos
                    }
                    if (paso === 3) {
                        initPaso3(); // initPaso3 ahora se encarga de todo el flujo asíncrono
                    }
                    if (paso === 4) {
                        restaurarDatosPaso4(); // Asegúrate de que esta función esté declarada si la usas
                    }
                });
            }, 0);
        });

    // Mostrar/ocultar botón atrás
    const btnAtras = document.getElementById("btn-atras");
    if (btnAtras) {
        btnAtras.style.display = paso === 1 ? "none" : "inline-flex";
    }
}

function validarPaso1() {
    let errores = [];

    const correoEmpresa = document.getElementById("correoEmpresa")?.value.trim();
    const telefonoEmpresaEl = document.getElementById("telefonoEmpresa");
    const telefonoEmpresa = telefonoEmpresaEl ? window.intlTelInputGlobals?.getInstance(telefonoEmpresaEl)?.getNumber() : null;
    const sitioWeb = document.getElementById("sitioWeb")?.value.trim(); // opcional

    const adminNombre = document.getElementById("nombreAdmin")?.value.trim();
    const adminCorreo = document.getElementById("correoAdmin")?.value.trim();
    const telefonoAdminEl = document.getElementById("telefonoAdmin");
    const telefonoAdmin = telefonoAdminEl ? window.intlTelInputGlobals?.getInstance(telefonoAdminEl)?.getNumber() : null;

    // Validaciones básicas
    if (!correoEmpresa) errores.push("El correo de empresa no puede estar vacío.");
    if (!telefonoEmpresa) errores.push("El teléfono de empresa es requerido.");
    if (!adminNombre) errores.push("El nombre del administrador es obligatorio.");
    if (!adminCorreo) errores.push("El correo del administrador no puede estar vacío.");
    if (!telefonoAdmin) errores.push("El teléfono del administrador es requerido.");

    // Validaciones de formato
    if (correoEmpresa && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correoEmpresa)) {
        errores.push("El correo de empresa no tiene un formato válido.");
    }

    if (adminCorreo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminCorreo)) {
        errores.push("El correo del administrador no es válido.");
    }

    if (telefonoEmpresa && telefonoEmpresa.length < 10) {
        errores.push("El número de teléfono de empresa parece incompleto.");
    }

    if (telefonoAdmin && telefonoAdmin.length < 10) {
        errores.push("El número de teléfono del administrador parece incompleto.");
    }

    // Mostrar errores si los hay
    if (errores.length > 0) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: "warning",
                title: "Revisá los campos",
                html: `<ul style="text-align:left;">${errores.map(e => `<li>${e}</li>`).join("")}</ul>`,
                confirmButtonText: "Entendido",
            });
        } else {
            alert(errores.join('\n'));
        }
        return false;
    }

    return true;
}

function siguientePaso() {
    // Validar solo si estamos en paso 1
    if (paso === 1) {
        if (!validarPaso1()) return;
        guardarDatosPaso1();
    }

    if (paso === 2) guardarDatosPaso2();
    if (paso === 3) guardarDatosPaso3();
    if (paso === 4 && typeof guardarDatosPaso4 === 'function') guardarDatosPaso4();

    if (paso < 4) {
        paso++;
        cargarPaso();
    }
}

function guardarDatosPaso1() {
    const telefonoEmpresaEl = document.getElementById("telefonoEmpresa");
    const telefonoAdminEl = document.getElementById("telefonoAdmin");

    const datos = {
        empresa: document.querySelector('input[name="nombreEmpresa"]')?.value,
        correoEmpresa: document.getElementById("correoEmpresa")?.value,
        telefonoEmpresa: telefonoEmpresaEl ? window.intlTelInputGlobals?.getInstance(telefonoEmpresaEl)?.getNumber() : null,
        sitioWeb: document.getElementById("sitioWeb")?.value,
        adminNombre: document.getElementById("nombreAdmin")?.value,
        adminCorreo: document.getElementById("correoAdmin")?.value,
        telefonoAdmin: telefonoAdminEl ? window.intlTelInputGlobals?.getInstance(telefonoAdminEl)?.getNumber() : null,
    };

    sessionStorage.setItem("datosPaso1", JSON.stringify(datos));
}

function restaurarDatosPaso1() {
    const data = JSON.parse(sessionStorage.getItem("datosPaso1") || "{}");

    const campos = {
        nombreEmpresa: data.empresa,
        correoEmpresa: data.correoEmpresa,
        sitioWeb: data.sitioWeb,
        nombreAdmin: data.adminNombre,
        correoAdmin: data.adminCorreo,
        rolAdmin: data.rolAdmin
    };

    for (const [id, valor] of Object.entries(campos)) {
        const el = document.getElementById(id);
        if (el) el.value = valor || "";
    }

    // Restaurar teléfonos cuando intl-tel-input ya esté listo
    setTimeout(() => {
        const telEmpresaInput = document.getElementById("telefonoEmpresa");
        const telAdminInput = document.getElementById("telefonoAdmin");

        if (telEmpresaInput && window.intlTelInputGlobals) {
            const telEmpresa = window.intlTelInputGlobals.getInstance(telEmpresaInput);
            if (telEmpresa && data.telefonoEmpresa) telEmpresa.setNumber(data.telefonoEmpresa);
        }

        if (telAdminInput && window.intlTelInputGlobals) {
            const telAdmin = window.intlTelInputGlobals.getInstance(telAdminInput);
            if (telAdmin && data.telefonoAdmin) telAdmin.setNumber(data.telefonoAdmin);
        }
    }, 100);
}

function inicializarInputsTelefono() {
    const inputs = ["#telefonoAdmin", "#telefonoEmpresa"];
    inputs.forEach(selector => {
        const input = document.querySelector(selector);
        if (input && typeof window.intlTelInput === "function" && !input.dataset.intl) {
            try {
                const iti = window.intlTelInput(input, {
                    initialCountry: "sv",
                    preferredCountries: ["sv", "mx", "co"],
                    separateDialCode: true,
                    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js"
                });

                // Guardamos la instancia en el input para futuras consultas
                input.dataset.intl = "true"; // solo como marca para no repetir
            } catch (error) {
                console.error('Error initializing intl-tel-input:', error);
            }
        }
    });
}

function validarTelefonos() {
    const campos = ["#telefonoAdmin", "#telefonoEmpresa"];
    let todosValidos = true;

    campos.forEach(selector => {
        const input = document.querySelector(selector);
        if (input && window.intlTelInputGlobals) {
            const iti = window.intlTelInputGlobals.getInstance(input);
            if (!iti || !iti.isValidNumber()) {
                input.classList.add("is-invalid");
                todosValidos = false;
            } else {
                input.classList.remove("is-invalid");
            }
        }
    });

    return todosValidos;
}

function siguientePaso1() {
    // Validar campos y formato de datos
    if (!validarPaso1()) return;

    // Validar teléfonos con intlTelInput
    const inputEmpresa = document.getElementById("telefonoEmpresa");
    const inputAdmin = document.getElementById("telefonoAdmin");

    if (!inputEmpresa || !inputAdmin) {
        alert("Error: No se pudieron encontrar los campos de teléfono.");
        return;
    }

    const telEmpresaInstance = window.intlTelInputGlobals?.getInstance(inputEmpresa);
    const telAdminInstance = window.intlTelInputGlobals?.getInstance(inputAdmin);

    const telefonoEmpresa = telEmpresaInstance?.getNumber();
    const telefonoAdmin = telAdminInstance?.getNumber();

    // Validar que ambos teléfonos estén completos
    if (!telefonoEmpresa || telefonoEmpresa.length < 10) {
        if (typeof Swal !== 'undefined') {
            Swal.fire("Teléfono inválido", "El teléfono de empresa no es válido.", "warning");
        } else {
            alert("El teléfono de empresa no es válido.");
        }
        return;
    }

    if (!telefonoAdmin || telefonoAdmin.length < 10) {
        if (typeof Swal !== 'undefined') {
            Swal.fire("Teléfono inválido", "El teléfono del administrador no es válido.", "warning");
        } else {
            alert("El teléfono del administrador no es válido.");
        }
        return;
    }

    // Guardar los datos y avanzar
    guardarDatosPaso1();
    if (paso < 3) {
        paso++;
        cargarPaso();
    }
}

function anteriorPaso() {
    if (paso > 1) {
        paso--;
        cargarPaso();
    }
}

function cancelarPaso() {
    const mensaje = "Si cancelás ahora, se perderán los datos ingresados.";

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: "¿Estás seguro?",
            text: mensaje,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "Volver"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Cancelado",
                    text: "Redireccionando al inicio...",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = "primerUso.html";
                });
            }
        });
    } else {
        if (confirm(mensaje)) {
            window.location.href = "primerUso.html";
        }
    }
}

// Carga inicial
document.addEventListener('DOMContentLoaded', () => {
    cargarPaso();
});

///////////////////////// COSAS PARA EL PASO 2 /////////////////////////
///////////////////////// SCRIPT FUNCIONAL PARA CATEGORÍAS /////////////////////////
const API_URL2 = "https://retoolapi.dev/mNwaIw/categorias";

// Variables globales
let categorias = [];

document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
        const contenedor = document.getElementById("lista-categorias");
        if (contenedor) {
            initPaso2();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (document.getElementById("lista-categorias")) {
        initPaso2();
    }
});

function initPaso2() {
    const contenedor = document.getElementById("lista-categorias");
    if (!contenedor) {
        return;
    }

    // Obtener categorías y configurar eventos
    obtenerCategorias();
    configurarEventos();

    // Mostrar botón flotante
    const btnFlotante = document.getElementById("btnFlotanteAgregar");
    if (btnFlotante) {
        btnFlotante.style.display = "block";
    }
}

// Función para obtener categorías de la API
async function obtenerCategorias() {
    const contenedor = document.getElementById("lista-categorias");
    if (!contenedor) {
        return;
    }

    // Mostrar indicador de carga
    contenedor.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando categorías...</span>
            </div>
            <p class="mt-2 text-muted">Cargando categorías...</p>
        </div>
    `;

    try {
        const response = await fetch(API_URL2);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        categorias = data; // Actualizar la lista global
        mostrarCategorias(data);

    } catch (error) {
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error al cargar las categorías. Por favor, intenta nuevamente.
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="obtenerCategorias()">
                    <i class="fas fa-redo me-1"></i>Reintentar
                </button>
            </div>
        `;
    }
}

// Función para mostrar categorías en el DOM
function mostrarCategorias(categorias) {

    const contenedor = document.getElementById('lista-categorias');
    if (!contenedor) {
        return;
    }

    // Limpiar contenido anterior
    contenedor.innerHTML = '';

    if (!categorias || categorias.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-warning text-center">
                <i class="fas fa-info-circle me-2"></i>
                No hay categorías registradas. ¡Agrega la primera!
            </div>
        `;
        return;
    }

    // Crear cards para cada categoría
    categorias.forEach(categoria => {
        const card = document.createElement('div');
        card.className = 'card shadow-sm mb-3';
        card.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title mb-1">
                        <i class="bi bi-collection-fill text-info"></i>
                        ${categoria.nombreDepartamento || categoria.nombreCategoria || 'Sin nombre'}
                    </h5>
                    <small class="text-muted">ID: ${categoria.id}</small>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-primary btn-editar" 
                            data-id="${categoria.id}" 
                            data-nombre="${categoria.nombreDepartamento || categoria.nombreCategoria || ''}"
                            title="Editar categoría">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger btn-eliminar" 
                            data-id="${categoria.id}" 
                            data-nombre="${categoria.nombreDepartamento || categoria.nombreCategoria || ''}"
                            title="Eliminar categoría">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;

        contenedor.appendChild(card);
    });

    // Asignar eventos a los botones
    asignarEventosBotones();
}

// Función para asignar eventos a los botones
function asignarEventosBotones() {
    // Eventos para botones editar
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-editar');
            const id = button.dataset.id;
            const nombre = button.dataset.nombre;
            abrirModalEditar(id, nombre);
        });
    });

    // Eventos para botones eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-eliminar');
            const id = button.dataset.id;
            const nombre = button.dataset.nombre;
            eliminarCategoria(id, nombre);
        });
    });
}

// Función para abrir modal de agregar
function abrirModalAgregar() {
    const modal = document.getElementById('modal-agregarcat');
    const input = document.getElementById('nombre');

    if (modal && input) {
        input.value = '';
        modal.showModal();
        input.focus();
    }
}

// Función para abrir modal de editar
function abrirModalEditar(id, nombre) {
    const modal = document.getElementById('modal-editarcat');
    const inputId = document.getElementById('idEditar');
    const inputNombre = document.getElementById('nombreEditar');

    if (modal && inputId && inputNombre) {
        inputId.value = id;
        inputNombre.value = nombre;
        modal.showModal();
        inputNombre.focus();
    }
}

// Función para cerrar modales
function cerrarModales() {
    const modalAgregar = document.getElementById('modal-agregarcat');
    const modalEditar = document.getElementById('modal-editarcat');

    if (modalAgregar) modalAgregar.close();
    if (modalEditar) modalEditar.close();
}

// Función para agregar categoría
async function agregarCategoria(nombre) {
    try {
        const response = await fetch(API_URL2, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombreDepartamento: nombre
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const nuevaCategoria = await response.json();

        // Mostrar mensaje de éxito
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Categoría agregada correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        }

        // Recargar lista
        obtenerCategorias();
        cerrarModales();

    } catch (error) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al agregar categoría'
            });
        }
    }
}

// Función para editar categoría
async function editarCategoria(id, nombre) {
    try {
        const response = await fetch(`${API_URL2}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombreDepartamento: nombre
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const categoriaEditada = await response.json();

        // Mostrar mensaje de éxito
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Categoría actualizada correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        }

        // Recargar lista
        obtenerCategorias();
        cerrarModales();

    } catch (error) {

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar categoría'
            });
        }
    }
}

// Función para eliminar categoría
async function eliminarCategoria(id, nombre) {
    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la categoría "${nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) {
            return;
        }
    }

    try {

        const response = await fetch(`${API_URL2}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Mostrar mensaje de éxito
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'Categoría eliminada correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        }

        // Recargar lista
        obtenerCategorias();

    } catch (error) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al eliminar categoría'
            });
        }
    }
}

// Función para filtrar categorías
function filtrarCategorias(termino) {
    const terminoLower = termino.toLowerCase();
    const categoriasFiltradas = categorias.filter(categoria => {
        const nombre = categoria.nombreDepartamento || categoria.nombreCategoria || '';
        return nombre.toLowerCase().includes(terminoLower);
    });

    mostrarCategorias(categoriasFiltradas);
}

// Función para configurar eventos
function configurarEventos() {
    console.log('🔗 Configurando eventos...');

    // Botón flotante agregar
    const btnFlotante = document.getElementById('btnFlotanteAgregar');
    if (btnFlotante) {
        btnFlotante.addEventListener('click', abrirModalAgregar);
    }

    // Formulario agregar
    const frmAgregar = document.getElementById('frmAgregar');
    if (frmAgregar) {
        frmAgregar.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value.trim();
            if (nombre) {
                agregarCategoria(nombre);
            }
        });
    }

    // Formulario editar
    const frmEditar = document.getElementById('frmEditar');
    if (frmEditar) {
        frmEditar.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('idEditar').value;
            const nombre = document.getElementById('nombreEditar').value.trim();
            if (id && nombre) {
                editarCategoria(id, nombre);
            }
        });
    }

    // Botones cerrar modales
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const btnCerrarEditar = document.getElementById('btnCerrarEditar');

    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModales);
    }

    if (btnCerrarEditar) {
        btnCerrarEditar.addEventListener('click', cerrarModales);
    }

    // Búsqueda
    const inputBusqueda = document.getElementById('busquedaDepartamento');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const termino = e.target.value.trim();
            if (termino === '') {
                mostrarCategorias(categorias);
            } else {
                filtrarCategorias(termino);
            }
        });
    }

    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModales();
        }
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaso2);
} else {
    initPaso2();
}

function guardarDatosPaso2() {
    // Obtener todos los contactos que están marcados como parte del equipo
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
    const ids = Array.from(equipoActual).map(el => el.dataset.id);

    sessionStorage.setItem("miEquipo", JSON.stringify(ids));
}

// Departamentos
function restaurarDatosPaso2() {
    obtenerCategorias()
}

///////////////////////// COSAS PARA EL PASO 3 /////////////////////////
const API_URL = "https://retoolapi.dev/bRqmHj/tecnicoData";
const IMG_API_URL = "https://api.imgbb.com/1/upload?key=2c2a83d4ddbff10c8af95b3159d53646";

let listaTecnicos = [];
let tecnicosAgregados = [];
let listaCategorias = []; // Para almacenar las categorías obtenidas de la API
let miEquipo = []; // Global variable to hold the team members' IDs (from sessionStorage)

document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
        const contenedor = document.getElementById("lista-tecnicos");
        if (contenedor) {
            initPaso3();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (document.getElementById("lista-tecnicos")) {
        initPaso3();
        observer.disconnect();
    }
});

// Función para inicializar el Paso 3
function initPaso3() {
    const contenedor = document.getElementById("lista-tecnicos");
    if (!contenedor) {
        console.warn("No se encontró el contenedor de lista-tecnicos");
        return;
    }

    // Encadenar las promesas para asegurar el orden de ejecución:
    // 1. Obtener categorías
    // 2. Obtener técnicos (y que internamente se llamará a mostrarDatos para renderizarlos)
    // 3. Luego, restaurar el estado visual y configurar eventos.
    obtenerCategorias3()
        .then(() => obtenerTecnicos()) // obtenerTecnicos ya llama a mostrarDatos(data) para renderizar
        .then(() => {
            // *** PUNTO CRÍTICO: Aquí los técnicos ya están en el DOM. ***
            restaurarDatosPaso3(); // Es seguro llamar a la función de restauración ahora.
            configurarEventosModales(); // Configurar eventos que dependen de elementos ya renderizados.
            console.log("Paso 3 inicializado y estado de técnicos restaurado.");
        })
        .catch(error => {
            console.error("Error en la inicialización del Paso 3:", error);
            Swal.fire({
                title: "Error de Carga",
                text: "No se pudieron cargar los técnicos o las categorías.",
                icon: "error",
                confirmButtonText: "Entendido"
            });
        });

    // Lógica para el botón flotante (no depende de la carga de técnicos, se puede ejecutar de inmediato)
    const btnFlotante = document.getElementById("btnFlotanteAgregar");
    if (btnFlotante) {
        btnFlotante.style.display = "block";
        btnFlotante.addEventListener("click", () => {
            const modal = document.getElementById("modal-agregar");
            if (modal) modal.showModal();
        });
    }
}

// Función para obtener categorías desde la API
async function obtenerCategorias3() {
    try {
        const res = await fetch(API_URL2);
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        const data = await res.json();
        listaCategorias = data;
        cargarCategoriasEnDropdown();
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        // Agregar categorías por defecto en caso de error
        listaCategorias = [
            { id: 1, nombre: "Supervisor" },
            { id: 2, nombre: "Técnico Senior" },
            { id: 3, nombre: "Técnico Junior" },
            { id: 4, nombre: "Especialista" }
        ];
        cargarCategoriasEnDropdown();
    }
}

// Función para cargar las categorías en el dropdown
function cargarCategoriasEnDropdown() {
    const dropdown = document.getElementById("categoriaDropdown");
    if (!dropdown) {
        console.warn("Elemento 'categoriaDropdown' no encontrado en el DOM.");
        return;
    }

    // Limpiar opciones existentes excepto la primera (que suele ser un placeholder)
    dropdown.innerHTML = '<option value="">Selecciona una categoría</option>';

    // Agregar categorías
    listaCategorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria.id;
        option.textContent = categoria.nombreDepartamento;
        dropdown.appendChild(option);
    });
}

// Función para obtener y mostrar técnicos desde la API
async function obtenerTecnicos() {
    const contenedor = document.getElementById("lista-tecnicos");
    if (!contenedor) return;

    // Mostrar indicador de carga
    contenedor.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando técnicos...</span>
            </div>
            <p class="mt-2 text-muted">Cargando técnicos...</p>
        </div>
    `;

    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        listaTecnicos = data; // Actualizar la lista global
        console.log("Técnicos cargados:", listaTecnicos); // Debug

        mostrarDatos(data);
        return data; // Retornar los datos para poder usar .then()
    } catch (error) {
        console.error("Error al obtener técnicos:", error);
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los técnicos. Por favor, intenta nuevamente.
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="obtenerTecnicos()">
                    Reintentar
                </button>
            </div>
        `;
    }
}

function mostrarDatos(tecnicos) {
    const contenedor = document.getElementById("lista-tecnicos");
    if (!contenedor) return;

    if (!tecnicos || tecnicos.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-warning text-center">
                No hay técnicos disponibles.
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    // Crear buscador si no existe
    if (!document.getElementById("busquedaTecnico")) {
        const buscadorContainer = document.createElement("div");
        buscadorContainer.className = "mb-4";
        buscadorContainer.innerHTML = `
            <div class="input-group">
                <input type="text" id="busquedaTecnico" class="form-control" 
                       placeholder="Buscar por nombre, correo o teléfono...">
                <button class="btn btn-outline-secondary" type="button" id="btnBuscar">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(buscadorContainer);
    }

    const headers = document.createElement("div");
    headers.className = "row align-items-center mb-2 px-2 headers-tecnico";
    headers.innerHTML = `
        <div class="col-auto text-center">Técnico</div>
        <div class="col text-end">Nombre</div>
        <div class="col text-end">Correo</div>
        <div class="col text-end">Teléfono</div>
        <div class="col text-end">Acciones</div>
    `;

    contenedor.appendChild(headers);

    // Obtener el equipo actual ANTES de renderizar
    const equipoActual = JSON.parse(sessionStorage.getItem("miEquipo") || "[]");
    console.log("Equipo actual al renderizar:", equipoActual);

    tecnicos.forEach((tecnico) => {
        const imgSrc = tecnico.Foto && tecnico.Foto.trim()
            ? tecnico.Foto
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        const nombreLimpio = limpiarTexto(tecnico.Nombre);
        const telefonoFormateado = formatearTelefonoInteligente(tecnico["Número de tel."]);

        const fila = document.createElement("div");
        fila.className = "row align-items-center py-2 px-2 shadow-sm border rounded mb-2 bg-white tecnico-fila";
        fila.setAttribute("data-id", tecnico.id);
        fila.innerHTML = `
            <div class="col-auto d-flex justify-content-center align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <img src="${imgSrc}" 
                     alt="Foto de ${nombreLimpio}" 
                     class="rounded-circle foto-tecnico"
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
            </div>

            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 fw-semibold nombre-tecnico">
                    ${nombreLimpio || "Sin nombre"}
                </div>
            </div>

            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 text-muted small correo-tecnico">
                    ${tecnico["Correo Electrónico"] || tecnico["Correo Elect."] || "Sin correo"}
                </div>
            </div>

            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 text-muted small telefono-tecnico">
                    ${telefonoFormateado}
                </div>
            </div>

            <div class="col d-flex justify-content-end align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="d-flex flex-column align-items-end gap-2" id="acciones-${tecnico.id}">
                    <button class="btn btn-sm btn-accion añadir" data-id="${tecnico.id}" title="Añadir al equipo">
                        <i class="bi bi-person-plus-fill me-1"></i> Añadir al equipo
                    </button>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-accion editar" data-id="${tecnico.id}" title="Editar">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-accion eliminar" data-id="${tecnico.id}" title="Eliminar">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        contenedor.appendChild(fila);

        // Verificar si este técnico está en el equipo INMEDIATAMENTE
        const miembroEquipo = equipoActual.find(miembro => miembro.id == tecnico.id);
        const contenedorAcciones = document.getElementById(`acciones-${tecnico.id}`);
        
        if (miembroEquipo && contenedorAcciones) {
            console.log(`Restaurando técnico ${tecnico.id} inmediatamente`);
            marcarTecnicoComoAñadidoVisual(tecnico.id, contenedorAcciones, true);
        }

        // Eventos para botones normales (solo si no está en el equipo)
        if (!miembroEquipo) {
            const editarBtn = fila.querySelector(".editar");
            const eliminarBtn = fila.querySelector(".eliminar");
            const añadirBtn = fila.querySelector(".añadir");

            if (editarBtn) {
                editarBtn.addEventListener("click", () => {
                    AbrirModalEditar(
                        tecnico.id,
                        tecnico.Nombre,
                        tecnico["Correo Electrónico"] || tecnico["Correo Elect."],
                        tecnico["Número de tel."],
                        tecnico.Foto
                    );
                });
            }

            if (eliminarBtn) {
                eliminarBtn.addEventListener("click", () => {
                    Swal.fire({
                        title: `¿Eliminar a ${tecnico.Nombre}?`,
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#6c757d",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    }).then(result => {
                        if (result.isConfirmed) {
                            eliminarTecnico(tecnico.id);
                        }
                    });
                });
            }

            if (añadirBtn) {
                añadirBtn.addEventListener("click", () => {
                    abrirModalAgregarEquipo(tecnico);
                });
            }
        }
    });

    // Inicializar buscador al final
    setTimeout(() => {
        inicializarBuscadorDeTecnicos();
    }, 100);
}


function restaurarEstadoEquipo() {
    const equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]"); // Cambiado a localStorage
    console.log("Restaurando equipo desde localStorage:", equipo); // Debug

    if (equipo.length === 0) return;

    equipo.forEach(miembro => {
        if (miembro && miembro.id) {
            const contenedorAcciones = document.getElementById(`acciones-${miembro.id}`);
            if (contenedorAcciones) {
                console.log(`Restaurando técnico ${miembro.id} con categoría ${miembro.categoria}`);
                marcarTecnicoComoAñadidoVisual(miembro.id, contenedorAcciones, true);
            } else {
                console.warn(`No se encontró contenedor de acciones para técnico ${miembro.id}`);
            }
        }
    });
}

function formatearTelefonoInteligente(telefono) {
    if (!telefono) return "Teléfono no disponible";

    // Clean the number, keeping only digits and the initial '+' if it exists.
    const originalTelefono = telefono.toString().trim();
    const esInternacional = originalTelefono.startsWith('+');
    let soloDigitos = originalTelefono.replace(/\D/g, '');

    let codigoPais = "";
    let numero = "";

    // 1. Identify country code and local number
    if (esInternacional) {
        if (soloDigitos.startsWith("503")) { // El Salvador
            codigoPais = "+503";
            numero = soloDigitos.substring(3);
        } else if (soloDigitos.startsWith("52")) { // Mexico
            codigoPais = "+52";
            numero = soloDigitos.substring(2);
        } else if (soloDigitos.startsWith("57")) { // Colombia
            codigoPais = "+57";
            numero = soloDigitos.substring(2);
        } else if (soloDigitos.startsWith("1")) { // USA/Canada
            codigoPais = "+1";
            numero = soloDigitos.substring(1);
        } else if (soloDigitos.startsWith("593")) { // Ecuador
            codigoPais = "+593";
            numero = soloDigitos.substring(3);
        } else {
            // If the code is not recognized, return it as is.
            return originalTelefono; // Return original if international but not recognized
        }
    } else {
        // Assume El Salvador if there's no international prefix.
        if (soloDigitos.length === 8) {
            codigoPais = "+503";
            numero = soloDigitos;
        } else {
            return originalTelefono; // Cannot format with certainty.
        }
    }

    // 2. Apply spacing format based on country
    switch (codigoPais) {
        case '+503': // Format: +503 XXXX-XXXX
            if (numero.length === 8) return `${codigoPais} ${numero.substring(0, 4)}-${numero.substring(4)}`;
            break;
        case '+52': // Format: +52 XX XXXX XXXX
            if (numero.length === 10) return `${codigoPais} ${numero.substring(0, 2)} ${numero.substring(2, 6)} ${numero.substring(6)}`;
            break;
        case '+57': // Format: +57 XXX XXX XXXX
            if (numero.length === 10) return `${codigoPais} ${numero.substring(0, 3)} ${numero.substring(3, 6)} ${numero.substring(6)}`;
            break;
        case '+1': // Format: +1 (XXX) XXX-XXXX
            if (numero.length === 10) return `${codigoPais} (${numero.substring(0, 3)}) ${numero.substring(3, 6)}-${numero.substring(6)}`;
            break;
        case '+593': // Ecuador Format: +593 9XX XXX XXX (Celular) or +593 X XXX XXXX (Fijo)
            if (numero.length === 9 && numero.startsWith('9')) { // Mobile (e.g., 987654321)
                return `${codigoPais} ${numero.substring(0, 3)} ${numero.substring(3, 6)} ${numero.substring(6)}`;
            } else if (numero.length === 8) { // Landline (e.g., 23456789)
                return `${codigoPais} ${numero.substring(0, 1)} ${numero.substring(1, 4)} ${numero.substring(4)}`;
            }
            break;
    }
    return `${codigoPais} ${numero}`.trim();
}

function eliminarTecnico(id) {
    fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo eliminar el técnico.");
            }
            return response.json();
        })
        .then(() => {
            Swal.fire({
                icon: "success",
                title: "Técnico eliminado",
                text: "El técnico ha sido eliminado correctamente.",
                timer: 1500,
                showConfirmButton: false
            });

            // Opcional: recargar lista de técnicos o avanzar
            obtenerTecnicos?.();
        })
        .catch(error => {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un problema al eliminar el técnico."
            });
        });
}

function configurarEventosModales() {
    // Modal AGREGAR TÉCNICO
    const modalAgregar = document.getElementById("modal-agregar");
    const btnAbrirModalAgregar = document.getElementById("btnAbrirModal");
    const btnFlotante = document.getElementById("btnFlotanteAgregar");
    const btnCerrarAgregar = document.getElementById("btnCerrarModal");

    if (btnAbrirModalAgregar) {
        btnAbrirModalAgregar.addEventListener("click", () => {
            if (modalAgregar) {
                modalAgregar.showModal();
                setTimeout(() => inicializarTelefonosPaso3(), 100);
            }
        });
    }

    if (btnFlotante) {
        btnFlotante.addEventListener("click", () => {
            if (modalAgregar) {
                modalAgregar.showModal();
                setTimeout(() => inicializarTelefonosPaso3(), 100);
            }
        });
    }

    if (btnCerrarAgregar && modalAgregar) {
        btnCerrarAgregar.addEventListener("click", () => modalAgregar.close());
    }

    const frmAgregar = document.getElementById("frmAgregar");
    if (frmAgregar) {
        frmAgregar.addEventListener("submit", async (e) => {
            e.preventDefault();
            await agregarTecnico();
        });
    }

    // Modal EDITAR TÉCNICO
    const modalEditar = document.getElementById("modal-editar");
    const btnCerrarEditar = document.getElementById("btnCerrarEditar");

    if (btnCerrarEditar && modalEditar) {
        btnCerrarEditar.addEventListener("click", () => modalEditar.close());
    }

    const frmEditar = document.getElementById("frmEditar");
    if (frmEditar) {
        frmEditar.addEventListener("submit", async (e) => {
            e.preventDefault();
            await editarTecnico();
        });
    }

    // Preview de imagen para agregar
    const inputFoto = document.getElementById("foto");
    const preview = document.getElementById("previewAgregar");

    if (inputFoto && preview) {
        inputFoto.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                preview.src = URL.createObjectURL(file);
            }
        });
    }

    // Modal AGREGAR A EQUIPO
    const modalEquipo = document.getElementById("modal-agregar-equipo");
    const btnCancelarEquipo = document.getElementById("btnCancelarEquipo");

    if (btnCancelarEquipo && modalEquipo) {
        btnCancelarEquipo.addEventListener("click", () => modalEquipo.close());
    }

    const frmAgregarEquipo = document.getElementById("frmAgregarEquipo");

    if (frmAgregarEquipo) {
        frmAgregarEquipo.addEventListener("submit", (e) => {
            e.preventDefault();

            const categoria = document.getElementById("categoriaDropdown")?.value;
            const id = frmAgregarEquipo.dataset.idTecnico;

            if (!categoria) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: "warning",
                        title: "Categoría requerida",
                        text: "Por favor, selecciona una categoría antes de continuar.",
                        confirmButtonColor: "#007bff"
                    });
                } else {
                    alert("Por favor, selecciona una categoría antes de continuar.");
                }
                return;
            }

            marcarTecnicoComoAñadido(id, categoria);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: "success",
                    title: "¡Añadido!",
                    text: "El técnico se ha añadido exitosamente al equipo.",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                alert("El técnico se ha añadido exitosamente al equipo.");
            }

            if (modalEquipo) modalEquipo.close();
        });
    }
}

async function agregarTecnico() {
    const nombre = document.getElementById("nombre")?.value.trim();
    const correo = document.getElementById("email")?.value.trim();
    const archivoFoto = document.getElementById("foto")?.files[0];

    // Validar campos obligatorios
    if (!nombre || !correo) {
        Swal.fire({
            icon: "warning",
            title: "Campos incompletos",
            text: "Por favor, completa todos los campos obligatorios (nombre y correo).",
            confirmButtonText: "Entendido"
        });
        return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        Swal.fire({
            icon: "error",
            title: "Correo no válido",
            text: "Por favor, ingresa un correo electrónico con el formato correcto.",
            confirmButtonText: "Revisar"
        });
        return;
    }

    // Validar teléfono
    if (!validarTelefonoIndividual("telefonoAgregar")) {
        Swal.fire({
            icon: "warning",
            title: "Teléfono inválido",
            text: "Por favor, ingresa un número de teléfono válido (mínimo 7 dígitos).",
            confirmButtonText: "Verificar"
        });
        return;
    }

    // Obtener teléfono con prefijo
    const telefono = obtenerTelefonoConPrefijo("telefonoAgregar");
    if (!telefono) {
        Swal.fire({
            icon: "error",
            title: "No se pudo procesar",
            text: "Verifica que el número de teléfono esté completo y correcto.",
            confirmButtonText: "Ok"
        });
        return;
    }

    // Proceder con el guardado
    await enviarTecnico(nombre, correo, telefono, archivoFoto);
}

async function enviarTecnico(nombre, correo, telefono, archivoFoto) {
    try {
        // Subir imagen si fue seleccionada
        let urlFoto = "";
        if (archivoFoto) {
            urlFoto = await subirImagen(archivoFoto);
        }

        const nuevoTecnico = {
            Nombre: nombre,
            "Correo Electrónico": correo,
            "Número de tel.": telefono,
            Foto: urlFoto
        };

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoTecnico)
        });

        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status}`);
        }

        const respuesta = await res.json();

        Swal.fire({
            icon: "success",
            title: "¡Técnico agregado!",
            text: "El técnico ha sido guardado exitosamente.",
            timer: 1500,
            showConfirmButton: false
        });

        // Limpiar formulario
        const frmAgregar = document.getElementById("frmAgregar");
        if (frmAgregar) frmAgregar.reset();

        const previewAgregar = document.getElementById("previewAgregar");
        if (previewAgregar) previewAgregar.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        // Cerrar modal
        const modalAgregar = document.getElementById("modal-agregar");
        if (modalAgregar) modalAgregar.close();

        // Recargar lista
        obtenerTecnicos();

    } catch (error) {
        console.error("Error al agregar técnico:", error);

        Swal.fire({
            icon: "error",
            title: "Ups...",
            text: "Ocurrió un problema al guardar el técnico. Por favor, intenta nuevamente.",
            confirmButtonText: "Entendido"
        });
    }
}

function validarTelefonoIndividual(idInput) {
    const input = document.getElementById(idInput);
    if (!input) {
        console.error(`Input no encontrado: ${idInput}`);
        return false;
    }

    const valorInput = input.value.trim();

    // Validación básica primero
    if (!valorInput || valorInput.length < 7) {
        Swal.fire({
            icon: "warning",
            title: "Teléfono inválido",
            text: "El número de teléfono está vacío o es demasiado corto.",
            confirmButtonText: "Entendido"
        });
        input.classList.add("is-invalid");
        return false;
    }

    // Verificar que contenga solo números, espacios, guiones, paréntesis
    const formatoValido = /^[\d\s\-\(\)+]+$/.test(valorInput);
    if (!formatoValido) {
        Swal.fire({
            icon: "warning",
            title: "Teléfono inválido",
            text: "El número debe contener solo números, espacios, guiones o paréntesis.",
            confirmButtonText: "Revisar"
        });
        input.classList.add("is-invalid");
        return false;
    }

    // Contar solo los dígitos
    const soloDigitos = valorInput.replace(/\D/g, '');
    const esValido = soloDigitos.length >= 7 && soloDigitos.length <= 15;

    // Aplicar clase visual
    input.classList.toggle("is-invalid", !esValido);

    return esValido;
}

// Función AbrirModalEditar corregida
function AbrirModalEditar(id, nombre, correo, telefono, foto = "") {
    // Limpiar el nombre de caracteres problemáticos
    const nombreLimpio = limpiarTexto(nombre);

    document.getElementById("idEditar").value = id;
    document.getElementById("nombreEditar").value = nombreLimpio || "";
    document.getElementById("emailEditar").value = correo || "";

    const fotoActual = document.getElementById("fotoActual");
    if (fotoActual) {
        fotoActual.src = foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }

    const modalEditar = document.getElementById("modal-editar");
    if (modalEditar) {
        modalEditar.showModal();

        // Inicializar teléfonos después de abrir el modal
        setTimeout(() => {
            inicializarTelefonosPaso3();

            // Establecer el número de teléfono después de inicializar
            setTimeout(() => {
                const telefonoInput = document.getElementById("telefonoEditar");
                if (telefonoInput && telefono) {
                    const iti = window.intlTelInputGlobals?.getInstance(telefonoInput);
                    if (iti) {
                        // Limpiar el teléfono antes de establecerlo
                        const telefonoLimpio = telefono.replace(/[^\d\+\-\s\(\)]/g, '');
                        iti.setNumber(telefonoLimpio);
                    }
                }
            }, 200);
        }, 100);
    }
}

// Para renderizar en el paso 2:
async function obtenerTecnicosPaso3() {
    const res = await fetch(API_URL);
    listaTecnicos = await res.json();
    renderizarTecnicos(listaTecnicos);
}

// CORRECCIÓN 2: Función mejorada para obtener teléfono con prefijo
function obtenerTelefonoConPrefijo(idInput) {
    const input = document.getElementById(idInput);
    if (!input) {
        console.error(`Input no encontrado: ${idInput}`);
        return null;
    }

    const valorInput = input.value.trim();

    // Intentar usar intlTelInput si está disponible
    const iti = window.intlTelInputGlobals?.getInstance(input);
    let numeroFinal = null;

    if (iti) {
        try {
            // Intentar obtener el número con intlTelInput
            const numeroCompleto = iti.getNumber();
            const paisSeleccionado = iti.getSelectedCountryData();

            if (numeroCompleto && numeroCompleto.trim() !== '') {
                numeroFinal = numeroCompleto.trim();
            } else if (paisSeleccionado && paisSeleccionado.dialCode) {
                // Construir manualmente si intlTelInput no devolvió el número
                const soloDigitos = valorInput.replace(/\D/g, '');
                numeroFinal = `+${paisSeleccionado.dialCode} ${soloDigitos}`;
            }
        } catch (error) {
            console.warn('Error con intlTelInput:', error);
        }
    }

    // Fallback: usar El Salvador como código por defecto
    if (!numeroFinal && valorInput) {
        const soloDigitos = valorInput.replace(/\D/g, '');
        if (soloDigitos.length >= 7) {
            // Si ya tiene código de país, usarlo tal como está
            if (valorInput.startsWith('+')) {
                numeroFinal = valorInput;
            } else {
                // Usar +503 (El Salvador) como predeterminado
                numeroFinal = `+503 ${soloDigitos}`;
            }
        }
    }
    return numeroFinal;
}

// CORRECCIÓN 3: Función para mostrar teléfono con prefijo en las cards
function formatearTelefonoParaMostrar(telefono) {
    if (!telefono) return "+503 0000-0000";

    // Si ya tiene el formato correcto, devolverlo tal como está
    if (telefono.startsWith('+')) {
        return telefono;
    }

    // Si es solo números, agregar el prefijo de El Salvador
    const soloDigitos = telefono.replace(/\D/g, '');
    if (soloDigitos.length >= 7) {
        return `+503 ${soloDigitos}`;
    }

    return telefono;
}


function renderizarTecnicos(tecnicos) {
    const contenedor = document.getElementById("lista-tecnicos");
    contenedor.innerHTML = "";

    if (!tecnicos || tecnicos.length === 0) {
        contenedor.innerHTML = `<p class='text-muted'>No hay técnicos registrados aún.</p>`;
        return;
    }

    // Eliminar spinner si aún existe
    const spinner = contenedor.querySelector(".spinner-wrapper");
    if (spinner) spinner.remove();

    // Obtener técnicos ya añadidos al equipo - NORMALIZAR A STRINGS
    /* const equipoActual = JSON.parse(sessionStorage.getItem("miEquipo") || "[]").map(id => String(id)); */

    tecnicos.forEach(tecnico => {
        const card = document.createElement("div");
        card.className = "card p-3 shadow-sm";

        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <img src="${tecnico.Foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}"
                         alt="Foto de ${tecnico.Nombre}" class="rounded-circle border"
                         width="56" height="56" style="object-fit: cover; background-color: #f3f3f3;">
                    <div>
                        <h6 class="mb-0 nombre-tecnico">${tecnico.Nombre}</h6>
                        <small class="text-muted correo-tecnico">${tecnico["Correo Electrónico"]}</small><br>
                        <small class="telefono-tecnico">${tecnico["Número de tel."]}</small>
                    </div>
                </div>
                <div class="d-flex flex-column align-items-end gap-2" id="acciones-${tecnico.id}">
                <div class="text-success fw-semibold d-flex align-items-center justify-content-end es-equipo" data-id="${tecnico.id}">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            Parte de tu equipo
                            <button class="btn text-danger btn-remover" title="Eliminar del equipo" style="border: none; background: none; font-size: 2.4rem; line-height: 1; padding: 0 0.5rem; font-weight: bold;">&times;</button>
                        </div> :
                <button class="btn btn-sm btn-accion añadir" data-id="${tecnico.id}">
                            <i class="bi bi-person-plus-fill me-1"></i> Añadir al equipo
                        </button>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-accion editar" title="Editar"
                          onclick="AbrirModalEditar(
                            '${tecnico.id}',
                            \`${tecnico.Nombre}\`,
                            \`${tecnico["Correo Electrónico"]}\`,
                            \`${tecnico["Número de tel."]}\`,
                            \`${tecnico.Foto || ""}\`)">
                          <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-accion eliminar" title="Eliminar"
                          onclick="eliminarTecnico('${tecnico.id}')">
                          <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        contenedor.appendChild(card);
    });
}

function obtenerTecnicoPorId(id) {
    const tecnico = listaTecnicos?.find(t => t.id == id);
    return tecnico;
}

// Función para abrir modal y guardar ID correctamente
function abrirModalAgregarEquipo(tecnico) {
    document.getElementById("imgEquipo").src = tecnico.Foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    document.getElementById("nombreEquipo").value = tecnico.Nombre || "";
    document.getElementById("correoEquipo").value = tecnico["Correo Electrónico"] || "";
    document.getElementById("telefonoEquipo").value = formatearTelefonoParaMostrar(tecnico["Número de tel."]) || "";
    document.getElementById("categoriaDropdown").value = "";

    // IMPORTANTE: Guardar el ID en el formulario para usarlo después
    const frmAgregarEquipo = document.getElementById("frmAgregarEquipo");
    if (frmAgregarEquipo) {
        frmAgregarEquipo.dataset.idTecnico = tecnico.id;
    }

    document.getElementById("modal-agregar-equipo").showModal();
}

// CORRECCIÓN 6: Función editarTecnico corregida
async function editarTecnico() {
    const id = document.getElementById("idEditar").value;
    const nombre = limpiarTexto(document.getElementById("nombreEditar").value.trim());
    const correo = document.getElementById("emailEditar").value.trim();
    const telefonoInput = document.getElementById("telefonoEditar");
    const nuevaFoto = document.getElementById("fotoEditar").files[0];
    const previewFoto = document.getElementById("fotoActual");
    let urlFinal = previewFoto ? previewFoto.src : "";

    // Obtener teléfono con prefijo
    let telefono = "";
    if (telefonoInput) {
        const iti = window.intlTelInputGlobals?.getInstance(telefonoInput);
        if (iti) {
            telefono = iti.getNumber() || obtenerTelefonoConPrefijo("telefonoEditar");
        } else {
            telefono = obtenerTelefonoConPrefijo("telefonoEditar");
        }
    }

    if (!nombre || !correo || !telefono) {
        alert("Complete todos los campos obligatorios");
        return;
    }

    try {
        if (nuevaFoto) {
            urlFinal = await subirImagen(nuevaFoto);
        }

        const actualizado = {
            Nombre: nombre,
            "Correo Electrónico": correo,
            "Número de tel.": telefono,
            Foto: urlFinal
        };

        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actualizado)
        });

        if (res.ok) {
            Swal.fire({
                icon: "success",
                title: "Técnico actualizado",
                text: "El técnico ha sido actualizado exitosamente.",
                timer: 1500,
                showConfirmButton: false
            });

            document.getElementById("modal-editar").close();
            obtenerTecnicos(); // Recargar la lista
        } else {
            throw new Error("Error al actualizar el técnico");
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Algo salió mal",
            text: "No se pudo actualizar el técnico.",
            confirmButtonText: "Entendido"
        });
    }
}

// Define una función asíncrona llamada subirImagen que recibe un 'file' (archivo) como argumento.
async function subirImagen(file) {
    // Inicia un bloque try...catch para manejar posibles errores durante el proceso.
    try {
        // 1. CONVERTIR IMAGEN A BASE64
        // Espera (await) a que la función 'toBase64' termine de convertir el archivo a una cadena de texto Base64.
        const base64 = await toBase64(file);

        // 2. PREPARAR DATOS PARA EL ENVÍO
        // Crea un objeto FormData, que es la forma estándar de enviar datos de un formulario (como archivos) a un servidor.
        const formData = new FormData();

        // Agrega la imagen al FormData.
        // 'base64.split(",")[1]' extrae solo los datos de la imagen, eliminando el prefijo "data:image/jpeg;base64,".
        formData.append("image", base64.split(",")[1]);

        // 3. ENVIAR IMAGEN AL SERVIDOR (API)
        // Realiza una petición (fetch) a la URL del servidor (guardada en la constante IMG_API_URL).
        const res = await fetch(IMG_API_URL, {
            method: "POST", // Especifica que es una petición POST para enviar datos.
            body: formData   // Asigna el FormData (con la imagen) como el cuerpo de la petición.
        });

        // 4. PROCESAR LA RESPUESTA DEL SERVIDOR
        // Espera la respuesta del servidor y la convierte a un objeto JSON.
        const data = await res.json();

        // Devuelve la URL de la imagen subida.
        // Usa encadenamiento opcional (?.) para evitar errores si 'data' o 'data.data' no existen.
        // Si no encuentra la URL, devuelve una cadena vacía "".
        return data?.data?.url || "";

    } catch (error) {
        // Si ocurre cualquier error en el bloque 'try', se ejecuta este bloque.
        console.error("Error al subir imagen:", error); // Muestra el error en la consola del navegador.
        return ""; // Devuelve una cadena vacía para indicar que la subida falló.
    }
}

// Define una función que recibe un 'file' y devuelve una Promesa.
function toBase64(file) {
    // Una Promesa es un objeto que representa la eventual finalización (o fallo) de una operación asíncrona.
    return new Promise((resolve, reject) => {
        // Crea una instancia de FileReader, una API del navegador para leer archivos.
        const reader = new FileReader();

        // Define qué hacer cuando el archivo se haya leído correctamente.
        // El 'reader.result' contendrá la cadena en formato Base64.
        // 'resolve' se llama para cumplir la promesa con el resultado.
        reader.onload = () => resolve(reader.result);

        // Define qué hacer si ocurre un error durante la lectura.
        // 'reject' se llama para rechazar la promesa, indicando un fallo.
        reader.onerror = reject;

        // Inicia la lectura del archivo. El resultado será una URL de datos (formato Base64).
        reader.readAsDataURL(file);
    });
}

function iniciarPaso() {
    const elPaso = document.getElementById("paso-actual");
    if (!elPaso) return console.warn("No se encontró #paso-actual en el DOM");

    const paso = elPaso.textContent?.trim();
    if (!paso) return console.warn("Paso actual vacío");

    switch (paso) {
        case "1":
            console.log("Iniciando Paso 1");
            break;
        case "2":
            console.log("Iniciando Paso 2");
            initPaso2();
            break;
        case "3":
            console.log("Iniciando Paso 3");
            initPaso3();
            break;
        case "4":
            console.log("Iniciando Paso 4");
            break;
        default:
            console.warn(`Paso no reconocido: ${paso}`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const pasoElemento = document.getElementById("paso-actual");
    if (pasoElemento) {
        iniciarPaso();
    } else {
        const observer = new MutationObserver(() => {
            const pasoElemento = document.getElementById("paso-actual");
            if (pasoElemento) {
                iniciarPaso();
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});

// Efecto de entrada suave del botón
window.addEventListener('load', function () {
    const btn = document.getElementById('btnFlotanteAgregar');
    if (btn) {
        btn.style.transform = 'scale(0) translateY(20px)';
        btn.style.opacity = '0';

        setTimeout(() => {
            btn.style.transform = 'scale(1) translateY(0)';
            btn.style.opacity = '1';
        }, 800);
    }
});

function inicializarTelefonosPaso3() {
    const inputs = ["#telefonoAgregar", "#telefonoEditar"];

    inputs.forEach(selector => {
        const input = document.querySelector(selector);
        if (input && typeof window.intlTelInput === "function") {
            // Verificar si ya está inicializado
            if (input.dataset.intl === "true") {
                return;
            }

            const iti = window.intlTelInput(input, {
                initialCountry: "sv",
                preferredCountries: ["sv", "mx", "co"],
                separateDialCode: true,
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js"
            });

            // Marcar como inicializado
            input.dataset.intl = "true";
        }
    });
}

function validarAntesDeEnviar(idInput) {
    const input = document.getElementById(idInput);
    if (!input) return false;

    const valorInput = input.value.trim();

    // Validación básica: que no esté vacío y tenga al menos 8 caracteres
    if (!valorInput || valorInput.length < 8) {
        console.log(`Input ${idInput} muy corto o vacío:`, valorInput);
        return false;
    }

    // Validación de formato: solo números, espacios, guiones, paréntesis
    if (!/^[\d\s\-\(\)]+$/.test(valorInput)) {
        console.log(`Input ${idInput} tiene formato inválido:`, valorInput);
        return false;
    }
    return true;
}

function actualizarEquipoEnStorage(id, accion, categoria) {
    let equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]"); // Cambiado a localStorage

    const index = equipo.findIndex(miembro => miembro.id == id);

    if (accion === 'agregar') {
        if (index === -1) {
            equipo.push({ id: id, categoria: categoria });
        } else {
            equipo[index].categoria = categoria;
        }
    } else if (accion === 'eliminar') {
        if (index !== -1) {
            equipo.splice(index, 1);
        }
    }

    localStorage.setItem("miEquipo", JSON.stringify(equipo)); // Cambiado a localStorage
    console.log("Equipo actualizado en localStorage:", equipo); // Debug
}

// CORRECCIÓN: Función para marcar técnico como añadido (igual que contactos)
function marcarTecnicoComoAñadido(idTecnico, categoria, restaurando = false) {
    const btnAñadir = document.querySelector(`button.añadir[data-id="${idTecnico}"]`);
    if (!btnAñadir) return;
    const contenedorAcciones = document.getElementById(`acciones-${idTecnico}`);
    if (!contenedorAcciones) return;

    // Actualizar storage solo si no se está restaurando
    if (!restaurando) {
        actualizarEquipoEnStorage(idTecnico, "agregar", categoria);
    }

    // Marcar visualmente
    marcarTecnicoComoAñadidoVisual(idTecnico, contenedorAcciones, restaurando);
}

function obtenerCategoriaTecnico(id) {
    const equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]"); // Cambiado a localStorage
    const tecnico = equipo.find(item => {
        if (typeof item === 'object') {
            return item.id == id; // Usar == para comparación de tipo suelto si IDs pueden ser string/number
        }
        return false;
    });
    return tecnico ? tecnico.categoria : null;
}

function marcarTecnicoComoAñadidoVisual(idTecnico, contenedorAcciones, restaurando = false) {
    if (!contenedorAcciones) {
        console.warn(`No se encontró contenedor de acciones para técnico ${idTecnico}`);
        return;
    }

    const equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]"); // Cambiado a localStorage
    const miembroDelEquipo = equipo.find(item => item.id == idTecnico);
    const categoriaId = miembroDelEquipo ? miembroDelEquipo.categoria : '';
    
    // Buscar la categoría en la lista
    const categoriaInfo = listaCategorias.find(c => c.id == categoriaId);
    const nombreCategoria = categoriaInfo ? `(${categoriaInfo.nombreDepartamento})` : '';

    // Actualizar el HTML del contenedor
    contenedorAcciones.innerHTML = `
        <div class="text-success fw-semibold d-flex align-items-center justify-content-end es-equipo" data-id="${idTecnico}">
            <i class="bi bi-check-circle-fill me-2"></i>
            Parte de tu equipo ${nombreCategoria}
            <button class="btn text-danger btn-remover" title="Eliminar del equipo" style="border: none; background: none; font-size: 2.4rem; line-height: 1; padding: 0 0.5rem; font-weight: bold;">&times;</button>
        </div>
    `;

    // Asignar eventos a los botones
    const editarBtn = contenedorAcciones.querySelector(".editar");
    const eliminarBtn = contenedorAcciones.querySelector(".eliminar");
    const removerBtn = contenedorAcciones.querySelector(".btn-remover");

    if (editarBtn) {
        editarBtn.addEventListener("click", () => {
            const tecnico = listaTecnicos.find(t => t.id == idTecnico);
            if (tecnico) {
                AbrirModalEditar(
                    tecnico.id,
                    tecnico.Nombre,
                    tecnico["Correo Electrónico"] || tecnico["Correo Elect."],
                    tecnico["Número de tel."],
                    tecnico.Foto
                );
            }
        });
    }

    if (eliminarBtn) {
        eliminarBtn.addEventListener("click", () => {
            const tecnico = listaTecnicos.find(t => t.id == idTecnico);
            if (tecnico) {
                Swal.fire({
                    title: `¿Eliminar a ${tecnico.Nombre}?`,
                    text: "Esta acción no se puede deshacer.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar"
                }).then(result => {
                    if (result.isConfirmed) {
                        eliminarTecnico(idTecnico);
                    }
                });
            }
        });
    }

    if (removerBtn) {
        removerBtn.addEventListener("click", () => {
            removerDelEquipo(idTecnico);
        });
    }
}

// CORRECCIÓN: Función obtenerTecnicos simplificada
async function obtenerTecnicos() {
    const contenedor = document.getElementById("lista-tecnicos");
    if (!contenedor) return;

    // Mostrar indicador de carga
    contenedor.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando técnicos...</span>
            </div>
            <p class="mt-2 text-muted">Cargando técnicos...</p>
        </div>
    `;

    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        listaTecnicos = data; // Actualizar la lista global
        console.log("Técnicos cargados:", listaTecnicos);

        // Mostrar datos Y restaurar estado automáticamente
        mostrarDatos(data);
        
        return data;
    } catch (error) {
        console.error("Error al obtener técnicos:", error);
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los técnicos. Por favor, intenta nuevamente.
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="obtenerTecnicos()">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// CORRECCIÓN: Función para remover técnico del equipo
function removerDelEquipo(idTecnico) {
    Swal.fire({
        title: '¿Remover del equipo?',
        text: 'Esta persona ya no formará parte de tu equipo de trabajo.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, remover',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Actualizar storage
            actualizarEquipoEnStorage(idTecnico, "eliminar");

            // Refrescar la vista
            obtenerTecnicos();

            Swal.fire({
                icon: 'success',
                title: 'Removido del equipo',
                text: 'La persona ha sido removida de tu equipo.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function guardarDatosPaso3() {
    // Obtener todos los técnicos que están marcados como parte del equipo
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');

    // Mapear los elementos para crear un array de objetos con id y categoría
    const miEquipoCompleto = Array.from(equipoActual).map(el => {
        return {
            id: el.dataset.id,
            categoria: el.dataset.categoria
        };
    });

    // ¡Cambio clave aquí! Guardar el array de objetos en localStorage
    localStorage.setItem("miEquipo", JSON.stringify(miEquipoCompleto));

    console.log("Datos del equipo guardados en localStorage:", miEquipoCompleto);
}

function restaurarDatosPaso3() {
    // ¡Cambio clave aquí! Obtener el equipo de localStorage
    const equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]");

    if (equipo.length === 0) {
        console.log("No hay equipo guardado en localStorage para restaurar.");
        return;
    }

    // Directamente llamar a restaurarEstadoEquipo.
    // La función restaurarEstadoEquipo es la que itera sobre 'miEquipo'
    // y llama a marcarTecnicoComoAñadidoVisual por cada miembro,
    // que a su vez buscará los elementos específicos por su ID de acción.
    restaurarEstadoEquipo();
    console.log("Estado del equipo restaurado visualmente desde localStorage.");
}

// Función mejorada para el buscador
function inicializarBuscadorDeTecnicos() {
    const inputBusqueda = document.getElementById("busquedaTecnico");
    const botonBuscar = document.getElementById("btnBuscar");

    if (!inputBusqueda || !botonBuscar) return;

    // Función de filtrado mejorada
    const filtrarTecnicos = () => {
        const query = inputBusqueda.value.trim().toLowerCase();
        const filas = document.querySelectorAll(".tecnico-fila");

        let tecnicosVisibles = 0;

        filas.forEach(fila => {
            const nombre = fila.querySelector(".nombre-tecnico")?.textContent.toLowerCase() || "";
            const correo = fila.querySelector(".correo-tecnico")?.textContent.toLowerCase() || "";
            const telefono = fila.querySelector(".telefono-tecnico")?.textContent.toLowerCase() || "";

            // Buscar en todos los campos
            const coincide = query === "" ||
                nombre.includes(query) ||
                correo.includes(query) ||
                telefono.includes(query);

            if (coincide) {
                fila.style.display = "flex";
                tecnicosVisibles++;
            } else {
                fila.style.display = "none";
            }
        });

        // Mostrar mensaje si no hay resultados
        mostrarMensajeResultados(tecnicosVisibles, query);
    };

    // Asignar nuevos eventos
    botonBuscar.addEventListener("click", filtrarTecnicos);
    inputBusqueda.addEventListener("keyup", filtrarTecnicos);
}

function limpiarTexto(texto) {
    if (!texto) return "";

    return texto
        // Permitir letras (incluyendo acentos y ñ Ñ), espacios, guiones y apóstrofes
        .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñüÜ'\s-]/g, '')
        .replace(/\s+/g, ' ')       // Normalizar espacios múltiples
        .trim();                    // Eliminar espacios al inicio y al final
}

function accionSiguientePaso() {
    siguientePaso();
}

// FUNCIONES PARA VERIFICAR EL STORAGE:
/* 
// 1. Ver todo el equipo actual
function verEquipoActual() {
    const equipo = JSON.parse(sessionStorage.getItem("miEquipo") || "[]");
    console.log("Equipo completo:", equipo);
    return equipo;
}

// 2. Ver un técnico específico con su categoría
function verTecnicoEnEquipo(idTecnico) {
    const equipo = JSON.parse(sessionStorage.getItem("miEquipo") || "[]");
    const tecnico = equipo.find(item => {
        if (typeof item === 'object') {
            return item.id === idTecnico;
        }
        return false;
    });

    if (tecnico) {
        console.log(`Técnico ${idTecnico}:`, {
            id: tecnico.id,
            categoria: tecnico.categoria,
            fechaAgregado: tecnico.fechaAgregado
        });
    } else {
        console.log(`Técnico ${idTecnico} no está en el equipo`);
    }

    return tecnico;
}

// 3. Listar todos los técnicos con sus categorías
function listarEquipoConCategorias() {
    const equipo = JSON.parse(sessionStorage.getItem("miEquipo") || "[]");

    console.log("=== EQUIPO ACTUAL ===");
    equipo.forEach((miembro, index) => {
        if (typeof miembro === 'object') {
            console.log(`${index + 1}. ID: ${miembro.id} - Categoría: ${miembro.categoria}`);
        } else {
            console.log(`${index + 1}. ID: ${miembro} - Categoría: Sin categoría (formato antiguo)`);
        }
    });

    return equipo;
} */

//---------------------------------- PASO 4 ----------------------------------

// Función para inicializar componentes específicos de cada paso
function inicializarComponentesPaso(paso) {
    fetch(`pasosPrimerUso/paso${paso}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById("contenido-dinamico").innerHTML = html;
            document.getElementById("paso-actual").textContent = paso;
            actualizarIndicadorPaso();

            setTimeout(() => {
                inicializarInputsTelefono();

                requestAnimationFrame(() => {
                    // Ejecutar funciones específicas según el paso
                    if (paso === 1) {
                        restaurarDatosPaso1();
                    }
                    if (paso === 2) {
                        // IMPORTANTE: Ejecutar initPaso2() antes de restaurar datos
                        initPaso2();
                        // Restaurar datos después de que se hayan cargado las categorías
                        setTimeout(() => {
                            restaurarDatosPaso2();
                        }, 500); // Dar tiempo para que se carguen las categorías

                    }
                    if (paso === 3) {
                        // IMPORTANTE: Ejecutar initPaso3() antes de restaurar datos
                        initPaso3();
                        // Restaurar datos después de que se hayan cargado los contactos
                        setTimeout(() => {
                            restaurarDatosPaso3();
                        }, 500); // Dar tiempo para que se carguen los contactos
                    }
                    if (paso === 4) {
                        restaurarDatosPaso4();
                    }
                });
            }, 0);
        });

    // Mostrar/ocultar botón atrás
    const btnAtras = document.getElementById("btn-atras");
    if (btnAtras) {
        btnAtras.style.display = paso === 1 ? "none" : "inline-flex";
    }
}

// NUEVA - Función principal unificada para navegar entre pasos
function navegarAPaso(numeroPaso) {
    const paso = parseInt(numeroPaso);

    if (paso < 1 || paso > 3) {
        console.error('Número de paso inválido:', paso);
        return;
    }

    fetch(`pasosPrimerUso/paso${paso}.html`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.text();
        })
        .then(html => {
            document.getElementById("main").innerHTML = html;

            // Actualizar paso actual si existe la variable
            if (typeof pasoActual !== 'undefined') {
                pasoActual = paso;
            }

            // Usar las funciones existentes
            actualizarIndicadorPaso(paso);
            inicializarComponentesPaso(paso);

            window.scrollTo({ top: 0, behavior: "smooth" });
            console.log(`Navegado al paso ${paso} exitosamente`);
        })
        .catch(err => {
            console.error("Error al cargar paso:", err);
            Swal.fire({
                title: "Error",
                text: `No se pudo cargar el paso ${paso}. Verifica que el archivo existe.`,
                icon: "error",
                confirmButtonText: "Entendido"
            });
        });
}

document.addEventListener("click", function (e) {
    // Detectar navegación específica (para botones del paso 3)
    const botonNavegar = e.target.closest("[data-navegar-paso]");
    if (botonNavegar) {
        const pasoDestino = botonNavegar.dataset.navegarPaso;
        navegarAPaso(pasoDestino);
        return;
    }

    // Detectar navegación general (botones "Modificar", etc.)
    const boton = e.target.closest("[data-paso]");
    if (boton) {
        const paso = boton.dataset.paso;
        navegarAPaso(paso);
    }
});

// OPCIONAL - Funciones específicas para mayor claridad
function regresarAPaso1() {
    navegarAPaso(1);
}

function regresarAPaso2() {
    navegarAPaso(2);
}