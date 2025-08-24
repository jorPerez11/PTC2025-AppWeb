// Importaciones
import { 
    validarPaso1, 
    inicializarInputsTelefono 
} from '../utils/validacionesFirstUse.js';

import { 
    guardarDatosPaso1, 
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
                        restaurarDatosPaso1();
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

export async function siguientePaso() {
    if (pasoActualGlobal === 1) {
        if (!validarPaso1()) return;
        guardarDatosPaso1();
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
        }).then((result) => {
            if (!result.isConfirmed) return;

            Swal.fire({
                icon: 'success',
                title: '¡Enhorabuena!',
                html: `<p>Haz creado tu propio equipo.</p><p>puedes dirigirte al panel principal para gestionarlo</p>`,
                confirmButtonText: 'Ir al Inicio',
                confirmButtonColor: '#28a745'
            }).then(() => {
                window.location.href = './PlataformaWebInicio/PW_Inicio.html';
            });
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