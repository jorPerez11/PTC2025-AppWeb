import {
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity
} from '../services/activitiesService.js';

const activitiesGrid = document.getElementById('activitiesGrid');
const activityForm = document.getElementById('activityForm');
const createActivityModal = document.getElementById('createActivityModal');
const createActivityModalLabel = document.getElementById('createActivityModalLabel');
const createActivitySubmitBtn = document.getElementById('createActivitySubmitBtn');
const titleInput = document.getElementById('activityTitle');
const descriptionInput = document.getElementById('activityDescription');
const activityIdInput = document.getElementById('activityId');
const formatBar = document.querySelector('.format-bar');
const searchInput = document.getElementById('searchInput');
const ticketsPerPage = document.getElementById('ticketsPerPage');
const paginationControls = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');

let currentPage = 1;
let activitiesPerPage = 4;

let activitiesData = []; // Caché para almacenar los datos de las actividades

// 3. Función para cargar y renderizar las tarjetas de actividades.
async function loadActivities(limit = null) {
    try {
        if(activitiesData.length === 0){
         const response = await getActivities();
        activitiesData = response.content || []; // Almacena los datos en la caché   
        }

        activitiesGrid.innerHTML = ''; // Limpia el contenedor antes de renderizar

        const startIndex = (currentPage - 1) * activitiesPerPage;
        const endIndex = startIndex + activitiesPerPage;
        const activitiesToRender = activitiesData.slice(startIndex, endIndex);
        
        if (activitiesToRender.length > 0) {
            activitiesToRender.forEach(activity => {
                const cardHtml = createActivityCard(activity);
                activitiesGrid.innerHTML += cardHtml;
            });
        } else {
            activitiesGrid.innerHTML = '<p class="text-center text-muted">No se encontraron actividades.</p>';
        }

        updatePaginationControls();

    } catch (error) {
        console.error("Error al cargar actividades:", error);
        activitiesGrid.innerHTML = `<p class="text-center text-danger">Error al cargar las actividades. Por favor, inténtelo de nuevo.</p>`;
    }
}

function updatePaginationControls() {
    const totalPages = Math.ceil(activitiesData.length / activitiesPerPage);
    currentPageSpan.textContent = currentPage;

    // Habilita/deshabilita el botón "Anterior"
    if (currentPage === 1) {
        prevPageBtn.classList.add('disabled');
    } else {
        prevPageBtn.classList.remove('disabled');
    }

    // Habilita/deshabilita el botón "Siguiente"
    if (currentPage === totalPages || activitiesData.length === 0) {
        nextPageBtn.classList.add('disabled');
    } else {
        nextPageBtn.classList.remove('disabled');
    }
};


function addLineBreaks(text, maxLength) {
  if (text.length > maxLength) {
    let breakPoint = text.substring(0, maxLength).lastIndexOf(" ");
    if (breakPoint === -1) {
      breakPoint = maxLength;
    }
    return text.substring(0, breakPoint) + "<br>" + text.substring(breakPoint + 1);
  }
  return text;
}

// 4. Función para generar el HTML de una tarjeta individual.
function createActivityCard(activity) {
    const descriptionHtmlParts = [];
    const lines = activity.activityDescription.split('\n');
    let inList = false;

    // Iteramos sobre cada línea de la descripción
    lines.forEach((line, index) => {
        let processedLine = line;

        // Reemplaza negrita y subrayado
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processedLine = processedLine.replace(/__(.*?)__/g, '<u>$1</u>');

        // Verifica si la línea es un elemento de lista de checkboxes
        if (processedLine.match(/^\[( |x)\]\s/)) {
            if (!inList) {
                descriptionHtmlParts.push('<ul class="list-unstyled mb-0">');
                inList = true;
            }
            const isChecked = processedLine.startsWith('[x]');
            const taskText = processedLine.replace(/^\[( |x)\]\s/, '');
            descriptionHtmlParts.push(`
                <li class="d-flex align-items-start">
                    <input type="checkbox" class="form-check-input me-2 mt-1" ${isChecked ? 'checked' : ''} data-activity-id="${activity.id}" data-task-index="${index}">
                    <span class="${isChecked ? 'text-decoration-line-through text-muted' : ''}">${taskText}</span>
                </li>
            `);
        } else {
            if (inList) {
                descriptionHtmlParts.push('</ul>');
                inList = false;
            }
            // Si la línea no es un elemento de lista, se considera un párrafo
            descriptionHtmlParts.push(addLineBreaks(processedLine, 46));
        }
    });

    // Cierra la etiqueta <ul> si aún está abierta
    if (inList) {
        descriptionHtmlParts.push('</ul>');
    }

    const processedDescription = descriptionHtmlParts.join('');
    return `
        <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
            <div class="card-agendada shadow-sm">
                <div class="card-agendada-header pb-3">
                    <h5 class="card-agendada-title">${activity.activityTitle}</h5>
                    <button type="button" data-action="delete" class="btn-close-agendada delete-activity-btn" data-id="${activity.id}" aria-label="Close"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="card-agendada-body pb-5 mb-5">
                    <div class="activity-description">${processedDescription}</div>
                </div>
                <div class="card-agendada-footer mt-5">
                    <button class="btn btn-edit-agendada edit-activity-btn" data-action="update" data-id="${activity.id}">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

//Motor de busqueda 
searchInput.addEventListener('keyup', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    // Obtiene todos los elementos que son tarjetas de actividad
    const cards = document.querySelectorAll('.col-xl-3.col-lg-4.col-md-6.mb-4'); 

    cards.forEach(card => {
        // Busca el título y la descripción dentro de cada tarjeta
        const titleElement = card.querySelector('.card-agendada-title');
        const descriptionElement = card.querySelector('.activity-description');
        
        // Verifica si los elementos existen para evitar errores
        const activityTitle = titleElement ? titleElement.textContent.toLowerCase() : '';
        const activityDescription = descriptionElement ? descriptionElement.textContent.toLowerCase() : '';
        
        // Comprueba si el término de búsqueda está en el título o la descripción
        if (activityTitle.includes(searchTerm) || activityDescription.includes(searchTerm)) {
            card.style.display = 'block'; // Muestra la tarjeta
        } else {
            card.style.display = 'none'; // Oculta la tarjeta
        }
    });
});

ticketsPerPage.addEventListener('change', () => {
    activitiesPerPage = parseInt(ticketsPerPage.value);
    currentPage = 1;

    loadActivities();
});

// Manejador del botón "Anterior"
prevPageBtn.addEventListener('click', (event) => {
    event.preventDefault(); 
    if (currentPage > 1) {
        currentPage--;
        loadActivities();
    }
});

// Manejador del botón "Siguiente"
nextPageBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const totalPages = Math.ceil(activitiesData.length / activitiesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        loadActivities();
    }
});

function openUpdateModal(activity) {
    activityIdInput.value = activity.id;
    titleInput.value = activity.activityTitle;
    descriptionInput.value = activity.activityDescription;
    
    createActivityModalLabel.textContent = "Actualizar Actividad";
    createActivitySubmitBtn.textContent = "Actualizar";
    
    const myModal = new bootstrap.Modal(createActivityModal);
    myModal.show();
}


// Delegación de eventos para manejar clics en cualquier parte de la cuadrícula
activitiesGrid.addEventListener('click', async (event) => {
    // Verifica si el clic fue en un checkbox
    if (event.target.matches('.activity-description input[type="checkbox"]')) {
        const checkbox = event.target;
        const activityId = parseInt(checkbox.dataset.activityId);
        const taskIndex = parseInt(checkbox.dataset.taskIndex);

        const activity = activitiesData.find(a => a.id === activityId);
        if (!activity) {
            console.error('Actividad no encontrada para el checkbox.');
            return;
        }

        const lines = activity.activityDescription.split('\n');
        if (lines[taskIndex]) {
            const isChecked = checkbox.checked;
            if (isChecked) {
                // Reemplaza [ ] por [x]
                lines[taskIndex] = lines[taskIndex].replace(/^\[ \]/, '[x]');
            } else {
                // Reemplaza [x] por [ ]
                lines[taskIndex] = lines[taskIndex].replace(/^\[x\]/, '[ ]');
            }
            const newDescription = lines.join('\n');
            
            try {
                const newTitle = activity.activityTitle;
                await updateActivity({ activityTitle: newTitle, activityDescription: newDescription }, activityId);

                // Opcional: actualiza el caché de datos y vuelve a renderizar para reflejar el cambio
                activity.activityDescription = newDescription;
                loadActivities();

            } catch (error) {
                console.error("Error al actualizar la actividad:", error);
                Swal.fire('Error', 'No se pudo actualizar la actividad.', 'error');
            }
        }
    }
    
    // Si quieres, aquí puedes manejar también los eventos de los botones de editar y eliminar
    const clickedElement = event.target.closest('[data-action]');
    if (!clickedElement) return;

    if (clickedElement.matches('.edit-activity-btn')) {
        const activityId = parseInt(clickedElement.dataset.id);
        const activityToUpdate = activitiesData.find(a => a.id === activityId);
        if (activityToUpdate) {
            openUpdateModal(activityToUpdate);
        }
    } else if (clickedElement.matches('.delete-activity-btn')) {
        const activityId = parseInt(clickedElement.dataset.id);
        // ... Lógica para eliminar la actividad
    }
});






// 6. Funciones del modal (Crear y Actualizar)
const createActivityBtn = document.getElementById('createActivityBtn');
createActivityBtn.addEventListener('click', () => {
    activityIdInput.value = '';
    activityForm.reset();
    createActivityModalLabel.textContent = "Crear Actividad";
    createActivitySubmitBtn.textContent = "Crear";
    
    const myModal = new bootstrap.Modal(createActivityModal);
    myModal.show();
});

document.addEventListener('click', function(event) {
    if (event.target.matches('[data-bs-toggle="dropdown"]')) {
        const dropdownElement = event.target.closest('.dropdown');
        new bootstrap.Dropdown(dropdownElement).toggle();
    }
});

// Nuevo: Manejador de eventos para la barra de herramientas de formato
formatBar.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]').dataset.action;
    let start = descriptionInput.selectionStart;
    let end = descriptionInput.selectionEnd;
    let selectedText = descriptionInput.value.substring(start, end);

    let formattedText = '';
    let newCursorPos = end;

    switch(action) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            newCursorPos = start + 2;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            newCursorPos = start + 2;
            break;
        case 'list':
            const lines = selectedText.split('\n');
            formattedText = lines.map(line => `[ ] ${line}`).join('\n');
            newCursorPos = start + 4;
            break;
        default:
            return;
    }

    descriptionInput.value = descriptionInput.value.substring(0, start) + formattedText + descriptionInput.value.substring(end);
    
    // Vuelve a colocar el cursor
    descriptionInput.focus();
    descriptionInput.setSelectionRange(newCursorPos, newCursorPos);
});

// 7. Manejador de envío del formulario
activityForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = activityIdInput.value;
    const title = titleInput.value;
    const description = descriptionInput.value;

    if (title.length > 100) {
        Swal.fire('Error', 'El título no puede exceder los 100 caracteres.', 'error');
        return; // Detiene la ejecución si hay un error
    }

    if (description.length > 255) {
        Swal.fire('Error', 'La descripción no puede exceder los 255 caracteres.', 'error');
        return; // Detiene la ejecución si hay un error
    }
    
    const data = {
        activityTitle: title,
        activityDescription: description
    };

    try {
        if (id) {
            await updateActivity(data, id);
            Swal.fire('¡Éxito!', 'La actividad ha sido actualizada.', 'success');

            const activityToUpdate = activitiesData.find(a => a.id === parseInt(id));
            if (activityToUpdate) {
                activityToUpdate.activityTitle = title;
                activityToUpdate.activityDescription = description;
            }
        } else {
            await createActivity(data);
            Swal.fire('¡Éxito!', 'La actividad ha sido creada.', 'success');
        }
        
        const modalInstance = bootstrap.Modal.getInstance(createActivityModal);
        modalInstance.hide();
        activityForm.reset();
        loadActivities();
        
    } catch (error) {
        console.error("Error al procesar la actividad:", error);
        Swal.fire('Error', 'No se pudo procesar la actividad.', 'error');

        if (title.length > 100) {
        Swal.fire('Error', 'El título no puede exceder los 100 caracteres.', 'error');
    }

    if (description.length > 255) {
        Swal.fire('Error', 'La descripción no puede exceder los 255 caracteres.', 'error');
    }
    }
});

// 8. Inicia la carga de actividades al cargar la página
document.addEventListener('DOMContentLoaded', loadActivities);
