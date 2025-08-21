import { obtenerCategorias, agregarCategoria, editarCategoria, eliminarCategoria, obtenerTecnicos, agregarTecnico, editarTecnico, eliminarTecnico, subirImagen } from "../services/serviceFirstUse.js";
import { validarPaso1, validarTelefonoIndividual, validarTelefonos } from "../utils/validacionesFirstUse.js";
import { guardarDatosPaso1, restaurarDatosPaso1, actualizarEquipoEnStorage } from "../utils/storageHelperFirstUse.js";

// ---------------- CONTROL DE PASOS ----------------
export function cargarPaso(paso) {
    document.querySelectorAll('.paso').forEach(div => div.style.display = 'none');
    const actual = document.getElementById(`paso${paso}`);
    if (actual) actual.style.display = 'block';
}

export function siguientePaso(paso) {
    if (paso === 1 && !validarPaso1()) return;
    cargarPaso(paso + 1);
}

export function anteriorPaso(paso) {
    cargarPaso(paso - 1);
}

export function cancelarPaso() {
    if (confirm("¿Seguro que deseas cancelar?")) {
        cargarPaso(1);
    }
}

// ---------------- CATEGORÍAS ----------------
export async function initPaso2() {
    const contenedor = document.getElementById("lista-categorias");
    if (!contenedor) return;

    try {
        const categorias = await obtenerCategorias();
        mostrarCategorias(categorias);
    } catch (e) {
        contenedor.innerHTML = `<p>Error al cargar categorías</p>`;
    }
}

function mostrarCategorias(categorias) {
    const contenedor = document.getElementById('lista-categorias');
    contenedor.innerHTML = "";
    categorias.forEach(cat => {
        const div = document.createElement("div");
        div.textContent = cat.nombreDepartamento;
        contenedor.appendChild(div);
    });
}

// ---------------- TÉCNICOS ----------------
export async function initPaso3() {
    const contenedor = document.getElementById("lista-tecnicos");
    if (!contenedor) return;

    try {
        const tecnicos = await obtenerTecnicos();
        mostrarTecnicos(tecnicos);
    } catch (e) {
        contenedor.innerHTML = `<p>Error al cargar técnicos</p>`;
    }
}

function mostrarTecnicos(tecnicos) {
    const contenedor = document.getElementById('lista-tecnicos');
    contenedor.innerHTML = "";
    tecnicos.forEach(tec => {
        const div = document.createElement("div");
        div.textContent = `${tec.nombre} - ${tec.telefono}`;
        contenedor.appendChild(div);
    });
}