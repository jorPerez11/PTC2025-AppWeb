// Importaciones
import {
  obtenerTecnicosAPI,
  agregarTecnicoAPI,
  editarTecnicoAPI,
  eliminarTecnicoAPI,
  subirImagenAPI,
  agregarTecnicoPendienteAPI,
  asignarCategoriaYActivarTecnicoAPI,
  obtenerCategoriasAPI
} from '../services/serviceFirstUse.js';

import {
  validarTelefonoIndividual,
  obtenerTelefonoConPrefijo,
  formatearTelefonoParaMostrar
} from '../utils/validacionesFirstUse.js';

import { companyId, adminId } from './controllerFirstUse.js';

// Variables globales
let listaTecnicos = [];
let tecnicosAgregados = [];
let listaCategorias = [];
let miEquipo = [];
let IMaskLib = null; // Variable para almacenar la referencia a IMask

// 🛑 ¡FALTABA ESTA DECLARACIÓN!
// Almacena las instancias de intlTelInput para evitar reinicializarlas
const intlTelInputInstances = new Map();
// Variable para almacenar las instancias de la máscara, una por cada input.
// Usamos un Map para manejar múltiples inputs.
const phoneMasks = new Map();

// Funciones específicas del Paso 3
export async function initPaso3() {
  const contenedor = document.getElementById("lista-tecnicos");
  if (!contenedor) {
    console.warn("No se encontró el contenedor de lista-tecnicos");
    return;
  }

  obtenerCategorias3()
    .then(() => obtenerTecnicos())
    .then(() => {
      restaurarDatosPaso3();
      configurarEventosModales();
      console.log("Paso 3 inicializado y estado de técnicos restaurado.");
    })
    .catch(error => {
      console.error("Error en la inicialización del Paso 3:", error);
      Swal.fire({
        title: "Error de Carga",
        text: "No se pudieron cargar los técnicos o las categorías.",
        icon: "error",
        confirmButtonText: "Entendido"
      });
    });

  const btnFlotante = document.getElementById("btnFlotanteAgregar");
  if (btnFlotante) {
    btnFlotante.style.display = "block";
    btnFlotante.addEventListener("click", () => {
      const modal = document.getElementById("modal-agregar");
      if (modal) modal.showModal();
    });
  }

  listaTecnicos = Array.from(
    document.getElementById("lista-tecnicos")
  );
}

export async function obtenerCategorias3() {
  try {
    listaCategorias = await obtenerCategoriasAPI();
    localStorage.setItem("listaCategorias", JSON.stringify(listaCategorias));
    cargarCategoriasEnDropdown();
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    listaCategorias = [
      { id: 1, nombre: "Supervisor" },
      { id: 2, nombre: "Técnico Senior" },
      { id: 3, nombre: "Técnico Junior" },
      { id: 4, nombre: "Especialista" }
    ];
    localStorage.setItem("listaCategorias", JSON.stringify(listaCategorias));
    cargarCategoriasEnDropdown();
  }
}

export function cargarCategoriasEnDropdown() {
  const dropdown = document.getElementById("categoriaDropdown");
  if (!dropdown) {
    console.warn("Elemento 'categoriaDropdown' no encontrado en el DOM.");
    return;
  }

  dropdown.innerHTML = '<option value="">Selecciona una categoría</option>';

  listaCategorias.forEach(categoria => {
    const option = document.createElement("option");
    option.value = categoria.id;
    option.textContent = categoria.nombreDepartamento;
    dropdown.appendChild(option);
  });
}

export function mostrarDatos(tecnicos) {
  console.log("%c[DEBUG mostrarDatos] INICIANDO RENDERIZADO DE TECNICOS", 'background: #FFD700; color: black; font-weight: bold;');
  const contenedor = document.getElementById("lista-tecnicos");
  if (!contenedor) return;

  if (!tecnicos || tecnicos.length === 0) {
    contenedor.innerHTML = `
            <div class="alert alert-warning text-center">
                No hay técnicos disponibles.
            </div>
        `;
    return;
  }

  contenedor.innerHTML = "";

  if (!document.getElementById("busquedaTecnico")) {
    const buscadorContainer = document.createElement("div");
    buscadorContainer.className = "mb-4";
    buscadorContainer.innerHTML = `
            <div class="input-group">
                <input type="text" id="busquedaTecnico" class="form-control" 
                       placeholder="Buscar por nombre, correo o teléfono...">
                <button class="btn btn-outline-secondary" type="button" id="btnBuscar">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        `;
    contenedor.appendChild(buscadorContainer);
  }

  const headers = document.createElement("div");
  headers.className = "row align-items-center mb-2 px-2 headers-tecnico";
  headers.innerHTML = `
        <div class="col-auto text-center">Técnico</div>
        <div class="col text-end">Nombre</div>
        <div class="col text-end">Correo</div>
        <div class="col text-end">Teléfono</div>
        <div class="col text-end">Acciones</div>
    `;

  contenedor.appendChild(headers);

  const equipoActual = JSON.parse(localStorage.getItem("miEquipo") || "[]");
  console.log("Equipo actual al renderizar:", equipoActual);

  tecnicos.forEach((tecnico) => {
    // SIEMPRE usar la imagen por defecto, ignorando cualquier foto existente
    const imgSrc = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const nombreLimpio = limpiarTexto(tecnico.Nombre);
    const telefonoFormateado = formatearTelefonoInteligente(tecnico["Número de tel."]);

    const fila = document.createElement("div");
    fila.className = "row align-items-center py-2 px-2 shadow-sm border rounded mb-2 bg-white tecnico-fila";
    fila.setAttribute("data-id", tecnico.id);
    fila.innerHTML = `
            <div class="col-auto d-flex justify-content-center align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <img src="${imgSrc}" 
                     alt="Foto de ${nombreLimpio}" 
                     class="rounded-circle foto-tecnico"
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
            </div>
            
            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 fw-semibold nombre-tecnico">
                    ${nombreLimpio || "Sin nombre"}
                </div>
            </div>
            
            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 text-muted small correo-tecnico">
                    ${tecnico["Correo Electrónico"] || tecnico["Correo Elect."] || "Sin correo"}
                </div>
            </div>
            
            <div class="col d-flex align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="w-100 text-muted small telefono-tecnico">
                    ${telefonoFormateado}
                </div>
            </div>
            
            <div class="col d-flex justify-content-end align-items-center" style="min-height: clamp(48px, 4vw, 64px);">
                <div class="d-flex flex-column align-items-end gap-2" id="acciones-${tecnico.id}">
                    <button class="btn btn-sm btn-accion añadir" data-id="${tecnico.id}" title="Añadir al equipo">
                        <i class="bi bi-person-plus-fill me-1"></i> Añadir al equipo
                    </button>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-accion editar" data-id="${tecnico.id}" title="Editar">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-accion eliminar" data-id="${tecnico.id}" title="Eliminar">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

    contenedor.appendChild(fila);

    const miembroEquipo = equipoActual.find(miembro => miembro.id === tecnico.id);
    const contenedorAcciones = document.getElementById(`acciones-${tecnico.id}`);

    if (miembroEquipo && contenedorAcciones) {
      console.log(`Restaurando técnico ${tecnico.id} inmediatamente`);
      marcarTecnicoComoAñadidoVisual(tecnico.id, contenedorAcciones, true);
    }

    if (!miembroEquipo) {
      const editarBtn = fila.querySelector(".editar");
      const eliminarBtn = fila.querySelector(".eliminar");
      const añadirBtn = fila.querySelector(".añadir");

      if (editarBtn) {
        editarBtn.addEventListener("click", () => {
          AbrirModalEditar(
            tecnico.id,
            tecnico.Nombre,
            tecnico["Correo Electrónico"] || tecnico["Correo Elect."],
            tecnico["Número de tel."],
            tecnico.Foto
          );
        });
      }

      if (eliminarBtn) {
        eliminarBtn.addEventListener("click", () => {
          Swal.fire({
            title: `¿Eliminar a ${tecnico.Nombre}?`,
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
          }).then(result => {
            if (result.isConfirmed) {
              eliminarTecnico(tecnico.id);
            }
          });
        });
      }

      if (añadirBtn) {
        añadirBtn.addEventListener("click", () => {
          abrirModalAgregarEquipo(tecnico);
        });
      }
    }
  });

  setTimeout(() => {
    inicializarBuscadorDeTecnicos();
  }, 100);
}

export function formatearTelefonoInteligente(telefono) {
  if (!telefono) return "Teléfono no disponible";

  const originalTelefono = telefono.toString().trim();
  const esInternacional = originalTelefono.startsWith('+');
  let soloDigitos = originalTelefono.replace(/\D/g, '');

  let codigoPais = "";
  let numero = "";

  if (esInternacional) {
    if (soloDigitos.startsWith("503")) {
      codigoPais = "+503";
      numero = soloDigitos.substring(3);
    } else if (soloDigitos.startsWith("52")) {
      codigoPais = "+52";
      numero = soloDigitos.substring(2);
    } else if (soloDigitos.startsWith("57")) {
      codigoPais = "+57";
      numero = soloDigitos.substring(2);
    } else if (soloDigitos.startsWith("1")) {
      codigoPais = "+1";
      numero = soloDigitos.substring(1);
    } else if (soloDigitos.startsWith("593")) {
      codigoPais = "+593";
      numero = soloDigitos.substring(3);
    } else {
      return originalTelefono;
    }
  } else {
    if (soloDigitos.length === 8) {
      codigoPais = "+503";
      numero = soloDigitos;
    } else {
      return originalTelefono;
    }
  }

  switch (codigoPais) {
    case '+503':
      if (numero.length === 8) return `${codigoPais} ${numero.substring(0, 4)}-${numero.substring(4)}`;
      break;
    case '+52':
      if (numero.length === 10) return `${codigoPais} ${numero.substring(0, 2)} ${numero.substring(2, 6)} ${numero.substring(6)}`;
      break;
    case '+57':
      if (numero.length === 10) return `${codigoPais} ${numero.substring(0, 3)} ${numero.substring(3, 6)} ${numero.substring(6)}`;
      break;
    case '+1':
      if (numero.length === 10) return `${codigoPais} (${numero.substring(0, 3)}) ${numero.substring(3, 6)}-${numero.substring(6)}`;
      break;
    case '+593':
      if (numero.length === 9 && numero.startsWith('9')) {
        return `${codigoPais} ${numero.substring(0, 3)} ${numero.substring(3, 6)} ${numero.substring(6)}`;
      } else if (numero.length === 8) {
        return `${codigoPais} ${numero.substring(0, 1)} ${numero.substring(1, 4)} ${numero.substring(4)}`;
      }
      break;
  }
  return `${codigoPais} ${numero}`.trim();
}

export function eliminarTecnico(id) {
  eliminarTecnicoAPI(id)
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "Técnico eliminado",
        text: "El técnico ha sido eliminado correctamente.",
        timer: 1500,
        showConfirmButton: false
      });
      obtenerTecnicos();
    })
    .catch(error => {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al eliminar el técnico."
      });
    });
}

export function configurarEventosModales() {
  const modalAgregar = document.getElementById("modal-agregar");
  const btnAbrirModalAgregar = document.getElementById("btnAbrirModal");
  const btnFlotante = document.getElementById("btnFlotanteAgregar");
  const btnCerrarAgregar = document.getElementById("btnCerrarModal");
  // Ocultar y deshabilitar inputs de foto en modales
  const inputFotoAgregar = document.getElementById("foto");
  const previewAgregar = document.getElementById("previewAgregar");
  const inputFotoEditar = document.getElementById("fotoEditar");
  const fotoActual = document.getElementById("fotoActual");

  if (inputFotoAgregar) {
    inputFotoAgregar.style.display = "none";
    inputFotoAgregar.disabled = true;
  }

  if (previewAgregar) {
    previewAgregar.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  }

  if (inputFotoEditar) {
    inputFotoEditar.style.display = "none";
    inputFotoEditar.disabled = true;
  }

  if (fotoActual) {
    fotoActual.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  }

  if (btnAbrirModalAgregar) {
    btnAbrirModalAgregar.addEventListener("click", () => {
      if (modalAgregar) {
        modalAgregar.showModal();
        setTimeout(() => inicializarTelefonosPaso3(), 100);
      }
    });
  }

  if (btnFlotante) {
    btnFlotante.addEventListener("click", () => {
      if (modalAgregar) {
        modalAgregar.showModal();
        setTimeout(() => inicializarTelefonosPaso3(), 100);
      }
    });
  }

  if (btnCerrarAgregar && modalAgregar) {
    btnCerrarAgregar.addEventListener("click", () => modalAgregar.close());
  }

  const frmAgregar = document.getElementById("frmAgregar");
  if (frmAgregar) {
    frmAgregar.addEventListener("submit", async (e) => {
      e.preventDefault();
      await agregarTecnico();
    });
  }

  const modalEditar = document.getElementById("modal-editar");
  const btnCerrarEditar = document.getElementById("btnCerrarEditar");

  if (btnCerrarEditar && modalEditar) {
    btnCerrarEditar.addEventListener("click", () => modalEditar.close());
  }

  const frmEditar = document.getElementById("frmEditar");
  if (frmEditar) {
    frmEditar.addEventListener("submit", async (e) => {
      e.preventDefault();
      await editarTecnico();
    });
  }

  const inputFoto = document.getElementById("foto");
  const preview = document.getElementById("previewAgregar");

  if (inputFoto && preview) {
    inputFoto.addEventListener("change", function () {
      const file = this.files[0];
      if (file) preview.src = URL.createObjectURL(file);
    });
  }

  const modalEquipo = document.getElementById("modal-agregar-equipo");
  const btnCancelarEquipo = document.getElementById("btnCancelarEquipo");

  if (btnCancelarEquipo && modalEquipo) {
    btnCancelarEquipo.addEventListener("click", () => modalEquipo.close());
  }

  const frmAgregarEquipo = document.getElementById("frmAgregarEquipo");

  if (frmAgregarEquipo) {
    frmAgregarEquipo.addEventListener("submit", e => {
      e.preventDefault();

      const frm = e.target;
      const idTec = frm.dataset.idTecnico;
      const username = frm.dataset.usernameTec;

      const categoria = document.getElementById("categoriaDropdown").value;
      if (!categoria) {
        Swal.fire({
          icon: "warning",
          title: "Categoría requerida",
          text: "Selecciona una categoría antes de continuar."
        });
        return;
      }

      marcarTecnicoComoAñadido(idTec, categoria, username);

      const modalEquipo = document.getElementById("modal-agregar-equipo");
      if (modalEquipo) modalEquipo.close();
    });
  }
}

export async function agregarTecnico() {
  const nombre = document.getElementById("nombre")?.value.trim();
  const correo = document.getElementById("email")?.value.trim();
  const archivoFoto = document.getElementById("foto")?.files[0];

  if (!nombre || !correo) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor, completa todos los campos obligatorios (nombre y correo).",
      confirmButtonText: "Entendido"
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    Swal.fire({
      icon: "error",
      title: "Correo no válido",
      text: "Por favor, ingresa un correo electrónico con el formato correcto.",
      confirmButtonText: "Revisar"
    });
    return;
  }

  if (!validarTelefonoIndividual("telefonoAgregar")) {
    Swal.fire({
      icon: "warning",
      title: "Teléfono inválido",
      text: "Por favor, ingresa un número de teléfono válido (mínimo 7 dígitos).",
      confirmButtonText: "Verificar"
    });
    return;
  }

  const telefono = obtenerTelefonoConPrefijo("telefonoAgregar");
  if (!telefono) {
    Swal.fire({
      icon: "error",
      title: "No se pudo procesar",
      text: "Verifica que el número de teléfono esté completo y correcto.",
      confirmButtonText: "Ok"
    });
    return;
  }

  await enviarTecnico(nombre, correo, telefono, null);
}

export async function enviarTecnico(nombre, correo, telefono, archivoFoto) {
  try {
    const urlFoto = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    const companyId = Number(localStorage.getItem('companyId'));

    if (!companyId) {
      console.error("Error: companyId no se encontró en el localStorage.");
      Swal.fire({
        icon: 'error',
        title: 'Error de configuración',
        text: 'No se encontró el ID de la compañía. Por favor, reinicie el proceso desde el Paso 1.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const nuevoTecnico = {
      Nombre: nombre,
      "Correo Electrónico": correo,
      "Número de tel.": telefono,
      Foto: urlFoto
    };

    // 💡 Aquí está el cambio importante: pasamos el ID como segundo argumento
    await agregarTecnicoPendienteAPI(nuevoTecnico, companyId);

    Swal.fire({
      icon: "success",
      title: "¡Técnico agregado!",
      text: "El técnico ha sido guardado exitosamente.",
      timer: 1500,
      showConfirmButton: false
    });

    const frmAgregar = document.getElementById("frmAgregar");
    if (frmAgregar) frmAgregar.reset();
    const previewAgregar = document.getElementById("previewAgregar");
    if (previewAgregar) previewAgregar.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    const modalAgregar = document.getElementById("modal-agregar");
    if (modalAgregar) modalAgregar.close();
    obtenerTecnicos();
  } catch (error) {
    console.error("Error al agregar técnico:", error);
    Swal.fire({
      icon: "error",
      title: "Ups...",
      text: "Ocurrió un problema al guardar el técnico. Por favor, intenta nuevamente.",
      confirmButtonText: "Entendido"
    });
  }
}

export function AbrirModalEditar(id, nombre, correo, telefono, foto = "") {
  const nombreLimpio = limpiarTexto(nombre);

  document.getElementById("idEditar").value = id;
  document.getElementById("nombreEditar").value = nombreLimpio || "";
  document.getElementById("emailEditar").value = correo || "";

  const fotoActual = document.getElementById("fotoActual");
  if (fotoActual) {
    fotoActual.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  }

  const modalEditar = document.getElementById("modal-editar");
  if (modalEditar) {
    modalEditar.showModal();

    setTimeout(() => {
      // 1. Inicializa intl-tel-input y IMask
      inicializarTelefonosPaso3();

      setTimeout(() => {
        const telefonoInput = document.getElementById("telefonoEditar");
        const iti = intlTelInputInstances.get("telefonoEditar"); // Obtiene la instancia guardada
        const maskInstance = phoneMasks.get("#telefonoEditar"); // Obtiene la instancia de IMask

        if (telefonoInput && telefono && iti) {
          // 2. Limpia el número (asegura el formato intl-tel-input: +123456789)
          const telefonoLimpio = telefono.replace(/[^\d\+]/g, '');

          // 3. Establece el número con intl-tel-input (esto actualiza el país y el placeholder)
          iti.setNumber(telefonoLimpio);

          // 4. El valor final del input ya está limpio y listo
          // No necesitamos hacer nada con IMask.value si iti ya ajustó el valor del input.

          // Forzamos la re-aplicación de la máscara por si acaso el país cambia el formato
          telefonoInput.dispatchEvent(new Event('countrychange'));
        }
      }, 200);
    }, 100);
  }
}

export function abrirModalAgregarEquipo(tecnico) {
  document.getElementById("imgEquipo").src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  document.getElementById("nombreEquipo").value = tecnico.Nombre || "";
  document.getElementById("correoEquipo").value = tecnico["Correo Electrónico"] || "";
  document.getElementById("telefonoEquipo").value = formatearTelefonoParaMostrar(tecnico["Número de tel."]) || "";
  document.getElementById("categoriaDropdown").value = "";

  const partes = tecnico.Nombre.trim().split(/\s+/);
  const primerNombre = partes[0] || '';
  const primerApellido = partes[partes.length - 1] || '';

  const normalizar = str => str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const username = `${normalizar(primerNombre)}.${normalizar(primerApellido)}`;

  const inputUser = document.getElementById("usernameEquipo");
  if (inputUser) inputUser.value = username;

  const frm = document.getElementById("frmAgregarEquipo");
  if (frm) {
    frm.dataset.idTecnico = tecnico.id;
    frm.dataset.usernameTec = username;
  }

  const frmAgregarEquipo = document.getElementById("frmAgregarEquipo");
  if (frmAgregarEquipo) {
    frmAgregarEquipo.dataset.idTecnico = tecnico.id;
  }

  document.getElementById("modal-agregar-equipo").showModal();
}

export async function editarTecnico() {
  const id = document.getElementById("idEditar").value;
  const nombre = limpiarTexto(document.getElementById("nombreEditar").value.trim());
  const correo = document.getElementById("emailEditar").value.trim();
  const telefonoInput = document.getElementById("telefonoEditar");

  let telefono = "";
    if (telefonoInput) {
        // Usar la instancia guardada en nuestro Map
        const iti = intlTelInputInstances.get("telefonoEditar"); 
        
        // La función getNumber() es la manera más fiable de obtener el valor internacional.
        // Si iti existe, usa getNumber(). Si no, usa el fallback de obtenerTelefonoConPrefijo.
        telefono = iti ? iti.getNumber() : obtenerTelefonoConPrefijo("telefonoEditar");
    }

  if (!nombre || !correo || !telefono) {
    alert("Complete todos los campos obligatorios");
    return;
  }

  try {
    const urlFinal = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const actualizado = {
      Nombre: nombre,
      "Correo Electrónico": correo,
      "Número de tel.": telefono,
      Foto: urlFinal
    };

    await editarTecnicoAPI(id, actualizado);

    Swal.fire({
      icon: "success",
      title: "Técnico actualizado",
      text: "El técnico ha sido actualizado exitosamente.",
      timer: 1500,
      showConfirmButton: false
    });

    document.getElementById("modal-editar").close();
    obtenerTecnicos();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Algo salió mal",
      text: "No se pudo actualizar el técnico.",
      confirmButtonText: "Entendido"
    });
  }
}

export async function subirImagen(file) {
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

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Función que aplica la máscara de IMask basada en el placeholder
 * generado por intl-tel-input.
 * @param {HTMLInputElement} phoneInput - El elemento input.
 * @param {string} selector - El selector del input (ID).
 */
const applyMask = async (phoneInput, selector) => {
  // 1. Carga la librería IMask dinámicamente si aún no está cargada
  if (!IMaskLib) {
    try {
      const module = await import('https://cdn.jsdelivr.net/npm/imask@6.4.3/dist/imask.min.js');
      IMaskLib = module.default || window.IMask;

      if (!IMaskLib) {
        console.error("No se pudo cargar IMask como módulo.");
        return;
      }
    } catch (error) {
      console.error('Error al cargar IMask dinámicamente:', error);
      return;
    }
  }

  const placeholder = phoneInput.placeholder;

  if (!placeholder) {
    // Si el placeholder (de intl-tel-input) no está listo, reintenta.
    setTimeout(() => applyMask(phoneInput, selector), 100);
    return;
  }

  // 2. Transforma el placeholder a formato de máscara '0000 0000'
  // Se usa la '0' como un comodín de dígito.
  const maskFormat = placeholder.replace(/[^\d]/g, '0');

  let phoneMask = phoneMasks.get(selector);

  // Destruye la máscara anterior si existe.
  if (phoneMask) {
    phoneMask.destroy();
  }

  // 3. Aplica la nueva máscara
  phoneMask = IMaskLib(phoneInput, {
    mask: maskFormat,
    lazy: false,
    // El commit es importante para limpiar el valor antes de almacenarlo en el input.value
    commit: function (value, masked) {
      // Almacenamos el valor en el input sin los caracteres de la máscara (solo dígitos)
      // Esto ayuda a intl-tel-input a validar mejor y obtener el valor limpio.
      masked._value = value.replace(/\s+/g, '').replace(/[\(\)\-\+]/g, '');
    }
  });

  // Guarda la nueva instancia de IMask
  phoneMasks.set(selector, phoneMask);
};


/**
 * Inicializa intl-tel-input y IMask para los inputs de los modales (Paso 3).
 * @returns {void}
 */
export function inicializarTelefonosPaso3() {
  // IDs de los inputs de teléfono en los modales
  const inputs = ["#telefonoAgregar", "#telefonoEditar"];

  inputs.forEach(selector => {
    const phoneInput = document.querySelector(selector);
    const id = selector.replace('#', ''); // Obtener el ID sin el #

    // intlTelInput debe estar cargado
    if (phoneInput && typeof window.intlTelInput === "function") {
      try {
        let iti = intlTelInputInstances.get(id);

        // 1. Inicializa intl-tel-input solo si no se ha inicializado
        if (!iti) {
          iti = window.intlTelInput(phoneInput, {
            initialCountry: "sv",
            preferredCountries: ["sv", "mx", "gt", "cr", "pa"],
            separateDialCode: true,
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js",
          });
          intlTelInputInstances.set(id, iti); // Guarda la instancia

          // 2. Agrega el listener para cambiar la máscara al cambiar de país
          // y aplica la máscara inmediatamente después de un pequeño retraso
          phoneInput.addEventListener("countrychange", () => applyMask(phoneInput, selector));
        }

        // 3. Dispara el evento una vez para inicializar o actualizar la máscara
        // Usamos requestAnimationFrame para asegurar que el placeholder de intl-tel-input esté listo.
        requestAnimationFrame(() => {
          phoneInput.dispatchEvent(new Event('countrychange'));
        });

      } catch (error) {
        console.error(`Error initializing intl-tel-input or IMask for ${selector}:`, error);
      }
    }
  });
}

export function validarAntesDeEnviar(idInput) {
  const input = document.getElementById(idInput);
  if (!input) return false;

  const valorInput = input.value.trim();

  if (!valorInput || valorInput.length < 8) {
    console.log(`Input ${idInput} muy corto o vacío:`, valorInput);
    return false;
  }

  if (!/^[\d\s\-\(\)]+$/.test(valorInput)) {
    console.log(`Input ${idInput} tiene formato inválido:`, valorInput);
    return false;
  }
  return true;
}

export function actualizarEquipoEnStorage(id, accion, categoria, username = '') {
  let equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]");

  // Normalizar ID a string para consistencia
  const idNormalizado = String(id);
  const idx = equipo.findIndex(m => String(m.id) === idNormalizado);

  if (accion === 'agregar') {
    const nuevo = {
      id: idNormalizado,
      categoria: String(categoria), // También normalizar categoría a string
      username
    };
    if (idx === -1) equipo.push(nuevo);
    else equipo[idx] = nuevo;
  } else if (accion === 'eliminar' && idx !== -1) {
    equipo.splice(idx, 1);
  }

  localStorage.setItem("miEquipo", JSON.stringify(equipo));
  console.log("Equipo actualizado en storage:", equipo);
}

// Corregido: La función debe ser ASYNC para poder usar 'await'
export async function marcarTecnicoComoAñadido(idTecnico, categoria, username, restaurando = false) {
  const btnAñadir = document.querySelector(`button.añadir[data-id="${idTecnico}"]`);
  if (!btnAñadir) return;
  const contenedorAcciones = document.getElementById(`acciones-${idTecnico}`);
  if (!contenedorAcciones) return;

  // Solo si no estamos restaurando (es decir, el usuario acaba de hacer click en añadir)
  if (!restaurando) {
    try {
      // 🛑 LÍNEA CLAVE AGREGADA: Llamar a la API para asignar la categoría y activar el técnico
      // Esto es lo que faltaba para reflejar el cambio en la BD.
      console.log(`Llamando a la API para asignar categoría ${categoria} al técnico ${idTecnico}`);
      await asignarCategoriaYActivarTecnicoAPI(idTecnico, categoria);

      // Si el backend responde OK, actualizamos el localStorage
      actualizarEquipoEnStorage(idTecnico, "agregar", categoria, username);

      // Mostrar mensaje de éxito específico para esta acción
      Swal.fire({
        icon: 'success',
        title: 'Técnico añadido y categorizado',
        text: 'El técnico ha sido asignado a su equipo y a su categoría.',
        timer: 1500,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Error al asignar categoría y activar técnico:", error);
      // Si el backend falla, mostramos el error y detenemos la ejecución
      Swal.fire({
        icon: 'error',
        title: 'Error al añadir al equipo',
        text: error.message || "Ocurrió un error al intentar asignar la categoría en el sistema.",
        confirmButtonText: 'Aceptar'
      });
      return; // Salir de la función para no actualizar la vista si falla el backend
    }
  }

  // Luego actualizamos la vista (Visualización en el frontend)
  const accionesContainer = document.getElementById(`acciones-${idTecnico}`);
  marcarTecnicoComoAñadidoVisual(idTecnico, accionesContainer, restaurando, username);
}

export function obtenerCategoriaTecnico(id) {
  const equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]");
  const tecnico = equipo.find(item => {
    if (typeof item === 'object') return item.id == id;
    return false;
  });
  return tecnico ? tecnico.categoria : null;
}

export function marcarTecnicoComoAñadidoVisual(idTecnico, contenedorAcciones, restaurando = false, username = '') {
  console.groupCollapsed(`%c[marcarTecnicoComoAñadidoVisual] Llamada para técnico ${idTecnico}`, 'color: purple; font-weight: bold;');
  console.trace("Pila de llamadas para marcarTecnicoComoAñadidoVisual");

  if (!contenedorAcciones) {
    console.warn(`No se encontró contenedor de acciones para técnico ${idTecnico}`);
    console.groupEnd();
    return;
  }

  const equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]");
  const miembroDelEquipo = equipo.find(item => item.id === idTecnico);

  const categoriaId = miembroDelEquipo ? String(miembroDelEquipo.categoria).trim() : '';

  console.log(`%c[DEBUG marcarTecnico] Para técnico ${idTecnico}:`, 'color: #007bff; font-weight: bold;');
  console.log(`%c  - ID de categoría de localStorage (categoriaId) (¡TRIMEADO!): '${categoriaId}' (Tipo: ${typeof categoriaId})`, 'color: #007bff;');
  console.log("%c  - Contenido completo de listaCategorias (global) JUSTO ANTES DE FIND:", 'color: #28a745; font-weight: bold;', JSON.parse(JSON.stringify(listaCategorias || [])));

  const categoriaInfo = listaCategorias.find(c => {
    const trimmed_c_id = String(c.id).trim();
    console.log(`%c    > Comparando elemento TRIMEADO '${trimmed_c_id}' (Tipo: ${typeof trimmed_c_id}) con ID buscado TRIMEADO '${categoriaId}' (Tipo: ${typeof categoriaId})`, 'color: #ffc107;');
    const comparisonResult = (trimmed_c_id == categoriaId);
    const strictComparisonResult = (trimmed_c_id === categoriaId);
    console.log(`%c      Resultado (==): ${comparisonResult}, Resultado (===): ${strictComparisonResult}`, 'color: #ffc107;');
    return comparisonResult;
  });

  console.log(`%c[DEBUG marcarTecnico] Resultado FINAL de la búsqueda en listaCategorias para ID '${categoriaId}':`, 'color: #dc3545; font-weight: bold;', categoriaInfo);

  const nombreCategoria = categoriaInfo
    ? `(${categoriaInfo.nombreDepartamento || categoriaInfo.nombre || 'Categoría no definida'})`
    : '';
  console.log(`%c[DEBUG marcarTecnico] Nombre final de categoría a mostrar: '${nombreCategoria}'`, 'color: #6f42c1; font-weight: bold;');

  contenedorAcciones.innerHTML = `
        <div class="text-success fw-semibold d-flex align-items-center justify-content-end es-equipo" data-id="${idTecnico}" data-categoria="${categoriaId}" data-username="${username}">
            <i class="bi bi-check-circle-fill me-2"></i>
            Parte de tu equipo ${nombreCategoria}
            <button class="btn text-danger btn-remover" title="Eliminar del equipo" style="border: none; background: none; font-size: 2.4rem; line-height: 1; padding: 0 0.5rem; font-weight: bold;">&times;</button>
        </div>
    `;

  console.log(`%c[DEBUG marcarTecnico] HTML FINAL insertado para técnico ${idTecnico}:`, 'color: #008000; font-weight: bold;', contenedorAcciones.innerHTML);

  const editarBtn = contenedorAcciones.querySelector(".editar");
  const eliminarBtn = contenedorAcciones.querySelector(".eliminar");
  const removerBtn = contenedorAcciones.querySelector(".btn-remover");

  if (editarBtn) {
    editarBtn.addEventListener("click", () => {
      const tecnico = listaTecnicos.find(t => t.id == idTecnico);
      if (tecnico) {
        AbrirModalEditar(
          tecnico.id,
          tecnico.Nombre,
          tecnico["Correo Electrónico"] || tecnico["Correo Elect."],
          tecnico["Número de tel."],
          tecnico.Foto
        );
      }
    });
  }

  if (eliminarBtn) {
    eliminarBtn.addEventListener("click", () => {
      const tecnico = listaTecnicos.find(t => t.id == idTecnico);
      if (tecnico) {
        Swal.fire({
          title: `¿Eliminar a ${tecnico.Nombre}?`,
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        }).then(result => {
          if (result.isConfirmed) eliminarTecnico(idTecnico);
        });
      }
    });
  }

  if (removerBtn) {
    removerBtn.addEventListener("click", () => removerDelEquipo(idTecnico));
  }
}

export async function obtenerTecnicos() {
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
    const data = await obtenerTecnicosAPI();

    // Normalizar IDs a string para consistencia
    listaTecnicos = data.map(tecnico => ({
      ...tecnico,
      id: String(tecnico.id) // Convertir ID a string
    }));

    localStorage.setItem("listaTecnicos", JSON.stringify(listaTecnicos));
    console.log("Técnicos cargados y normalizados:", listaTecnicos);
    mostrarDatos(listaTecnicos);
    return listaTecnicos;
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    contenedor.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los técnicos. Por favor, intenta nuevamente.
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="obtenerTecnicos()">
                    Reintentar
                </button>
            </div>
        `;
  }
}

export function removerDelEquipo(idTecnico) {
  Swal.fire({
    title: '¿Remover del equipo?',
    text: 'Esta persona ya no formará parte de tu equipo de trabajo.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#0066FF',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, remover',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      actualizarEquipoEnStorage(idTecnico, "eliminar");
      obtenerTecnicos();

      Swal.fire({
        icon: 'success',
        title: 'Removido del equipo',
        text: 'La persona ha sido removida de tu equipo.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

export function guardarDatosPaso3() {
  const equipoActual = document.querySelectorAll('.es-equipo[data-id]');
  const miEquipoCompleto = Array.from(equipoActual).map(el => ({
    id: el.dataset.id,
    categoria: el.dataset.categoria,
    username: el.dataset.username
  }));

  localStorage.setItem("miEquipo", JSON.stringify(miEquipoCompleto));
  console.log("Datos del equipo guardados en localStorage:", miEquipoCompleto);
}

export function restaurarDatosPaso3() {
  const equipo = JSON.parse(localStorage.getItem("miEquipo") || "[]");
  equipo.forEach(({ id }) => {
    const cont = document.getElementById(`acciones-${id}`);
    if (cont) marcarTecnicoComoAñadidoVisual(id, cont, true);
  });
}

export function inicializarBuscadorDeTecnicos() {
  const inputBusqueda = document.getElementById("busquedaTecnico");
  const botonBuscar = document.getElementById("btnBuscar");

  if (!inputBusqueda || !botonBuscar) return;

  const filtrarTecnicos = () => {
    const query = inputBusqueda.value.trim().toLowerCase();
    const filas = document.querySelectorAll(".tecnico-fila");
    let tecnicosVisibles = 0;

    filas.forEach(fila => {
      const nombre = fila.querySelector(".nombre-tecnico")?.textContent.toLowerCase() || "";
      const correo = fila.querySelector(".correo-tecnico")?.textContent.toLowerCase() || "";
      const telefono = fila.querySelector(".telefono-tecnico")?.textContent.toLowerCase() || "";

      const coincide = query === "" || nombre.includes(query) || correo.includes(query) || telefono.includes(query);

      if (coincide) {
        fila.style.display = "flex";
        tecnicosVisibles++;
      } else {
        fila.style.display = "none";
      }
    });

    mostrarMensajeResultados(tecnicosVisibles, query);
  };

  botonBuscar.addEventListener("click", filtrarTecnicos);
  inputBusqueda.addEventListener("keyup", filtrarTecnicos);
}

export function limpiarTexto(texto) {
  if (!texto) return "";
  return texto
    .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñüÜ'\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Función auxiliar para extraer primer nombre y apellido
function obtenerNombreCorto(nombreCompleto) {
  const partes = nombreCompleto.split(' ');
  if (partes.length <= 2) return nombreCompleto;

  // Tomar el primer nombre y el primer apellido (asumiendo formato: nombre apellido1 apellido2)
  return `${partes[0]} ${partes[partes.length - 2]}`;
}

// Función para generar HTML de lista de técnicos
function generarListaTecnicos(tecnicos, titulo) {
  if (tecnicos.length === 0) return '';

  let html = `<p style="margin-bottom: 10px; font-weight: bold;">${titulo}</p>`;
  html += '<ul style="text-align: left; margin-left: 20px; margin-bottom: 15px;">';

  // Mostrar máximo 5 técnicos y agregar "entre otros" si hay más
  const mostrarTecnicos = tecnicos.slice(0, 5);
  const hayMas = tecnicos.length > 5;

  mostrarTecnicos.forEach(tecnico => {
    html += `<li>${obtenerNombreCorto(tecnico)}</li>`;
  });

  if (hayMas) {
    html += `<li>entre otros (${tecnicos.length - 5} más)</li>`;
  }

  html += '</ul>';
  return html;
}

// Prevenir clicks en imágenes de perfil
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.modal-perfil img, #imgEquipo').forEach(img => {
    img.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    img.style.pointerEvents = 'none';
  });
});

export async function accionSiguientePaso() {
  return new Promise((resolve) => {
    console.log("=== INICIANDO VALIDACIÓN DEL PASO 3 ===");

    // Obtener todos los técnicos y el equipo actual
    const todosTecnicos = listaTecnicos;
    const miEquipo = JSON.parse(localStorage.getItem("miEquipo") || "[]");

    console.log("Técnicos en el sistema:", todosTecnicos);
    console.log("Mi equipo actual:", miEquipo);

    // Verificar que cada técnico esté en el equipo y tenga categoría
    const tecnicosFaltantes = [];
    const tecnicosSinCategoria = [];

    todosTecnicos.forEach(tecnico => {
      // Convertir ambos IDs a string para comparación consistente
      const idTecnicoStr = String(tecnico.id);
      const enEquipo = miEquipo.find(m => String(m.id) === idTecnicoStr);

      if (!enEquipo) {
        tecnicosFaltantes.push(tecnico.Nombre);
      } else if (!enEquipo.categoria || enEquipo.categoria === "") {
        tecnicosSinCategoria.push(tecnico.Nombre);
      }
    });

    console.log("Técnicos faltantes en equipo:", tecnicosFaltantes);
    console.log("Técnicos sin categoría:", tecnicosSinCategoria);

    // Si hay técnicos faltantes o sin categoría, mostrar alerta
    if (tecnicosFaltantes.length > 0 || tecnicosSinCategoria.length > 0) {
      let htmlContent = "";

      if (tecnicosFaltantes.length > 0) {
        htmlContent += generarListaTecnicos(tecnicosFaltantes, "Faltan técnicos en el equipo:");
      }

      if (tecnicosSinCategoria.length > 0) {
        htmlContent += generarListaTecnicos(tecnicosSinCategoria, "Técnicos sin categoría asignada:");
      }

      htmlContent += "<p>Todos los técnicos deben tener una categoría asignada y ser parte del equipo. De lo contrario, elimine el técnico que no desee que forme parte de su equipo.</p>";

      console.log("Mostrando alerta de error");

      Swal.fire({
        icon: "warning",
        title: "Conformación incompleta",
        html: htmlContent,
        confirmButtonText: "Entendido"
      }).then(() => {
        resolve(false); // Validación fallida
      });
    } else {
      console.log("Validación exitosa - Puede avanzar al siguiente paso");
      resolve(true); // Validación exitosa
    }
  });
}