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
                    if (paso === 1) restaurarDatosPaso1();
                    if (paso === 2) restaurarDatosPaso2();
                    if (paso === 3) restaurarDatosPaso3();
                });
            }, 0);

        });

    // Mostralo u ocultalo de inmediato, sin depender del fetch
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
    const rolAdmin = document.getElementById("rolAdmin")?.value.trim();

    // Validaciones básicas
    if (!correoEmpresa) errores.push("El correo de empresa no puede estar vacío.");
    if (!telefonoEmpresa) errores.push("El teléfono de empresa es requerido.");
    if (!adminNombre) errores.push("El nombre del administrador es obligatorio.");
    if (!adminCorreo) errores.push("El correo del administrador no puede estar vacío.");
    if (!telefonoAdmin) errores.push("El teléfono del administrador es requerido.");
    if (!rolAdmin) errores.push("Debes seleccionar un rol para el administrador.");

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
    if (paso === 3 && typeof guardarDatosPaso3 === 'function') guardarDatosPaso3();

    if (paso < 3) {
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
        rolAdmin: document.getElementById("rolAdmin")?.value
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
const API_URL = "https://retoolapi.dev/SuMLlc/contactosDatos";
const IMG_API_URL = "https://api.imgbb.com/1/upload?key=2c2a83d4ddbff10c8af95b3159d53646";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado, esperando el contenedor...");

    const observer = new MutationObserver(() => {
        const contenedor = document.getElementById("lista-contactos");
        if (contenedor) {
            console.log("Contenedor encontrado, cargando contactos...");
            initPaso2();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (document.getElementById("lista-contactos")) {
        console.log("Contenedor ya estaba presente");
        initPaso2();
        observer.disconnect();
    }
});

function initPaso2() {
    const contenedor = document.getElementById("lista-contactos");
    if (!contenedor) {
        console.warn("No se encontró el contenedor #lista-contactos");
        return;
    }

    console.log("Contenedor encontrado, cargando contactos...");
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

    try {
        console.log("Obteniendo datos de la API...");
        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        console.log("Datos obtenidos:", data);
        listaContactos = data; // Actualizar la lista global

        mostrarDatos(data);
    } catch (error) {
        console.error("Error al obtener contactos:", error);
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los contactos. Por favor, intenta nuevamente.
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

    console.log(`Mostrando ${contactos.length} contactos`);
    contenedor.innerHTML = "";

    const headers = document.createElement("div");
    headers.className = "row align-items-center mb-2 px-2 headers-contacto";
    headers.innerHTML = `
        <div class="col-auto text-center">Contacto</div>
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

        const fila = document.createElement("div");
        fila.className = "row align-items-center py-2 px-2 shadow-sm border rounded mb-2 bg-white";
        fila.innerHTML = `
            <div class="col-auto d-flex justify-content-center align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <img src="${imgSrc}" 
                     alt="Foto de ${contacto.Nombre}" 
                     class="rounded-circle foto-contacto"
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
            </div>

            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 fw-semibold nombre-contacto">
                    ${contacto.Nombre || "Sin nombre"}
                </div>
            </div>

            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 text-muted small correo-contacto">
                    ${contacto["Correo Electrónico"] || contacto["Correo Elect."] || "Sin correo"}
                </div>
            </div>

            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 text-muted small telefono-contacto">
                    ${contacto["Número de tel."] || "+503 0000-0000"}
                </div>
            </div>

            <div class="col d-flex justify-content-end align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="d-flex flex-column align-items-end gap-2">
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

        // Eventos activos con verificación
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
                AbrirModalEliminar(contacto.id, contacto.Nombre);
            });
        }

        if (añadirBtn) {
            añadirBtn.addEventListener("click", () => {
                abrirModalAgregarEquipo(contacto);
            });
        }
    });
}

function configurarEventosModales() {
    console.log("Configurando eventos de modales...");

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
    console.log("=== INICIANDO AGREGAR CONTACTO ===");

    const nombre = document.getElementById("nombre")?.value.trim();
    const correo = document.getElementById("email")?.value.trim();
    const archivoFoto = document.getElementById("foto")?.files[0];

    // Validar campos obligatorios
    if (!nombre || !correo) {
        alert("Por favor, completa todos los campos obligatorios (nombre, correo).");
        return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return;
    }

    // Validar teléfono
    console.log("Validando teléfono...");
    if (!validarTelefonoIndividual("telefonoAgregar")) {
        alert("Por favor, ingresa un número de teléfono válido (mínimo 7 dígitos).");
        return;
    }

    // Obtener teléfono con prefijo
    const telefono = obtenerTelefonoConPrefijo("telefonoAgregar");
    if (!telefono) {
        alert("No se pudo procesar el número de teléfono. Por favor, verifica que esté correcto.");
        return;
    }

    console.log("Todos los datos validados correctamente");
    console.log("Teléfono final:", telefono);

    // Proceder con el guardado
    await enviarContacto(nombre, correo, telefono, archivoFoto);
}

async function enviarContacto(nombre, correo, telefono, archivoFoto) {
    console.log("=== ENVIANDO CONTACTO ===");
    console.log("Datos:", { nombre, correo, telefono });

    try {
        // Subir imagen si fue seleccionada
        let urlFoto = "";
        if (archivoFoto) {
            console.log("Subiendo imagen...");
            urlFoto = await subirImagen(archivoFoto);
            console.log("URL de imagen:", urlFoto);
        }

        const nuevoContacto = {
            Nombre: nombre,
            "Correo Electrónico": correo,
            "Número de tel.": telefono,
            Foto: urlFoto
        };

        console.log("Enviando a API:", nuevoContacto);

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoContacto)
        });

        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status}`);
        }

        const respuesta = await res.json();
        console.log("Respuesta del servidor:", respuesta);

        alert("¡Contacto agregado exitosamente!");

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
        alert("Ocurrió un problema al guardar el contacto. Por favor, intenta nuevamente.");
    }
}

function validarTelefonoIndividual(idInput) {
    const input = document.getElementById(idInput);
    if (!input) {
        console.error(`Input no encontrado: ${idInput}`);
        return false;
    }

    const valorInput = input.value.trim();
    console.log(`=== Validando ${idInput} ===`);
    console.log('Valor del input:', valorInput);

    // Validación básica primero
    if (!valorInput || valorInput.length < 7) {
        console.log('Teléfono muy corto o vacío');
        input.classList.add("is-invalid");
        return false;
    }

    // Verificar que contenga solo números, espacios, guiones, paréntesis
    const formatoValido = /^[\d\s\-\(\)+]+$/.test(valorInput);
    if (!formatoValido) {
        console.log('Formato de teléfono inválido');
        input.classList.add("is-invalid");
        return false;
    }

    // Contar solo los dígitos
    const soloDigitos = valorInput.replace(/\D/g, '');
    const esValido = soloDigitos.length >= 7 && soloDigitos.length <= 15;

    console.log('Solo dígitos:', soloDigitos);
    console.log('Cantidad de dígitos:', soloDigitos.length);
    console.log('Es válido:', esValido);

    // Aplicar clase visual
    input.classList.toggle("is-invalid", !esValido);

    return esValido;
}

function AbrirModalEditar(id, nombre, correo, telefono, foto = "") {
    console.log("Abriendo modal de editar con:", { id, nombre, correo, telefono, foto });

    document.getElementById("idEditar").value = id;
    document.getElementById("nombreEditar").value = nombre || "";
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
                    const iti = window.intlTelInputGlobals.getInstance(telefonoInput);
                    if (iti) {
                        iti.setNumber(telefono);
                        console.log("Número establecido en modal editar:", telefono);
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

function obtenerTelefonoConPrefijo(idInput) {
    const input = document.getElementById(idInput);
    if (!input) {
        console.error(`Input no encontrado: ${idInput}`);
        return null;
    }

    const valorInput = input.value.trim();
    console.log(`=== Obteniendo teléfono de ${idInput} ===`);
    console.log('Valor del input:', valorInput);

    // Intentar usar intlTelInput si está disponible
    const iti = window.intlTelInputGlobals?.getInstance(input);
    let numeroFinal = null;

    if (iti) {
        try {
            // Intentar obtener el número con intlTelInput
            const numeroCompleto = iti.getNumber();
            const paisSeleccionado = iti.getSelectedCountryData();

            console.log('IntlTelInput - Número completo:', numeroCompleto);
            console.log('IntlTelInput - País:', paisSeleccionado);

            if (numeroCompleto && numeroCompleto.trim() !== '') {
                numeroFinal = numeroCompleto.trim();
            } else if (paisSeleccionado && paisSeleccionado.dialCode) {
                // Construir manualmente si intlTelInput no devolvió el número
                const soloDigitos = valorInput.replace(/\D/g, '');
                numeroFinal = `+${paisSeleccionado.dialCode}${soloDigitos}`;
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
                numeroFinal = `+${soloDigitos}`;
            } else {
                // Usar +503 (El Salvador) como predeterminado
                numeroFinal = `+503${soloDigitos}`;
            }
        }
    }

    console.log('Número final:', numeroFinal);
    console.log('===============================');

    return numeroFinal;
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
    console.log("¿Se encontró el contacto?", contacto);
    return contacto;
}

// 2. Función modificada para abrir modal y guardar ID correctamente
function abrirModalAgregarEquipo(contacto) {
    console.log("=== ABRIENDO MODAL AGREGAR EQUIPO ===");
    console.log("Contacto recibido:", contacto);

    document.getElementById("imgEquipo").src = contacto.Foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    document.getElementById("nombreEquipo").value = contacto.Nombre || "";
    document.getElementById("correoEquipo").value = contacto["Correo Electrónico"] || "";
    document.getElementById("telefonoEquipo").value = contacto["Número de tel."] || "";
    document.getElementById("rolEquipo").value = "";

    // IMPORTANTE: Guardar el ID en el formulario para usarlo después
    const frmAgregarEquipo = document.getElementById("frmAgregarEquipo");
    if (frmAgregarEquipo) {
        frmAgregarEquipo.dataset.idContacto = contacto.id;
        console.log("ID guardado en formulario:", contacto.id);
    }

    document.getElementById("modal-agregar-equipo").showModal();
}


async function editarContacto() {
    const id = document.getElementById("idEditar").value;
    const nombre = document.getElementById("nombreEditar").value.trim();
    const correo = document.getElementById("emailEditar").value.trim();
    const telefono = document.getElementById("telefonoEditar").value.trim();
    const nuevaFoto = document.getElementById("fotoEditar").files[0];
    const previewFoto = document.getElementById("fotoActual");
    let urlFinal = previewFoto ? previewFoto.src : "";

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
            alert("Contacto actualizado exitosamente");
            document.getElementById("modal-editar").close();
            obtenerContactosPaso2(); // Recargar la lista
        } else {
            throw new Error("Error al actualizar el contacto");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar el contacto");
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
            initPaso2();
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
                console.log(`Input ${selector} ya está inicializado`);
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
            console.log(`Input ${selector} inicializado correctamente`);
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

    console.log(`Input ${idInput} pasó validación básica:`, valorInput);
    return true;
}


function marcarContactoComoAñadido(idContacto, restaurando = false) {
    const btnAñadir = document.querySelector(`button.añadir[data-id="${idContacto}"]`);
    if (!btnAñadir) return;

    const contenedorAcciones = btnAñadir.closest('.d-flex.flex-column');
    if (!contenedorAcciones) return;

    contenedorAcciones.innerHTML = `
        <div class="text-success fw-semibold d-flex align-items-center justify-content-end es-equipo" data-id="${idContacto}">
            <i class="bi bi-check-circle-fill me-2"></i>
            Parte de tu equipo
            <button class="btn btn-sm text-danger ms-3 btn-remover" title="Eliminar del equipo">&times;</button>
        </div>
    `;

    // Solo agregar evento si no se está restaurando (para evitar doble binding)
    if (!restaurando) {
        actualizarEquipoEnStorage(idContacto, "agregar");
    }

    // Evento para remover
    contenedorAcciones.querySelector(".btn-remover").addEventListener("click", () => {
        actualizarEquipoEnStorage(idContacto, "eliminar");
        obtenerContactos(); // Refrescar para volver a mostrar el botón "Añadir"
    });
}

function guardarDatosPaso2() {
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
    const ids = Array.from(equipoActual).map(el => el.dataset.id);
    sessionStorage.setItem("miEquipo", JSON.stringify(ids));
}

function restaurarDatosPaso2() {
    const equipo = JSON.parse(sessionStorage.getItem("miEquipo") || "[]");
    equipo.forEach(id => marcarContactoComoAñadido(id, true));
}

function actualizarEquipoEnStorage(id, accion) {
    let equipo = JSON.parse(sessionStorage.getItem("miEquipo") || "[]");

    if (accion === "agregar" && !equipo.includes(id)) {
        equipo.push(id);
    }

    if (accion === "eliminar") {
        equipo = equipo.filter(item => item !== id);
    }

    sessionStorage.setItem("miEquipo", JSON.stringify(equipo));
}

function accionSiguientePaso() {
    siguientePaso();
}