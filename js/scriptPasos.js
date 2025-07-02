let paso = 1;

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
                    /* if (paso === 2) restaurarDatosPaso2(); */
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
    const telefonoEmpresa = window.intlTelInputGlobals.getInstance(document.getElementById("telefonoEmpresa"))?.getNumber();
    const sitioWeb = document.getElementById("sitioWeb")?.value.trim(); // opcional

    const adminNombre = document.getElementById("nombreAdmin")?.value.trim();
    const adminCorreo = document.getElementById("correoAdmin")?.value.trim();
    const telefonoAdmin = window.intlTelInputGlobals.getInstance(document.getElementById("telefonoAdmin"))?.getNumber();
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
        Swal.fire({
            icon: "warning",
            title: "Revisá los campos",
            html: `<ul style="text-align:left;">${errores.map(e => `<li>${e}</li>`).join("")}</ul>`,
            confirmButtonText: "Entendido",
        });
        return false;
    }

    return true;
}


function accionSiguientePaso() {
    if (paso === 1) guardarDatosPaso1();
    if (paso === 2) guardarDatosPaso2();
    if (paso === 3) guardarDatosPaso3();
    siguientePaso();
}

function guardarDatosPaso1() {
    const datos = {
        empresa: document.querySelector('input[name="nombreEmpresa"]')?.value,
        correoEmpresa: document.getElementById("correoEmpresa")?.value,
        telefonoEmpresa: window.intlTelInputGlobals.getInstance(document.getElementById("telefonoEmpresa"))?.getNumber(),
        sitioWeb: document.getElementById("sitioWeb")?.value,
        adminNombre: document.getElementById("nombreAdmin")?.value,
        adminCorreo: document.getElementById("correoAdmin")?.value,
        telefonoAdmin: window.intlTelInputGlobals.getInstance(document.getElementById("telefonoAdmin"))?.getNumber(),
        rolAdmin: document.getElementById("rolAdmin")?.value
    };

    sessionStorage.setItem("datosPaso1", JSON.stringify(datos));
}

function restaurarDatosPaso1() {
    const data = JSON.parse(sessionStorage.getItem("datosPaso1") || "{}");
    // [Opcional] Log para depuración:
    /*
    console.log("Intentando restaurar campos:");
    ["nombreEmpresa", "correoEmpresa", "sitioWeb", "nombreAdmin", "correoAdmin", "rolAdmin"].forEach(id => {
      const input = document.getElementById(id);
      console.log(id, "→", input);
    });
    */
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

        const telEmpresa = window.intlTelInputGlobals.getInstance(telEmpresaInput);
        const telAdmin = window.intlTelInputGlobals.getInstance(telAdminInput);

        if (telEmpresa && data.telefonoEmpresa) telEmpresa.setNumber(data.telefonoEmpresa);
        if (telAdmin && data.telefonoAdmin) telAdmin.setNumber(data.telefonoAdmin);
    }, 100);
}

function inicializarInputsTelefono() {
    const inputs = ["#telefonoAdmin", "#telefonoEmpresa"];
    inputs.forEach(selector => {
        const input = document.querySelector(selector);
        if (input && typeof window.intlTelInput === "function") {
            const iti = window.intlTelInput(input, {
                initialCountry: "sv",
                preferredCountries: ["sv", "mx", "co"],
                separateDialCode: true,
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js"
            });

            // Guardamos la instancia en el input para futuras consultas
            input.dataset.intl = "true"; // solo como marca para no repetir
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

function siguientePaso() {
    // Validar campos y formato de datos
    if (!validarPaso1()) return;

    // Validar teléfonos con intlTelInput
    const inputEmpresa = document.getElementById("telefonoEmpresa");
    const inputAdmin = document.getElementById("telefonoAdmin");

    const telEmpresaInstance = window.intlTelInputGlobals.getInstance(inputEmpresa);
    const telAdminInstance = window.intlTelInputGlobals.getInstance(inputAdmin);

    const telefonoEmpresa = telEmpresaInstance?.getNumber();
    const telefonoAdmin = telAdminInstance?.getNumber();

    // Validar que ambos teléfonos estén completos
    if (!telefonoEmpresa || telefonoEmpresa.length < 10) {
        Swal.fire("Teléfono inválido", "El teléfono de empresa no es válido.", "warning");
        return;
    }

    if (!telefonoAdmin || telefonoAdmin.length < 10) {
        Swal.fire("Teléfono inválido", "El teléfono del administrador no es válido.", "warning");
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
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Si cancelás ahora, se perderán los datos ingresados.",
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

    // Por si ya estaba cargado antes de que inicie el observer
    if (document.getElementById("lista-contactos")) {
        console.log("Contenedor ya estaba presente");
        initPaso2();
        observer.disconnect();
    }
});

function initPaso2() {
    obtenerContactos();
    configurarEventosModales();

    const btnFlotante = document.getElementById("btnFlotanteAgregar");
    if (btnFlotante) {
        btnFlotante.style.display = "block";
        btnFlotante.addEventListener("click", () => {
            const modal = document.getElementById("modal-agregar");
            modal?.showModal();
        });
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
        const pasoActual = document.getElementById("paso-actual");
        if (pasoActual) {
            iniciarPaso();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Por si ya estaba presente
    if (document.getElementById("paso-actual")) {
        iniciarPaso();
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
}

// Función para obtener y mostrar personas desde la API
async function obtenerContactos() {
    const contenedor = document.getElementById("lista-contactos");

    try {
        console.log("Obteniendo datos de la API...");
        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        console.log("Datos obtenidos:", data);

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

    contactos.forEach((persona) => {
        const imgSrc =
            persona.Foto && persona.Foto.trim()
                ? persona.Foto
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        const fila = document.createElement("div");
        fila.className = "row align-items-center py-2 px-2 shadow-sm border rounded mb-2 bg-white";
        fila.innerHTML = `
  <div class="col-auto d-flex justify-content-center align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
    <img src="${imgSrc}" 
         alt="Foto de ${persona.Nombre}" 
         class="rounded-circle foto-contacto"
         onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
  </div>

  <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
    <div class="w-100 fw-semibold nombre-contacto">
      ${persona.Nombre || "Sin nombre"}
    </div>
  </div>

  <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
    <div class="w-100 text-muted small correo-contacto">
      ${persona["Correo Electrónico"] || persona["Correo Elect."] || "Sin correo"}
    </div>
  </div>

  <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
    <div class="w-100 text-muted small telefono-contacto">
      ${persona["Número de tel."] || "+503 0000-0000"}
    </div>
  </div>

  <div class="col d-flex justify-content-end align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
    <div class="d-flex flex-column align-items-end gap-2">
      <button class="btn btn-sm btn-accion añadir" data-id="${persona.id}" title="Añadir al equipo">
        <i class="bi bi-person-plus-fill me-1"></i> Añadir al equipo
      </button>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-accion editar" data-id="${persona.id}" title="Editar">
          <i class="bi bi-pencil-fill"></i>
        </button>
        <button class="btn btn-sm btn-accion eliminar" data-id="${persona.id}" title="Eliminar">
          <i class="bi bi-trash-fill"></i>
        </button>
      </div>
    </div>
  </div>
`;

        contenedor.appendChild(fila);

        // 🎯 Eventos activos
        fila.querySelector(".editar").addEventListener("click", () => {
            AbrirModalEditar(
                persona.id,
                persona.Nombre,
                persona["Correo Electrónico"] || persona["Correo Elect."],
                persona["Número de tel."],
                persona.Foto
            );
        });

        fila.querySelector(".eliminar").addEventListener("click", () => {
            AbrirModalEliminar(persona.id, persona.Nombre);
        });

        fila.querySelector(".añadir").addEventListener("click", () => {
            SeleccionarContacto(persona.id);
        });
    });
}



function configurarEventosModales() {
    // Modal agregar contacto
    const modal = document.getElementById("modal-agregar");
    const btnAgregar = document.getElementById("btnAbrirModal");
    const btnCerrar = document.getElementById("btnCerrarModal");

    if (btnAgregar && modal) {
        btnAgregar.addEventListener("click", () => {
            modal.showModal();
        });
    }

    const btnFlotante = document.getElementById("btnFlotanteAgregar");
    if (btnFlotante && modal) {
        btnFlotante.addEventListener("click", () => {
            modal.showModal();
        });
    }

    if (btnCerrar && modal) {
        btnCerrar.addEventListener("click", () => {
            modal.close();
        });
    }

    // Formulario agregar
    const frmAgregar = document.getElementById("frmAgregar");
    if (frmAgregar) {
        frmAgregar.addEventListener("submit", async (e) => {
            e.preventDefault();
            await agregarContacto();
        });
    }

    // Modal editar contacto
    const modalEditar = document.getElementById("modal-editar");
    const btnCerrarEditar = document.getElementById("btnCerrarEditar");

    if (btnCerrarEditar && modalEditar) {
        btnCerrarEditar.addEventListener("click", () => {
            modalEditar.close();
        });
    }

    // Formulario editar
    const frmEditar = document.getElementById("frmEditar");
    if (frmEditar) {
        frmEditar.addEventListener("submit", async (e) => {
            e.preventDefault();
            await editarContacto();
        });
    }
}

async function agregarContacto() {
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const imagen = document.getElementById("foto").files[0];

    if (!nombre || !correo || !telefono) {
        alert("Complete todos los campos obligatorios");
        return;
    }

    try {
        let urlFoto = "";
        if (imagen) {
            urlFoto = await subirImagen(imagen);
        }

        const nuevo = {
            Nombre: nombre,
            "Correo Electrónico": correo,
            "Número de tel.": telefono,
            Foto: urlFoto
        };

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevo)
        });

        if (res.ok) {
            alert("¡Contacto agregado exitosamente!");
            document.getElementById("frmAgregar").reset();
            document.getElementById("modal-agregar").close();
            obtenerPersonas(); // Recargar la lista
        } else {
            throw new Error("Error al guardar el contacto");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al agregar el contacto");
    }
}

function AbrirModalEditar(id, nombre, correo, telefono, foto = "") {
    document.getElementById("idEditar").value = id;
    document.getElementById("nombreEditar").value = nombre || "";
    document.getElementById("emailEditar").value = correo || "";
    document.getElementById("telefonoEditar").value = telefono || "";

    const fotoActual = document.getElementById("fotoActual");
    if (fotoActual) {
        fotoActual.src = foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }

    const modalEditar = document.getElementById("modal-editar");
    if (modalEditar) {
        modalEditar.showModal();
    }
}

async function editarContacto() {
    const id = document.getElementById("idEditar").value;
    const nombre = document.getElementById("nombreEditar").value.trim();
    const correo = document.getElementById("emailEditar").value.trim();
    const telefono = document.getElementById("telefonoEditar").value.trim();
    const nuevaFoto = document.getElementById("fotoEditar").files[0];
    let urlFinal = document.getElementById("fotoActual").src;

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
            obtenerPersonas(); // Recargar la lista
        } else {
            throw new Error("Error al actualizar el contacto");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar el contacto");
    }
}

// Funciones auxiliares
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
    const pasoActual = document.getElementById("paso-actual")?.textContent?.trim();
    if (!pasoActual) {
        console.warn("No se pudo detectar el paso actual");
        return;
    }

    switch (pasoActual) {
        case "1":
            console.log("Iniciando Paso 1");
            // initPaso1(); // si tenés uno
            break;
        case "2":
            console.log("Iniciando Paso 2");
            initPaso2();
            break;
        case "3":
            console.log("Iniciando Paso 3");
            // initPaso3(); // si lo tenés
            break;
        default:
            console.warn(`Paso no reconocido: ${pasoActual}`);
    }

}


document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM completamente cargado");
    iniciarPaso(); // Esto detecta si estás en el Paso 2 y llama initPaso2()
});

// Función del botón flotante
document.getElementById('btnFlotanteAgregar').addEventListener('click', function () {
    // Aquí puedes agregar tu lógica para agregar usuario
    alert('¡Agregar nuevo usuario!\n\nEste botón ahora se ve integrado con el diseño.');
});

// Efecto de entrada suave del botón
window.addEventListener('load', function () {
    const btn = document.getElementById('btnFlotanteAgregar');
    btn.style.transform = 'scale(0) translateY(20px)';
    btn.style.opacity = '0';

    setTimeout(() => {
        btn.style.transform = 'scale(1) translateY(0)';
        btn.style.opacity = '1';
    }, 800);
});

