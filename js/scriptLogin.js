// Credenciales únicas de inicio de sesión (de prueba)
const USUARIO_CORRECTO = "ptc2025@gmail.com";
const CONTRASENA_CORRECTA = "1234";

const form = document.getElementById("formLogin");
const correo = document.getElementById("inputEmail");
const contrasena = document.getElementById("inputPassword");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (correo.value === USUARIO_CORRECTO && contrasena.value === CONTRASENA_CORRECTA) {
        window.location.href = "primerUsoPasos.html";
    } else {
        alert("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
    }
});