// Utilidades para manejo de almacenamiento local y de sesión

// Guardar datos del paso 1
function guardarDatosPaso1() {
    const telefonoEmpresaEl = document.getElementById("telefonoEmpresa");
    const telefonoAdminEl = document.getElementById("telefonoAdmin");

    const datos = {
        nombreEmpresa: document.getElementById("nombreEmpresaInput")?.value || '',
        correoEmpresa: document.getElementById("correoEmpresa")?.value || '',
        telefonoEmpresa: telefonoEmpresaEl ? window.intlTelInputGlobals?.getInstance(telefonoEmpresaEl)?.getNumber() : null,
        sitioWeb: document.getElementById("sitioWeb")?.value || '',
        adminNombre: document.getElementById("nombreAdmin")?.value || '',
        adminCorreo: document.getElementById("correoAdmin")?.value || '',
        telefonoAdmin: telefonoAdminEl ? window.intlTelInputGlobals?.getInstance(telefonoAdminEl)?.getNumber() : null,
    };

    localStorage.setItem("datosPaso1", JSON.stringify(datos));
    console.log("Datos del Paso 1 guardados en localStorage:", datos);
}

// Restaurar datos del paso 1
function restaurarDatosPaso1() {
    const data = JSON.parse(localStorage.getItem("datosPaso1") || "{}");

    const campos = {
        nombreEmpresaInput: data.nombreEmpresa,
        correoEmpresa: data.correoEmpresa,
        sitioWeb: data.sitioWeb,
        nombreAdmin: data.adminNombre,
        correoAdmin: data.adminCorreo,
    };

    for (const [id, valor] of Object.entries(campos)) {
        const el = document.getElementById(id);
        if (el) el.value = valor || "";
    }

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

// Guardar datos del paso 2
function guardarDatosPaso2() {
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
    const ids = Array.from(equipoActual).map(el => el.dataset.id);
    sessionStorage.setItem("miEquipo", JSON.stringify(ids));
}

// Restaurar datos del paso 2
function restaurarDatosPaso2() {
    obtenerCategorias();
}

// Guardar datos del paso 3
function guardarDatosPaso3() {
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
    const miEquipoCompleto = Array.from(equipoActual).map(el => ({
        id: el.dataset.id,
        categoria: el.dataset.categoria,
        username: el.dataset.username
    }));

    localStorage.setItem("miEquipo", JSON.stringify(miEquipoCompleto));
    console.log("Datos del equipo guardados en localStorage:", miEquipoCompleto);
}

// Restaurar datos del paso 3
function restaurarDatosPaso3() {
    const equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]");
    equipo.forEach(({ id }) => {
        const cont = document.getElementById(`acciones-${id}`);
        if (cont) {
            marcarTecnicoComoAñadidoVisual(id, cont, true);
        }
    });
}

// Restaurar datos del paso 4
function restaurarDatosPaso4() {
    console.log("[restaurarDatosPaso4] Iniciando restauración de datos del Paso 4.");

    const datosPaso1 = JSON.parse(localStorage.getItem("datosPaso1") || "{}");
    const equipoGuardado = JSON.parse(localStorage.getItem("miEquipo") || "[]");
    const contenedor = document.getElementById("lista-integrantes-paso4");
    
    if (!contenedor) {
        console.error("[restaurarDatosPaso4] 'lista-integrantes-paso4' no encontrado.");
        return;
    }

    // Resto de la lógica para mostrar datos en el paso 4...
}

// Actualizar equipo en almacenamiento
function actualizarEquipoEnStorage(id, accion, categoria, username = '') {
    let equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]");
    const idx = equipo.findIndex(m => m.id == id);

    if (accion === 'agregar') {
        const nuevo = { id, categoria, username };
        if (idx === -1) equipo.push(nuevo);
        else equipo[idx] = nuevo;
    }
    else if (accion === 'eliminar' && idx !== -1) {
        equipo.splice(idx, 1);
    }

    localStorage.setItem("miEquipo", JSON.stringify(equipo));
}