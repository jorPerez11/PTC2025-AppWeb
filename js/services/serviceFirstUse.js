const API_CATEGORIAS = "https://retoolapi.dev/mNwaIw/categorias";
const API_TECNICOS = "https://retoolapi.dev/FQPNJ7/tecnicos";

// --------- CATEGORÍAS ----------
export async function obtenerCategorias() {
    const res = await fetch(API_CATEGORIAS);
    if (!res.ok) throw new Error("Error al cargar categorías");
    return await res.json();
}

export async function agregarCategoria(nombre) {
    const res = await fetch(API_CATEGORIAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreDepartamento: nombre })
    });
    return await res.json();
}

export async function editarCategoria(id, nombre) {
    const res = await fetch(`${API_CATEGORIAS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreDepartamento: nombre })
    });
    return await res.json();
}

export async function eliminarCategoria(id) {
    return await fetch(`${API_CATEGORIAS}/${id}`, { method: "DELETE" });
}

// --------- TÉCNICOS ----------
export async function obtenerTecnicos() {
    const res = await fetch(API_TECNICOS);
    if (!res.ok) throw new Error("Error al cargar técnicos");
    return await res.json();
}

export async function agregarTecnico(tecnico) {
    const res = await fetch(API_TECNICOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tecnico)
    });
    return await res.json();
}

export async function editarTecnico(id, tecnico) {
    const res = await fetch(`${API_TECNICOS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tecnico)
    });
    return await res.json();
}

export async function eliminarTecnico(id) {
    return await fetch(`${API_TECNICOS}/${id}`, { method: "DELETE" });
}

export async function subirImagen(file) {
    const formData = new FormData();
    formData.append("imagen", file);

    const res = await fetch("/upload", {
        method: "POST",
        body: formData
    });
    return await res.json();
}
