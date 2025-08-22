// Constantes de API
const API_URL2 = "https://retoolapi.dev/mNwaIw/categorias";
const API_URL = "https://retoolapi.dev/bRqmHj/tecnicoData";
const IMG_API_URL = "https://api.imgbb.com/1/upload?key=2c2a83d4ddbff10c8af95b3159d53646";

// Servicios para categorías
export async function obtenerCategoriasAPI() {
    const response = await fetch(API_URL2);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
}

export async function agregarCategoriaAPI(nombre) {
    const response = await fetch(API_URL2, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreDepartamento: nombre })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
}

export async function editarCategoriaAPI(id, nombre) {
    const response = await fetch(`${API_URL2}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreDepartamento: nombre })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
}

export async function eliminarCategoriaAPI(id) {
    const response = await fetch(`${API_URL2}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
}

// Servicios para técnicos
export async function obtenerTecnicosAPI() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
}

export async function agregarTecnicoAPI(datosTecnico) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosTecnico)
    });
    if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
    return response.json();
}

export async function editarTecnicoAPI(id, datosTecnico) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosTecnico)
    });
    if (!response.ok) throw new Error("Error al actualizar el técnico");
    return response.json();
}

export async function eliminarTecnicoAPI(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("No se pudo eliminar el técnico.");
    return response.json();
}

// Servicio para subir imágenes
export async function subirImagenAPI(file) {
    const base64 = await toBase64(file);
    const formData = new FormData();
    formData.append("image", base64.split(",")[1]);
    
    const response = await fetch(IMG_API_URL, {
        method: "POST",
        body: formData
    });
    const data = await response.json();
    return data?.data?.url || "";
}

export function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}