export function validarPaso1() {
    const nombre = document.getElementById("nombreEmpresa").value.trim();
    const telefono = document.getElementById("telefonoEmpresa").value.trim();

    if (!nombre) {
        alert("El nombre es obligatorio");
        return false;
    }
    if (!validarTelefonoIndividual(telefono)) {
        alert("Teléfono inválido");
        return false;
    }
    return true;
}

export function validarTelefonoIndividual(telefono) {
    return /^[0-9]{8}$/.test(telefono);
}

export function validarTelefonos(lista) {
    return lista.every(tel => validarTelefonoIndividual(tel));
}