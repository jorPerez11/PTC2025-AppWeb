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

