// Utilidades para validaciones

// Validar paso 1
function validarPaso1() {
    let errores = [];

    const correoEmpresa = document.getElementById("correoEmpresa")?.value.trim();
    const telefonoEmpresaEl = document.getElementById("telefonoEmpresa");
    const telefonoEmpresa = telefonoEmpresaEl ? window.intlTelInputGlobals?.getInstance(telefonoEmpresaEl)?.getNumber() : null;
    const sitioWeb = document.getElementById("sitioWeb")?.value.trim();
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

// Validar teléfonos
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

// Validar teléfono individual
function validarTelefonoIndividual(idInput) {
    const input = document.getElementById(idInput);
    if (!input) {
        console.error(`Input no encontrado: ${idInput}`);
        return false;
    }

    const valorInput = input.value.trim();

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

    if (!/^[\d\s\-\(\)+]+$/.test(valorInput)) {
        Swal.fire({
            icon: "warning",
            title: "Teléfono inválido",
            text: "El número debe contener solo números, espacios, guiones o paréntesis.",
            confirmButtonText: "Revisar"
        });
        input.classList.add("is-invalid");
        return false;
    }

    const soloDigitos = valorInput.replace(/\D/g, '');
    const esValido = soloDigitos.length >= 7 && soloDigitos.length <= 15;

    input.classList.toggle("is-invalid", !esValido);

    return esValido;
}

// Obtener teléfono con prefijo
function obtenerTelefonoConPrefijo(idInput) {
    const input = document.getElementById(idInput);
    if (!input) {
        console.error(`Input no encontrado: ${idInput}`);
        return null;
    }

    const valorInput = input.value.trim();
    const iti = window.intlTelInputGlobals?.getInstance(input);
    let numeroFinal = null;

    if (iti) {
        try {
            const numeroCompleto = iti.getNumber();
            const paisSeleccionado = iti.getSelectedCountryData();

            if (numeroCompleto && numeroCompleto.trim() !== '') {
                numeroFinal = numeroCompleto.trim();
            } else if (paisSeleccionado && paisSeleccionado.dialCode) {
                const soloDigitos = valorInput.replace(/\D/g, '');
                numeroFinal = `+${paisSeleccionado.dialCode} ${soloDigitos}`;
            }
        } catch (error) {
            console.warn('Error con intlTelInput:', error);
        }
    }

    if (!numeroFinal && valorInput) {
        const soloDigitos = valorInput.replace(/\D/g, '');
        if (soloDigitos.length >= 7) {
            if (valorInput.startsWith('+')) {
                numeroFinal = valorInput;
            } else {
                numeroFinal = `+503 ${soloDigitos}`;
            }
        }
    }
    return numeroFinal;
}

// Formatear teléfono para mostrar
function formatearTelefonoParaMostrar(telefono) {
    if (!telefono) return "+503 0000-0000";

    if (telefono.startsWith('+')) {
        return telefono;
    }

    const soloDigitos = telefono.replace(/\D/g, '');
    if (soloDigitos.length >= 7) {
        return `+503 ${soloDigitos}`;
    }

    return telefono;
}

// Limpiar texto
function limpiarTexto(texto) {
    if (!texto) return "";

    return texto
        .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñüÜ'\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Formatear teléfono inteligentemente
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