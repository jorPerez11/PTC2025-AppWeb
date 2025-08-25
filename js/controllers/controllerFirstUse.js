// Importaciones
import {
    validarPaso1,
    inicializarInputsTelefono
} from '../utils/validacionesFirstUse.js';

import {
    guardarPaso1EnAPI
} from '../services/serviceFirstUse.js';

import { deleteRecordsFromAPI, updateDataInAPI } from '../services/serviceFirstUse.js';

import { finalizarAdminSetupAPI } from '../services/serviceFirstUse.js';

import {
    restaurarDatosPaso1,
    guardarDatosPaso2,
    guardarDatosPaso3,
    guardarDatosPaso4
} from '../utils/storageHelperFirstUse.js';

import { initPaso2, restaurarDatosPaso2 } from './controllerPaso2.js';
import { initPaso3, restaurarDatosPaso3 } from './controllerPaso3.js';
import { restaurarDatosPaso4 } from './controllerPaso4.js';

// Variable global
export let pasoActualGlobal = 1;
export let companyId = null;
export let adminId = null;

// Funciones principales
export function actualizarIndicadorPaso() {
    document.querySelectorAll('.paso').forEach(p => p.classList.remove('activo'));
    const pasos = document.querySelectorAll('.paso');
    if (pasos[pasoActualGlobal - 1]) {
        pasos[pasoActualGlobal - 1].classList.add('activo');
    }
    console.log("Paso actual: " + pasoActualGlobal);
}

export function actualizarIndicadorPasoVisual() {
    document.querySelectorAll('.paso').forEach(p => p.classList.remove('activo'));
    const pasos = document.querySelectorAll('.paso');
    if (pasos[pasoActualGlobal - 1]) {
        pasos[pasoActualGlobal - 1].classList.add('activo');
    }
    console.log("Indicador actualizado para el Paso: " + pasoActualGlobal);
}

export function limpiarFormulario() {
    const contenedor = document.getElementById("contenido-dinamico");
    if (contenedor) {
        const formularios = contenedor.getElementsByTagName('form');
        for (let i = 0; i < formularios.length; i++) {
            formularios[i].reset();
        }
    } else {
        console.error(`Contenedor con ID 'contenido-dinamico' no encontrado para limpiar formularios.`);
    }
}

export function cargarPaso() {
    fetch(`pasosPrimerUso/paso${pasoActualGlobal}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById("contenido-dinamico").innerHTML = html;
            document.getElementById("paso-actual").textContent = pasoActualGlobal;
            actualizarIndicadorPasoVisual();

            setTimeout(() => {
                inicializarInputsTelefono();

                requestAnimationFrame(() => {
                    if (pasoActualGlobal === 1) {
                        cargarDatosPaso1();
                    }
                    if (pasoActualGlobal === 2) {
                        initPaso2();
                        setTimeout(() => {
                            restaurarDatosPaso2();
                        }, 500);
                    }
                    if (pasoActualGlobal === 3) {
                        initPaso3();
                    }
                    if (pasoActualGlobal === 4) {
                        restaurarDatosPaso4();
                    }
                });
            }, 0);
        });

    const btnAtras = document.getElementById("btn-atras");
    if (btnAtras) {
        btnAtras.style.display = pasoActualGlobal === 1 ? "none" : "inline-flex";
    }
}

export function cargarDatosPaso1() {
    // Obtener los datos de localStorage. Si no existen, inicializa un objeto vacío para evitar errores.
    const companyData = JSON.parse(localStorage.getItem('companyData') || '{}');
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

    // Rellenar los inputs de los datos de la compañía
    if (companyData.companyName) {
        document.getElementById("nombreEmpresa").value = companyData.companyName;
    }
    if (companyData.emailCompany) {
        document.getElementById("correoEmpresa").value = companyData.emailCompany;
    }
    if (companyData.contactPhone) {
        document.getElementById("telefonoEmpresa").value = companyData.contactPhone;
    }
    if (companyData.websiteUrl) {
        document.getElementById("sitioWeb").value = companyData.websiteUrl;
    }

    // Rellenar los inputs de los datos del administrador
    if (adminData.name) {
        document.getElementById("nombreAdmin").value = adminData.name;
    }
    if (adminData.username) {
        document.getElementById("adminUsername").value = adminData.username;
    }
    if (adminData.email) {
        document.getElementById("correoAdmin").value = adminData.email;
    }
    if (adminData.phone) {
        document.getElementById("telefonoAdmin").value = adminData.phone;
    }
    // No es necesario cargar la contraseña ya que no se guarda en localStorage por seguridad.
}

export function guardarDatosPaso1() {
    const companyData = obtenerDatosCompania();
    const adminData = obtenerDatosAdmin();

    // Guarda los datos en localStorage
    localStorage.setItem('companyData', JSON.stringify(companyData));
    localStorage.setItem('adminData', JSON.stringify(adminData));
}

export async function siguientePaso() {
    if (pasoActualGlobal === 1) {
        if (!validarPaso1()) {
            return;
        }

        guardarDatosPaso1();

        const companyData = obtenerDatosCompania();
        const adminData = obtenerDatosAdmin();
        const storedCompanyId = localStorage.getItem('companyId');
        const storedAdminId = localStorage.getItem('adminId');
        // Combina los datos de la compañía y del administrador en un solo objeto para simplificar
        const datosPaso1 = { ...companyData, ...adminData };

        // Guarda el objeto combinado en localStorage
        localStorage.setItem('datosPaso1', JSON.stringify(datosPaso1));

        // Obtener datos guardados o inicializar a un objeto vacío si no existen
        const savedCompanyData = JSON.parse(localStorage.getItem('companyData') || '{}');
        const savedAdminData = JSON.parse(localStorage.getItem('adminData') || '{}');

        try {
            // Caso 1: Es el primer registro o IDs no existen. Realiza un POST.
            if (!storedCompanyId || !storedAdminId) {
                const result = await guardarPaso1EnAPI(companyData, adminData);
                localStorage.setItem('companyId', result.company.id);
                localStorage.setItem('adminId', result.admin.id);
                localStorage.setItem('companyData', JSON.stringify(companyData));
                localStorage.setItem('adminData', JSON.stringify(adminData));

                // Avanza al siguiente paso.
                pasoActualGlobal++;
                cargarPaso();
                return;
            }

            // Caso 2: Compara los datos del formulario con los de localStorage.
            const companyDataChanged = JSON.stringify(companyData) !== JSON.stringify(savedCompanyData);
            const adminDataChanged = JSON.stringify(adminData) !== JSON.stringify(savedAdminData);

            if (!companyDataChanged && !adminDataChanged) {
                console.log("No se detectaron cambios. Avanzando al siguiente paso.");
                pasoActualGlobal++;
                cargarPaso();
                return;
            }

            // Caso 3: Si hay cambios, verifica si son en campos únicos.
            const uniqueCompanyChanged = companyData.emailCompany !== savedCompanyData.emailCompany;
            const uniqueAdminChanged = adminData.email !== savedAdminData.email || adminData.username !== savedAdminData.username;

            if (uniqueCompanyChanged || uniqueAdminChanged) {
                const confirmed = await Swal.fire({
                    title: 'Cambios en datos únicos',
                    text: "Cambiar un campo único implica eliminar el registro anterior para crear uno nuevo. ¿Desea continuar?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, continuar',
                    cancelButtonText: 'No, cancelar'
                }).then(res => res.isConfirmed);

                if (confirmed) {
                    // Elimina los registros anteriores y crea nuevos.
                    await deleteRecordsFromAPI(storedCompanyId, storedAdminId);
                    const result = await guardarPaso1EnAPI(companyData, adminData);

                    // Actualiza localStorage.
                    localStorage.setItem('companyId', result.company.id);
                    localStorage.setItem('adminId', result.admin.id);
                    localStorage.setItem('companyData', JSON.stringify(companyData));
                    localStorage.setItem('adminData', JSON.stringify(adminData));

                    pasoActualGlobal++;
                    cargarPaso();
                }
            } else {
                // Solo hay cambios en campos no únicos, haz PATCH.
                await updateDataInAPI('company', storedCompanyId, companyData);
                await updateDataInAPI('admin', storedAdminId, adminData);

                // Actualiza localStorage con los nuevos datos.
                localStorage.setItem('companyData', JSON.stringify(companyData));
                localStorage.setItem('adminData', JSON.stringify(adminData));

                pasoActualGlobal++;
                cargarPaso();
            }
        } catch (error) {
            console.error("Error al guardar en la API:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de registro',
                text: error.message,
                confirmButtonText: 'Entendido'
            });
            return;
        }
    }

    // Validación específica para el Paso 3
    if (pasoActualGlobal === 3) {
        try {
            // Importar el módulo del Paso 3 dinámicamente
            const { accionSiguientePaso } = await import('./controllerPaso3.js');

            // Ejecutar la validación específica del Paso 3
            const puedeAvanzar = await accionSiguientePaso();

            if (!puedeAvanzar) {
                return; // Detener si la validación falla
            }

            // Si la validación es exitosa, guardar datos y continuar
            guardarDatosPaso3();
        } catch (error) {
            console.error('Error al validar el paso 3:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de validación',
                text: 'No se pudo validar la información del equipo. Por favor, intente nuevamente.',
                confirmButtonText: 'Entendido'
            });
            return;
        }
    }

    if (pasoActualGlobal === 4) {
        Swal.fire({
            title: '¿Confirmar finalización?',
            text: 'Casi listo… ¿Deseas confirmar los datos para finalizar la creación?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            confirmButtonColor: '#28a745',
            cancelButtonText: 'Revisar',
            cancelButtonColor: '#dc3545'
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            // Muestra un cursor de espera
            document.body.style.cursor = 'wait';

            try {
                const adminId = localStorage.getItem('adminId');
                if (!adminId) {
                    throw new Error("El ID del administrador no se encontró. Por favor, vuelva a iniciar el proceso.");
                }

                const resultado = await finalizarAdminSetupAPI(adminId);
                console.log("Configuración finalizada exitosamente:", resultado);

                // Restaura el cursor a su estado normal en caso de éxito
                document.body.style.cursor = 'default';

                Swal.fire({
                    icon: 'success',
                    title: '¡Configuración completa!',
                    html: `
                        <p>La configuración de tu equipo ha finalizado.</p>
                        <p>Las credenciales de acceso han sido enviadas al correo electrónico del administrador.</p>
                        <p class="mt-3">Por favor, revisa tu bandeja de entrada y utiliza la contraseña temporal para iniciar sesión.</p>
                     `,
                    confirmButtonText: 'Ir a Iniciar Sesión',
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    localStorage.clear();
                    window.location.href = 'login.html';
                });

            } catch (error) {
                // Restaura el cursor a su estado normal en caso de error
                document.body.style.cursor = 'default';

                Swal.fire({
                    icon: 'error',
                    title: 'Error de finalización',
                    text: error.message
                });
                console.error("Error al finalizar la configuración:", error);
            }
        });
        return;
    }

    if (pasoActualGlobal === 2) guardarDatosPaso2();
    if (pasoActualGlobal === 4 && typeof guardarDatosPaso4 === 'function') guardarDatosPaso4();

    if (pasoActualGlobal < 4) {
        pasoActualGlobal++;
        cargarPaso();
    }
}

export function anteriorPaso() {
    if (pasoActualGlobal > 1) {
        pasoActualGlobal--;
        cargarPaso();
    }
}

function obtenerDatosCompania() {
    return {
        companyName: document.getElementById("nombreEmpresa")?.value.trim(),
        emailCompany: document.getElementById("correoEmpresa")?.value.trim(),
        contactPhone: document.getElementById("telefonoEmpresa")?.value.trim(),
        websiteUrl: document.getElementById("sitioWeb")?.value.trim()
    };
}

function obtenerDatosAdmin() {
    return {
        name: document.getElementById("nombreAdmin")?.value.trim(),
        username: document.getElementById("adminUsername")?.value.trim(),
        email: document.getElementById("correoAdmin")?.value.trim(),
        phone: document.getElementById("telefonoAdmin")?.value.trim(),
        password: document.getElementById("adminPassword")?.value.trim(),
        rolId: 3 // Asume el rol de administrador
    };
}

export function cancelarPaso() {
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

export function navegarAPaso(numeroPasoDestino) {
    const pasoInt = parseInt(numeroPasoDestino);

    if (pasoInt < 1 || pasoInt > 4) {
        console.error('Número de paso inválido:', pasoInt);
        return;
    }

    pasoActualGlobal = pasoInt;

    fetch(`pasosPrimerUso/paso${pasoActualGlobal}.html`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status} `);
            }
            return res.text();
        })
        .then(html => {
            document.getElementById("contenido-dinamico").innerHTML = html;
            document.getElementById("paso-actual").textContent = pasoActualGlobal;
            actualizarIndicadorPasoVisual();
            inicializarComponentesPaso(pasoActualGlobal);
            window.scrollTo({ top: 0, behavior: "smooth" });
            console.log(`Navegado al paso ${pasoActualGlobal} exitosamente`);
        })
        .catch(err => {
            console.error("Error al cargar paso:", err);
            Swal.fire({
                title: "Error",
                text: `No se pudo cargar el paso ${pasoActualGlobal}. Verifica que el archivo existe.`,
                icon: "error",
                confirmButtonText: "Entendido"
            });
        });
}

export function inicializarComponentesPaso(pasoActualGlobal) {
    fetch(`pasosPrimerUso/paso${pasoActualGlobal}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById("contenido-dinamico").innerHTML = html;
            document.getElementById("paso-actual").textContent = pasoActualGlobal;
            actualizarIndicadorPaso();

            setTimeout(() => {
                inicializarInputsTelefono();

                requestAnimationFrame(async () => {
                    if (pasoActualGlobal === 1) {
                        restaurarDatosPaso1();
                    }

                    if (pasoActualGlobal === 2) {
                        initPaso2();
                        setTimeout(() => {
                            restaurarDatosPaso2();
                        }, 500);
                    }

                    if (pasoActualGlobal === 3) {
                        await initPaso3(); // Asegúrate de que initPaso3 sea async
                        const { listaTecnicos } = await import('./controllerPaso3.js');
                        restaurarDatosPaso4(listaTecnicos);
                    }

                    if (pasoActualGlobal === 4) {
                        const { listaTecnicos } = await import('./controllerPaso3.js');
                        restaurarDatosPaso4(listaTecnicos);
                    }
                });
            }, 0);

            const btnAtras = document.getElementById("btn-atras");
            if (btnAtras) {
                btnAtras.style.display = pasoActualGlobal === 1 ? "none" : "inline-flex";
            }
        });
}

export function inicializarAplicacion() {
    cargarPaso();

    // Configurar event listeners para navegación entre pasos
    document.addEventListener("click", function (e) {
        const botonNavegar = e.target.closest("[data-navegar-paso]");
        if (botonNavegar) {
            const pasoDestino = botonNavegar.dataset.navegarPaso;
            navegarAPaso(pasoDestino);
            return;
        }

        const boton = e.target.closest("[data-paso]");
        if (boton) {
            const pasoDestino = boton.dataset.paso;
            navegarAPaso(pasoDestino);
        }
    });
}