// Variables globales para almacenar las instancias de intlTelInput e IMask
// Hacemos que estas variables sean globales para que se puedan acceder desde getFormattedPhoneNumber.
let itiCompanyInstance = null;
let itiAdminInstance = null;
let companyPhoneMask = null;
let adminPhoneMask = null;

/**
 * Función central para aplicar la máscara IMask basada en el país seleccionado en intlTelInput.
 * @param {HTMLInputElement} inputElement - El input del teléfono (ej: #telefonoEmpresa).
 * @param {Object} itiInstance - La instancia de intlTelInput para el input.
 * @param {Object | null} currentMaskInstance - La instancia actual de IMask (para destruirla).
 * @returns {Object} La nueva instancia de IMask.
 */
function applyPhoneMask(inputElement, itiInstance, currentMaskInstance) {
    // Si la librería IMask no está disponible, salimos
    if (typeof IMask === 'undefined') {
        console.error("IMask no está cargado. Asegúrate de incluir la librería.");
        return null;
    }

    // 1. Obtiene el placeholder/formato de número local (ej: 7000 0000 o (55) 5555 5555)
    // Usamos 'mobile' ya que es el formato más común para contacto.
    let placeholder = itiInstance.getPlaceholderNumberType('mobile') || inputElement.placeholder;
    
    // Si el placeholder es el por defecto (ej: 800 123 4567), usamos el valor que el usuario ingresó 
    // y aplicamos una máscara genérica si no hay un placeholder útil.
    if (!placeholder || placeholder.includes('...')) {
        placeholder = '0000 0000 0000 000'; // Máscara genérica de 15 dígitos
    }
    
    // 2. Transforma el placeholder a un formato de máscara para IMask.
    // Reemplaza todos los dígitos por '0'. Los espacios, guiones, paréntesis se mantienen.
    const maskFormat = placeholder.replace(/\d/g, '0');

    // 3. Destruye la máscara anterior si existe
    if (currentMaskInstance && typeof currentMaskInstance.destroy === 'function'){
        currentMaskInstance.destroy();
    }
    
    // 4. Inicializa la nueva máscara
    const newMask = IMask(inputElement, {
        mask: maskFormat,
        lazy: false, // Muestra el formato de la máscara inmediatamente
        // Definimos un bloque para que solo se permitan dígitos en la posición '0'
        blocks: {
            '0': {
                mask: IMask.MaskedRange,
                from: 0,
                to: 9,
            }
        },
        overwrite: true,
        autofix: true,
    });
    
    return newMask;
}

/**
 * Inicializa intlTelInput y la máscara IMask para ambos inputs de teléfono.
 */
export function inicializarInputsTelefono() {
    const phoneCompanyInput = document.getElementById("telefonoEmpresa");
    const phoneAdminInput = document.getElementById("telefonoAdmin");

    // Salir si los inputs no están presentes o intlTelInput no está cargado
    if (!phoneCompanyInput || !phoneAdminInput || typeof window.intlTelInput !== "function") {
        return;
    }

    // 1. Inicialización si no se ha hecho
    if (!itiCompanyInstance) {
        const itiConfig = {
            preferredCountries: ["sv", "mx", "gt", "cr", "pa"],
            separateDialCode: true,
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js", 
        };

        // Inicializar instancias
        itiCompanyInstance = window.intlTelInput(phoneCompanyInput, itiConfig);
        itiAdminInstance = window.intlTelInput(phoneAdminInput, itiConfig);

        // 2. Definir manejador de eventos para aplicar la máscara
        const setupInput = (input, itiInstance, instanceName) => {
            const handler = function() {
                // Aplicar nueva máscara al cambiar el país
                const newMask = applyPhoneMask(input, itiInstance, (instanceName === 'company' ? companyPhoneMask : adminPhoneMask));
                
                // Actualizar la referencia global de la instancia de IMask
                if (instanceName === 'company') {
                    companyPhoneMask = newMask;
                } else {
                    adminPhoneMask = newMask;
                }
            };

            input.addEventListener("countrychange", handler);
            // Ejecutar una vez al inicio para aplicar la máscara inicial
            handler(); 
        };

        setupInput(phoneCompanyInput, itiCompanyInstance, 'company');
        setupInput(phoneAdminInput, itiAdminInstance, 'admin');

    } else {
        // Caso de recarga del paso: re-aplicar la máscara (en caso de que el valor haya cambiado)
        if (companyPhoneMask) companyPhoneMask.updateValueFromInput();
        if (adminPhoneMask) adminPhoneMask.updateValueFromInput();
    }
}

/**
 * Obtiene el número de teléfono formateado (+DialCode NúmeroLocalEnmascarado) para la API.
 * @param {string} type - 'company' o 'admin' para seleccionar las instancias correctas.
 * @returns {string} El número de teléfono formateado. Ej: "+503 1234 5678".
 */
export function getFormattedPhoneNumber(type) {
    let itiInstance, maskInstance;

    if (type === 'company') {
        itiInstance = itiCompanyInstance;
        maskInstance = companyPhoneMask;
    } else if (type === 'admin') {
        itiInstance = itiAdminInstance;
        maskInstance = adminPhoneMask;
    } else {
        return null; // Tipo no válido
    }

    // Si no tenemos las instancias (deberían estar siempre si se llamó a inicializarInputsTelefono), devolvemos null
    if (!itiInstance || !maskInstance) {
        console.warn(`Instancias de teléfono para ${type} no encontradas.`);
        // Devolvemos el valor crudo del input en caso de error
        const input = document.getElementById(type === 'company' ? 'telefonoEmpresa' : 'telefonoAdmin');
        return input ? input.value.trim() : null;
    }

    // El dial code (ej: +503)
    const dialCode = itiInstance.getSelectedCountryData().dialCode;
    
    // El valor que el usuario ha ingresado, ya limpio por IMask de cualquier carácter de máscara.
    const unmaskedNumber = maskInstance.unmaskedValue; 

    // Solo formateamos si hay un número ingresado
    if (unmaskedNumber) {
        // Concatenar en el formato deseado: +DialCode unmaskedNumber
        // Usamos el número sin máscara para evitar enviar caracteres como '-' o '()' a la API.
        return `+${dialCode}${unmaskedNumber}`;
    }

    return null; 
}

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

export function inicializarInputsTelefono() {
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
                
                input.dataset.intl = "true";
            } catch (error) {
                console.error('Error initializing intl-tel-input:', error);
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