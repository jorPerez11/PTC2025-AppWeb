// Controlador principal para el flujo de primer uso

// Variable global que almacena el paso actual
let pasoActualGlobal = 1;

// Función principal para cargar el contenido de cada paso
function cargarPaso() {
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

// Función para actualizar el indicador visual del paso actual
function actualizarIndicadorPasoVisual() {
    document.querySelectorAll('.paso').forEach(p => p.classList.remove('activo'));
    const pasos = document.querySelectorAll('.paso');
    if (pasos[pasoActualGlobal - 1]) {
        pasos[pasoActualGlobal - 1].classList.add('activo');
    }
    console.log("Indicador actualizado para el Paso: " + pasoActualGlobal);
}

// Función para limpiar formularios
function limpiarFormulario() {
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

// Función para avanzar al siguiente paso
function siguientePaso() {
    if (pasoActualGlobal === 1) {
        if (!validarPaso1()) return;
        guardarDatosPaso1();
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
                html: `
          <p>Haz creado tu propio equipo.</p>
          <p>puedes dirigirte al panel principal para gestionarlo</p>
        `,
                confirmButtonText: 'Ir al Inicio',
                confirmButtonColor: '#28a745'
            }).then(() => {
                window.location.href = './PlataformaWebInicio/PW_Inicio.html';
            });
        });

        return;
    }

    if (pasoActualGlobal === 2) guardarDatosPaso2();
    if (pasoActualGlobal === 3) guardarDatosPaso3();

    if (pasoActualGlobal < 4) {
        pasoActualGlobal++;
        cargarPaso();
    }
}

// Función para retroceder al paso anterior
function anteriorPaso() {
    if (pasoActualGlobal > 1) {
        pasoActualGlobal--;
        cargarPaso();
    }
}

// Función para cancelar el proceso
function cancelarPaso() {
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

// Función para navegar a un paso específico
function navegarAPaso(numeroPasoDestino) {
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

// Inicializar componentes específicos de cada paso
function inicializarComponentesPaso(pasoActualGlobal) {
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
}

// Carga inicial
document.addEventListener('DOMContentLoaded', () => {
    cargarPaso();
});

// Event listener para botones de navegación
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