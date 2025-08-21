export function guardarDatosPaso1() {
    const nombre = document.getElementById("nombreEmpresa").value.trim();
    const telefono = document.getElementById("telefonoEmpresa").value.trim();
    localStorage.setItem("nombreEmpresa", nombre);
    localStorage.setItem("telefonoEmpresa", telefono);
}

export function restaurarDatosPaso1() {
    const nombre = localStorage.getItem("nombreEmpresa") || "";
    const telefono = localStorage.getItem("telefonoEmpresa") || "";
    document.getElementById("nombreEmpresa").value = nombre;
    document.getElementById("telefonoEmpresa").value = telefono;
}

export function actualizarEquipoEnStorage(equipo) {
    let lista = JSON.parse(localStorage.getItem("equipos")) || [];
    lista.push(equipo);
    localStorage.setItem("equipos", JSON.stringify(lista));
}
