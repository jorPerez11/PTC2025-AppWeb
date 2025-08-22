// Funciones de almacenamiento para el Paso 1
export function guardarDatosPaso1() {
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

export function restaurarDatosPaso1() {
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

// Funciones de almacenamiento para el Paso 2
export function guardarDatosPaso2() {
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
    const ids = Array.from(equipoActual).map(el => el.dataset.id);
    sessionStorage.setItem("miEquipo", JSON.stringify(ids));
}

// Funciones de almacenamiento para el Paso 3
export function guardarDatosPaso3() {
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
    const miEquipoCompleto = Array.from(equipoActual).map(el => ({
        id: el.dataset.id,
        categoria: el.dataset.categoria,
        username: el.dataset.username
    }));
    
    localStorage.setItem("miEquipo", JSON.stringify(miEquipoCompleto));
    console.log("Datos del equipo guardados en localStorage:", miEquipoCompleto);
}

// Funciones de almacenamiento para el Paso 4
export function guardarDatosPaso4() {
    // Función para guardar datos del paso 4 si es necesario
}

// Funciones auxiliares
export function obtenerDatosPaso1() {
    return JSON.parse(localStorage.getItem("datosPaso1") || "{}");
}

export function obtenerEquipoGuardado() {
    return JSON.parse(localStorage.getItem("miEquipo") || "[]");
}