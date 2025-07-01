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

            // Actualizar el indicador visual de pasos
            actualizarIndicadorPaso();

            // Mostrar u ocultar el botón Atrás según el paso
            const btnAtras = document.getElementById("btn-atras");
            if (paso === 1) {
                btnAtras.style.display = "none";
            } else {
                btnAtras.style.display = "inline-flex"; // o 'flex'
            }
        });
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
window.onload = cargarPaso();
