let paso = 1;
let listaContactos = [];

function actualizarIndicadorPaso() {
    // Remover clase 'activo' de todos los pasos
    document.querySelectorAll('.paso').forEach(p => p.classList.remove('activo'));

    // Agregar clase 'activo' al paso actual
    const pasos = document.querySelectorAll('.paso');
    if (pasos[paso - 1]) {
        pasos[paso - 1].classList.add('activo');
    }
}

function cargarPaso() {
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
                        setTimeout(() => {
                            restaurarDatosPaso2();
                        }, 500); // Dar tiempo para que se carguen los Técnicos

                    }
                    if (paso === 3) {
                        // IMPORTANTE: Ejecutar initPaso3() antes de restaurar datos
                        initPaso3();
                        // Restaurar datos después de que se hayan cargado los Técnicos
                        setTimeout(() => {
                            restaurarDatosPaso3();
                        }, 500); // Dar tiempo para que se carguen los Técnicos
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
        departamentoAdmin: data.departamentoAdmin
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
const API_URL = "https://retoolapi.dev/SuMLlc/contactosDatos";
const IMG_API_URL = "https://api.imgbb.com/1/upload?key=2c2a83d4ddbff10c8af95b3159d53646";

document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
        const contenedor = document.getElementById("lista-contactos");
        if (contenedor) {
            initPaso3();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (document.getElementById("lista-contactos")) {
        initPaso3();
        observer.disconnect();
    }
});

function initPaso3() {
    const contenedor = document.getElementById("lista-contactos");
    if (!contenedor) {
        console.warn("No se encontró el contenedor de lista-contactos");
        return;
    }

    obtenerContactos();
    configurarEventosModales();

    const btnFlotante = document.getElementById("btnFlotanteAgregar");
    if (btnFlotante) {
        btnFlotante.style.display = "block";
        btnFlotante.addEventListener("click", () => {
            const modal = document.getElementById("modal-agregar");
            if (modal) modal.showModal();
        });
    }
}

// Función para obtener y mostrar personas desde la API
async function obtenerContactos() {
    const contenedor = document.getElementById("lista-contactos");
    if (!contenedor) return;

    // Mostrar indicador de carga
    contenedor.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando contactos...</span>
            </div>
            <p class="mt-2 text-muted">Cargando contactos...</p>
        </div>
    `;

    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        listaContactos = data; // Actualizar la lista global

        mostrarDatos(data);
    } catch (error) {
        console.error("Error al obtener contactos:", error);
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los contactos. Por favor, intenta nuevamente.
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="obtenerContactos()">
                    Reintentar
                </button>
            </div>
        `;
    }
}

function mostrarDatos(contactos) {
    const contenedor = document.getElementById("lista-contactos");
    if (!contenedor) return;

    if (!contactos || contactos.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-warning text-center">
                No hay contactos disponibles.
            </div>
        `;
        return;
    }

    contenedor.innerHTML = "";

    // Crear buscador si no existe
    if (!document.getElementById("busquedaContacto")) {
        const buscadorContainer = document.createElement("div");
        buscadorContainer.className = "mb-4";
        buscadorContainer.innerHTML = `
            <div class="input-group">
                <input type="text" id="busquedaContacto" class="form-control" 
                       placeholder="Buscar por nombre, correo o teléfono...">
                <button class="btn btn-outline-secondary" type="button" id="btnBuscar">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(buscadorContainer);
    }

    const headers = document.createElement("div");
    headers.className = "row align-items-center mb-2 px-2 headers-contacto";
    headers.innerHTML = `
        <div class="col-auto text-center">Técnico</div>
        <div class="col text-end">Nombre</div>
        <div class="col text-end">Correo</div>
        <div class="col text-end">Teléfono</div>
        <div class="col text-end">Acciones</div>
    `;

    contenedor.appendChild(headers);

    contactos.forEach((contacto) => {
        const imgSrc = contacto.Foto && contacto.Foto.trim()
            ? contacto.Foto
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        const nombreLimpio = limpiarTexto(contacto.Nombre);
        const telefonoFormateado = formatearTelefonoInteligente(contacto["Número de tel."]);

        const fila = document.createElement("div");
        fila.className = "row align-items-center py-2 px-2 shadow-sm border rounded mb-2 bg-white contacto-fila";
        fila.setAttribute("data-id", contacto.id);
        fila.innerHTML = `
            <div class="col-auto d-flex justify-content-center align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <img src="${imgSrc}" 
                     alt="Foto de ${nombreLimpio}" 
                     class="rounded-circle foto-contacto"
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
            </div>

            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 fw-semibold nombre-contacto">
                    ${nombreLimpio || "Sin nombre"}
                </div>
            </div>

            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 text-muted small correo-contacto">
                    ${contacto["Correo Electrónico"] || contacto["Correo Elect."] || "Sin correo"}
                </div>
            </div>

            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 text-muted small telefono-contacto">
                    ${telefonoFormateado}
                </div>
            </div>

            <div class="col d-flex justify-content-end align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="d-flex flex-column align-items-end gap-2" id="acciones-${contacto.id}">
                    <button class="btn btn-sm btn-accion añadir" data-id="${contacto.id}" title="Añadir al equipo">
                        <i class="bi bi-person-plus-fill me-1"></i> Añadir al equipo
                    </button>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-accion editar" data-id="${contacto.id}" title="Editar">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-accion eliminar" data-id="${contacto.id}" title="Eliminar">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        contenedor.appendChild(fila);

        // Eventos
        const editarBtn = fila.querySelector(".editar");
        const eliminarBtn = fila.querySelector(".eliminar");
        const añadirBtn = fila.querySelector(".añadir");

        if (editarBtn) {
            editarBtn.addEventListener("click", () => {
                AbrirModalEditar(
                    contacto.id,
                    contacto.Nombre,
                    contacto["Correo Electrónico"] || contacto["Correo Elect."],
                    contacto["Número de tel."],
                    contacto.Foto
                );
            });
        }

        if (eliminarBtn) {
            eliminarBtn.addEventListener("click", () => {
                Swal.fire({
                    title: `¿Eliminar a ${contacto.Nombre}?`,
                    text: "Esta acción no se puede deshacer.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar"
                }).then(result => {
                    if (result.isConfirmed) {
                        eliminarContacto(contacto.id);
                    }
                });
            });
        }

        if (añadirBtn) {
            añadirBtn.addEventListener("click", () => {
                abrirModalAgregarEquipo(contacto);
            });
        }
    });

    // Inicializar el buscador después de renderizar
    setTimeout(() => {
        inicializarBuscadorDeContactos();
        // Restaurar estado del equipo
        restaurarEstadoEquipo();
    }, 100);
}

// CORRECCIÓN 5: Función mejorada para restaurar el estado del equipo
function restaurarEstadoEquipo() {
    const equipo = JSON.parse(sessionStorage.getItem("miEquipo") || "[]");

    if (equipo.length === 0) return;

    equipo.forEach(id => {
        const contenedorAcciones = document.getElementById(`acciones-${id}`);
        if (contenedorAcciones) {
            marcarContactoComoAñadidoVisual(id, contenedorAcciones);
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

function eliminarContacto(id) {
    fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo eliminar el contacto.");
            }
            return response.json();
        })
        .then(() => {
            Swal.fire({
                icon: "success",
                title: "Contacto eliminado",
                text: "El contacto ha sido eliminado correctamente.",
                timer: 1500,
                showConfirmButton: false
            });

            // Opcional: recargar lista de contactos o avanzar
            obtenerContactos?.(); // solo si existe esa función
        })
        .catch(error => {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un problema al eliminar el contacto."
            });
        });
}

function configurarEventosModales() {
    // Modal AGREGAR CONTACTO
    const modalAgregar = document.getElementById("modal-agregar");
    const btnAbrirModalAgregar = document.getElementById("btnAbrirModal");
    const btnFlotante = document.getElementById("btnFlotanteAgregar");
    const btnCerrarAgregar = document.getElementById("btnCerrarModal");

    if (btnAbrirModalAgregar) {
        btnAbrirModalAgregar.addEventListener("click", () => {
            if (modalAgregar) {
                modalAgregar.showModal();
                setTimeout(() => inicializarTelefonosPaso2(), 100);
            }
        });
    }

    if (btnFlotante) {
        btnFlotante.addEventListener("click", () => {
            if (modalAgregar) {
                modalAgregar.showModal();
                setTimeout(() => inicializarTelefonosPaso2(), 100);
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
            await agregarContacto();
        });
    }

    // Modal EDITAR CONTACTO
    const modalEditar = document.getElementById("modal-editar");
    const btnCerrarEditar = document.getElementById("btnCerrarEditar");

    if (btnCerrarEditar && modalEditar) {
        btnCerrarEditar.addEventListener("click", () => modalEditar.close());
    }

    const frmEditar = document.getElementById("frmEditar");
    if (frmEditar) {
        frmEditar.addEventListener("submit", async (e) => {
            e.preventDefault();
            await editarContacto();
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

            const rol = document.getElementById("rolEquipo")?.value;
            const id = frmAgregarEquipo.dataset.idContacto;

            if (!rol) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: "warning",
                        title: "Rol requerido",
                        text: "Por favor, selecciona un rol antes de continuar.",
                        confirmButtonColor: "#007bff"
                    });
                } else {
                    alert("Por favor, selecciona un rol antes de continuar.");
                }
                return;
            }

            marcarContactoComoAñadido(id);

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: "success",
                    title: "¡Añadido!",
                    text: "El contacto se ha añadido exitosamente al equipo.",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                alert("El contacto se ha añadido exitosamente al equipo.");
            }

            if (modalEquipo) modalEquipo.close();
        });
    }
}

async function agregarContacto() {
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
    await enviarContacto(nombre, correo, telefono, archivoFoto);
}

async function enviarContacto(nombre, correo, telefono, archivoFoto) {

    try {
        // Subir imagen si fue seleccionada
        let urlFoto = "";
        if (archivoFoto) {
            urlFoto = await subirImagen(archivoFoto);
        }

        const nuevoContacto = {
            Nombre: nombre,
            "Correo Electrónico": correo,
            "Número de tel.": telefono,
            Foto: urlFoto
        };

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoContacto)
        });

        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status}`);
        }

        const respuesta = await res.json();

        Swal.fire({
            icon: "success",
            title: "¡Contacto agregado!",
            text: "El contacto ha sido guardado exitosamente.",
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
        obtenerContactos();

    } catch (error) {
        console.error("Error al agregar contacto:", error);

        Swal.fire({
            icon: "error",
            title: "Ups...",
            text: "Ocurrió un problema al guardar el contacto. Por favor, intenta nuevamente.",
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

// CORRECCIÓN 4: Función AbrirModalEditar corregida
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
            inicializarTelefonosPaso2();

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
async function obtenerContactosPaso2() {
    const res = await fetch(API_URL);
    listaContactos = await res.json();
    renderizarContactos(listaContactos);
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

            /* console.log('IntlTelInput - Número completo:', numeroCompleto);
            console.log('IntlTelInput - País:', paisSeleccionado); */

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

function renderizarContactos(contactos) {
    const contenedor = document.getElementById("lista-contactos");
    contenedor.innerHTML = "";

    if (!contactos || contactos.length === 0) {
        contenedor.innerHTML = `<p class='text-muted'>No hay contactos registrados aún.</p>`;
        return;
    }

    // Eliminar spinner si aún existe
    const spinner = contenedor.querySelector(".spinner-wrapper");
    if (spinner) spinner.remove();

    contactos.forEach(contacto => {
        const card = document.createElement("div");
        card.className = "card p-3 shadow-sm";

        card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <img src="${contacto.Foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}"
               alt="Foto de ${contacto.Nombre}" class="rounded-circle border"
               width="56" height="56" style="object-fit: cover; background-color: #f3f3f3;">
          <div>
            <h6 class="mb-0">${contacto.Nombre}</h6>
            <small class="text-muted">${contacto["Correo Electrónico"]}</small><br>
            <small>${contacto["Número de tel."]}</small>
          </div>
        </div>
        <div class="d-flex flex-column align-items-end gap-2">
          <button class="btn btn-sm btn-accion añadir" data-id="${contacto.id}">
            <i class="bi bi-person-plus-fill me-1"></i> Añadir al equipo
          </button>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-accion editar" title="Editar"
              onclick="AbrirModalEditar(
                '${contacto.id}',
                \`${contacto.Nombre}\`,
                \`${contacto["Correo Electrónico"]}\`,
                \`${contacto["Número de tel."]}\`,
                \`${contacto.Foto || ""}\`)">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn btn-sm btn-accion eliminar" title="Eliminar"
              onclick="eliminarContacto('${contacto.id}')">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </div>
      </div>
    `;

        contenedor.appendChild(card);
    });
}

function obtenerContactoPorId(id) {
    const contacto = listaContactos?.find(c => c.id == id);
    return contacto;
}

// 2. Función modificada para abrir modal y guardar ID correctamente
function abrirModalAgregarEquipo(contacto) {
    document.getElementById("imgEquipo").src = contacto.Foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    document.getElementById("nombreEquipo").value = contacto.Nombre || "";
    document.getElementById("correoEquipo").value = contacto["Correo Electrónico"] || "";
    document.getElementById("telefonoEquipo").value = contacto["Número de tel."] || "";
    document.getElementById("rolEquipo").value = "";

    // IMPORTANTE: Guardar el ID en el formulario para usarlo después
    const frmAgregarEquipo = document.getElementById("frmAgregarEquipo");
    if (frmAgregarEquipo) {
        frmAgregarEquipo.dataset.idContacto = contacto.id;
    }

    document.getElementById("modal-agregar-equipo").showModal();
}


// CORRECCIÓN 6: Función editarContacto corregida
async function editarContacto() {
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
                title: "Contacto actualizado",
                text: "El contacto ha sido actualizado exitosamente.",
                timer: 1500,
                showConfirmButton: false
            });

            document.getElementById("modal-editar").close();
            obtenerContactos(); // Recargar la lista
        } else {
            throw new Error("Error al actualizar el contacto");
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Algo salió mal",
            text: "No se pudo actualizar el contacto.",
            confirmButtonText: "Entendido"
        });
    }
}

async function subirImagen(file) {
    try {
        const base64 = await toBase64(file);
        const formData = new FormData();
        formData.append("image", base64.split(",")[1]);

        const res = await fetch(IMG_API_URL, {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        return data?.data?.url || "";
    } catch (error) {
        console.error("Error al subir imagen:", error);
        return "";
    }
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
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
            initPaso3();
            break;
        case "3":
            console.log("Iniciando Paso 3");
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

function inicializarTelefonosPaso2() {
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

function actualizarEquipoEnStorage(id, accion) {
    const equipo = JSON.parse(sessionStorage.getItem("miEquipo") || "[]");

    if (accion === "agregar" && !equipo.includes(id)) {
        equipo.push(id);
    }

    if (accion === "eliminar") {
        const index = equipo.indexOf(id);
        if (index !== -1) equipo.splice(index, 1);
    }

    sessionStorage.setItem("miEquipo", JSON.stringify(equipo));
}


// CORRECCIÓN 8: Función mejorada para marcar contacto como añadido
function marcarContactoComoAñadido(idContacto, restaurando = false) {
    const contenedorAcciones = document.getElementById(`acciones-${idContacto}`);
    if (!contenedorAcciones) return;

    // Actualizar storage solo si no se está restaurando
    if (!restaurando) {
        actualizarEquipoEnStorage(idContacto, "agregar");
    }

    // Marcar visualmente
    marcarContactoComoAñadidoVisual(idContacto, contenedorAcciones);
}

// CORRECCIÓN 6: Función separada para marcar visualmente como añadido
function marcarContactoComoAñadidoVisual(idContacto, contenedorAcciones) {
    if (!contenedorAcciones) return;

    contenedorAcciones.innerHTML = `
        <div class="text-success fw-semibold d-flex align-items-center justify-content-end es-equipo" data-id="${idContacto}">
            <i class="bi bi-check-circle-fill me-2"></i>
            Parte de tu equipo
            <button class="btn text-danger btn-remover" title="Eliminar del equipo" style="border: none; background: none; font-size: 2.4rem; line-height: 1; padding: 0 0.5rem; font-weight: bold;">&times;</button>
        </div>
    `;

    // Reconfigurar eventos para los botones de editar y eliminar
    const editarBtn = contenedorAcciones.querySelector(".editar");
    const eliminarBtn = contenedorAcciones.querySelector(".eliminar");
    const removerBtn = contenedorAcciones.querySelector(".btn-remover");

    if (editarBtn) {
        editarBtn.addEventListener("click", () => {
            const contacto = listaContactos.find(c => c.id == idContacto);
            if (contacto) {
                AbrirModalEditar(
                    contacto.id,
                    contacto.Nombre,
                    contacto["Correo Electrónico"] || contacto["Correo Elect."],
                    contacto["Número de tel."],
                    contacto.Foto
                );
            }
        });
    }

    if (eliminarBtn) {
        eliminarBtn.addEventListener("click", () => {
            const contacto = listaContactos.find(c => c.id == idContacto);
            if (contacto) {
                Swal.fire({
                    title: `¿Eliminar a ${contacto.Nombre}?`,
                    text: "Esta acción no se puede deshacer.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar"
                }).then(result => {
                    if (result.isConfirmed) {
                        eliminarContacto(idContacto);
                    }
                });
            }
        });
    }

    if (removerBtn) {
        removerBtn.addEventListener("click", () => {
            removerDelEquipo(idContacto);
        });
    }
}

// CORRECCIÓN 7: Función para remover del equipo
function removerDelEquipo(idContacto) {
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
            actualizarEquipoEnStorage(idContacto, "eliminar");

            // Refrescar la vista
            obtenerContactos();

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

function guardarDatosPaso2() {
    // Obtener todos los contactos que están marcados como parte del equipo
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
    const ids = Array.from(equipoActual).map(el => el.dataset.id);

    sessionStorage.setItem("miEquipo", JSON.stringify(ids));
}

// Departamentos
function restaurarDatosPaso2() {

}

// Función mejorada para el buscador
function inicializarBuscadorDeContactos() {
    const inputBusqueda = document.getElementById("busquedaContacto");
    const botonBuscar = document.getElementById("btnBuscar");

    if (!inputBusqueda || !botonBuscar) return;

    // Función de filtrado mejorada
    const filtrarContactos = () => {
        const query = inputBusqueda.value.trim().toLowerCase();
        const filas = document.querySelectorAll(".contacto-fila");

        let contactosVisibles = 0;

        filas.forEach(fila => {
            const nombre = fila.querySelector(".nombre-contacto")?.textContent.toLowerCase() || "";
            const correo = fila.querySelector(".correo-contacto")?.textContent.toLowerCase() || "";
            const telefono = fila.querySelector(".telefono-contacto")?.textContent.toLowerCase() || "";

            // Buscar en todos los campos
            const coincide = query === "" ||
                nombre.includes(query) ||
                correo.includes(query) ||
                telefono.includes(query);

            if (coincide) {
                fila.style.display = "flex";
                contactosVisibles++;
            } else {
                fila.style.display = "none";
            }
        });

        // Mostrar mensaje si no hay resultados
        mostrarMensajeResultados(contactosVisibles, query);
    };

    // Asignar nuevos eventos
    botonBuscar.addEventListener("click", filtrarContactos);
    inputBusqueda.addEventListener("keyup", filtrarContactos);
}

// CORRECCIÓN 1: Función para limpiar caracteres especiales en nombres
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

//---------------------------------- PASO 3 ----------------------------------

function guardarDatosPaso3() {
    // Obtener todos los contactos que están marcados como parte del equipo
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
    const ids = Array.from(equipoActual).map(el => el.dataset.id);

    sessionStorage.setItem("miEquipo", JSON.stringify(ids));
}

function restaurarDatosPaso3() {
    const equipo = JSON.parse(sessionStorage.getItem("miEquipo") || "[]");

    if (equipo.length === 0) return;

    // Función para verificar y restaurar con reintentos
    const verificarYRestaurar = (intentos = 0) => {
        const contenedor = document.getElementById("lista-contactos");

        if (!contenedor) {
            if (intentos < 30) {
                setTimeout(() => verificarYRestaurar(intentos + 1), 100);
            }
            return;
        }

        // Verificar que los contactos estén renderizados
        const contactosRenderizados = contenedor.querySelectorAll('.contacto-fila');

        if (contactosRenderizados.length === 0) {
            if (intentos < 30) {
                setTimeout(() => verificarYRestaurar(intentos + 1), 100);
            }
            return;
        }

        // Restaurar estado del equipo
        setTimeout(() => {
            restaurarEstadoEquipo();
        }, 200);
    };

    verificarYRestaurar();
}

/* function restaurarDatosPaso3() {
    // Aquí cargas los datos de los pasos anteriores para mostrar en confirmación
    console.log("Restaurando datos para confirmación...");
    
    // Ejemplo: Obtener datos del localStorage o variables globales
    const datosEmpresa = obtenerDatosEmpresa();
    const datosIntegrantes = obtenerDatosIntegrantes();
    
    // Mostrar datos en el paso 3
    mostrarDatosConfirmacion(datosEmpresa, datosIntegrantes);
} */

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
                        restaurarDatosPaso2();

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