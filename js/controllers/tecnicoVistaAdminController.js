import{
    getUserTech,
    createUserTech,
    updateUserTech,
    deleteUserTech,
    getCategories
} from '../services/tecnicoVistaAdminService.js';

let currentPage = 0;
let currentSize = 10;
let totalPages = 0;


let totalElements = 0;
let usuariosFiltradosPorBackend = [];

let iti;
let phoneMask;

let form;

//const categoriasApi = {
    //'Soporte técnico': { id: 1, displayName: 'Soporte técnico' },
    //'Consultas': { id: 2, displayName: 'Consultas' },
    //'Gestión de Usuarios': { id: 3, displayName: 'Gestión de Usuarios' },
    //'Redes': { id: 4, displayName: 'Redes' },
    //'Incidentes Críticos': { id: 5, displayName: 'Incidentes Críticos' }
//};

let categoriasApiDinamicas = {};


async function cargarCategoriasDinamicas() {
    try {
        const categoriasArray = await getCategories();
        categoriasApiDinamicas = categoriasArray.reduce((acc, current) => {
            // Se asegura de que cada categoría sea única por displayName si es necesario
            acc[current.displayName] = current; 
            return acc;
        }, {});
        console.log("✅ Categorías cargadas dinámicamente:", categoriasApiDinamicas);
    } catch (error) {
        console.error("❌ Error al cargar las categorías desde la API:", error);
        // Opcional: Cargar un set de categorías de respaldo o mostrar un error al usuario
    }
}

//FUNCION PARA CARGAR PAGINA WEB
async function cargarPaginaTecnicos(page){
    const term = document.getElementById('busquedaUsuario').value.trim();
    const categoryFilter = document.getElementById('statusFilter').value;

    try {
      currentPage = page
    // Almacenaremos los usuarios originales para no tener que pedirlos a la API de nuevo
    const data = await getUserTech(page, currentSize, term, categoryFilter, 'all');
    const usuarios = data.content || data;

    //guarda globalmente resultados del backend
    usuariosFiltradosPorBackend = usuarios; 

    //Actualiza las variables globales con datos de la API
    currentPage = data.number ?? page;//Numero de pagina
    totalElements = data.totalElements || 0; //Total de elementos encontrados

    aplicarFiltroLocal();

    updatePaginationControls(); 

    document.querySelector('.btn-add-user').addEventListener('click', abrirFormularioCreacion);

    
    }catch(error){
        console.error('Error al cargar la página filtrada:', error);
        mostrarDatos([]); 
    }
}

 //FUNCION PARA PAGINACION DE DATOS

 function updatePaginationControls() {
    const prevButton = document.getElementById('prevPage');
    const currentPageLink = document.getElementById('currentPage');
    const nextButton = document.getElementById('nextPage');
    
    // Si no se encuentran los elementos, salimos
    if (!prevButton || !currentPageLink || !nextButton) {
        console.error("Elementos de paginación no encontrados.");
        return;
    }

    // 2. Actualizar el número de página actual (mostramos 1-based, por eso +1)
    currentPageLink.textContent = currentPage + 1;
    
    // Usamos Math.ceil para asegurar que si hay un resto, cuenta como otra página
    totalPages = Math.ceil(totalElements / currentSize); 
    
    // 4. Habilitar/Deshabilitar el botón Anterior
    if (currentPage === 0) {
        prevButton.classList.add('disabled');
    } else {
        prevButton.classList.remove('disabled');
    }

    // 5. Habilitar/Deshabilitar el botón Siguiente
    if (currentPage >= totalPages - 1 || totalPages === 0) {
        nextButton.classList.add('disabled');
    } else {
        nextButton.classList.remove('disabled');
    }
    
    // 6. Remover y reasignar los Event Listeners para evitar duplicados
    prevButton.removeEventListener('click', handlePaginationClick);
    nextButton.removeEventListener('click', handlePaginationClick);
    
    prevButton.addEventListener('click', handlePaginationClick);
    nextButton.addEventListener('click', handlePaginationClick);
}

function renderFilterBar(){
  // 1. Obtener la referencia al elemento select
    const selectCategoria = document.getElementById('statusFilter');

    // Limpiar opciones anteriores
    selectCategoria.innerHTML = '<option value="all">Todas las categorías</option>';

    // 2. Iterar sobre el objeto categoriasApi para llenar el select
    const categoriasArray = Object.values(categoriasApiDinamicas);

    categoriasArray.forEach(categoria => {
        const option = document.createElement('option');
        // Usamos el nombre de la categoría (displayName) como valor y texto,
        // tal como se hacía en tu código original para el filtro.
        option.value = categoria.displayName; 
        option.textContent = categoria.displayName;
        selectCategoria.appendChild(option);
    });
    
    // **No se genera más HTML.**
    console.log("✅ Selector de Categorías (statusFilter) llenado con éxito.");
}


//MANEJO DE CLICS EN BOTONES DE SIGUEINTE / ANTERIOR
function handlePaginationClick(event) {
    event.preventDefault();

    const targetId = event.currentTarget.id;
    let newPage = currentPage;

    if (targetId === 'prevPage' && currentPage > 0) {
        newPage = currentPage - 1;
    } else if (targetId === 'nextPage' && currentPage < totalPages - 1) {
        newPage = currentPage + 1;
    } else {
        return; // No hacer nada si está deshabilitado
    }
    
    cargarPaginaTecnicos(newPage);
}


//FUNCION PARA INICIALIZAR INTERFAZ / LLAMADO DE CARGA INICIAL
async function initTecnicos() {
    try{

        await cargarCategoriasDinamicas();
        //Inicializacion de UI y eventos
        renderFilterBar();
        initFilterEvents();
        inicializarBuscadorDeUsuarios();

        

        const addButton = document.querySelector('.btn-add-user');
        if (addButton) {
            addButton.addEventListener('click', abrirFormularioCreacion);
        }

        // Vinculación directa al botón de guardar (¡NUEVO BLOQUE!)
    const btnSave = document.getElementById('btnGuardarTecnico');
    if (btnSave) {
        // El botón ya no dispara el evento 'submit', sino un 'click' que llama a la función.
        btnSave.addEventListener('click', handleFormSubmit); 
        console.log("✅ Evento CLICK del botón de Guardar vinculado con éxito.");
    } else {
        console.error("❌ Botón de Guardar no encontrado. Revisa el ID en el HTML.");
    }


        //Llamada inicial: cargar primera pagina
        await cargarPaginaTecnicos(0);

        const ticketsPerPageSelect = document.getElementById('ticketsPerPage');

        

    ticketsPerPageSelect.addEventListener('change', (event) => {
      const newSize = event.target.value;

      currentSize = newSize;

      currentPage = 0;

      cargarPaginaTecnicos(currentPage, currentSize); 

    });
        
    }catch(err) {
    console.error('Error cargando usuarios:', err);
  }
}


function initFilterEvents() {
  document.getElementById('periodFilter').addEventListener('change', filtrarUsuarios);
  document.getElementById('statusFilter').addEventListener('change', filtrarUsuarios);
  document.getElementById('busquedaUsuario').addEventListener('input', filtrarUsuarios);
}

function updateCounts() {

     // 1. Mostrar el total de resultados filtrados (el dato que viene del backend)
    // Asume que tienes un span con id="totalFilterCount" en el HTML
    const totalFilterCountElement = document.getElementById('userCount');
    if (totalFilterCountElement) {
        // Muestra el total filtrado por el backend
        totalFilterCountElement.textContent = totalElements; 
    }

  const term = document.getElementById('busquedaUsuario').value.trim();
  const per = document.getElementById('periodFilter').value;
  const stat = document.getElementById('statusFilter').value;
  let act = 0;
  if (term) act++;
  if (per !== 'all') act++;
  if (stat !== 'all') act++;
  document.getElementById('filterCount').textContent = act;
}

function mostrarDatos(usuarios) {
  const cont = document.getElementById('lista-usuarios');
  if (!cont) return;

  if (!usuarios || usuarios.length === 0) {
    cont.innerHTML = `
      <div class="alert alert-info text-center mt-3">
        No se encontraron usuarios con los filtros seleccionados.
      </div>
    `;
    return;
  }

  cont.innerHTML = '';

  // Cabeceras
  const headers = document.createElement('div');
  headers.className = 'row g-0 text-center fw-semibold mb-2 py-2 headers-usuario d-none d-lg-flex';
  headers.innerHTML = `
        <div class="col-md-1">Foto</div>
        <div class="col-md-2">Nombre</div>
        <div class="col-md-2">Email</div>
        <div class="col-md-2">Usuario</div>
        <div class="col-md-2">Fecha de Registro</div>
        <div class="col-md-2">Categoría</div>
        <div class="col-md-1"></div>
  `;
  cont.appendChild(headers);

  // Filas de datos
  usuarios.forEach(user => {
    const row = document.createElement('div');
    row.className = 'row g-0 align-items-center shadow-sm rounded mb-2 bg-white usuario-card';
    const dropdownId = `dropdownMenuLink-${user.userId}`;
    row.innerHTML = `
      <div class="col-md-1 d-flex justify-content-center align-items-center py-2">
        <img src="${user.profilePictureUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}"
             class="rounded-circle"
             style="width:32px; height:32px; object-fit: cover;"
             onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${user.name}
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${user.email}
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${user.username}
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${formatearFecha(user.registrationDate)}
      </div>
      <div class="col-md-2 d-flex justify-content-center align-items-center px-2">
        ${user.category ? user.category.displayName : 'Sin Categoría'}
      </div>
      <div class="col-md-1 d-flex justify-content-center align-items-center">
        <div class="dropdown">
          <button class="btn btn-sm" data-bs-offset="0,10" type="button" data-bs-toggle="dropdown" id="${dropdownId}" aria-expanded="false">
            <svg width="30" height="30" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.0625 25.5312C6.99335 25.5312 5.96798 25.1065 5.21198 24.3505C4.45597 23.5945 4.03125 22.5692 4.03125 21.5C4.03125 20.4308 4.45597 19.4055 5.21198 18.6495C5.96798 17.8935 6.99335 17.4688 8.0625 17.4688C9.13165 17.4688 10.157 17.8935 10.913 18.6495C11.669 19.4055 12.0938 20.4308 12.0938 21.5C12.0938 22.5692 11.669 23.5945 10.913 24.3505C10.157 25.1065 9.13165 25.5312 8.0625 25.5312ZM21.5 25.5312C20.4308 25.5312 19.4055 25.1065 18.6495 24.3505C17.8935 23.5945 17.4688 22.5692 17.4688 21.5C17.4688 20.4308 17.8935 19.4055 18.6495 18.6495C19.4055 17.8935 20.4308 17.4688 21.5 17.4688C22.5692 17.4688 23.5945 17.8935 24.3505 18.6495C25.1065 19.4055 25.5312 20.4308 25.5312 21.5C25.5312 22.5692 25.1065 23.5945 24.3505 24.3505C23.5945 25.1065 22.5692 25.5312 21.5 25.5312ZM34.9375 25.5312C33.8683 25.5312 32.843 25.1065 32.087 24.3505C31.331 23.5945 30.9062 22.5692 30.9062 21.5C30.9062 20.4308 31.331 19.4055 32.087 18.6495C32.843 17.8935 33.8683 17.4688 34.9375 17.4688C36.0067 17.4688 37.032 17.8935 37.788 18.6495C38.544 19.4055 38.9688 20.4308 38.9688 21.5C38.9688 22.5692 38.544 23.5945 37.788 24.3505C37.032 25.1065 36.0067 25.5312 34.9375 25.5312Z" fill="black"/>
            </svg>
          </button>
          <ul class="dropdown-menu" aria-labelledby="${dropdownId}">
            <li><a class="dropdown-item ver-actividad" href="#" data-id="${user.id || user.userId}"><i class="bi bi-eye me-2"></i>Ver datos</a></li>
            <li><a class="dropdown-item editar-usuario" href="#" data-id="${user.userId || user.id}"><i class="bi bi-pencil me-2"></i>Editar</a></li>
            <li><a class="dropdown-item text-danger eliminar-usuario" href="#" data-id="${user.userId || user.id}"><i class="bi bi-trash me-2"></i>Eliminar</a></li>
          </ul>
        </div>
      </div>
    `;
    cont.appendChild(row);

    const dropdownToggle = row.querySelector(`#${dropdownId}`);
    if (dropdownToggle) {
        new bootstrap.Dropdown(dropdownToggle);
    }

   // 1. Ver Actividad
    const verActividadBtn = row.querySelector('.ver-actividad');
    if (verActividadBtn) { 
        verActividadBtn.addEventListener('click', (e) => {
            e.preventDefault();
             // 1. Definición de la variable (Existe solo en este listener)
            const anchorElement = e.target.closest('.ver-actividad'); 
            
            // 2. VERIFICACIÓN Y USO:
            // Toda la lógica que usa 'anchorElement' DEBE ir aquí dentro:
            if (anchorElement) {
                const userId = anchorElement.getAttribute('data-id');

                if (userId) {
                    abrirModalVerActividad(userId);
                } else {
                    console.error("ID no encontrado en el atributo data-id. Revise el HTML.");
                }
            } 
            
            
        });
    }

    // 2. Editar Usuario
    const editarUsuarioBtn = row.querySelector('.editar-usuario');
    if (editarUsuarioBtn) { // <-- ¡Verificación clave!
        editarUsuarioBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const anchorElement = e.target.closest('.editar-usuario'); 
            
            // 2. VERIFICACIÓN Y USO:
            // Toda la lógica que usa 'anchorElement' DEBE ir aquí dentro:
            if (anchorElement) {
                const userId = anchorElement.getAttribute('data-id');

                if (userId) {
                    abrirFormularioEdicion(userId);
                } else {
                    console.error("ID no encontrado en el atributo data-id. Revise el HTML.");
                }
            } 

        });
    }

    // 3. Eliminar Usuario
    const eliminarUsuarioBtn = row.querySelector('.eliminar-usuario');
    if (eliminarUsuarioBtn) { 
        eliminarUsuarioBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const anchorElement = e.target.closest('.eliminar-usuario'); 
            
            if (anchorElement) {
                const userId = anchorElement.getAttribute('data-id');

                if (userId) {
                    confirmarEliminacion(userId);
                } else {
                    console.error("ID no encontrado en el atributo data-id. Revise el HTML.");
                }
            } 
            
        });
      }
  });
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return 'N/A';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}


 //Filtra la lista de usuarios basándose en todos los criterios.
function filtrarUsuarios() {
    // LLAMA A LA FUNCIÓN DE CARGA, forzando el inicio en la página 0.
    cargarPaginaTecnicos(0); 
}

function aplicarFiltroLocal() {
    const periodFilter = document.getElementById('periodFilter').value;

    const usuariosParaFiltrar = usuariosFiltradosPorBackend || [];
    let usuariosFinales = usuariosParaFiltrar; 

    // Lógica para el filtro de período (AHORA AQUÍ)
    if (periodFilter !== 'all') {
        usuariosFinales = usuariosParaFiltrar.filter(user => {
            const userDate = new Date(user.registrationDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let startDate;
            switch (periodFilter) {
                case 'today':
                    startDate = today;
                    break;
                case 'week':
                    startDate = new Date();
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date();
                    startDate.setMonth(today.getMonth() - 1);
                    break;
            }
            return userDate >= startDate;
        });
    }

    mostrarDatos(usuariosFinales); 
    updateCounts(); 
}


function inicializarBuscadorDeUsuarios() {
  document.addEventListener('keypress', e => {
    if (e.key === 'Enter' && document.activeElement.id === 'busquedaUsuario') {
      filtrarUsuarios();
    }
  });
}

async function abrirModalVerActividad(userId) {
  const modalId = 'modalVerActividad';
  try {
    const res = await getUserTech(0, 1, String(userId), 'all', 'all');

    const usuarios = res.content || res;
    const u = usuarios[0];

    if (!u) {
         console.error("Técnico no encontrado: La búsqueda no arrojó resultados.");
            
            Swal.fire({
                title: 'Error de Búsqueda',
                text: 'No se pudo cargar la información del técnico. Por favor, intenta de nuevo o verifica el ID.',
                icon: 'error'
            });
            return; // Salimos de la función si no hay usuario
    }

    document.getElementById('lblUserId').textContent = u.userId || u.id || userId; 

    // Llenado de campos visibles
    document.getElementById('lblNombre').textContent = u.name || 'N/A';
    document.getElementById('lblEmail').textContent = u.email || 'N/A';
    document.getElementById('lblUsuario').textContent = u.username || 'N/A';
    document.getElementById('lblTelefono').textContent = u.phone || 'N/A';
    document.getElementById('lblCategoria').textContent = 
    (u.category && u.category.displayName) || 'Sin categoría'; 


    // Formatear la fecha de registro
        const fechaRegistro = u.registrationDate 
            ? new Date(u.registrationDate).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            }) 
            : 'N/A';
        document.getElementById('lblFechaRegistro').textContent = fechaRegistro;

        // 3. MOSTRAR EL MODAL
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const myModal = new bootstrap.Modal(modalElement);
            myModal.show();
        } else {
            console.error(`Error: Modal con ID "${modalId}" no fue encontrado.`);
        }
  } catch (err) {
        console.error('Error cargando usuario:', err);
        console.log('Tipo de error:', typeof err);
        console.log('Mensaje de error:', err.message);

        const errorMessage = err.message || "Error de conexión desconocido.";
        Swal.fire({
            title: "Error de Conexión",
            text: `Error al obtener los datos del técnico: ${errorMessage}`,
            icon: "error"
        });
  }
}

// Mapa de estado → [claseIcono, claseColor]
const statusIconMap = {
  'Abierto': ['bi-exclamation-circle', 'text-danger'],       
  'En Proceso': ['bi-grid', 'text-warning'],                 
  'Cerrado': ['bi-check-circle', 'text-success'],            
  'En Espera': ['bi-clock', 'text-warning']                  
};

// Inyecta el icono de creación + fecha
function mostrarCreacion(fechaStr, estado) {
  const [_, color] = statusIconMap[estado] || ['bi-question-circle', 'text-muted'];
  const fechaFormateada = fechaStr
    ? new Date(fechaStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    : '—';

  const el = document.getElementById('lblCreacion');
  el.innerHTML = `
    <span class="">${fechaFormateada}</span>
    <i class="bi bi-calendar2-week ${color} ms-2"></i>
  `;
}

async function abrirFormularioCreacion() {
    const modalElement = document.getElementById('modalAgregarTecnico');
    const formElement = modalElement.querySelector('form');
    const phoneInput = document.getElementById('telefono');

    if (formElement) {
        formElement.reset(); // Limpia todos los campos del formulario
    }
    document.getElementById('userId').value = '';

    document.getElementById('modalAgregarTecnicoLabel').textContent = 'Agregar Nuevo Técnico';

    // 1. Obtener la referencia al elemento select
    const selectCategoria = document.getElementById('categoria');

    if (!selectCategoria) {
        console.error('El elemento select con ID "categoria" no fue encontrado.');
        return; 
    }

    selectCategoria.innerHTML = ''; 

    // Object.values() nos da un array con los objetos de categoría ({id: X, displayName: Y})
    const categoriasArray = Object.values(categoriasApiDinamicas);

    // 4. Llenar el select con las categorías
    categoriasArray.forEach(categoria => {
        const option = document.createElement('option');
        // Usamos el ID de la categoría como valor, que es lo que normalmente se enviaría al backend
        option.value = categoria.id; 
        option.textContent = categoria.displayName;
        selectCategoria.appendChild(option);
    });

    // Inicializar intl-tel-input y IMask (la nueva función)
    if(phoneInput) {
        initializePhoneInputAndMask(phoneInput);
    }
    
    const myModal = new bootstrap.Modal(modalElement);
    myModal.show();
    
    console.log('Modal "Agregar Nuevo Técnico" abierto y categorías cargadas desde variable local.');
}

function initializePhoneInputAndMask(phoneInput) {
    // ⚠️ Evitar inicializar intlTelInput más de una vez
    if (!iti) {
        iti = window.intlTelInput(phoneInput, {
            preferredCountries: ["sv", "mx", "gt", "cr", "pa"], 
            separateDialCode: true,
            // utilsScript ya se carga en el HTML principal
        });
    }

    // Lógica de enmascaramiento con IMask.js
    const applyMask = () => {
        const placeholder = phoneInput.placeholder;

        // Convierte el placeholder a formato de máscara (ej. (555) 5555-5555 -> 0000 0000)
        const maskFormat = placeholder.replace(/\d/g, '0');

        if (phoneMask) {
            phoneMask.destroy(); // Destruye la máscara anterior
        }

        phoneMask = IMask(phoneInput, {
            mask: maskFormat,
            lazy: true, // ✅ MÁSCARA INVISIBLE HASTA QUE SE ESCRIBE EL PRIMER DÍGITO
            // Eliminamos 'placeholder' para no ver los '_'
            commit: function(value, masked) {
                // Elimina todos los caracteres no numéricos para el valor subyacente
                masked._value = value.replace(/\D/g, ''); 
            }
        });
        
        // Limpiar el campo cuando el país cambia
        phoneInput.value = "";
    };

    // Aplicar máscara inmediatamente después de inicializar
    phoneInput.removeEventListener("countrychange", applyMask); // Evitar duplicados
    phoneInput.addEventListener("countrychange", applyMask);
    
    // Disparar el evento de cambio de país inicial para aplicar la máscara por defecto
    phoneInput.dispatchEvent(new Event('countrychange'));
}







async function handleFormSubmit(event) {
    event.preventDefault(); // Detiene la recarga de la página
    const userIdElement = document.getElementById('userId') || { value: '' }; // Fallback seguro
    let id = userIdElement.value;

    // 1. Obtener valores del formulario    
    const fullName = document.getElementById('nombreCompleto').value.trim();
    const email = document.getElementById('email').value.trim();
    const categoryId = document.getElementById('categoria').value;
    const telefono = document.getElementById('telefono').value || "99999999";
    const nombreUsuario = document.getElementById('nombreUsuario').value.trim() || "temp_user_" + Date.now();
    
    const phoneNumber = iti ? iti.getNumber() : telefono.value;

    const categoriaSeleccionada = Object.values(cargarCategoriasDinamicas).find(
        cat => String(cat.id) === categoryId
    );

    // 2. Control de validación (opcional pero recomendado)
    //if (!categoriaSeleccionada) {
        //Swal.fire({
            //title: "Error de Validación",
            //text: "Debe seleccionar una categoría válida para el técnico.",
            //icon: "warning"
        //});
        //return; // Detener la ejecución si no hay categoría
    //}

    // 2. Estructurar el JSON (Payload)
    const userData = {
        name: fullName,
        username: nombreUsuario,
        email: email,
        phone: phoneNumber,
        category: categoriaSeleccionada // Asegurar que sea número
    };

    // --- VALIDACIONES DE JAVASCRIPT ---
    // 1. Validación de campos vacíos
    if (!fullName || !nombreUsuario || !email || !phoneNumber) {
        Swal.fire({
            title: "Error de Validación",
            text: "Todos los campos obligatorios (Nombre, Email, Usuario, Teléfono, Categoría) deben ser llenados.",
            icon: "error" // o 'warning'
        });
        return;
    }

    // 2. Validación de formato de nombre (nombre y apellido)
    const nameRegex = /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/;
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    if (!nameRegex.test(fullName) || nameParts.length < 2) {
        Swal.fire({
            title: "Error de Formato",
            text: "Por favor, ingresa el nombre completo (nombre y apellido). Solo letras y espacios.",
            icon: "error"
        });
        return;
    }

    // 3. Validación de nombre de usuario (alfanumérico con guiones bajos)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(nombreUsuario)) {
        Swal.fire({
            title: "Error de Formato",
            text: "El nombre de usuario solo puede contener letras, números y guiones bajos.",
            icon: "error"
        });
        return;
    }

    // 4. Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            title: "Error de Formato",
            text: "Por favor, ingresa una dirección de correo electrónico válida.",
            icon: "error"
        });
        return;
    }

    // 5. Validación de número de teléfono con la librería intl-tel-input
    if (iti && !iti.isValidNumber()) {
        Swal.fire({
            title: "Error de Formato",
            text: "Por favor, ingresa un número de teléfono válido.",
            icon: "error"
        });
        return;
    }

    // 6. Validación de la cantidad de caracteres (min y max)
    if (fullName.length < 5 || fullName.length > 100) {
        Swal.fire({
            title: "Error de Longitud",
            text: "El nombre completo debe tener entre 5 y 100 caracteres.",
            icon: "error"
        });
        return;
    }
    if (userData.username.length < 3 || userData.username.length > 100) {
        Swal.fire({
            title: "Error de Longitud",
            text: "El nombre de usuario debe tener entre 3 y 100 caracteres.",
            icon: "error"
        });
        return;
    }
    if (userData.email.length > 100) {
        Swal.fire({
            title: "Error de Longitud",
            text: "El email excede el límite de 100 caracteres.",
            icon: "error"
        });
        return;
    }
    if (userData.phone.length > 20) {
        Swal.fire({
            title: "Error de Longitud",
            text: "El número de teléfono excede el límite de 20 caracteres.",
            icon: "error"
        });
        return;
    }
    // --- FIN VALIDACIONES ---

    // 3. Control de UI (Deshabilitar botón)
    const submitButton = event.currentTarget; 
    submitButton.textContent = 'Guardando...';
    submitButton.disabled = true;

    try {
        if(id){
            await updateUserTech(userData, id)
        }else{
            await createUserTech(userData);
        }

        // 5. Éxito: Cerrar Modal y Recargar Datos
        const modalElement = document.getElementById('modalAgregarTecnico');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        
        // Recargar la tabla de técnicos para ver el nuevo registro
        cargarPaginaTecnicos(0); 

        const successMessage = id ? "Técnico actualizado con éxito." : "Técnico registrado con éxito.";
        Swal.fire({
            title: "¡Operación Exitosa!",
            text: successMessage,
            icon: "success"
        });

    } catch (error) {
        // 6. Manejo de Errores

        const errorMessage = error.message || "Error desconocido al intentar guardar el técnico.";

        console.error("Detalle del error:", error);

         Swal.fire({
            title: "Error de Guardado",
            text: `❌ Error: ${errorMessage}`,
            icon: "error"
        });
    } finally {
        // 7. Restaurar UI
        submitButton.textContent = 'Guardar Técnico';
        submitButton.disabled = false;
    }
}

async function abrirFormularioEdicion(userId) {
    // 1. Limpiar el formulario (reutilizando la función que llena las categorías)
    await abrirFormularioCreacion(); // Esto limpia y carga el select de categorías

    const res = await getUserTech(0, 1, String(userId), 'all', 'all'); 
    console.log("ID del usuario para la búsqueda:", res);

    const usuarios = res.content || res;
    const u = usuarios[0];

    if (!u) {
            Swal.fire({
            title: "Error de Edición",
            text: "No se encontraron datos para editar este técnico. Por favor, intente de nuevo.",
            icon: "error"
        });
            return;
        }

    // 2. Llenar los campos con los datos del usuario
    document.getElementById('userId').value = u.userId || u.id || ''; // ID oculto
    document.getElementById('nombreCompleto').value = u.name || '';
    document.getElementById('nombreUsuario').value = u.username || '';
    document.getElementById('email').value = u.email || '';
    document.getElementById('telefono').value = u.phone || '';
    
    // 3. Seleccionar la categoría correcta
    const selectCategoria = document.getElementById('categoria');
    if (u.category && u.category.id) {
        // Asignar el valor del ID de la categoría (ej. "2") al select
        selectCategoria.value = u.category.id;
    } else {
        // Resetear la selección si no hay categoría
        selectCategoria.value = "";
    }

    // 4. Cambiar el título del modal
    document.getElementById('modalAgregarTecnicoLabel').textContent = `Editar Técnico: ${u.name}`;

    const modalElement = document.getElementById('modalAgregarTecnico');
    const myModal = bootstrap.Modal.getOrCreateInstance(modalElement);
    myModal.show();
    
    // El modal ya estará abierto gracias a abrirFormularioCreacion()
    console.log(`Abierto formulario para edición del usuario ${userId}`);
}

async function confirmarEliminacion(userId) {
     // Validar que el ID exista antes de intentar eliminar
    if (!userId) {
        console.error("No se proporcionó un ID de técnico para eliminar.");
        Swal.fire({
            title: "Error de Validación",
            text: "ID del técnico no válido. No se puede proceder con la eliminación.",
            icon: "error"
        });
        return;
    }
    
    // 1. Confirmación de Usuario para la eliminación
    const result = await Swal.fire({
        title: '¿Confirmar Eliminación?',
        text: "¿Está seguro de que desea eliminar este técnico? ¡Esta acción no se puede deshacer!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', // Rojo para la acción peligrosa
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) {
        return; // El usuario canceló
    }

    try {
        // 2. Llamada al Servicio
        await deleteUserTech(userId);

        // 3. Notificación y Recarga
        Swal.fire({
            title: "¡Eliminado!",
            text: "El técnico ha sido eliminado exitosamente.",
            icon: "success"
        });
        
        // Recarga la página actual para reflejar el cambio
        // Asumiendo que 'currentPage' está definido en el alcance global o superior
        await cargarPaginaTecnicos(currentPage); 

    } catch (error) {
        console.error("Error al eliminar el técnico:", error);
        
        let mensajeError = "Error desconocido al intentar eliminar el técnico.";
        
        // Manejo básico si el error lanzado tiene un mensaje HTTP (como 404 o 500)
        if (error.message && error.message.includes('Error HTTP:')) {
            const status = error.message.split(':')[1].trim();
            mensajeError = `Error al eliminar. El servidor devolvió el código de estado ${status}.`;
        }
        
        Swal.fire({
            title: "Error de Eliminación",
            text: mensajeError,
            icon: "error"
        });
    }
}



document.addEventListener('DOMContentLoaded', initTecnicos);


