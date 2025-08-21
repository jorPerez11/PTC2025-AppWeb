// Servicios para APIs

// URLs de las APIs
const API_URL2 = "https://retoolapi.dev/mNwaIw/categorias";
const API_URL = "https://retoolapi.dev/bRqmHj/tecnicoData";
const IMG_API_URL = "https://api.imgbb.com/1/upload?key=2c2a83d4ddbff10c8af95b3159d53646";

// Obtener categorías
async function obtenerCategorias() {
    const contenedor = document.getElementById("lista-categorias");
    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando categorías...</span>
            </div>
            <p class="mt-2 text-muted">Cargando categorías...</p>
        </div>
    `;

    try {
        const response = await fetch(API_URL2);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
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
        throw error;
    }
}

// Agregar categoría
async function agregarCategoria(nombre) {
    try {
        const response = await fetch(API_URL2, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombreDepartamento: nombre
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al agregar categoría:', error);
        throw error;
    }
}

// Editar categoría
async function editarCategoria(id, nombre) {
    try {
        const response = await fetch(`${API_URL2}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombreDepartamento: nombre
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al editar categoría:', error);
        throw error;
    }
}

// Eliminar categoría
async function eliminarCategoria(id) {
    try {
        const response = await fetch(`${API_URL2}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        throw error;
    }
}

// Obtener técnicos
async function obtenerTecnicos() {
    const contenedor = document.getElementById("lista-tecnicos");
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando técnicos...</span>
            </div>
            <p class="mt-2 text-muted">Cargando técnicos...</p>
        </div>
    `;

    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los técnicos. Por favor, intenta nuevamente.
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="obtenerTecnicos()">
                    Reintentar
                </button>
            </div>
        `;
        throw error;
    }
}

// Agregar técnico
async function agregarTecnico(nombre, correo, telefono, archivoFoto) {
    try {
        let urlFoto = "";
        if (archivoFoto) {
            urlFoto = await subirImagen(archivoFoto);
        }

        const nuevoTecnico = {
            Nombre: nombre,
            "Correo Electrónico": correo,
            "Número de tel.": telefono,
            Foto: urlFoto
        };

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoTecnico)
        });

        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error al agregar técnico:", error);
        throw error;
    }
}

// Editar técnico
async function editarTecnico(id, nombre, correo, telefono, archivoFoto, fotoActual) {
    try {
        let urlFinal = fotoActual;
        if (archivoFoto) {
            urlFinal = await subirImagen(archivoFoto);
        }

        const actualizado = {
            Nombre: nombre,
            "Correo Electrónico": correo,
            "Número de tel.": telefono,
            Foto: urlFinal
        };

        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actualizado)
        });

        if (!res.ok) {
            throw new Error("Error al actualizar el técnico");
        }

        return await res.json();
    } catch (error) {
        console.error("Error al editar técnico:", error);
        throw error;
    }
}

// Eliminar técnico
async function eliminarTecnico(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("No se pudo eliminar el técnico.");
        }

        return await response.json();
    } catch (error) {
        console.error("Error al eliminar técnico:", error);
        throw error;
    }
}

// Subir imagen
async function subirImagen(file) {
    try {
        const base64 = await toBase64(file);
        const formData = new FormData();
        formData.append("image", base64.split(",")[1]);

        const res = await fetch(IMG_API_URL, {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        return data?.data?.url || "";
    } catch (error) {
        console.error("Error al subir imagen:", error);
        return "";
    }
}

// Convertir a Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}