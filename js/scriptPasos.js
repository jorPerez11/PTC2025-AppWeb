let paso = 1;

function actualizarIndicadorPaso() {
    // Remover clase 'activo' de todos los pasos
    document.querySelectorAll('.paso').forEach(p => p.classList.remove('activo'));

    // Agregar clase 'activo' al paso actual
    const pasos = document.querySelectorAll('.paso');
    if (pasos[paso - 1]) {
        pasos[paso - 1].classList.add('activo');
    }
}

function cargarPaso() {
    fetch(`pasosPrimerUso/paso${paso}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById("contenido-dinamico").innerHTML = html;
            document.getElementById("paso-actual").textContent = paso;
            actualizarIndicadorPaso();
            setTimeout(() => {
                inicializarInputsTelefono();
            }, 0);
        });

    // Mostralo u ocultalo de inmediato, sin depender del fetch
    const btnAtras = document.getElementById("btn-atras");
    if (btnAtras) {
        btnAtras.style.display = paso === 1 ? "none" : "inline-flex";
    }
}

function inicializarInputsTelefono() {
    const inputs = ["#telefonoAdmin", "#telefonoEmpresa"];
    inputs.forEach(selector => {
        const input = document.querySelector(selector);
        if (input && typeof window.intlTelInput === "function") {
            const iti = window.intlTelInput(input, {
                initialCountry: "sv",
                preferredCountries: ["sv", "mx", "co"],
                separateDialCode: true,
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js"
            });

            // Guardamos la instancia en el input para futuras consultas
            input.dataset.intl = "true"; // solo como marca para no repetir
        }
    });
}


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
/* 
const telefonoEmpresa = window.intlTelInputGlobals.getInstance(
  document.querySelector("#telefonoEmpresa")
)?.getNumber();

const telefonoAdmin = window.intlTelInputGlobals.getInstance(
  document.querySelector("#telefonoAdmin")
)?.getNumber();

console.log("Empresa:", telefonoEmpresa);
console.log("Admin:", telefonoAdmin); */

function siguientePaso() {
    if (!validarTelefonos()) {
        return;
    }

    const inputEmpresa = document.querySelector("#telefonoEmpresa");
    const inputAdmin = document.querySelector("#telefonoAdmin");

    const telefonoEmpresa = window.intlTelInputGlobals.getInstance(inputEmpresa)?.getNumber();
    const telefonoAdmin = window.intlTelInputGlobals.getInstance(inputAdmin)?.getNumber();

    console.log("Empresa:", telefonoEmpresa);
    console.log("Admin:", telefonoAdmin);

    if (paso < 3) {
        paso++;
        cargarPaso();
    }
}

function siguientePaso() {
    if (paso < 3) {
        paso++;
        cargarPaso();
    }
}

function anteriorPaso() {
    if (paso > 1) {
        paso--;
        cargarPaso();
    }
}

function cancelarPaso() {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Si cancelás ahora, se perderán los datos ingresados.",
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
}

// Carga inicial
document.addEventListener('DOMContentLoaded', () => {
    cargarPaso();
});

