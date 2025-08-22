// Importaciones
import { 
    obtenerCategoriasAPI, 
    agregarCategoriaAPI, 
    editarCategoriaAPI, 
    eliminarCategoriaAPI 
} from '../services/serviceFirstUse.js';

// Variables globales
let categorias = [];

// Funciones específicas del Paso 2
export function initPaso2() {
    const contenedor = document.getElementById("lista-categorias");
    if (!contenedor) return;
    
    obtenerCategorias();
    configurarEventos();
    
    const btnFlotante = document.getElementById("btnFlotanteAgregar");
    if (btnFlotante) btnFlotante.style.display = "block";
}

export async function obtenerCategorias() {
    const contenedor = document.getElementById("lista-categorias");
    if (!contenedor) return;
    
    contenedor.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando categorías...</span>
            </div>
            <p class="mt-2 text-muted">Cargando categorías...</p>
        </div>
    `;
    
    try {
        const data = await obtenerCategoriasAPI();
        categorias = data;
        mostrarCategorias(data);
    } catch (error) {
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error al cargar las categorías. Por favor, intenta nuevamente.
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="obtenerCategorias()">
                    <i class="fas fa-redo me-1"></i>Reintentar
                </button>
            </div>
        `;
    }
}

export function mostrarCategorias(categorias) {
    const contenedor = document.getElementById('lista-categorias');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (!categorias || categorias.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-warning text-center">
                <i class="fas fa-info-circle me-2"></i>
                No hay categorías registradas. ¡Agrega la primera!
            </div>
        `;
        return;
    }
    
    categorias.forEach(categoria => {
        const card = document.createElement('div');
        card.className = 'card shadow-sm mb-3';
        card.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title mb-1">
                        <i class="bi bi-collection-fill text-info"></i>
                        ${categoria.nombreDepartamento || categoria.nombreCategoria || 'Sin nombre'}
                    </h5>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-primary btn-editar" 
                            data-id="${categoria.id}" 
                            data-nombre="${categoria.nombreDepartamento || categoria.nombreCategoria || ''}"
                            title="Editar categoría">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger btn-eliminar" 
                            data-id="${categoria.id}" 
                            data-nombre="${categoria.nombreDepartamento || categoria.nombreCategoria || ''}"
                            title="Eliminar categoría">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
    
    asignarEventosBotones();
}

export function asignarEventosBotones() {
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-editar');
            const id = button.dataset.id;
            const nombre = button.dataset.nombre;
            abrirModalEditar(id, nombre);
        });
    });
    
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-eliminar');
            const id = button.dataset.id;
            const nombre = button.dataset.nombre;
            eliminarCategoria(id, nombre);
        });
    });
}

export function abrirModalAgregar() {
    const modal = document.getElementById('modal-agregarcat');
    const input = document.getElementById('nombre');
    
    if (modal && input) {
        input.value = '';
        modal.showModal();
        input.focus();
    }
}

export function abrirModalEditar(id, nombre) {
    const modal = document.getElementById('modal-editarcat');
    const inputId = document.getElementById('idEditar');
    const inputNombre = document.getElementById('nombreEditar');
    
    if (modal && inputId && inputNombre) {
        inputId.value = id;
        inputNombre.value = nombre;
        modal.showModal();
        inputNombre.focus();
    }
}

export function cerrarModales() {
    const modalAgregar = document.getElementById('modal-agregarcat');
    const modalEditar = document.getElementById('modal-editarcat');
    
    if (modalAgregar) modalAgregar.close();
    if (modalEditar) modalEditar.close();
}

export async function agregarCategoria(nombre) {
    try {
        await agregarCategoriaAPI(nombre);
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Categoría agregada correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        }
        
        obtenerCategorias();
        cerrarModales();
    } catch (error) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al agregar categoría'
            });
        }
    }
}

export async function editarCategoria(id, nombre) {
    try {
        await editarCategoriaAPI(id, nombre);
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Categoría actualizada correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        }
        
        obtenerCategorias();
        cerrarModales();
    } catch (error) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar categoría'
            });
        }
    }
}

export async function eliminarCategoria(id, nombre) {
    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la categoría "${nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) return;
    }
    
    try {
        await eliminarCategoriaAPI(id);
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'Categoría eliminada correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        }
        
        obtenerCategorias();
    } catch (error) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al eliminar categoría'
            });
        }
    }
}

export function filtrarCategorias(termino) {
    const terminoLower = termino.toLowerCase();
    const categoriasFiltradas = categorias.filter(categoria => {
        const nombre = categoria.nombreDepartamento || categoria.nombreCategoria || '';
        return nombre.toLowerCase().includes(terminoLower);
    });
    
    mostrarCategorias(categoriasFiltradas);
}

export function configurarEventos() {
    const btnFlotante = document.getElementById('btnFlotanteAgregar');
    if (btnFlotante) btnFlotante.addEventListener('click', abrirModalAgregar);
    
    const frmAgregar = document.getElementById('frmAgregar');
    if (frmAgregar) {
        frmAgregar.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value.trim();
            if (nombre) agregarCategoria(nombre);
        });
    }
    
    const frmEditar = document.getElementById('frmEditar');
    if (frmEditar) {
        frmEditar.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('idEditar').value;
            const nombre = document.getElementById('nombreEditar').value.trim();
            if (id && nombre) editarCategoria(id, nombre);
        });
    }
    
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const btnCerrarEditar = document.getElementById('btnCerrarEditar');
    
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModales);
    if (btnCerrarEditar) btnCerrarEditar.addEventListener('click', cerrarModales);
    
    const inputBusqueda = document.getElementById('busquedaDepartamento');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const termino = e.target.value.trim();
            if (termino === '') mostrarCategorias(categorias);
            else filtrarCategorias(termino);
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModales();
    });
}

export function guardarDatosPaso2() {
    const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
    const ids = Array.from(equipoActual).map(el => el.dataset.id);
    sessionStorage.setItem("miEquipo", JSON.stringify(ids));
}

export function restaurarDatosPaso2() {
    obtenerCategorias();
}