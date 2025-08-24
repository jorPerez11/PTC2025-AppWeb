// Constantes de API
const API_URL2 = "http://localhost:8080/api/firstuse/categorias";
const API_URL = "http://localhost:8080/api/firstuse/tecnicoData";
const IMG_API_URL = "https://api.imgbb.com/1/upload?key=2c2a83d4ddbff10c8af95b3159d53646";
const API_TECNICOS_PENDIENTES = "http://localhost:8080/api/firstuse/tecnicos-pendientes";
const API_ASIGNAR_CATEGORIA = "http://localhost:8080/api/firstuse/tecnicos";

export async function obtenerCategoriasAPI() {
    const response = await fetch(API_URL2);
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
}

export async function agregarCategoriaAPI(nombre) {
    const response = await fetch(API_URL2, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreDepartamento: nombre })
    });
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
}

export async function editarCategoriaAPI(id, nombre) {
    const response = await fetch(`${API_URL2}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreDepartamento: nombre })
    });
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
}

// En tu archivo serviceFirstUse.js
export async function eliminarCategoriaAPI(id) {
    try {
        console.log("Enviando DELETE para categoría:", id);
        const response = await fetch(`${API_URL2}/${id}`, { 
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log("Respuesta recibida, status:", response.status);
        
        const responseText = await response.text();
        console.log("Contenido de la respuesta:", responseText);
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Respuesta inválida del servidor: ${responseText}`);
        }
        
        if (!response.ok) {
            throw new Error(responseData.error || `Error del servidor: ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error("Error en eliminarCategoriaAPI:", error);
        throw error;
    }
}

// Servicio para agregar un técnico en estado "pendiente"
export async function agregarTecnicoPendienteAPI(datosTecnico) {
    const response = await fetch(API_TECNICOS_PENDIENTES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosTecnico)
    });

    const responseText = await response.text();

    if (!response.ok) {
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
            errorMsg = responseText || errorMsg;
        }
        throw new Error(errorMsg);
    }

    return JSON.parse(responseText);
}

// Servicio para asignar una categoría a un técnico pendiente y activarlo
export async function asignarCategoriaYActivarTecnicoAPI(id, categoryId) {
    const response = await fetch(`${API_ASIGNAR_CATEGORIA}/${id}/asignar-categoria`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: categoryId })
    });
    
    const responseText = await response.text();

    if (!response.ok) {
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
            errorMsg = responseText || errorMsg;
        }
        throw new Error(errorMsg);
    }
    
    return JSON.parse(responseText);
}

// Servicios para técnicos
export async function obtenerTecnicosAPI() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
}

export async function agregarTecnicoAPI(datosTecnico) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosTecnico)
    });
    // Leer la respuesta como texto primero
    const responseText = await response.text();

    if (!response.ok) {
        // Intentar parsear como JSON si es posible
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
            errorMsg = responseText || errorMsg;
        }
        throw new Error(errorMsg);
    }

    if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
    return response.json();
}

export async function editarTecnicoAPI(id, datosTecnico) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosTecnico)
    });
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error("Error al actualizar el técnico");
    return response.json();
}

export async function eliminarTecnicoAPI(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
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