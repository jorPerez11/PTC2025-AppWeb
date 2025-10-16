// Variable para almacenar las instancias de la máscara, una por cada input.
// Usamos un Map para manejar múltiples inputs.
const phoneMasks = new Map();

// Validaciones del Paso 1
export function validarPaso1() {
    let errores = [];

    const correoEmpresa = document.getElementById("correoEmpresa")?.value.trim();
    const telefonoEmpresaEl = document.getElementById("telefonoEmpresa");
    const telefonoEmpresa = telefonoEmpresaEl ? window.intlTelInputGlobals?.getInstance(telefonoEmpresaEl)?.getNumber() : null;
    const sitioWeb = document.getElementById("sitioWeb")?.value.trim();

    const adminNombre = document.getElementById("nombreAdmin")?.value.trim();
    const adminCorreo = document.getElementById("correoAdmin")?.value.trim();
    const telefonoAdminEl = document.getElementById("telefonoAdmin");
    const telefonoAdmin = telefonoAdminEl ? window.intlTelInputGlobals?.getInstance(telefonoAdminEl)?.getNumber() : null;

    if (!correoEmpresa) errores.push("El correo de empresa no puede estar vacío.");
    if (!telefonoEmpresa) errores.push("El teléfono de empresa es requerido.");
    if (!adminNombre) errores.push("El nombre del administrador es obligatorio.");
    if (!adminCorreo) errores.push("El correo del administrador no puede estar vacío.");
    if (!telefonoAdmin) errores.push("El teléfono del administrador es requerido.");

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

export function validarTelefonos() {
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

export function validarTelefonoIndividual(idInput) {
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

    const soloDigitos = valorInput.replace(/\D/g, '');
    const esValido = soloDigitos.length >= 7 && soloDigitos.length <= 15;

    input.classList.toggle("is-invalid", !esValido);

    return esValido;
}

// REEMPLAZA ESTA FUNCIÓN COMPLETA EN TU ARCHIVO
export function inicializarInputsTelefono() {
    // Selectores de los inputs de teléfono
    const inputs = ["#telefonoAdmin", "#telefonoEmpresa"];

    inputs.forEach(selector => {
        const phoneInput = document.querySelector(selector);

        // Verificar que el input exista, que intlTelInput esté cargado, y que no se haya inicializado antes.
        if (phoneInput && typeof window.intlTelInput === "function" && !phoneInput.dataset.intl) {
            try {
                // 1. Inicializa intl-tel-input
                window.intlTelInput(phoneInput, {
                    initialCountry: "sv",
                    preferredCountries: ["sv", "mx", "gt", "cr", "pa"],
                    separateDialCode: true,
                    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js",
                });

                // Marca el input como inicializado
                phoneInput.dataset.intl = "true";

                // Función para aplicar la máscara
                const applyMask = () => {
                    if (typeof window.IMask !== 'function') {
                        console.warn("IMask no está cargado. Reintentando...");
                        setTimeout(applyMask, 50); // Reintenta
                        return;
                    }

                    const placeholder = phoneInput.placeholder;

                    if (!placeholder) {
                        // Si el placeholder no está listo, reintenta después de un breve momento
                        setTimeout(applyMask, 100);
                        return;
                    }

                    // 2. Transforma el placeholder a un formato de máscara de IMask.
                    // Se reemplazan los dígitos (0-9) en el placeholder por '0'.
                    // Nota: Usamos el placeholder para obtener el formato local.
                    const maskFormat = placeholder.replace(/\d/g, '0');

                    let phoneMask = phoneMasks.get(selector);

                    if (phoneMask) {
                        phoneMask.destroy();
                    }

                    // 3. Aplica la nueva máscara
                    phoneMask = window.IMask(phoneInput, {
                        mask: maskFormat,
                        lazy: false,
                        // Limpia el valor en la máscara de caracteres fijos de IMask
                        commit: function (value, masked) {
                            masked._value = value.replace(/\s+/g, '').replace(/[\(\)\-\+]/g, '');
                        }
                    });

                    // Guarda la nueva instancia
                    phoneMasks.set(selector, phoneMask);
                };

                // Agrega el listener para cambiar la máscara al cambiar de país
                phoneInput.addEventListener("countrychange", applyMask);

                // Dispara el evento una vez para inicializar la máscara con el país por defecto
                requestAnimationFrame(() => {
                    phoneInput.dispatchEvent(new Event('countrychange'));
                });

            } catch (error) {
                console.error('Error initializing intl-tel-input or IMask:', error);
            }
        }
    });
}

export function obtenerTelefonoConPrefijo(idInput) {
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

export function formatearTelefonoParaMostrar(telefono) {
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